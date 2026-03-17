package com.vibeshop.api.catalog;

public record CategorySummary(
    Long id,
    String slug,
    String name,
    String description,
    String accentColor,
    int displayOrder,
    String coverImageUrl,
    String coverImageAlt,
    String heroTitle,
    String heroSubtitle
) {
}
