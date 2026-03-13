package com.vibeshop.api.catalog;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @EntityGraph(attributePaths = "category")
    List<Product> findAllByOrderByFeaturedDescIdAsc();

    @EntityGraph(attributePaths = "category")
    List<Product> findByCategory_SlugOrderByFeaturedDescIdAsc(String categorySlug);

    @EntityGraph(attributePaths = "category")
    Optional<Product> findBySlug(String slug);

    @EntityGraph(attributePaths = "category")
    List<Product> findAllByIdIn(Collection<Long> ids);

    @EntityGraph(attributePaths = "category")
    List<Product> findTop4ByFeaturedTrueOrderByIdAsc();
}

