package com.vibeshop.api.catalog;

import java.util.List;

public final class SearchDtos {

    private SearchDtos() {
    }

    public record ParsedSearchQueryResponse(
        String raw,
        String normalized,
        String keyword,
        String category,
        String color,
        Integer minPrice,
        Integer maxPrice,
        String season,
        String useCase,
        String gender
    ) {
    }

    public record AppliedFilterResponse(
        String type,
        String value,
        String label
    ) {
    }

    public record SearchFallbackResponse(
        boolean applied,
        String reason,
        List<String> relaxedFilters
    ) {
    }

    public record ProductSearchResponse(
        List<ProductSummary> items,
        ParsedSearchQueryResponse parsedQuery,
        List<AppliedFilterResponse> appliedFilters,
        SearchFallbackResponse fallback,
        int page,
        int size,
        long totalItems,
        int totalPages,
        boolean hasNext,
        boolean hasPrev
    ) {
    }
}
