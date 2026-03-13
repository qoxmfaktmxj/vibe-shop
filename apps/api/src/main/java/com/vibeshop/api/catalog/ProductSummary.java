package com.vibeshop.api.catalog;

import java.math.BigDecimal;

public record ProductSummary(
    Long id,
    String slug,
    String name,
    String categorySlug,
    String categoryName,
    String summary,
    BigDecimal price,
    String badge,
    String accentColor
) {
}

