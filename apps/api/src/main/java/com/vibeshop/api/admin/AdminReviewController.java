package com.vibeshop.api.admin;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.vibeshop.api.review.AdminReviewResponse;
import com.vibeshop.api.review.ReviewService;
import com.vibeshop.api.review.UpdateAdminReviewStatusRequest;

@RestController
@RequestMapping("/api/v1/admin/reviews")
public class AdminReviewController {

    private static final String ADMIN_SESSION_COOKIE = "vibe_shop_admin_session";

    private final AdminAccessGuard adminAccessGuard;
    private final ReviewService reviewService;

    public AdminReviewController(AdminAccessGuard adminAccessGuard, ReviewService reviewService) {
        this.adminAccessGuard = adminAccessGuard;
        this.reviewService = reviewService;
    }

    @GetMapping
    List<AdminReviewResponse> reviews(
        @CookieValue(value = ADMIN_SESSION_COOKIE, required = false) String adminSessionToken,
        @RequestParam(required = false) String status,
        @RequestParam(required = false, name = "q") String keyword
    ) {
        adminAccessGuard.requireAdmin(adminSessionToken);
        return reviewService.getAdminReviews(status, keyword);
    }

    @PutMapping("/{reviewId}/status")
    AdminReviewResponse updateReviewStatus(
        @CookieValue(value = ADMIN_SESSION_COOKIE, required = false) String adminSessionToken,
        @PathVariable Long reviewId,
        @Valid @RequestBody UpdateAdminReviewStatusRequest request
    ) {
        adminAccessGuard.requireAdmin(adminSessionToken);
        return reviewService.updateReviewStatus(reviewId, request);
    }
}
