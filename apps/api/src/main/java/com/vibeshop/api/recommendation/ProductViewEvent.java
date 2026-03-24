package com.vibeshop.api.recommendation;

import java.time.OffsetDateTime;

import com.vibeshop.api.catalog.Product;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "product_view_events")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProductViewEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "visitor_key", length = 64)
    private String visitorKey;

    @Column(nullable = false, length = 40)
    private String source;

    @Column(name = "viewed_at", nullable = false)
    private OffsetDateTime viewedAt;

    public ProductViewEvent(Product product, Long userId, String visitorKey, String source, OffsetDateTime viewedAt) {
        this.product = product;
        this.userId = userId;
        this.visitorKey = visitorKey;
        this.source = source;
        this.viewedAt = viewedAt;
    }
}
