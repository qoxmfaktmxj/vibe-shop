package com.vibeshop.api.review;

import java.util.List;

public record ProductReviewListResponse(
    ReviewSummaryResponse summary,
    List<ProductReviewResponse> reviews,
    boolean canWriteReview,
    boolean hasReviewed
) {
}
