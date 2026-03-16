package com.vibeshop.api.catalog;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @EntityGraph(attributePaths = "category")
    List<Product> findAllByOrderByFeaturedDescIdAsc();

    @EntityGraph(attributePaths = "category")
    List<Product> findByCategory_SlugOrderByFeaturedDescIdAsc(String categorySlug);

    @EntityGraph(attributePaths = "category")
    List<Product> findAllByOrderByCreatedAtDescIdDesc();

    @EntityGraph(attributePaths = "category")
    Optional<Product> findBySlug(String slug);

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

    long countByFeaturedTrue();

    long countByStockLessThanEqual(int stock);
}
