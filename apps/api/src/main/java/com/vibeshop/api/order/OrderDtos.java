package com.vibeshop.api.order;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public final class OrderDtos {

    private OrderDtos() {
    }

    public record CheckoutItemRequest(
        @NotNull(message = "상품 ID는 필수입니다.") Long productId,
        @NotNull(message = "수량은 필수입니다.")
        @Min(value = 1, message = "수량은 1개 이상이어야 합니다.") Integer quantity
    ) {
    }

    public record CheckoutPreviewRequest(
        @NotEmpty(message = "상품을 1개 이상 담아 주세요.") List<@Valid CheckoutItemRequest> items
    ) {
    }

    public record CheckoutLineResponse(
        Long productId,
        String productName,
        int quantity,
        BigDecimal unitPrice,
        BigDecimal lineTotal
    ) {
    }

    public record CheckoutPreviewResponse(
        List<CheckoutLineResponse> lines,
        BigDecimal subtotal,
        BigDecimal shippingFee,
        BigDecimal total
    ) {
    }

    public record CreateOrderRequest(
        @NotBlank(message = "중복 제출 방지 키는 필수입니다.") String idempotencyKey,
        @NotBlank(message = "받는 분 이름을 입력해 주세요.") String customerName,
        @NotBlank(message = "연락처를 입력해 주세요.") String phone,
        @NotBlank(message = "우편번호를 입력해 주세요.") String postalCode,
        @NotBlank(message = "기본 주소를 입력해 주세요.") String address1,
        String address2,
        String note,
        @NotNull(message = "결제 수단을 선택해 주세요.") PaymentMethod paymentMethod,
        @NotEmpty(message = "주문 상품은 필수입니다.") List<@Valid CheckoutItemRequest> items
    ) {
    }

    public record CreateOrderResponse(
        String orderNumber,
        String status,
        String paymentStatus,
        String paymentMethod
    ) {
    }

    public record GuestOrderLookupRequest(
        @NotBlank(message = "주문번호를 입력해 주세요.") String orderNumber,
        @NotBlank(message = "연락처를 입력해 주세요.") String phone
    ) {
    }

    public record GuestOrderLookupResponse(String orderNumber) {
    }

    public record CancelOrderResponse(String orderNumber, String status) {
    }

    public record OrderSummaryResponse(
        String orderNumber,
        String status,
        String customerType,
        String customerName,
        BigDecimal total,
        OffsetDateTime createdAt,
        int itemCount
    ) {
    }

    public record OrderResponse(
        String orderNumber,
        String status,
        String customerType,
        String paymentStatus,
        String paymentMethod,
        String paymentMessage,
        String customerName,
        String phone,
        String postalCode,
        String address1,
        String address2,
        String note,
        List<CheckoutLineResponse> lines,
        BigDecimal subtotal,
        BigDecimal shippingFee,
        BigDecimal total,
        OffsetDateTime createdAt
    ) {
    }
}
