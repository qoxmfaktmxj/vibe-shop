package com.vibeshop.api.review;

import java.time.OffsetDateTime;
import java.util.List;

public record ProductReviewResponse(
    Long id,
    int rating,
    String title,
    String content,
    String reviewerName,
    boolean buyerReview,
    String fitTag,
    boolean repurchaseYn,
    Integer deliverySatisfaction,
    Integer packagingSatisfaction,
    int helpfulCount,
    boolean helpfulVoted,
    boolean hasPhotos,
    List<ReviewImageResponse> images,
    OffsetDateTime createdAt
) {
}
