package com.vibeshop.api.catalog;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findAllByOrderByDisplayOrderAscIdAsc();

    List<Category> findAllByVisibleTrueOrderByDisplayOrderAscIdAsc();

    Optional<Category> findBySlug(String slug);

    Optional<Category> findBySlugAndVisibleTrue(String slug);

    boolean existsBySlugIgnoreCase(String slug);

    boolean existsBySlugIgnoreCaseAndIdNot(String slug, Long id);
}
