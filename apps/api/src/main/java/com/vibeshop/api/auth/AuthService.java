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

    private final UserRepository userRepository;
    private final UserSessionRepository userSessionRepository;
    private final PasswordEncoder passwordEncoder;
    private final SocialIdentityVerifier socialIdentityVerifier;

    public AuthService(
        UserRepository userRepository,
        UserSessionRepository userSessionRepository,
        PasswordEncoder passwordEncoder,
        SocialIdentityVerifier socialIdentityVerifier
    ) {
        this.userRepository = userRepository;
        this.userSessionRepository = userSessionRepository;
        this.passwordEncoder = passwordEncoder;
        this.socialIdentityVerifier = socialIdentityVerifier;
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
        AuthProviderType requestedProvider = parseSocialProvider(request.provider());
        SocialIdentity identity = socialIdentityVerifier.verify(requestedProvider, request.accessToken());
        if (identity.provider() != requestedProvider) {
            throw new IllegalArgumentException("지원하지 않는 소셜 로그인 공급자입니다.");
        }

        String normalizedEmail = requireSocialEmail(identity.email(), identity.emailVerified());
        String displayName = normalizeDisplayName(identity.displayName(), normalizedEmail);
        OffsetDateTime now = OffsetDateTime.now(SEOUL);

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
            .map(existingUser -> {
                existingUser.syncSocialProfile(displayName, requestedProvider);
                return existingUser;
            })
            .orElseGet(() -> userRepository.save(new User(
                displayName,
                normalizedEmail,
                passwordEncoder.encode(buildSyntheticSocialPassword(requestedProvider, identity.providerUserId())),
                requestedProvider,
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

        User user = session.get().getUser();
        if (user.isBlocked()) {
            userSessionRepository.delete(session.get());
            return Optional.empty();
        }

        return Optional.of(user);
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

        ensureAccountCanAuthenticate(user);
        return user;
    }

    private User authenticateAdminUser(LoginRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
            .orElseThrow(() -> new IllegalArgumentException("관리자 이메일 또는 비밀번호가 올바르지 않습니다."));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("관리자 이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        if (!user.isAdmin()) {
            throw new IllegalArgumentException("관리자 권한이 없습니다.");
        }

        ensureAccountCanAuthenticate(user);
        return user;
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

    private String buildSyntheticSocialPassword(AuthProviderType provider, String providerUserId) {
        return UUID.randomUUID() + "-social-" + provider.name().toLowerCase() + "-" + providerUserId.trim();
    }

    private AuthenticatedSession createSession(User user, OffsetDateTime now) {
        clearExpiredSessions();
        ensureAccountCanAuthenticate(user);
        user.markLoggedIn(now);

        String rawToken = UUID.randomUUID().toString().replace("-", "");
        userSessionRepository.save(new UserSession(
            user,
            hashToken(rawToken),
            now,
            now.plusDays(30)
        ));

        return new AuthenticatedSession(user, rawToken);
    }

    private void ensureAccountCanAuthenticate(User user) {
        if (user.isBlocked()) {
            throw new IllegalArgumentException("차단된 계정입니다. 관리자에게 문의해 주세요.");
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private String requireSocialEmail(String email, boolean emailVerified) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("이메일 제공 동의가 필요합니다. 공급자 동의 화면에서 이메일 권한을 허용해 주세요.");
        }
        if (!emailVerified) {
            throw new IllegalArgumentException("이메일 검증이 완료되지 않은 소셜 계정입니다.");
        }
        return normalizeEmail(email);
    }

    private String normalizeDisplayName(String displayName, String fallbackEmail) {
        if (displayName == null || displayName.isBlank()) {
            return fallbackEmail;
        }
        return displayName.trim();
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
