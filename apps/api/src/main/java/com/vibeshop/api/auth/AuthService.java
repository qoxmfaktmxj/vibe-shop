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
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import com.vibeshop.api.admin.AdminDtos.BootstrapAdminSignupRequest;
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
            throw new IllegalArgumentException("\uC774\uBBF8 \uAC00\uC785\uD55C \uC774\uBA54\uC77C\uC785\uB2C8\uB2E4.");
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

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public AuthenticatedSession signUpBootstrapAdmin(BootstrapAdminSignupRequest request) {
        if (!canBootstrapAdmin()) {
            throw new IllegalArgumentException("\uC774\uBBF8 \uAD00\uB9AC\uC790 \uACC4\uC815\uC774 \uC788\uC2B5\uB2C8\uB2E4.");
        }

        String normalizedEmail = normalizeEmail(request.email());
        if (userRepository.findByEmailIgnoreCase(normalizedEmail).isPresent()) {
            throw new IllegalArgumentException("\uC774\uBBF8 \uC0AC\uC6A9 \uC911\uC778 \uC774\uBA54\uC77C\uC785\uB2C8\uB2E4.");
        }

        OffsetDateTime now = OffsetDateTime.now(SEOUL);
        User user = userRepository.save(new User(
            request.name().trim(),
            normalizedEmail,
            passwordEncoder.encode(request.password()),
            AuthProviderType.LOCAL,
            UserRole.OWNER,
            now
        ));

        return createSession(user, now);
    }

    @Transactional
    public AuthenticatedSession socialExchange(SocialExchangeRequest request) {
        AuthProviderType requestedProvider = parseSocialProvider(request.provider());
        SocialIdentity identity = socialIdentityVerifier.verify(requestedProvider, request.accessToken());
        if (identity.provider() != requestedProvider) {
            throw new IllegalArgumentException("\uC9C0\uC6D0\uD558\uC9C0 \uC54A\uB294 \uC18C\uC15C \uB85C\uADF8\uC778 \uACF5\uAE09\uC790\uC785\uB2C8\uB2E4.");
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
    public boolean canBootstrapAdmin() {
        return userRepository.countByRoleNot(UserRole.CUSTOMER) == 0;
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
            .orElseThrow(() -> new IllegalArgumentException("\uC774\uBA54\uC77C \uB610\uB294 \uBE44\uBC00\uBC88\uD638\uAC00 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("\uC774\uBA54\uC77C \uB610\uB294 \uBE44\uBC00\uBC88\uD638\uAC00 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");
        }

        ensureAccountCanAuthenticate(user);
        return user;
    }

    private User authenticateAdminUser(LoginRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
            .orElseThrow(() -> new IllegalArgumentException("\uAD00\uB9AC\uC790 \uC774\uBA54\uC77C \uB610\uB294 \uBE44\uBC00\uBC88\uD638\uAC00 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("\uAD00\uB9AC\uC790 \uC774\uBA54\uC77C \uB610\uB294 \uBE44\uBC00\uBC88\uD638\uAC00 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");
        }

        if (!user.isAdmin()) {
            throw new IllegalArgumentException("\uAD00\uB9AC\uC790 \uAD8C\uD55C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");
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
        throw new IllegalArgumentException("\uC9C0\uC6D0\uD558\uC9C0 \uC54A\uB294 \uC18C\uC15C \uB85C\uADF8\uC778 \uACF5\uAE09\uC790\uC785\uB2C8\uB2E4.");
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
            throw new IllegalArgumentException("\uCC28\uB2E8\uB41C \uACC4\uC815\uC785\uB2C8\uB2E4. \uAD00\uB9AC\uC790\uC5D0\uAC8C \uBB38\uC758\uD574 \uC8FC\uC138\uC694.");
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private String requireSocialEmail(String email, boolean emailVerified) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("\uC774\uBA54\uC77C \uC81C\uACF5 \uB3D9\uC758\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4. \uACF5\uAE09\uC790 \uB3D9\uC758 \uD654\uBA74\uC5D0\uC11C \uC774\uBA54\uC77C \uAD8C\uD55C\uC744 \uD5C8\uC6A9\uD574 \uC8FC\uC138\uC694.");
        }
        if (!emailVerified) {
            throw new IllegalArgumentException("\uC774\uBA54\uC77C \uAC80\uC99D\uC774 \uC644\uB8CC\uB418\uC9C0 \uC54A\uC740 \uC18C\uC15C \uACC4\uC815\uC785\uB2C8\uB2E4.");
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
