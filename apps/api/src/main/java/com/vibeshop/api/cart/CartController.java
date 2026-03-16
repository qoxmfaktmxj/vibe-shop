package com.vibeshop.api.cart;

import java.time.Duration;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vibeshop.api.auth.AuthService;
import com.vibeshop.api.cart.CartDtos.CartResponse;
import com.vibeshop.api.cart.CartDtos.UpdateCartItemRequest;

@RestController
@RequestMapping("/api/v1/cart")
public class CartController {

    private static final String CART_SESSION_COOKIE = "vibe_shop_cart";
    private static final String AUTH_SESSION_COOKIE = "vibe_shop_session";
    private static final Duration CART_SESSION_MAX_AGE = Duration.ofDays(30);

    private final CartService cartService;
    private final AuthService authService;

    public CartController(CartService cartService, AuthService authService) {
        this.cartService = cartService;
        this.authService = authService;
    }

    @GetMapping
    CartResponse cart(
        @CookieValue(value = CART_SESSION_COOKIE, required = false) String sessionToken,
        @CookieValue(value = AUTH_SESSION_COOKIE, required = false) String authSessionToken,
        HttpServletResponse response
    ) {
        Long userId = resolveUserId(authSessionToken);
        if (userId != null) {
            mergeGuestCartIfNeeded(sessionToken, userId, response);
        }

        CartResponse cart = userId != null ? cartService.getForUser(userId) : cartService.get(sessionToken);
        if (sessionToken != null && !sessionToken.isBlank() && cart.items().isEmpty()) {
            clearCookie(response);
        }
        return cart;
    }

    @PutMapping("/items/{productId}")
    CartResponse putItem(
        @PathVariable Long productId,
        @Valid @RequestBody UpdateCartItemRequest request,
        @CookieValue(value = CART_SESSION_COOKIE, required = false) String sessionToken,
        @CookieValue(value = AUTH_SESSION_COOKIE, required = false) String authSessionToken,
        HttpServletResponse response
    ) {
        Long userId = resolveUserId(authSessionToken);
        if (userId != null) {
            mergeGuestCartIfNeeded(sessionToken, userId, response);
            return cartService.putItemForUser(userId, productId, request.quantity());
        }

        String resolvedSessionToken = sessionToken;
        if (resolvedSessionToken == null || resolvedSessionToken.isBlank()) {
            resolvedSessionToken = cartService.createSessionToken();
        }

        CartResponse cart = cartService.putItem(resolvedSessionToken, productId, request.quantity());
        if (cart.items().isEmpty()) {
            clearCookie(response);
            return cart;
        }

        writeCookie(response, resolvedSessionToken);
        return cart;
    }

    @DeleteMapping("/items/{productId}")
    CartResponse removeItem(
        @PathVariable Long productId,
        @CookieValue(value = CART_SESSION_COOKIE, required = false) String sessionToken,
        @CookieValue(value = AUTH_SESSION_COOKIE, required = false) String authSessionToken,
        HttpServletResponse response
    ) {
        Long userId = resolveUserId(authSessionToken);
        if (userId != null) {
            mergeGuestCartIfNeeded(sessionToken, userId, response);
            return cartService.removeItemForUser(userId, productId);
        }

        CartResponse cart = cartService.removeItem(sessionToken, productId);
        if (cart.items().isEmpty()) {
            clearCookie(response);
        }
        return cart;
    }

    @DeleteMapping
    CartResponse clear(
        @CookieValue(value = CART_SESSION_COOKIE, required = false) String sessionToken,
        @CookieValue(value = AUTH_SESSION_COOKIE, required = false) String authSessionToken,
        HttpServletResponse response
    ) {
        Long userId = resolveUserId(authSessionToken);
        CartResponse cart = userId != null ? cartService.clearMemberCart(userId) : cartService.clear(sessionToken);
        clearCookie(response);
        return cart;
    }

    private Long resolveUserId(String authSessionToken) {
        return authService.resolveAuthenticatedUserId(authSessionToken);
    }

    private void mergeGuestCartIfNeeded(String sessionToken, Long userId, HttpServletResponse response) {
        if (sessionToken == null || sessionToken.isBlank()) {
            return;
        }

        cartService.mergeGuestCartIntoMemberCart(sessionToken, userId);
        clearCookie(response);
    }

    private void writeCookie(HttpServletResponse response, String sessionToken) {
        response.addHeader(HttpHeaders.SET_COOKIE, ResponseCookie.from(CART_SESSION_COOKIE, sessionToken)
            .httpOnly(true)
            .sameSite("Lax")
            .path("/")
            .maxAge(CART_SESSION_MAX_AGE)
            .build()
            .toString());
    }

    private void clearCookie(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, ResponseCookie.from(CART_SESSION_COOKIE, "")
            .httpOnly(true)
            .sameSite("Lax")
            .path("/")
            .maxAge(Duration.ZERO)
            .build()
            .toString());
    }
}
