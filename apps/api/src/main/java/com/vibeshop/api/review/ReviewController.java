package com.vibeshop.api.review;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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

    @PostMapping
    MyReviewResponse createReview(
        @CookieValue(value = AUTH_SESSION_COOKIE, required = false) String authSessionToken,
        @PathVariable Long productId,
        @Valid @RequestBody CreateReviewRequest request
    ) {
        Long userId = authService.resolveAuthenticatedUserId(authSessionToken);
        if (userId == null) {
            throw new UnauthorizedException("로그인이 필요합니다.");
        }

        return reviewService.createReview(userId, productId, request);
    }
}
