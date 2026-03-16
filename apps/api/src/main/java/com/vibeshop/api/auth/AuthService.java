package com.vibeshop.api.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vibeshop.api.auth.AuthDtos.LoginRequest;
import com.vibeshop.api.auth.AuthDtos.SignUpRequest;
import com.vibeshop.api.auth.AuthDtos.SocialExchangeRequest;

@Service
public class AuthService {

    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");
    private static final String BOOTSTRAP_ADMIN_EMAIL = "admin@vibeshop.local";
    private static final String BOOTSTRAP_ADMIN_PASSWORD = "admin1234!";
    private static final String BOOTSTRAP_ADMIN_NAME = "Vibe Shop Admin";

    private final UserRepository userRepository;
    private final UserSessionRepository userSessionRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
        UserRepository userRepository,
        UserSessionRepository userSessionRepository,
        PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.userSessionRepository = userSessionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AuthenticatedSession signUp(SignUpRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        if (userRepository.findByEmailIgnoreCase(normalizedEmail).isPresent()) {
            throw new IllegalArgumentException("이미 가입한 이메일입니다.");
        }

        OffsetDateTime now = OffsetDateTime.now(SEOUL);
        User user = userRepository.save(new User(
            request.name().trim(),
            normalizedEmail,
            passwordEncoder.encode(request.password()),
            AuthProviderType.LOCAL,
            UserRole.CUSTOMER,
            now
        ));

        return createSession(user, now);
    }

    @Transactional
    public AuthenticatedSession login(LoginRequest request) {
        User user = authenticateUser(request);
        return createSession(user, OffsetDateTime.now(SEOUL));
    }

    @Transactional
    public AuthenticatedSession loginAdmin(LoginRequest request) {
        User user = authenticateAdminUser(request);
        return createSession(user, OffsetDateTime.now(SEOUL));
    }

    @Transactional
    public AuthenticatedSession socialExchange(SocialExchangeRequest request) {
        AuthProviderType provider = parseSocialProvider(request.provider());
        String normalizedEmail = normalizeEmail(request.email());
        String displayName = request.displayName().trim();
        OffsetDateTime now = OffsetDateTime.now(SEOUL);

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
            .map(existingUser -> {
                existingUser.syncSocialProfile(displayName, provider);
                return existingUser;
            })
            .orElseGet(() -> userRepository.save(new User(
                displayName,
                normalizedEmail,
                passwordEncoder.encode(buildSocialPassword(provider, request.providerUserId())),
                provider,
                UserRole.CUSTOMER,
                now
            )));

        return createSession(user, now);
    }

    @Transactional(readOnly = true)
    public Optional<User> resolveUser(String rawSessionToken) {
        if (rawSessionToken == null || rawSessionToken.isBlank()) {
            return Optional.empty();
        }

        OffsetDateTime now = OffsetDateTime.now(SEOUL);
        Optional<UserSession> session = userSessionRepository.findBySessionTokenHash(hashToken(rawSessionToken));
        if (session.isEmpty()) {
            return Optional.empty();
        }

        if (session.get().getExpiresAt().isBefore(now)) {
            return Optional.empty();
        }

        return Optional.of(session.get().getUser());
    }

    @Transactional(readOnly = true)
    public Optional<User> resolveAdminUser(String rawSessionToken) {
        return resolveUser(rawSessionToken).filter(User::isAdmin);
    }

    @Transactional(readOnly = true)
    public Long resolveAuthenticatedUserId(String rawSessionToken) {
        return resolveUser(rawSessionToken).map(User::getId).orElse(null);
    }

    @Transactional
    public void logout(String rawSessionToken) {
        if (rawSessionToken == null || rawSessionToken.isBlank()) {
            return;
        }
        userSessionRepository.deleteBySessionTokenHash(hashToken(rawSessionToken));
    }

    @Transactional
    public void clearExpiredSessions() {
        userSessionRepository.deleteAllByExpiresAtBefore(OffsetDateTime.now(SEOUL));
    }

    private User authenticateUser(LoginRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
            .orElseThrow(() -> new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다."));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        return user;
    }

    private User authenticateAdminUser(LoginRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
            .orElseGet(() -> maybeCreateBootstrapAdmin(normalizedEmail, request.password()));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("관리자 이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        if (!user.isAdmin()) {
            throw new IllegalArgumentException("관리자 권한이 없습니다.");
        }

        return user;
    }

    private User maybeCreateBootstrapAdmin(String normalizedEmail, String rawPassword) {
        if (!BOOTSTRAP_ADMIN_EMAIL.equals(normalizedEmail) || !BOOTSTRAP_ADMIN_PASSWORD.equals(rawPassword)) {
            throw new IllegalArgumentException("관리자 이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        OffsetDateTime now = OffsetDateTime.now(SEOUL);
        return userRepository.save(new User(
            BOOTSTRAP_ADMIN_NAME,
            normalizedEmail,
            passwordEncoder.encode(rawPassword),
            AuthProviderType.LOCAL,
            UserRole.OWNER,
            now
        ));
    }

    private AuthProviderType parseSocialProvider(String provider) {
        String normalizedProvider = provider.trim().toUpperCase();
        if ("GOOGLE".equals(normalizedProvider)) {
            return AuthProviderType.GOOGLE;
        }
        if ("KAKAO".equals(normalizedProvider)) {
            return AuthProviderType.KAKAO;
        }
        throw new IllegalArgumentException("지원하지 않는 소셜 로그인 공급자입니다.");
    }

    private String buildSocialPassword(AuthProviderType provider, String providerUserId) {
        return "social-" + provider.name().toLowerCase() + "-" + providerUserId.trim();
    }

    private AuthenticatedSession createSession(User user, OffsetDateTime now) {
        clearExpiredSessions();

        String rawToken = UUID.randomUUID().toString().replace("-", "");
        userSessionRepository.save(new UserSession(
            user,
            hashToken(rawToken),
            now,
            now.plusDays(30)
        ));

        return new AuthenticatedSession(user, rawToken);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 algorithm is not available.", exception);
        }
    }

    public record AuthenticatedSession(User user, String rawSessionToken) {
    }
}
