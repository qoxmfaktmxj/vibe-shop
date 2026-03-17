package com.vibeshop.api.account;

import java.time.OffsetDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AccountDtos {

    private AccountDtos() {
    }

    public record AccountProfileResponse(
        Long id,
        String name,
        String email,
        String provider,
        OffsetDateTime createdAt,
        long orderCount,
        long addressCount,
        long wishlistCount,
        long reviewCount
    ) {
    }

    public record UpdateProfileRequest(
        @NotBlank(message = "이름을 입력해 주세요.")
        @Size(max = 80, message = "이름은 80자 이하여야 합니다.") String name
    ) {
    }

    public record ShippingAddressRequest(
        @NotBlank(message = "배송지 별칭을 입력해 주세요.")
        @Size(max = 40, message = "배송지 별칭은 40자 이하여야 합니다.") String label,
        @NotBlank(message = "받는 분 이름을 입력해 주세요.")
        @Size(max = 80, message = "받는 분 이름은 80자 이하여야 합니다.") String recipientName,
        @NotBlank(message = "연락처를 입력해 주세요.")
        @Size(max = 30, message = "연락처는 30자 이하여야 합니다.") String phone,
        @NotBlank(message = "우편번호를 입력해 주세요.")
        @Size(max = 20, message = "우편번호는 20자 이하여야 합니다.") String postalCode,
        @NotBlank(message = "기본 주소를 입력해 주세요.")
        @Size(max = 255, message = "기본 주소는 255자 이하여야 합니다.") String address1,
        String address2,
        boolean isDefault
    ) {
    }

    public record ShippingAddressResponse(
        Long id,
        String label,
        String recipientName,
        String phone,
        String postalCode,
        String address1,
        String address2,
        boolean isDefault
    ) {
    }

    public record DeleteShippingAddressResponse(Long addressId) {
    }
}
