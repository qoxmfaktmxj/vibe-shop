package com.vibeshop.api.display;

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
@Table(name = "display_items")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DisplayItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "section_id", nullable = false)
    private DisplaySection section;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String subtitle;

    @Column(name = "image_url", nullable = false, length = 255)
    private String imageUrl;

    @Column(name = "image_alt", nullable = false, length = 255)
    private String imageAlt;

    @Column(nullable = false, length = 255)
    private String href;

    @Column(name = "cta_label", nullable = false, length = 80)
    private String ctaLabel;

    @Column(name = "accent_color", nullable = false, length = 20)
    private String accentColor;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(name = "is_visible", nullable = false)
    private boolean visible;

    @Column(name = "starts_at")
    private OffsetDateTime startsAt;

    @Column(name = "ends_at")
    private OffsetDateTime endsAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public DisplayItem(
        DisplaySection section,
        String title,
        String subtitle,
        String imageUrl,
        String imageAlt,
        String href,
        String ctaLabel,
        String accentColor,
        int displayOrder,
        boolean visible,
        OffsetDateTime startsAt,
        OffsetDateTime endsAt,
        OffsetDateTime updatedAt
    ) {
        this.section = section;
        this.title = title;
        this.subtitle = subtitle;
        this.imageUrl = imageUrl;
        this.imageAlt = imageAlt;
        this.href = href;
        this.ctaLabel = ctaLabel;
        this.accentColor = accentColor;
        this.displayOrder = displayOrder;
        this.visible = visible;
        this.startsAt = startsAt;
        this.endsAt = endsAt;
        this.updatedAt = updatedAt;
    }

    public void update(
        DisplaySection section,
        String title,
        String subtitle,
        String imageUrl,
        String imageAlt,
        String href,
        String ctaLabel,
        String accentColor,
        int displayOrder,
        boolean visible,
        OffsetDateTime startsAt,
        OffsetDateTime endsAt,
        OffsetDateTime updatedAt
    ) {
        this.section = section;
        this.title = title;
        this.subtitle = subtitle;
        this.imageUrl = imageUrl;
        this.imageAlt = imageAlt;
        this.href = href;
        this.ctaLabel = ctaLabel;
        this.accentColor = accentColor;
        this.displayOrder = displayOrder;
        this.visible = visible;
        this.startsAt = startsAt;
        this.endsAt = endsAt;
        this.updatedAt = updatedAt;
    }

    public boolean isActiveAt(OffsetDateTime point) {
        if (!visible) {
            return false;
        }

        if (startsAt != null && startsAt.isAfter(point)) {
            return false;
        }

        if (endsAt != null && endsAt.isBefore(point)) {
            return false;
        }

        return true;
    }
}
