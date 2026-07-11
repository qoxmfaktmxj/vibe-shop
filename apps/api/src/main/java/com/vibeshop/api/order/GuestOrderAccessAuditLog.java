package com.vibeshop.api.order;

import java.time.OffsetDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "guest_order_access_audit_logs")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GuestOrderAccessAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String action;

    @Column(name = "order_number", nullable = false, length = 40)
    private String orderNumber;

    @Column(name = "request_key_hash", nullable = false, length = 64)
    private String requestKeyHash;

    @Column(nullable = false)
    private boolean succeeded;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    public GuestOrderAccessAuditLog(
        String action,
        String orderNumber,
        String requestKeyHash,
        boolean succeeded,
        OffsetDateTime createdAt
    ) {
        this.action = action;
        this.orderNumber = orderNumber;
        this.requestKeyHash = requestKeyHash;
        this.succeeded = succeeded;
        this.createdAt = createdAt;
    }
}
