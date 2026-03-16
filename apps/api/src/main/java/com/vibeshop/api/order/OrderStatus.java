package com.vibeshop.api.order;

public enum OrderStatus {
    PENDING_PAYMENT,
    PAID,
    PREPARING,
    SHIPPED,
    DELIVERED,
    RECEIVED,
    REFUND_REQUESTED,
    REFUNDED,
    CANCELLED
}
