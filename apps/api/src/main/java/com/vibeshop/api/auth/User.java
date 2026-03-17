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

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserStatus status;

    @Column(length = 30)
    private String phone;

    @Column(name = "last_login_at")
    private OffsetDateTime lastLoginAt;

    @Column(name = "marketing_opt_in", nullable = false)
    private boolean marketingOptIn;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    public User(
        String name,
        String email,
        String passwordHash,
        AuthProviderType provider,
        OffsetDateTime createdAt
    ) {
        this(
            name,
            email,
            passwordHash,
            provider,
            UserRole.CUSTOMER,
            UserStatus.ACTIVE,
            null,
            false,
            null,
            createdAt
        );
    }

    public User(
        String name,
        String email,
        String passwordHash,
        AuthProviderType provider,
        UserRole role,
        OffsetDateTime createdAt
    ) {
        this(
            name,
            email,
            passwordHash,
            provider,
            role,
            UserStatus.ACTIVE,
            null,
            false,
            null,
            createdAt
        );
    }

    public User(
        String name,
        String email,
        String passwordHash,
        AuthProviderType provider,
        UserRole role,
        UserStatus status,
        String phone,
        boolean marketingOptIn,
        OffsetDateTime lastLoginAt,
        OffsetDateTime createdAt
    ) {
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.provider = provider;
        this.role = role;
        this.status = status;
        this.phone = phone;
        this.lastLoginAt = lastLoginAt;
        this.marketingOptIn = marketingOptIn;
        this.createdAt = createdAt;
    }

    public void rename(String name) {
        this.name = name;
    }

    public void syncSocialProfile(String name, AuthProviderType provider) {
        this.name = name;
        this.provider = provider;
    }

    public void changeStatus(UserStatus status) {
        this.status = status;
    }

    public void markLoggedIn(OffsetDateTime lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }

    public boolean isAdmin() {
        return role != UserRole.CUSTOMER;
    }

    public boolean isBlocked() {
        return status == UserStatus.BLOCKED;
    }
}
