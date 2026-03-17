package com.vibeshop.api.wishlist;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public final class WishlistDtos {

    private WishlistDtos() {
    }

    public record WishlistStateResponse(
        Long productId,
        boolean wishlisted
    ) {
    }

    public record WishlistProductResponse(
        Long productId,
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
        OffsetDateTime createdAt
    ) {
    }
}
