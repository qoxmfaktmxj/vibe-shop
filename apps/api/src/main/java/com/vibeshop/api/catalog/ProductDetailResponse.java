package com.vibeshop.api.catalog;

import java.math.BigDecimal;
import java.util.List;

import com.vibeshop.api.review.ProductReviewResponse;
import com.vibeshop.api.review.ReviewSummaryResponse;

public record ProductDetailResponse(
    Long id,
    String slug,
    String name,
    String categorySlug,
    String categoryName,
    String summary,
    String description,
    BigDecimal price,
    String badge,
    String accentColor,
    String imageUrl,
    String imageAlt,
    int stock,
    boolean wishlisted,
    boolean canWriteReview,
    boolean hasReviewed,
    ReviewSummaryResponse reviewSummary,
    List<ProductReviewResponse> reviews
) {
}
