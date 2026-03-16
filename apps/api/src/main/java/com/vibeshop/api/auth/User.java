package com.vibeshop.api.auth;

import java.time.OffsetDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "users")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String name;

    @Column(nullable = false, unique = true, length = 120)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 120)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AuthProviderType provider;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    public User(
        String name,
        String email,
        String passwordHash,
        AuthProviderType provider,
        OffsetDateTime createdAt
    ) {
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.provider = provider;
        this.createdAt = createdAt;
    }

    public void rename(String name) {
        this.name = name;
    }
}
