package com.vibeshop.api.review;

import java.time.OffsetDateTime;

public record AdminReviewResponse(
    Long id,
    Long productId,
    String productSlug,
    String productName,
    String reviewerName,
    String reviewerEmail,
    int rating,
    String title,
    String content,
    String fitTag,
    boolean repurchaseYn,
    Integer deliverySatisfaction,
    Integer packagingSatisfaction,
    boolean buyerReview,
    int helpfulCount,
    int photoCount,
    String status,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {
}
