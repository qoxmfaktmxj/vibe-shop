package com.vibeshop.api.review;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {

    @EntityGraph(attributePaths = {"user", "images"})
    List<ProductReview> findByProduct_IdAndStatusOrderByCreatedAtDesc(Long productId, ReviewStatus status);

    @EntityGraph(attributePaths = {"product", "product.category", "images"})
    List<ProductReview> findByUser_IdOrderByCreatedAtDesc(Long userId);

    @EntityGraph(attributePaths = {"product", "product.category", "user", "images"})
    List<ProductReview> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"product", "product.category", "user", "images"})
    Optional<ProductReview> findById(Long reviewId);

    @EntityGraph(attributePaths = {"product", "product.category", "user", "images"})
    Optional<ProductReview> findByIdAndUser_Id(Long reviewId, Long userId);

    @EntityGraph(attributePaths = {"product", "user", "images"})
    Optional<ProductReview> findByIdAndProduct_Id(Long reviewId, Long productId);

    boolean existsByUser_IdAndProduct_Id(Long userId, Long productId);

    long countByUser_Id(Long userId);
}
