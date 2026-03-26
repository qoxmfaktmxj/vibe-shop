package com.vibeshop.api.catalog;

import java.util.List;

public record PagedProductResponse(
    List<ProductSummary> items,
    int page,
    int size,
    long totalItems,
    int totalPages,
    boolean hasNext,
    boolean hasPrev
) {
}
