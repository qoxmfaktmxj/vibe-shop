package com.vibeshop.api.order;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {

    @EntityGraph(attributePaths = "lines")
    Optional<CustomerOrder> findByOrderNumber(String orderNumber);

    @EntityGraph(attributePaths = "lines")
    Optional<CustomerOrder> findByIdempotencyKey(String idempotencyKey);

    @EntityGraph(attributePaths = "lines")
    List<CustomerOrder> findByPhoneOrderByCreatedAtDesc(String phone);

    @EntityGraph(attributePaths = "lines")
    Optional<CustomerOrder> findByOrderNumberAndUserId(String orderNumber, Long userId);

    @EntityGraph(attributePaths = "lines")
    List<CustomerOrder> findByUserIdOrderByCreatedAtDesc(Long userId);
}

