package com.vibeshop.api.order;

import java.time.OffsetDateTime;

import org.springframework.data.jpa.repository.JpaRepository;

public interface GuestOrderAccessAuditLogRepository extends JpaRepository<GuestOrderAccessAuditLog, Long> {

    long countByActionAndRequestKeyHashAndSucceededFalseAndCreatedAtAfter(
        String action,
        String requestKeyHash,
        OffsetDateTime cutoff
    );
}
