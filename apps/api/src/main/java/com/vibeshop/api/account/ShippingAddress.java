package com.vibeshop.api.account;

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

import com.vibeshop.api.auth.User;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "shipping_addresses")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ShippingAddress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 40)
    private String label;

    @Column(name = "recipient_name", nullable = false, length = 80)
    private String recipientName;

    @Column(nullable = false, length = 30)
    private String phone;

    @Column(name = "postal_code", nullable = false, length = 20)
    private String postalCode;

    @Column(nullable = false, length = 255)
    private String address1;

    @Column(nullable = false, length = 255)
    private String address2;

    @Column(name = "is_default", nullable = false)
    private boolean isDefault;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public ShippingAddress(
        User user,
        String label,
        String recipientName,
        String phone,
        String postalCode,
        String address1,
        String address2,
        boolean isDefault,
        OffsetDateTime now
    ) {
        this.user = user;
        this.label = label;
        this.recipientName = recipientName;
        this.phone = phone;
        this.postalCode = postalCode;
        this.address1 = address1;
        this.address2 = address2;
        this.isDefault = isDefault;
        this.createdAt = now;
        this.updatedAt = now;
    }

    public void update(
        String label,
        String recipientName,
        String phone,
        String postalCode,
        String address1,
        String address2,
        boolean isDefault,
        OffsetDateTime now
    ) {
        this.label = label;
        this.recipientName = recipientName;
        this.phone = phone;
        this.postalCode = postalCode;
        this.address1 = address1;
        this.address2 = address2;
        this.isDefault = isDefault;
        this.updatedAt = now;
    }

    public void changeDefault(boolean isDefault, OffsetDateTime now) {
        this.isDefault = isDefault;
        this.updatedAt = now;
    }
}
