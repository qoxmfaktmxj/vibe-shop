package com.vibeshop.api.catalog;

import java.math.BigDecimal;
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

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "products")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false, unique = true, length = 120)
    private String slug;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 255)
    private String summary;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 12, scale = 0)
    private BigDecimal price;

    @Column(nullable = false, length = 50)
    private String badge;

    @Column(name = "accent_color", nullable = false, length = 20)
    private String accentColor;

    @Column(name = "image_url", nullable = false, length = 255)
    private String imageUrl;

    @Column(name = "image_alt", nullable = false, length = 255)
    private String imageAlt;

    @Column(nullable = false)
    private boolean featured;

    @Column(nullable = false)
    private int stock;

    @Column(name = "popularity_score", nullable = false)
    private int popularityScore;

    @Column(length = 40)
    private String color;

    @Column(name = "season_tag", length = 40)
    private String seasonTag;

    @Column(name = "use_case_tag", length = 60)
    private String useCaseTag;

    @Column(name = "gender_tag", length = 20)
    private String genderTag;

    @Column(name = "material_tag", length = 60)
    private String materialTag;

    @Column(name = "search_keywords", columnDefinition = "TEXT")
    private String searchKeywords;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    public Product(
        Category category,
        String slug,
        String name,
        String summary,
        String description,
        BigDecimal price,
        String badge,
        String accentColor,
        String imageUrl,
        String imageAlt,
        boolean featured,
        int stock,
        int popularityScore,
        OffsetDateTime createdAt
    ) {
        validateAdminValues(price, stock, popularityScore);

        this.category = category;
        this.slug = slug;
        this.name = name;
        this.summary = summary;
        this.description = description;
        this.price = price;
        this.badge = badge;
        this.accentColor = accentColor;
        this.imageUrl = imageUrl;
        this.imageAlt = imageAlt;
        this.featured = featured;
        this.stock = stock;
        this.popularityScore = popularityScore;
        this.seasonTag = "all_season";
        this.useCaseTag = "daily";
        this.genderTag = "unisex";
        this.searchKeywords = String.join(", ", name, summary, description, badge, slug, category.getName());
        this.createdAt = createdAt;
    }

    public void decreaseStock(int quantity) {
        if (quantity < 1) {
            throw new IllegalArgumentException("수량은 1개 이상이어야 합니다.");
        }
        if (stock < quantity) {
            throw new IllegalArgumentException(name + " 재고가 부족합니다.");
        }
        this.stock -= quantity;
    }

    public void increaseStock(int quantity) {
        if (quantity < 1) {
            throw new IllegalArgumentException("수량은 1개 이상이어야 합니다.");
        }
        this.stock += quantity;
    }

    public void updateForAdmin(
        String name,
        String summary,
        String badge,
        BigDecimal price,
        int stock,
        int popularityScore,
        boolean featured
    ) {
        validateAdminValues(price, stock, popularityScore);

        this.name = name;
        this.summary = summary;
        this.badge = badge;
        this.price = price;
        this.stock = stock;
        this.popularityScore = popularityScore;
        this.featured = featured;
    }

    private void validateAdminValues(BigDecimal price, int stock, int popularityScore) {
        if (price == null || price.signum() < 0) {
            throw new IllegalArgumentException("가격은 0 이상이어야 합니다.");
        }
        if (stock < 0) {
            throw new IllegalArgumentException("재고는 0 이상이어야 합니다.");
        }
        if (popularityScore < 0) {
            throw new IllegalArgumentException("인기 점수는 0 이상이어야 합니다.");
        }
    }
}
