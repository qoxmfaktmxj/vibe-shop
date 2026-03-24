package com.vibeshop.api.order;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CustomerOrderLineRepository extends JpaRepository<CustomerOrderLine, Long> {

    @Query("""
        SELECT CASE WHEN COUNT(line) > 0 THEN true ELSE false END
        FROM CustomerOrderLine line
        JOIN line.order customerOrder
        WHERE customerOrder.userId = :userId
          AND customerOrder.customerType = com.vibeshop.api.order.CustomerType.MEMBER
          AND customerOrder.status IN :statuses
          AND line.productId = :productId
        """)
    boolean existsPurchasedProductForReview(
        @Param("userId") Long userId,
        @Param("productId") Long productId,
        @Param("statuses") Collection<OrderStatus> statuses
    );

    @Query("""
        SELECT COUNT(DISTINCT customerOrder.id)
        FROM CustomerOrderLine line
        JOIN line.order customerOrder
        WHERE customerOrder.userId = :userId
          AND customerOrder.customerType = com.vibeshop.api.order.CustomerType.MEMBER
          AND customerOrder.status IN :statuses
          AND line.productId = :productId
        """)
    long countPurchasedOrdersForReview(
        @Param("userId") Long userId,
        @Param("productId") Long productId,
        @Param("statuses") Collection<OrderStatus> statuses
    );

    @Query("""
        SELECT line.productId
        FROM CustomerOrderLine line
        JOIN line.order customerOrder
        WHERE customerOrder.userId = :userId
          AND customerOrder.customerType = com.vibeshop.api.order.CustomerType.MEMBER
          AND customerOrder.status IN :statuses
          AND line.productId IN :productIds
        GROUP BY line.productId
        """)
    List<Long> findPurchasedProductIdsForReview(
        @Param("userId") Long userId,
        @Param("productIds") Collection<Long> productIds,
        @Param("statuses") Collection<OrderStatus> statuses
    );
}
