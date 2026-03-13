package com.vibeshop.api.catalog;

import java.util.List;

public record HomeResponse(
    String heroTitle,
    String heroSubtitle,
    List<CategorySummary> featuredCategories,
    List<ProductSummary> featuredProducts
) {
}

