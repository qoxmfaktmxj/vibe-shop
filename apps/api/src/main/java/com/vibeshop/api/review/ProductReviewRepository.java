package com.vibeshop.api.review;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {

    @EntityGraph(attributePaths = {"user"})
    List<ProductReview> findByProduct_IdAndStatusOrderByCreatedAtDesc(Long productId, ReviewStatus status);

    @EntityGraph(attributePaths = {"product", "product.category"})
    List<ProductReview> findByUser_IdOrderByCreatedAtDesc(Long userId);

    @EntityGraph(attributePaths = {"product", "product.category", "user"})
    List<ProductReview> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"product", "product.category", "user"})
    Optional<ProductReview> findById(Long reviewId);

    boolean existsByUser_IdAndProduct_Id(Long userId, Long productId);

    long countByUser_Id(Long userId);

    long countByProduct_IdAndStatus(Long productId, ReviewStatus status);

    @Query("""
        SELECT AVG(review.rating)
        FROM ProductReview review
        WHERE review.product.id = :productId
          AND review.status = :status
        """)
    Double findAverageRatingByProductIdAndStatus(
        @Param("productId") Long productId,
        @Param("status") ReviewStatus status
    );
}
