package com.vibeshop.api.auth;

import java.time.Duration;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vibeshop.api.auth.AuthDtos.AuthSessionResponse;
import com.vibeshop.api.auth.AuthDtos.AuthenticatedUserResponse;
import com.vibeshop.api.auth.AuthDtos.LoginRequest;
import com.vibeshop.api.auth.AuthDtos.SignUpRequest;
import com.vibeshop.api.auth.AuthDtos.SocialExchangeRequest;
import com.vibeshop.api.cart.CartService;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final String AUTH_SESSION_COOKIE = "vibe_shop_session";
    private static final String CART_SESSION_COOKIE = "vibe_shop_cart";
    private static final Duration AUTH_SESSION_MAX_AGE = Duration.ofDays(30);
    private static final boolean AUTH_COOKIE_SECURE = false;
    private static final String AUTH_COOKIE_SAME_SITE = "Lax";

    private final AuthService authService;
    private final CartService cartService;

    public AuthController(AuthService authService, CartService cartService) {
        this.authService = authService;
        this.cartService = cartService;
    }

    @PostMapping("/signup")
    AuthSessionResponse signUp(
        @Valid @RequestBody SignUpRequest request,
        @CookieValue(value = CART_SESSION_COOKIE, required = false) String cartSessionToken,
        HttpServletResponse response
    ) {
        AuthService.AuthenticatedSession session = authService.signUp(request);
        applyAuthenticatedSession(response, session);
        mergeGuestCartIfPresent(cartSessionToken, session.user().getId());
        return toResponse(session.user());
    }

    @PostMapping("/login")
    AuthSessionResponse login(
        @Valid @RequestBody LoginRequest request,
        @CookieValue(value = CART_SESSION_COOKIE, required = false) String cartSessionToken,
        HttpServletResponse response
    ) {
        AuthService.AuthenticatedSession session = authService.login(request);
        applyAuthenticatedSession(response, session);
        mergeGuestCartIfPresent(cartSessionToken, session.user().getId());
        return toResponse(session.user());
    }

    @PostMapping("/social/exchange")
    AuthSessionResponse socialExchange(
        @Valid @RequestBody SocialExchangeRequest request,
        @CookieValue(value = CART_SESSION_COOKIE, required = false) String cartSessionToken,
        HttpServletResponse response
    ) {
        AuthService.AuthenticatedSession session = authService.socialExchange(request);
        applyAuthenticatedSession(response, session);
        mergeGuestCartIfPresent(cartSessionToken, session.user().getId());
        return toResponse(session.user());
    }

    @PostMapping("/logout")
    AuthSessionResponse logout(
        @CookieValue(value = AUTH_SESSION_COOKIE, required = false) String sessionToken,
        HttpServletResponse response
    ) {
        authService.logout(sessionToken);
        clearSessionCookie(response);
        return AuthSessionResponse.unauthenticated();
    }

    @GetMapping("/session")
    AuthSessionResponse session(
        @CookieValue(value = AUTH_SESSION_COOKIE, required = false) String sessionToken,
        HttpServletResponse response
    ) {
        return authService.resolveUser(sessionToken)
            .map(this::toResponse)
            .orElseGet(() -> {
                clearSessionCookie(response);
                return AuthSessionResponse.unauthenticated();
            });
    }

    private void applyAuthenticatedSession(HttpServletResponse response, AuthService.AuthenticatedSession session) {
        response.addHeader(HttpHeaders.SET_COOKIE, ResponseCookie.from(AUTH_SESSION_COOKIE, session.rawSessionToken())
            .httpOnly(true)
            .secure(AUTH_COOKIE_SECURE)
            .sameSite(AUTH_COOKIE_SAME_SITE)
            .path("/")
            .maxAge(AUTH_SESSION_MAX_AGE)
            .build()
            .toString());
    }

    private void clearSessionCookie(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, ResponseCookie.from(AUTH_SESSION_COOKIE, "")
            .httpOnly(true)
            .secure(AUTH_COOKIE_SECURE)
            .sameSite(AUTH_COOKIE_SAME_SITE)
            .path("/")
            .maxAge(Duration.ZERO)
            .build()
            .toString());
    }

    private void mergeGuestCartIfPresent(String guestCartToken, Long userId) {
        if (guestCartToken == null || guestCartToken.isBlank()) {
            return;
        }

        cartService.mergeGuestCartIntoMemberCart(guestCartToken, userId);
    }

    private AuthSessionResponse toResponse(User user) {
        return new AuthSessionResponse(
            true,
            new AuthenticatedUserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getProvider().name()
            )
        );
    }
}
