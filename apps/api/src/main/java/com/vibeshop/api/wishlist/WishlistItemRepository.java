package com.vibeshop.api.wishlist;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {

    @EntityGraph(attributePaths = {"product", "product.category"})
    List<WishlistItem> findByUser_IdOrderByCreatedAtDesc(Long userId);

    boolean existsByUser_IdAndProduct_Id(Long userId, Long productId);

    long countByUser_Id(Long userId);

    void deleteByUser_IdAndProduct_Id(Long userId, Long productId);

    @Query("""
        SELECT item.product.id
        FROM WishlistItem item
        WHERE item.user.id = :userId
          AND item.product.id IN :productIds
        """)
    List<Long> findWishlistedProductIds(
        @Param("userId") Long userId,
        @Param("productIds") Collection<Long> productIds
    );
}
