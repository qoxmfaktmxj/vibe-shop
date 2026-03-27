package com.vibeshop.api.admin;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
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
        AdminSessionUserResponse user
    ) {
        public static AdminSessionResponse unauthenticated() {
            return new AdminSessionResponse(false, null);
        }
    }

    public record AdminBootstrapStatusResponse(boolean signupEnabled) {
    }

    public record BootstrapAdminSignupRequest(
        @NotBlank(message = "관리자 이름을 입력해 주세요.")
        @Size(max = 80, message = "관리자 이름은 80자 이하로 입력해 주세요.") String name,
        @NotBlank(message = "관리자 이메일을 입력해 주세요.")
        @Email(message = "올바른 이메일 형식을 입력해 주세요.") String email,
        @NotBlank(message = "관리자 비밀번호를 입력해 주세요.")
        @Size(min = 8, message = "관리자 비밀번호는 8자 이상이어야 합니다.") String password
    ) {
    }

    public record AdminDisplayItemResponse(
        Long id,
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
        OffsetDateTime endsAt
    ) {
    }

    public record AdminDisplaySectionResponse(
        Long id,
        String code,
        String title,
        String subtitle,
        int displayOrder,
        boolean visible,
        List<AdminDisplayItemResponse> items
    ) {
    }

    public record AdminDisplayResponse(
        String heroTitle,
        String heroSubtitle,
        String heroCtaLabel,
        String heroCtaHref,
        List<AdminDisplaySectionResponse> sections
    ) {
    }

    public record UpdateAdminDisplayRequest(
        @NotBlank(message = "메인 제목을 입력해 주세요.")
        @Size(max = 255, message = "메인 제목은 255자 이하로 입력해 주세요.") String heroTitle,
        @NotBlank(message = "메인 설명을 입력해 주세요.")
        @Size(max = 1000, message = "메인 설명은 1000자 이하로 입력해 주세요.") String heroSubtitle,
        @NotBlank(message = "메인 버튼 문구를 입력해 주세요.")
        @Size(max = 80, message = "메인 버튼 문구는 80자 이하로 입력해 주세요.") String heroCtaLabel,
        @NotBlank(message = "메인 버튼 링크를 입력해 주세요.")
        @Size(max = 255, message = "메인 버튼 링크는 255자 이하로 입력해 주세요.") String heroCtaHref
    ) {
    }

    public record UpdateAdminDisplaySectionRequest(
        @NotBlank(message = "섹션 제목을 입력해 주세요.")
        @Size(max = 255, message = "섹션 제목은 255자 이하로 입력해 주세요.") String title,
        @NotBlank(message = "섹션 설명을 입력해 주세요.")
        @Size(max = 1000, message = "섹션 설명은 1000자 이하로 입력해 주세요.") String subtitle,
        @Min(value = 0, message = "정렬 순서는 0 이상이어야 합니다.") int displayOrder,
        boolean visible
    ) {
    }

    public record CreateAdminDisplayItemRequest(
        @NotBlank(message = "섹션 코드를 선택해 주세요.") String sectionCode,
        @NotBlank(message = "배너 제목을 입력해 주세요.")
        @Size(max = 255, message = "배너 제목은 255자 이하로 입력해 주세요.") String title,
        @NotBlank(message = "배너 설명을 입력해 주세요.")
        @Size(max = 1000, message = "배너 설명은 1000자 이하로 입력해 주세요.") String subtitle,
        @NotBlank(message = "이미지 경로를 입력해 주세요.")
        @Size(max = 255, message = "이미지 경로는 255자 이하로 입력해 주세요.") String imageUrl,
        @NotBlank(message = "이미지 대체 텍스트를 입력해 주세요.")
        @Size(max = 255, message = "이미지 대체 텍스트는 255자 이하로 입력해 주세요.") String imageAlt,
        @NotBlank(message = "이동 링크를 입력해 주세요.")
        @Size(max = 255, message = "이동 링크는 255자 이하로 입력해 주세요.") String href,
        @NotBlank(message = "버튼 문구를 입력해 주세요.")
        @Size(max = 80, message = "버튼 문구는 80자 이하로 입력해 주세요.") String ctaLabel,
        @NotBlank(message = "강조 색상을 입력해 주세요.")
        @Size(max = 20, message = "강조 색상은 20자 이하로 입력해 주세요.") String accentColor,
        @Min(value = 0, message = "정렬 순서는 0 이상이어야 합니다.") int displayOrder,
        boolean visible,
        OffsetDateTime startsAt,
        OffsetDateTime endsAt
    ) {
    }

    public record UpdateAdminDisplayItemRequest(
        @NotBlank(message = "섹션 코드를 선택해 주세요.") String sectionCode,
        @NotBlank(message = "배너 제목을 입력해 주세요.")
        @Size(max = 255, message = "배너 제목은 255자 이하로 입력해 주세요.") String title,
        @NotBlank(message = "배너 설명을 입력해 주세요.")
        @Size(max = 1000, message = "배너 설명은 1000자 이하로 입력해 주세요.") String subtitle,
        @NotBlank(message = "이미지 경로를 입력해 주세요.")
        @Size(max = 255, message = "이미지 경로는 255자 이하로 입력해 주세요.") String imageUrl,
        @NotBlank(message = "이미지 대체 텍스트를 입력해 주세요.")
        @Size(max = 255, message = "이미지 대체 텍스트는 255자 이하로 입력해 주세요.") String imageAlt,
        @NotBlank(message = "이동 링크를 입력해 주세요.")
        @Size(max = 255, message = "이동 링크는 255자 이하로 입력해 주세요.") String href,
        @NotBlank(message = "버튼 문구를 입력해 주세요.")
        @Size(max = 80, message = "버튼 문구는 80자 이하로 입력해 주세요.") String ctaLabel,
        @NotBlank(message = "강조 색상을 입력해 주세요.")
        @Size(max = 20, message = "강조 색상은 20자 이하로 입력해 주세요.") String accentColor,
        @Min(value = 0, message = "정렬 순서는 0 이상이어야 합니다.") int displayOrder,
        boolean visible,
        OffsetDateTime startsAt,
        OffsetDateTime endsAt
    ) {
    }

    public record DeleteAdminDisplayItemResponse(Long itemId) {
    }

    public record AdminCategoryResponse(
        Long id,
        String slug,
        String name,
        String description,
        String accentColor,
        int displayOrder,
        boolean visible,
        String coverImageUrl,
        String coverImageAlt,
        String heroTitle,
        String heroSubtitle,
        long productCount
    ) {
    }

    public record CreateAdminCategoryRequest(
        @NotBlank(message = "카테고리 slug를 입력해 주세요.")
        @Size(max = 80, message = "카테고리 slug는 80자 이하로 입력해 주세요.") String slug,
        @NotBlank(message = "카테고리명을 입력해 주세요.")
        @Size(max = 80, message = "카테고리명은 80자 이하로 입력해 주세요.") String name,
        @NotBlank(message = "카테고리 설명을 입력해 주세요.")
        @Size(max = 255, message = "카테고리 설명은 255자 이하로 입력해 주세요.") String description,
        @NotBlank(message = "강조 색상을 입력해 주세요.")
        @Size(max = 20, message = "강조 색상은 20자 이하로 입력해 주세요.") String accentColor,
        @Min(value = 0, message = "정렬 순서는 0 이상이어야 합니다.") int displayOrder,
        boolean visible,
        @NotBlank(message = "커버 이미지 경로를 입력해 주세요.")
        @Size(max = 255, message = "커버 이미지 경로는 255자 이하로 입력해 주세요.") String coverImageUrl,
        @NotBlank(message = "커버 이미지 대체 텍스트를 입력해 주세요.")
        @Size(max = 255, message = "커버 이미지 대체 텍스트는 255자 이하로 입력해 주세요.") String coverImageAlt,
        @NotBlank(message = "카테고리 히어로 제목을 입력해 주세요.")
        @Size(max = 255, message = "카테고리 히어로 제목은 255자 이하로 입력해 주세요.") String heroTitle,
        @NotBlank(message = "카테고리 히어로 설명을 입력해 주세요.")
        @Size(max = 1000, message = "카테고리 히어로 설명은 1000자 이하로 입력해 주세요.") String heroSubtitle
    ) {
    }

    public record UpdateAdminCategoryRequest(
        @NotBlank(message = "카테고리 slug를 입력해 주세요.")
        @Size(max = 80, message = "카테고리 slug는 80자 이하로 입력해 주세요.") String slug,
        @NotBlank(message = "카테고리명을 입력해 주세요.")
        @Size(max = 80, message = "카테고리명은 80자 이하로 입력해 주세요.") String name,
        @NotBlank(message = "카테고리 설명을 입력해 주세요.")
        @Size(max = 255, message = "카테고리 설명은 255자 이하로 입력해 주세요.") String description,
        @NotBlank(message = "강조 색상을 입력해 주세요.")
        @Size(max = 20, message = "강조 색상은 20자 이하로 입력해 주세요.") String accentColor,
        @Min(value = 0, message = "정렬 순서는 0 이상이어야 합니다.") int displayOrder,
        boolean visible,
        @NotBlank(message = "커버 이미지 경로를 입력해 주세요.")
        @Size(max = 255, message = "커버 이미지 경로는 255자 이하로 입력해 주세요.") String coverImageUrl,
        @NotBlank(message = "커버 이미지 대체 텍스트를 입력해 주세요.")
        @Size(max = 255, message = "커버 이미지 대체 텍스트는 255자 이하로 입력해 주세요.") String coverImageAlt,
        @NotBlank(message = "카테고리 히어로 제목을 입력해 주세요.")
        @Size(max = 255, message = "카테고리 히어로 제목은 255자 이하로 입력해 주세요.") String heroTitle,
        @NotBlank(message = "카테고리 히어로 설명을 입력해 주세요.")
        @Size(max = 1000, message = "카테고리 히어로 설명은 1000자 이하로 입력해 주세요.") String heroSubtitle
    ) {
    }

    public record DeleteAdminCategoryResponse(Long categoryId) {
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

    public record CreateAdminProductRequest(
        @NotBlank(message = "상품 카테고리를 선택해 주세요.")
        @Size(max = 80, message = "상품 카테고리 slug는 80자 이하여야 합니다.") String categorySlug,
        @NotBlank(message = "상품 slug를 입력해 주세요.")
        @Size(max = 120, message = "상품 slug는 120자 이하여야 합니다.") String slug,
        @NotBlank(message = "상품명을 입력해 주세요.")
        @Size(max = 120, message = "상품명은 120자 이하여야 합니다.") String name,
        @NotBlank(message = "상품 요약을 입력해 주세요.")
        @Size(max = 255, message = "상품 요약은 255자 이하여야 합니다.") String summary,
        @NotBlank(message = "상품 설명을 입력해 주세요.")
        @Size(max = 5000, message = "상품 설명은 5000자 이하여야 합니다.") String description,
        @DecimalMin(value = "0", message = "가격은 0 이상이어야 합니다.") BigDecimal price,
        @NotBlank(message = "배지 문구를 입력해 주세요.")
        @Size(max = 50, message = "배지 문구는 50자 이하여야 합니다.") String badge,
        @NotBlank(message = "강조 색상을 입력해 주세요.")
        @Size(max = 20, message = "강조 색상은 20자 이하여야 합니다.") String accentColor,
        @NotBlank(message = "이미지 경로를 입력해 주세요.")
        @Size(max = 255, message = "이미지 경로는 255자 이하여야 합니다.") String imageUrl,
        @NotBlank(message = "이미지 대체 텍스트를 입력해 주세요.")
        @Size(max = 255, message = "이미지 대체 텍스트는 255자 이하여야 합니다.") String imageAlt,
        boolean featured,
        @Min(value = 0, message = "재고는 0 이상이어야 합니다.") int stock,
        @Min(value = 0, message = "인기 점수는 0 이상이어야 합니다.") int popularityScore
    ) {
    }

    public record UpdateAdminProductRequest(
        @NotBlank(message = "상품명을 입력해 주세요.")
        @Size(max = 120, message = "상품명은 120자 이하로 입력해 주세요.") String name,
        @NotBlank(message = "상품 요약을 입력해 주세요.")
        @Size(max = 255, message = "상품 요약은 255자 이하로 입력해 주세요.") String summary,
        @NotBlank(message = "배지 문구를 입력해 주세요.")
        @Size(max = 50, message = "배지 문구는 50자 이하로 입력해 주세요.") String badge,
        @DecimalMin(value = "0", message = "가격은 0 이상이어야 합니다.") BigDecimal price,
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

    public record AdminMemberResponse(
        Long id,
        String name,
        String email,
        String phone,
        String provider,
        String role,
        String status,
        boolean marketingOptIn,
        OffsetDateTime createdAt,
        OffsetDateTime lastLoginAt,
        long orderCount,
        long shippingAddressCount,
        BigDecimal totalSpent
    ) {
    }

    public record AdminManagedAccountResponse(
        Long id,
        String name,
        String email,
        String role,
        String status,
        String provider,
        OffsetDateTime createdAt,
        OffsetDateTime lastLoginAt
    ) {
    }

    public record CreateAdminAccountRequest(
        @NotBlank(message = "관리자 이름을 입력해 주세요.")
        @Size(max = 80, message = "관리자 이름은 80자 이하로 입력해 주세요.") String name,
        @NotBlank(message = "관리자 이메일을 입력해 주세요.")
        @Email(message = "올바른 이메일 형식을 입력해 주세요.") String email,
        @NotBlank(message = "관리자 비밀번호를 입력해 주세요.")
        @Size(min = 8, message = "관리자 비밀번호는 8자 이상이어야 합니다.") String password,
        @NotBlank(message = "관리자 역할을 선택해 주세요.") String role
    ) {
    }

    public record UpdateAdminMemberStatusRequest(
        @NotBlank(message = "회원 상태를 입력해 주세요.") String status
    ) {
    }

    public record AdminStatisticsSummaryResponse(
        int windowDays,
        long orderCount,
        BigDecimal paidRevenue,
        long newMemberCount,
        long cancelledOrderCount,
        long refundedOrderCount
    ) {
    }

    public record AdminDailyMetricResponse(
        String date,
        long orderCount,
        BigDecimal paidRevenue,
        long newMemberCount
    ) {
    }

    public record AdminCategorySalesResponse(
        String categorySlug,
        String categoryName,
        long quantity,
        BigDecimal revenue
    ) {
    }

    public record AdminTopProductResponse(
        Long productId,
        String productName,
        String categoryName,
        long quantity,
        BigDecimal revenue
    ) {
    }

    public record AdminStatisticsResponse(
        AdminStatisticsSummaryResponse sevenDay,
        AdminStatisticsSummaryResponse thirtyDay,
        List<AdminDailyMetricResponse> dailyMetrics,
        List<AdminCategorySalesResponse> categorySales,
        List<AdminTopProductResponse> topProducts
    ) {
    }

    public record AdminOperationsSummaryResponse(
        int lowStockThreshold,
        int suspiciousScoreThreshold,
        int lowRatingThreshold,
        long lowStockCount,
        long suspiciousOrderCount,
        long trendingProductCount,
        long lowRatingReviewCount,
        long fulfillmentAttentionCount
    ) {
    }

    public record AdminLowStockProductResponse(
        Long productId,
        String productName,
        String categoryName,
        int stock,
        int popularityScore,
        boolean featured
    ) {
    }

    public record AdminSuspiciousOrderResponse(
        String orderNumber,
        String customerName,
        String customerType,
        String phone,
        String status,
        String paymentStatus,
        String paymentMethod,
        BigDecimal total,
        int itemCount,
        String riskLevel,
        int riskScore,
        List<String> reasons,
        OffsetDateTime createdAt
    ) {
    }

    public record AdminTrendingProductDetailResponse(
        Long productId,
        String productName,
        String categoryName,
        int stock,
        long recentViewCount,
        long paidOrderQuantity,
        long wishlistCount,
        int trendScore
    ) {
    }

    public record AdminLowRatingReviewResponse(
        Long reviewId,
        Long productId,
        String productName,
        String reviewerName,
        String reviewerEmail,
        int rating,
        String title,
        String status,
        int helpfulCount,
        boolean buyerReview,
        OffsetDateTime createdAt
    ) {
    }

    public record AdminOperationsResponse(
        AdminOperationsSummaryResponse summary,
        List<AdminLowStockProductResponse> lowStockProducts,
        List<AdminSuspiciousOrderResponse> suspiciousOrders,
        List<AdminTrendingProductDetailResponse> trendingProducts,
        List<AdminLowRatingReviewResponse> lowRatingReviews
    ) {
    }

    public record AdminDashboardResponse(
        AdminDisplayResponse display,
        long productCount,
        long featuredProductCount,
        long lowStockCount,
        long memberCount,
        long activeMemberCount,
        long dormantMemberCount,
        long blockedMemberCount,
        long totalOrderCount,
        long paidOrderCount,
        long pendingOrderCount,
        List<AdminOrderResponse> recentOrders,
        List<AdminProductResponse> spotlightProducts
    ) {
    }
}
