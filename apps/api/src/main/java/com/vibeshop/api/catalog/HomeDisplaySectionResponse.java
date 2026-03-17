package com.vibeshop.api.catalog;

import java.util.List;

public record HomeDisplaySectionResponse(
    String code,
    String title,
    String subtitle,
    boolean visible,
    List<HomeDisplayItemResponse> items
) {
}
