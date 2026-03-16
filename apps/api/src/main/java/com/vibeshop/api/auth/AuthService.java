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

@Service
public class AuthService {

    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");

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
            throw new IllegalArgumentException("이미 가입된 이메일입니다.");
        }

        OffsetDateTime now = OffsetDateTime.now(SEOUL);
        User user = userRepository.save(new User(
            request.name().trim(),
            normalizedEmail,
            passwordEncoder.encode(request.password()),
            AuthProviderType.LOCAL,
            now
        ));

        return createSession(user, now);
    }

    @Transactional
    public AuthenticatedSession login(LoginRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
            .orElseThrow(() -> new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다."));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        return createSession(user, OffsetDateTime.now(SEOUL));
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
