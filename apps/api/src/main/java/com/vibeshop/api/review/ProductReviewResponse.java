package com.vibeshop.api.review;

import java.time.OffsetDateTime;

public record ProductReviewResponse(
    Long id,
    int rating,
    String title,
    String content,
    String reviewerName,
    OffsetDateTime createdAt
) {
}
