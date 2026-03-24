package com.vibeshop.api.review;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.vibeshop.api.auth.AuthService;
import com.vibeshop.api.common.UnauthorizedException;

@RestController
@RequestMapping("/api/v1/products/{productId}/reviews")
public class ReviewController {

    private static final String AUTH_SESSION_COOKIE = "vibe_shop_session";

    private final ReviewService reviewService;
    private final AuthService authService;

    public ReviewController(ReviewService reviewService, AuthService authService) {
        this.reviewService = reviewService;
        this.authService = authService;
    }

    @GetMapping
    ProductReviewListResponse reviews(
        @CookieValue(value = AUTH_SESSION_COOKIE, required = false) String authSessionToken,
        @PathVariable Long productId,
        @RequestParam(required = false) String sort,
        @RequestParam(required = false) Integer rating,
        @RequestParam(defaultValue = "false") boolean photoOnly
    ) {
        return reviewService.getProductReviews(
            productId,
            authService.resolveAuthenticatedUserId(authSessionToken),
            sort,
            rating,
            photoOnly
        );
    }

    @PostMapping
    MyReviewResponse createReview(
        @CookieValue(value = AUTH_SESSION_COOKIE, required = false) String authSessionToken,
        @PathVariable Long productId,
        @Valid @RequestBody CreateReviewRequest request
    ) {
        return reviewService.createReview(requireAuthenticatedUserId(authSessionToken), productId, request);
    }

    @PostMapping("/{reviewId}/helpful")
    ReviewHelpfulStateResponse markHelpful(
        @CookieValue(value = AUTH_SESSION_COOKIE, required = false) String authSessionToken,
        @PathVariable Long productId,
        @PathVariable Long reviewId
    ) {
        return reviewService.markReviewHelpful(requireAuthenticatedUserId(authSessionToken), productId, reviewId);
    }

    @DeleteMapping("/{reviewId}/helpful")
    ReviewHelpfulStateResponse unmarkHelpful(
        @CookieValue(value = AUTH_SESSION_COOKIE, required = false) String authSessionToken,
        @PathVariable Long productId,
        @PathVariable Long reviewId
    ) {
        return reviewService.unmarkReviewHelpful(requireAuthenticatedUserId(authSessionToken), productId, reviewId);
    }

    private Long requireAuthenticatedUserId(String authSessionToken) {
        Long userId = authService.resolveAuthenticatedUserId(authSessionToken);
        if (userId == null) {
            throw new UnauthorizedException("로그인이 필요합니다.");
        }
        return userId;
    }
}
