package com.vibeshop.api.cart;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoredCartItemRepository extends JpaRepository<StoredCartItem, Long> {

    @EntityGraph(attributePaths = "product")
    List<StoredCartItem> findAllBySessionTokenOrderByIdAsc(String sessionToken);

    @EntityGraph(attributePaths = "product")
    Optional<StoredCartItem> findBySessionTokenAndProduct_Id(String sessionToken, Long productId);

    void deleteBySessionTokenAndProduct_Id(String sessionToken, Long productId);

    void deleteAllBySessionToken(String sessionToken);
}
