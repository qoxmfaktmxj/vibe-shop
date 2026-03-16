package com.vibeshop.api.order;

import java.time.OffsetDateTime;

public interface PaymentGatewayAdapter {

    AuthorizationResult authorize(CustomerOrder order, PaymentMethod paymentMethod);

    CancellationResult cancel(CustomerOrder order, OrderPayment payment);

    record AuthorizationResult(
        String providerCode,
        String referenceCode,
        PaymentStatus paymentStatus,
        String message,
        OffsetDateTime processedAt
    ) {
    }

    record CancellationResult(
        PaymentStatus paymentStatus,
        String message,
        OffsetDateTime processedAt
    ) {
    }
}
