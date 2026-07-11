package com.vibeshop.api.order;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {

    @EntityGraph(attributePaths = "lines")
    Optional<CustomerOrder> findByOrderNumber(String orderNumber);

    @EntityGraph(attributePaths = "lines")
    @Query("SELECT o FROM CustomerOrder o WHERE o.id = :id")
    Optional<CustomerOrder> findWithLinesById(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(attributePaths = "lines")
    @Query("SELECT o FROM CustomerOrder o WHERE o.id = :id")
    Optional<CustomerOrder> findByIdForUpdate(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(attributePaths = "lines")
    @Query("SELECT o FROM CustomerOrder o WHERE o.orderNumber = :orderNumber")
    Optional<CustomerOrder> findByOrderNumberForUpdate(@Param("orderNumber") String orderNumber);

    @EntityGraph(attributePaths = "lines")
    Optional<CustomerOrder> findByIdempotencyKey(String idempotencyKey);

    @EntityGraph(attributePaths = "lines")
    Optional<CustomerOrder> findByOrderNumberAndUserId(String orderNumber, Long userId);

    @EntityGraph(attributePaths = "lines")
    List<CustomerOrder> findByUserIdOrderByCreatedAtDesc(Long userId);

    @EntityGraph(attributePaths = "lines")
    List<CustomerOrder> findAllByOrderByCreatedAtDesc();

    long countByUserId(Long userId);

    long countByStatus(OrderStatus status);
}
