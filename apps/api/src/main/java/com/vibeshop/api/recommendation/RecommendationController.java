package com.vibeshop.api.recommendation;

import java.time.Duration;
import java.util.List;

import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.vibeshop.api.auth.AuthService;
import com.vibeshop.api.cart.CartService;
import com.vibeshop.api.recommendation.RecommendationDtos.RecentlyViewedResponse;
import com.vibeshop.api.recommendation.RecommendationDtos.RecommendationCollectionResponse;
import com.vibeshop.api.recommendation.RecommendationDtos.TrackProductViewResponse;

@RestController
@RequestMapping("/api/v1")
public class RecommendationController {

    private static final String AUTH_SESSION_COOKIE = "vibe_shop_session";
    private static final String CART_SESSION_COOKIE = "vibe_shop_cart";
    private static final String VISITOR_COOKIE = "vibe_shop_visitor";
    private static final Duration VISITOR_COOKIE_MAX_AGE = Duration.ofDays(30);

    private final RecommendationService recommendationService;
    private final AuthService authService;
    private final CartService cartService;

    public RecommendationController(
        RecommendationService recommendationService,
        AuthService authService,
        CartService cartService
    ) {
        this.recommendationService = recommendationService;
        this.authService = authService;
        this.cartService = cartService;
    }

    @PostMapping("/recently-viewed/items/{productId}")
    TrackProductViewResponse trackRecentlyViewed(
        @PathVariable Long productId,
        @RequestParam(required = false) String source,
        @CookieValue(value = AUTH_SESSION_COOKIE, required = false) String authSessionToken,
        @CookieValue(value = VISITOR_COOKIE, required = false) String visitorKey,
        HttpServletResponse response
    ) {
        Long userId = authService.resolveAuthenticatedUserId(authSessionToken);
        RecommendationService.TrackViewResult tracked = recommendationService.trackView(
            productId,
            userId,
            visitorKey,
            source
        );
        if (userId == null) {
            writeVisitorCookie(response, tracked.visitorKey());
        }
        return tracked.response();
    }

    @GetMapping("/recently-viewed")
    RecentlyViewedResponse recentlyViewed(
        @CookieValue(value = AUTH_SESSION_COOKIE, required = false) String authSessionToken,
        @CookieValue(value = VISITOR_COOKIE, required = false) String visitorKey
    ) {
        Long userId = resolveUserId(authSessionToken, visitorKey);
        return recommendationService.getRecentlyViewed(userId, visitorKey);
    }

    @GetMapping("/recommendations/home")
    RecommendationCollectionResponse homeRecommendations(
        @CookieValue(value = AUTH_SESSION_COOKIE, required = false) String authSessionToken,
        @CookieValue(value = VISITOR_COOKIE, required = false) String visitorKey
    ) {
        Long userId = resolveUserId(authSessionToken, visitorKey);
        return recommendationService.getHomeRecommendations(userId, visitorKey);
    }

    @GetMapping("/recommendations/products/{productId}")
    RecommendationCollectionResponse productRecommendations(
        @PathVariable Long productId,
        @CookieValue(value = AUTH_SESSION_COOKIE, required = false) String authSessionToken,
        @CookieValue(value = VISITOR_COOKIE, required = false) String visitorKey
    ) {
        Long userId = resolveUserId(authSessionToken, visitorKey);
        return recommendationService.getProductRecommendations(productId, userId, visitorKey);
    }

    @GetMapping("/recommendations/cart")
    RecommendationCollectionResponse cartRecommendations(
        @CookieValue(value = CART_SESSION_COOKIE, required = false) String cartSessionToken,
        @CookieValue(value = AUTH_SESSION_COOKIE, required = false) String authSessionToken,
        @CookieValue(value = VISITOR_COOKIE, required = false) String visitorKey
    ) {
        Long userId = resolveUserId(authSessionToken, visitorKey);
        List<Long> cartProductIds = (userId != null ? cartService.getForUser(userId) : cartService.get(cartSessionToken)).items()
            .stream()
            .map(item -> item.productId())
            .toList();
        return recommendationService.getCartRecommendations(userId, visitorKey, cartProductIds);
    }

    @GetMapping("/recommendations/recently-viewed")
    RecommendationCollectionResponse recentlyViewedRecommendations(
        @CookieValue(value = AUTH_SESSION_COOKIE, required = false) String authSessionToken,
        @CookieValue(value = VISITOR_COOKIE, required = false) String visitorKey
    ) {
        Long userId = resolveUserId(authSessionToken, visitorKey);
        return recommendationService.getRecentlyViewedRecommendations(userId, visitorKey);
    }

    private Long resolveUserId(String authSessionToken, String visitorKey) {
        Long userId = authService.resolveAuthenticatedUserId(authSessionToken);
        if (userId != null) {
            recommendationService.mergeGuestHistoryIntoUser(visitorKey, userId);
        }
        return userId;
    }

    private void writeVisitorCookie(HttpServletResponse response, String visitorKey) {
        response.addHeader(HttpHeaders.SET_COOKIE, ResponseCookie.from(VISITOR_COOKIE, visitorKey)
            .httpOnly(true)
            .sameSite("Lax")
            .path("/")
            .maxAge(VISITOR_COOKIE_MAX_AGE)
            .build()
            .toString());
    }
}
