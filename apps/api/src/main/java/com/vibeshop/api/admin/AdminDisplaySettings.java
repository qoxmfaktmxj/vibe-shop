package com.vibeshop.api.admin;

import java.time.OffsetDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "admin_display_settings")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AdminDisplaySettings {

    @Id
    private Long id;

    @Column(name = "hero_title", nullable = false, length = 255)
    private String heroTitle;

    @Column(name = "hero_subtitle", nullable = false, columnDefinition = "TEXT")
    private String heroSubtitle;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public AdminDisplaySettings(Long id, String heroTitle, String heroSubtitle, OffsetDateTime updatedAt) {
        this.id = id;
        this.heroTitle = heroTitle;
        this.heroSubtitle = heroSubtitle;
        this.updatedAt = updatedAt;
    }

    public void update(String heroTitle, String heroSubtitle, OffsetDateTime updatedAt) {
        this.heroTitle = heroTitle;
        this.heroSubtitle = heroSubtitle;
        this.updatedAt = updatedAt;
    }
}
