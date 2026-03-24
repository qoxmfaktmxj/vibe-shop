package com.vibeshop.api.review;

import java.time.OffsetDateTime;
import java.util.List;

public record MyReviewResponse(
    Long id,
    Long productId,
    String productSlug,
    String productName,
    String productImageUrl,
    String productImageAlt,
    int rating,
    String title,
    String content,
    String fitTag,
    boolean repurchaseYn,
    Integer deliverySatisfaction,
    Integer packagingSatisfaction,
    int helpfulCount,
    boolean buyerReview,
    List<ReviewImageResponse> images,
    String status,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {
}
