package com.vibeshop.api.display;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DisplaySectionRepository extends JpaRepository<DisplaySection, Long> {

    @EntityGraph(attributePaths = "items")
    List<DisplaySection> findAllByOrderByDisplayOrderAscIdAsc();

    @EntityGraph(attributePaths = "items")
    Optional<DisplaySection> findByCode(DisplaySectionCode code);
}
