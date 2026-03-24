package com.vibeshop.api.recommendation;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductViewEventRepository extends JpaRepository<ProductViewEvent, Long> {

    @EntityGraph(attributePaths = { "product", "product.category" })
    List<ProductViewEvent> findTop80ByUserIdOrderByViewedAtDesc(Long userId);

    @EntityGraph(attributePaths = { "product", "product.category" })
    List<ProductViewEvent> findTop80ByVisitorKeyOrderByViewedAtDesc(String visitorKey);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
        UPDATE ProductViewEvent event
        SET event.userId = :userId
        WHERE event.userId IS NULL
          AND event.visitorKey = :visitorKey
        """)
    int assignGuestHistoryToUser(@Param("visitorKey") String visitorKey, @Param("userId") Long userId);
}
