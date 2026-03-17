package com.vibeshop.api.catalog;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "categories")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 80)
    private String slug;

    @Column(nullable = false, length = 80)
    private String name;

    @Column(nullable = false, length = 255)
    private String description;

    @Column(name = "accent_color", nullable = false, length = 20)
    private String accentColor;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(name = "is_visible", nullable = false)
    private boolean visible;

    @Column(name = "cover_image_url", nullable = false, length = 255)
    private String coverImageUrl;

    @Column(name = "cover_image_alt", nullable = false, length = 255)
    private String coverImageAlt;

    @Column(name = "hero_title", nullable = false, length = 255)
    private String heroTitle;

    @Column(name = "hero_subtitle", nullable = false, columnDefinition = "TEXT")
    private String heroSubtitle;

    @OneToMany(mappedBy = "category")
    private List<Product> products = new ArrayList<>();

    public Category(
        String slug,
        String name,
        String description,
        String accentColor,
        int displayOrder,
        boolean visible,
        String coverImageUrl,
        String coverImageAlt,
        String heroTitle,
        String heroSubtitle
    ) {
        this.slug = slug;
        this.name = name;
        this.description = description;
        this.accentColor = accentColor;
        this.displayOrder = displayOrder;
        this.visible = visible;
        this.coverImageUrl = coverImageUrl;
        this.coverImageAlt = coverImageAlt;
        this.heroTitle = heroTitle;
        this.heroSubtitle = heroSubtitle;
    }

    public void updateForAdmin(
        String slug,
        String name,
        String description,
        String accentColor,
        int displayOrder,
        boolean visible,
        String coverImageUrl,
        String coverImageAlt,
        String heroTitle,
        String heroSubtitle
    ) {
        this.slug = slug;
        this.name = name;
        this.description = description;
        this.accentColor = accentColor;
        this.displayOrder = displayOrder;
        this.visible = visible;
        this.coverImageUrl = coverImageUrl;
        this.coverImageAlt = coverImageAlt;
        this.heroTitle = heroTitle;
        this.heroSubtitle = heroSubtitle;
    }
}
