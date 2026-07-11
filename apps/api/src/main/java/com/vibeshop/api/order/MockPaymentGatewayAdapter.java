package com.vibeshop.api.order;

import java.time.OffsetDateTime;
import java.time.ZoneId;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "app.payment.mock-enabled", havingValue = "true")
public class MockPaymentGatewayAdapter implements PaymentGatewayAdapter {

    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");
    private static final String PROVIDER = "MOCK_PAY";

    public MockPaymentGatewayAdapter(@Value("${app.runtime-mode:production}") String runtimeMode) {
        if ("production".equalsIgnoreCase(runtimeMode.trim())) {
            throw new IllegalStateException("Mock payment must not be enabled in production mode.");
        }
    }

    @Override
    public AuthorizationResult authorize(CustomerOrder order, PaymentMethod paymentMethod) {
        OffsetDateTime now = OffsetDateTime.now(SEOUL);
        String referenceCode = "MOCK-" + order.getOrderNumber();

        return switch (paymentMethod) {
            case CARD, EASY_PAY -> new AuthorizationResult(
                PROVIDER,
                referenceCode,
                PaymentStatus.SUCCEEDED,
                "모의 결제가 승인되었습니다.",
                now
            );
            case BANK_TRANSFER, VIRTUAL_ACCOUNT -> new AuthorizationResult(
                PROVIDER,
                referenceCode,
                PaymentStatus.PENDING,
                "입금 확인 전까지 결제 대기 상태로 유지됩니다.",
                now
            );
            case MOBILE -> new AuthorizationResult(
                PROVIDER,
                referenceCode,
                PaymentStatus.FAILED,
                "모의 결제가 실패했습니다. 다른 결제 수단으로 다시 시도해 주세요.",
                now
            );
        };
    }

    @Override
    public CancellationResult cancel(CustomerOrder order, OrderPayment payment) {
        OffsetDateTime now = OffsetDateTime.now(SEOUL);

        return switch (payment.getPaymentStatus()) {
            case SUCCEEDED -> new CancellationResult(
                PaymentStatus.REFUNDED,
                "모의 환불이 완료되었습니다.",
                now
            );
            case READY, PENDING -> new CancellationResult(
                PaymentStatus.CANCELLED,
                "모의 결제가 취소되었습니다.",
                now
            );
            case FAILED -> new CancellationResult(
                PaymentStatus.FAILED,
                payment.getMessage(),
                now
            );
            case CANCELLED -> new CancellationResult(
                PaymentStatus.CANCELLED,
                payment.getMessage(),
                now
            );
            case REFUNDED -> new CancellationResult(
                PaymentStatus.REFUNDED,
                payment.getMessage(),
                now
            );
        };
    }
}
