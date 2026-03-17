package com.vibeshop.api.display;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DisplayItemRepository extends JpaRepository<DisplayItem, Long> {

    @EntityGraph(attributePaths = "section")
    List<DisplayItem> findAllBySection_CodeOrderByDisplayOrderAscIdAsc(DisplaySectionCode code);
}
