package com.vibeshop.api.catalog;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @EntityGraph(attributePaths = "category")
    List<Product> findAllByOrderByFeaturedDescIdAsc();

    @EntityGraph(attributePaths = "category")
    List<Product> findAllByCategory_VisibleTrueOrderByFeaturedDescIdAsc();

    @EntityGraph(attributePaths = "category")
    List<Product> findByCategory_SlugOrderByFeaturedDescIdAsc(String categorySlug);

    @EntityGraph(attributePaths = "category")
    List<Product> findByCategory_SlugAndCategory_VisibleTrueOrderByFeaturedDescIdAsc(String categorySlug);

    @EntityGraph(attributePaths = "category")
    List<Product> findAllByOrderByCreatedAtDescIdDesc();

    @EntityGraph(attributePaths = "category")
    Optional<Product> findBySlug(String slug);

    boolean existsBySlugIgnoreCase(String slug);

    @EntityGraph(attributePaths = "category")
    Optional<Product> findBySlugAndCategory_VisibleTrue(String slug);

    @EntityGraph(attributePaths = "category")
    List<Product> findAllByIdIn(Collection<Long> ids);

    @EntityGraph(attributePaths = "category")
    List<Product> findTop4ByFeaturedTrueOrderByIdAsc();

    @EntityGraph(attributePaths = "category")
    @Query("""
        SELECT p
        FROM Product p
        JOIN p.category c
        WHERE (:categorySlug IS NULL OR c.slug = :categorySlug)
          AND (
            :keyword IS NULL
            OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(p.summary) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
          )
        ORDER BY p.featured DESC, p.id ASC
        """)
    List<Product> search(
        @Param("categorySlug") String categorySlug,
        @Param("keyword") String keyword
    );

    @EntityGraph(attributePaths = "category")
    @Query("""
        SELECT p
        FROM Product p
        JOIN p.category c
        WHERE c.visible = true
          AND (:categorySlug IS NULL OR c.slug = :categorySlug)
          AND (
            :keyword IS NULL
            OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(p.summary) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
          )
        ORDER BY p.featured DESC, p.id ASC
        """)
    List<Product> searchVisible(
        @Param("categorySlug") String categorySlug,
        @Param("keyword") String keyword
    );

    long countByFeaturedTrue();

    long countByStockLessThanEqual(int stock);

    long countByCategory_Id(Long categoryId);

    @EntityGraph(attributePaths = "category")
    Page<Product> findAllByCategory_VisibleTrue(Pageable pageable);

    @EntityGraph(attributePaths = "category")
    Page<Product> findByCategory_SlugAndCategory_VisibleTrue(String slug, Pageable pageable);
}
