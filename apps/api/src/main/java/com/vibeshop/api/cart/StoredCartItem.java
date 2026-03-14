package com.vibeshop.api.cart;

import java.time.OffsetDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import com.vibeshop.api.catalog.Product;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "shopping_cart_items")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StoredCartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_token", nullable = false, length = 64)
    private String sessionToken;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private int quantity;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public StoredCartItem(String sessionToken, Product product, int quantity, OffsetDateTime now) {
        this.sessionToken = sessionToken;
        this.product = product;
        this.quantity = quantity;
        this.createdAt = now;
        this.updatedAt = now;
    }

    public void changeQuantity(int quantity, OffsetDateTime now) {
        this.quantity = quantity;
        this.updatedAt = now;
    }
}
