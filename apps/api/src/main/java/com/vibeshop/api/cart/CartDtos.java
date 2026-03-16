package com.vibeshop.api.cart;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public final class CartDtos {

    private CartDtos() {
    }

    public record UpdateCartItemRequest(
        @NotNull(message = "수량이 필요합니다.")
        @Min(value = 0, message = "수량은 0개 이상이어야 합니다.") Integer quantity
    ) {
    }

    public record CartItemResponse(
        Long productId,
        String slug,
        String name,
        BigDecimal price,
        String accentColor,
        String imageUrl,
        String imageAlt,
        int quantity
    ) {
    }

    public record CartResponse(
        List<CartItemResponse> items,
        int itemCount,
        BigDecimal subtotal
    ) {
    }
}
