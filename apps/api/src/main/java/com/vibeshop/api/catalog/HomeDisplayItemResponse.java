package com.vibeshop.api.catalog;

public record HomeDisplayItemResponse(
    Long id,
    String title,
    String subtitle,
    String imageUrl,
    String imageAlt,
    String href,
    String ctaLabel,
    String accentColor
) {
}
