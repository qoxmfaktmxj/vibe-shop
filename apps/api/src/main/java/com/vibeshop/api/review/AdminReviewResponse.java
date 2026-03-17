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
    String status,
    OffsetDateTime createdAt
) {
}
