package com.vibeshop.api.review;

import java.time.OffsetDateTime;

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
    String status,
    OffsetDateTime createdAt
) {
}
