package com.vibeshop.api.order;

import java.time.OffsetDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GuestOrderAccessTokenRepository extends JpaRepository<GuestOrderAccessToken, Long> {

    @EntityGraph(attributePaths = {"order", "order.lines"})
    Optional<GuestOrderAccessToken> findByTokenHashAndOrder_OrderNumberAndExpiresAtAfter(
        String tokenHash,
        String orderNumber,
        OffsetDateTime now
    );
}
