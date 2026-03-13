package com.vibeshop.api.catalog;

import java.math.BigDecimal;

public record ProductDetailResponse(
    Long id,
    String slug,
    String name,
    String categorySlug,
    String categoryName,
    String summary,
    String description,
    BigDecimal price,
    String badge,
    String accentColor,
    int stock
) {
}

