package com.vibeshop.api.review;

public record ReviewSummaryResponse(
    double averageRating,
    long reviewCount
) {
}
