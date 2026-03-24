package com.vibeshop.api.review;

import java.util.List;

public record ReviewSummaryResponse(
    double averageRating,
    long reviewCount,
    long photoReviewCount,
    long buyerReviewCount,
    double repurchaseRatio,
    Double deliverySatisfactionAverage,
    Double packagingSatisfactionAverage,
    List<ReviewRatingBreakdownResponse> ratingDistribution
) {
}
