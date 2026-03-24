package com.vibeshop.api.review;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;

import com.vibeshop.api.auth.User;
import com.vibeshop.api.catalog.Product;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "product_reviews")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProductReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private int rating;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "fit_tag", length = 40)
    private String fitTag;

    @Column(name = "repurchase_yn", nullable = false)
    private boolean repurchaseYn;

    @Column(name = "delivery_satisfaction")
    private Integer deliverySatisfaction;

    @Column(name = "packaging_satisfaction")
    private Integer packagingSatisfaction;

    @Column(name = "helpful_count", nullable = false)
    private int helpfulCount;

    @Column(name = "is_buyer_review", nullable = false)
    private boolean isBuyerReview;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReviewStatus status;

    @OrderBy("displayOrder ASC, id ASC")
    @OneToMany(mappedBy = "review", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReviewImage> images = new ArrayList<>();

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public ProductReview(
        Product product,
        User user,
        int rating,
        String title,
        String content,
        String fitTag,
        boolean repurchaseYn,
        Integer deliverySatisfaction,
        Integer packagingSatisfaction,
        ReviewStatus status,
        int helpfulCount,
        boolean isBuyerReview,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
    ) {
        this.product = product;
        this.user = user;
        this.rating = rating;
        this.title = title;
        this.content = content;
        this.fitTag = fitTag;
        this.repurchaseYn = repurchaseYn;
        this.deliverySatisfaction = deliverySatisfaction;
        this.packagingSatisfaction = packagingSatisfaction;
        this.status = status;
        this.helpfulCount = helpfulCount;
        this.isBuyerReview = isBuyerReview;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public void updateDetails(
        int rating,
        String title,
        String content,
        String fitTag,
        boolean repurchaseYn,
        Integer deliverySatisfaction,
        Integer packagingSatisfaction,
        OffsetDateTime updatedAt
    ) {
        this.rating = rating;
        this.title = title;
        this.content = content;
        this.fitTag = fitTag;
        this.repurchaseYn = repurchaseYn;
        this.deliverySatisfaction = deliverySatisfaction;
        this.packagingSatisfaction = packagingSatisfaction;
        this.updatedAt = updatedAt;
    }

    public void replaceImages(List<String> imageUrls, OffsetDateTime now) {
        images.clear();
        if (imageUrls == null || imageUrls.isEmpty()) {
            return;
        }

        for (int index = 0; index < imageUrls.size(); index++) {
            images.add(new ReviewImage(this, imageUrls.get(index), index, now));
        }
    }

    public void changeStatus(ReviewStatus status, OffsetDateTime updatedAt) {
        this.status = status;
        this.updatedAt = updatedAt;
    }

    public void syncHelpfulCount(int helpfulCount) {
        this.helpfulCount = helpfulCount;
    }

    public boolean hasPhotos() {
        return !images.isEmpty();
    }
}
