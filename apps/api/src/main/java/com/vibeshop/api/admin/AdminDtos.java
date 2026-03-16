package com.vibeshop.api.admin;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AdminDtos {

    private AdminDtos() {
    }

    public record AdminSessionUserResponse(
        Long id,
        String name,
        String email,
        String role
    ) {
    }

    public record AdminSessionResponse(
        boolean authenticated,
        AdminSessionUserResponse user,
        String sessionToken
    ) {
        public static AdminSessionResponse unauthenticated() {
            return new AdminSessionResponse(false, null, null);
        }
    }

    public record AdminDisplayResponse(
        String heroTitle,
        String heroSubtitle
    ) {
    }

    public record UpdateAdminDisplayRequest(
        @NotBlank(message = "메인 제목을 입력해 주세요.")
        @Size(max = 255, message = "메인 제목은 255자 이하여야 합니다.") String heroTitle,
        @NotBlank(message = "메인 설명을 입력해 주세요.")
        @Size(max = 1000, message = "메인 설명은 1000자 이하여야 합니다.") String heroSubtitle
    ) {
    }

    public record AdminProductResponse(
        Long id,
        String slug,
        String categorySlug,
        String categoryName,
        String name,
        String summary,
        BigDecimal price,
        String badge,
        boolean featured,
        int stock,
        int popularityScore,
        String imageUrl,
        String imageAlt
    ) {
    }

    public record UpdateAdminProductRequest(
        @NotBlank(message = "상품명을 입력해 주세요.")
        @Size(max = 120, message = "상품명은 120자 이하여야 합니다.") String name,
        @NotBlank(message = "상품 요약을 입력해 주세요.")
        @Size(max = 255, message = "상품 요약은 255자 이하여야 합니다.") String summary,
        @NotBlank(message = "배지 문구를 입력해 주세요.")
        @Size(max = 50, message = "배지 문구는 50자 이하여야 합니다.") String badge,
        @DecimalMin(value = "0", message = "가격은 0원 이상이어야 합니다.") BigDecimal price,
        @Min(value = 0, message = "재고는 0 이상이어야 합니다.") int stock,
        @Min(value = 0, message = "인기 점수는 0 이상이어야 합니다.") int popularityScore,
        boolean featured
    ) {
    }

    public record AdminOrderResponse(
        String orderNumber,
        String status,
        String paymentStatus,
        String paymentMethod,
        String customerType,
        String customerName,
        String phone,
        BigDecimal total,
        OffsetDateTime createdAt,
        int itemCount
    ) {
    }

    public record UpdateAdminOrderStatusRequest(
        @NotBlank(message = "주문 상태를 입력해 주세요.") String status
    ) {
    }

    public record AdminDashboardResponse(
        AdminDisplayResponse display,
        long productCount,
        long featuredProductCount,
        long lowStockCount,
        long memberCount,
        long totalOrderCount,
        long paidOrderCount,
        long pendingOrderCount,
        List<AdminOrderResponse> recentOrders,
        List<AdminProductResponse> spotlightProducts
    ) {
    }
}
