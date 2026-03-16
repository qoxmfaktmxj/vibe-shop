package com.vibeshop.api.order;

import java.time.OffsetDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "order_payments")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class OrderPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private CustomerOrder order;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 30)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 30)
    private PaymentStatus paymentStatus;

    @Column(name = "provider_code", nullable = false, length = 40)
    private String providerCode;

    @Column(name = "reference_code", nullable = false, unique = true, length = 80)
    private String referenceCode;

    @Column(nullable = false, length = 255)
    private String message;

    @Column(name = "approved_at")
    private OffsetDateTime approvedAt;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public OrderPayment(
        CustomerOrder order,
        PaymentMethod paymentMethod,
        String providerCode,
        String referenceCode,
        OffsetDateTime createdAt
    ) {
        this.order = order;
        this.paymentMethod = paymentMethod;
        this.paymentStatus = PaymentStatus.READY;
        this.providerCode = providerCode;
        this.referenceCode = referenceCode;
        this.message = "결제 준비 중입니다.";
        this.createdAt = createdAt;
        this.updatedAt = createdAt;
    }

    public void markPending(String message, OffsetDateTime updatedAt) {
        this.paymentStatus = PaymentStatus.PENDING;
        this.message = message;
        this.updatedAt = updatedAt;
    }

    public void markSucceeded(String message, OffsetDateTime approvedAt, OffsetDateTime updatedAt) {
        this.paymentStatus = PaymentStatus.SUCCEEDED;
        this.message = message;
        this.approvedAt = approvedAt;
        this.updatedAt = updatedAt;
    }

    public void markFailed(String message, OffsetDateTime updatedAt) {
        this.paymentStatus = PaymentStatus.FAILED;
        this.message = message;
        this.updatedAt = updatedAt;
    }

    public void markCancelled(String message, OffsetDateTime updatedAt) {
        this.paymentStatus = PaymentStatus.CANCELLED;
        this.message = message;
        this.updatedAt = updatedAt;
    }

    public void markRefunded(String message, OffsetDateTime updatedAt) {
        this.paymentStatus = PaymentStatus.REFUNDED;
        this.message = message;
        this.updatedAt = updatedAt;
    }
}
