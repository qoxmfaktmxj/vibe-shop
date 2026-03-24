package com.vibeshop.api.recommendation;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public final class RecommendationDtos {

    private RecommendationDtos() {
    }

    public record TrackProductViewResponse(
        Long productId,
        OffsetDateTime viewedAt
    ) {
    }

    public record RecentlyViewedItemResponse(
        Long id,
        String slug,
        String name,
        String categorySlug,
        String categoryName,
        String summary,
        BigDecimal price,
        String badge,
        String accentColor,
        String imageUrl,
        String imageAlt,
        boolean wishlisted,
        OffsetDateTime viewedAt
    ) {
    }

    public record RecentlyViewedResponse(
        List<RecentlyViewedItemResponse> items
    ) {
    }

    public record RecommendationProductResponse(
        Long id,
        String slug,
        String name,
        String categorySlug,
        String categoryName,
        String summary,
        BigDecimal price,
        String badge,
        String accentColor,
        String imageUrl,
        String imageAlt,
        boolean wishlisted,
        String reasonCode,
        String reasonLabel,
        String reasonDetail,
        int score
    ) {
    }

    public record RecommendationCollectionResponse(
        String context,
        String title,
        String subtitle,
        List<RecommendationProductResponse> items
    ) {
    }
}
