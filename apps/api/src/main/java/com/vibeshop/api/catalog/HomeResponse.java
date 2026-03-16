package com.vibeshop.api.catalog;

import java.util.List;

public record HomeResponse(
    String heroTitle,
    String heroSubtitle,
    List<CategorySummary> featuredCategories,
    List<ProductSummary> curatedPicks,
    List<ProductSummary> newArrivals,
    List<ProductSummary> bestSellers
) {
}
