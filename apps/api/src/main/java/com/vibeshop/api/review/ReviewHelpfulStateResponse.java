package com.vibeshop.api.review;

public record ReviewHelpfulStateResponse(
    Long reviewId,
    int helpfulCount,
    boolean helpfulVoted
) {
}
