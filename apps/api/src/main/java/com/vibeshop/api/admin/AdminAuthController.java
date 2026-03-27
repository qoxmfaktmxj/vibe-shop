package com.vibeshop.api.admin;

import java.time.Duration;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vibeshop.api.admin.AdminDtos.AdminBootstrapStatusResponse;
import com.vibeshop.api.admin.AdminDtos.AdminSessionResponse;
import com.vibeshop.api.admin.AdminDtos.AdminSessionUserResponse;
import com.vibeshop.api.admin.AdminDtos.BootstrapAdminSignupRequest;
import com.vibeshop.api.auth.AuthDtos.LoginRequest;
import com.vibeshop.api.auth.AuthService;
import com.vibeshop.api.auth.User;
import com.vibeshop.api.config.SessionCookieFactory;

@RestController
@RequestMapping("/api/v1/admin/session")
public class AdminAuthController {

    private static final String ADMIN_SESSION_COOKIE = "vibe_shop_admin_session";
    private static final Duration ADMIN_SESSION_MAX_AGE = Duration.ofDays(30);

    private final AuthService authService;
    private final SessionCookieFactory sessionCookieFactory;

    public AdminAuthController(AuthService authService, SessionCookieFactory sessionCookieFactory) {
        this.authService = authService;
        this.sessionCookieFactory = sessionCookieFactory;
    }

    @PostMapping("/login")
    AdminSessionResponse login(
        @Valid @RequestBody LoginRequest request,
        HttpServletResponse response
    ) {
        AuthService.AuthenticatedSession session = authService.loginAdmin(request);
        applyAuthenticatedSession(response, session);
        return toResponse(session.user());
    }

    @PostMapping("/signup")
    AdminSessionResponse signUp(
        @Valid @RequestBody BootstrapAdminSignupRequest request,
        HttpServletResponse response
    ) {
        AuthService.AuthenticatedSession session = authService.signUpBootstrapAdmin(request);
        applyAuthenticatedSession(response, session);
        return toResponse(session.user());
    }

    @PostMapping("/logout")
    AdminSessionResponse logout(
        @CookieValue(value = ADMIN_SESSION_COOKIE, required = false) String sessionToken,
        HttpServletResponse response
    ) {
        authService.logout(sessionToken);
        clearSessionCookie(response);
        return AdminSessionResponse.unauthenticated();
    }

    @GetMapping
    AdminSessionResponse session(
        @CookieValue(value = ADMIN_SESSION_COOKIE, required = false) String sessionToken,
        HttpServletResponse response
    ) {
        return authService.resolveAdminUser(sessionToken)
            .map(this::toResponse)
            .orElseGet(() -> {
                clearSessionCookie(response);
                return AdminSessionResponse.unauthenticated();
            });
    }

    @GetMapping("/bootstrap")
    AdminBootstrapStatusResponse bootstrapStatus() {
        return new AdminBootstrapStatusResponse(authService.canBootstrapAdmin());
    }

    private void applyAuthenticatedSession(HttpServletResponse response, AuthService.AuthenticatedSession session) {
        response.addHeader(
            HttpHeaders.SET_COOKIE,
            sessionCookieFactory.create(ADMIN_SESSION_COOKIE, session.rawSessionToken(), ADMIN_SESSION_MAX_AGE)
        );
    }

    private void clearSessionCookie(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, sessionCookieFactory.clear(ADMIN_SESSION_COOKIE));
    }

    private AdminSessionResponse toResponse(User user) {
        return new AdminSessionResponse(
            true,
            new AdminSessionUserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name()
            )
        );
    }
}
