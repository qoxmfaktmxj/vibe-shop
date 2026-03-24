package com.vibeshop.api.review;

public record ReviewImageResponse(
    Long id,
    String imageUrl,
    int displayOrder
) {
}
