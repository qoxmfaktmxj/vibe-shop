package com.vibeshop.api.review;

public record ReviewRatingBreakdownResponse(
    int rating,
    long count,
    double percentage
) {
}
