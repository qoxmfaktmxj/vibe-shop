package com.vibeshop.api.display;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "display_sections")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DisplaySection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true, length = 40)
    private DisplaySectionCode code;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String subtitle;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(name = "is_visible", nullable = false)
    private boolean visible;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @OneToMany(mappedBy = "section", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DisplayItem> items = new ArrayList<>();

    public DisplaySection(
        DisplaySectionCode code,
        String title,
        String subtitle,
        int displayOrder,
        boolean visible,
        OffsetDateTime updatedAt
    ) {
        this.code = code;
        this.title = title;
        this.subtitle = subtitle;
        this.displayOrder = displayOrder;
        this.visible = visible;
        this.updatedAt = updatedAt;
    }

    public void updateMetadata(String title, String subtitle, int displayOrder, boolean visible, OffsetDateTime updatedAt) {
        this.title = title;
        this.subtitle = subtitle;
        this.displayOrder = displayOrder;
        this.visible = visible;
        this.updatedAt = updatedAt;
    }
}
