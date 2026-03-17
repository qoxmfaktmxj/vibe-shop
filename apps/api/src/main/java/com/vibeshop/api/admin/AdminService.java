package com.vibeshop.api.admin;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vibeshop.api.admin.AdminDtos.AdminCategoryResponse;
import com.vibeshop.api.admin.AdminDtos.AdminDashboardResponse;
import com.vibeshop.api.admin.AdminDtos.AdminDisplayItemResponse;
import com.vibeshop.api.admin.AdminDtos.AdminDisplayResponse;
import com.vibeshop.api.admin.AdminDtos.AdminDisplaySectionResponse;
import com.vibeshop.api.admin.AdminDtos.AdminOrderResponse;
import com.vibeshop.api.admin.AdminDtos.AdminProductResponse;
import com.vibeshop.api.admin.AdminDtos.CreateAdminCategoryRequest;
import com.vibeshop.api.admin.AdminDtos.CreateAdminDisplayItemRequest;
import com.vibeshop.api.admin.AdminDtos.DeleteAdminCategoryResponse;
import com.vibeshop.api.admin.AdminDtos.DeleteAdminDisplayItemResponse;
import com.vibeshop.api.admin.AdminDtos.UpdateAdminCategoryRequest;
import com.vibeshop.api.admin.AdminDtos.UpdateAdminDisplayItemRequest;
import com.vibeshop.api.admin.AdminDtos.UpdateAdminDisplayRequest;
import com.vibeshop.api.admin.AdminDtos.UpdateAdminDisplaySectionRequest;
import com.vibeshop.api.admin.AdminDtos.UpdateAdminOrderStatusRequest;
import com.vibeshop.api.admin.AdminDtos.UpdateAdminProductRequest;
import com.vibeshop.api.auth.UserRepository;
import com.vibeshop.api.auth.UserRole;
import com.vibeshop.api.auth.UserStatus;
import com.vibeshop.api.catalog.Category;
import com.vibeshop.api.catalog.CategoryRepository;
import com.vibeshop.api.catalog.Product;
import com.vibeshop.api.catalog.ProductRepository;
import com.vibeshop.api.common.ResourceNotFoundException;
import com.vibeshop.api.display.DisplayItem;
import com.vibeshop.api.display.DisplayItemRepository;
import com.vibeshop.api.display.DisplaySection;
import com.vibeshop.api.display.DisplaySectionCode;
import com.vibeshop.api.display.DisplaySectionRepository;
import com.vibeshop.api.order.CustomerOrder;
import com.vibeshop.api.order.CustomerOrderLine;
import com.vibeshop.api.order.CustomerOrderRepository;
import com.vibeshop.api.order.OrderPayment;
import com.vibeshop.api.order.OrderPaymentRepository;
import com.vibeshop.api.order.OrderService;
import com.vibeshop.api.order.OrderStatus;

@Service
@Transactional
public class AdminService {

    private static final long DISPLAY_SETTINGS_ID = 1L;
    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");
    private static final Comparator<DisplayItem> DISPLAY_ITEM_ORDER = Comparator
        .comparing(DisplayItem::getDisplayOrder)
        .thenComparing(DisplayItem::getId);
    private static final Pattern SLUG_ALLOWED = Pattern.compile("^[a-z0-9-]+$");

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final CustomerOrderRepository customerOrderRepository;
    private final OrderPaymentRepository orderPaymentRepository;
    private final UserRepository userRepository;
    private final AdminDisplaySettingsRepository adminDisplaySettingsRepository;
    private final DisplaySectionRepository displaySectionRepository;
    private final DisplayItemRepository displayItemRepository;
    private final OrderService orderService;

    public AdminService(
        ProductRepository productRepository,
        CategoryRepository categoryRepository,
        CustomerOrderRepository customerOrderRepository,
        OrderPaymentRepository orderPaymentRepository,
        UserRepository userRepository,
        AdminDisplaySettingsRepository adminDisplaySettingsRepository,
        DisplaySectionRepository displaySectionRepository,
        DisplayItemRepository displayItemRepository,
        OrderService orderService
    ) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.customerOrderRepository = customerOrderRepository;
        this.orderPaymentRepository = orderPaymentRepository;
        this.userRepository = userRepository;
        this.adminDisplaySettingsRepository = adminDisplaySettingsRepository;
        this.displaySectionRepository = displaySectionRepository;
        this.displayItemRepository = displayItemRepository;
        this.orderService = orderService;
    }

    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboard() {
        List<CustomerOrder> recentOrders = customerOrderRepository.findAllByOrderByCreatedAtDesc().stream()
            .limit(6)
            .toList();
        Map<Long, OrderPayment> paymentMap = getPaymentMap(recentOrders);

        List<AdminProductResponse> spotlightProducts = productRepository.findAllByOrderByFeaturedDescIdAsc().stream()
            .filter(Product::isFeatured)
            .limit(4)
            .map(this::toProductResponse)
            .toList();

        return new AdminDashboardResponse(
            getDisplay(),
            productRepository.count(),
            productRepository.countByFeaturedTrue(),
            productRepository.countByStockLessThanEqual(5),
            userRepository.countByRole(UserRole.CUSTOMER),
            userRepository.countByRoleAndStatus(UserRole.CUSTOMER, UserStatus.ACTIVE),
            userRepository.countByRoleAndStatus(UserRole.CUSTOMER, UserStatus.DORMANT),
            userRepository.countByRoleAndStatus(UserRole.CUSTOMER, UserStatus.BLOCKED),
            customerOrderRepository.count(),
            customerOrderRepository.countByStatus(OrderStatus.PAID),
            customerOrderRepository.countByStatus(OrderStatus.PENDING_PAYMENT),
            recentOrders.stream().map(order -> toOrderResponse(order, paymentMap.get(order.getId()))).toList(),
            spotlightProducts
        );
    }

    @Transactional(readOnly = true)
    public List<AdminProductResponse> getProducts(String categorySlug, String keyword) {
        String normalizedCategorySlug = normalize(categorySlug);
        String normalizedKeyword = normalize(keyword);

        List<Product> products = normalizedKeyword == null
            ? (
                normalizedCategorySlug == null
                    ? productRepository.findAllByOrderByCreatedAtDescIdDesc()
                    : productRepository.findByCategory_SlugOrderByFeaturedDescIdAsc(normalizedCategorySlug)
            )
            : productRepository.search(normalizedCategorySlug, normalizedKeyword);

        return products.stream().map(this::toProductResponse).toList();
    }

    public AdminProductResponse updateProduct(Long productId, UpdateAdminProductRequest request) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("상품을 찾을 수 없습니다."));

        product.updateForAdmin(
            request.name().trim(),
            request.summary().trim(),
            request.badge().trim(),
            request.price(),
            request.stock(),
            request.popularityScore(),
            request.featured()
        );

        return toProductResponse(product);
    }

    @Transactional(readOnly = true)
    public List<AdminOrderResponse> getOrders(String status) {
        OrderStatus normalizedStatus = normalizeStatus(status);
        List<CustomerOrder> orders = customerOrderRepository.findAllByOrderByCreatedAtDesc().stream()
            .filter(order -> normalizedStatus == null || order.getStatus() == normalizedStatus)
            .toList();
        Map<Long, OrderPayment> paymentMap = getPaymentMap(orders);
        return orders.stream().map(order -> toOrderResponse(order, paymentMap.get(order.getId()))).toList();
    }

    public AdminOrderResponse updateOrderStatus(String orderNumber, UpdateAdminOrderStatusRequest request) {
        OrderStatus nextStatus = normalizeRequiredStatus(request.status());
        return toOrderResponse(orderService.updateStatusForAdmin(orderNumber, nextStatus));
    }

    @Transactional(readOnly = true)
    public AdminDisplayResponse getDisplay() {
        AdminDisplaySettings settings = getDisplaySettings();
        List<DisplaySection> sections = ensureDisplaySections();

        return new AdminDisplayResponse(
            settings.getHeroTitle(),
            settings.getHeroSubtitle(),
            settings.getHeroCtaLabel(),
            settings.getHeroCtaHref(),
            sections.stream().map(this::toDisplaySectionResponse).toList()
        );
    }

    public AdminDisplayResponse updateDisplay(UpdateAdminDisplayRequest request) {
        AdminDisplaySettings settings = getDisplaySettings();
        settings.update(
            request.heroTitle().trim(),
            request.heroSubtitle().trim(),
            request.heroCtaLabel().trim(),
            request.heroCtaHref().trim(),
            now()
        );
        return getDisplay();
    }

    public AdminDisplaySectionResponse updateDisplaySection(
        String code,
        UpdateAdminDisplaySectionRequest request
    ) {
        DisplaySection section = getSectionByCode(code);
        section.updateMetadata(
            request.title().trim(),
            request.subtitle().trim(),
            request.displayOrder(),
            request.visible(),
            now()
        );
        return toDisplaySectionResponse(section);
    }

    public AdminDisplayItemResponse createDisplayItem(CreateAdminDisplayItemRequest request) {
        validateDisplaySchedule(request.startsAt(), request.endsAt());
        DisplaySection section = getSectionByCode(request.sectionCode());
        DisplayItem item = displayItemRepository.save(new DisplayItem(
            section,
            request.title().trim(),
            request.subtitle().trim(),
            request.imageUrl().trim(),
            request.imageAlt().trim(),
            request.href().trim(),
            request.ctaLabel().trim(),
            request.accentColor().trim(),
            request.displayOrder(),
            request.visible(),
            request.startsAt(),
            request.endsAt(),
            now()
        ));
        return toDisplayItemResponse(item);
    }

    public AdminDisplayItemResponse updateDisplayItem(Long itemId, UpdateAdminDisplayItemRequest request) {
        validateDisplaySchedule(request.startsAt(), request.endsAt());
        DisplayItem item = displayItemRepository.findById(itemId)
            .orElseThrow(() -> new ResourceNotFoundException("배너를 찾을 수 없습니다."));
        DisplaySection section = getSectionByCode(request.sectionCode());

        item.update(
            section,
            request.title().trim(),
            request.subtitle().trim(),
            request.imageUrl().trim(),
            request.imageAlt().trim(),
            request.href().trim(),
            request.ctaLabel().trim(),
            request.accentColor().trim(),
            request.displayOrder(),
            request.visible(),
            request.startsAt(),
            request.endsAt(),
            now()
        );
        return toDisplayItemResponse(item);
    }

    public DeleteAdminDisplayItemResponse deleteDisplayItem(Long itemId) {
        DisplayItem item = displayItemRepository.findById(itemId)
            .orElseThrow(() -> new ResourceNotFoundException("배너를 찾을 수 없습니다."));
        displayItemRepository.delete(item);
        return new DeleteAdminDisplayItemResponse(itemId);
    }

    @Transactional(readOnly = true)
    public List<AdminCategoryResponse> getCategories() {
        return categoryRepository.findAllByOrderByDisplayOrderAscIdAsc().stream()
            .map(this::toCategoryResponse)
            .toList();
    }

    public AdminCategoryResponse createCategory(CreateAdminCategoryRequest request) {
        String normalizedSlug = normalizeSlug(request.slug());
        if (categoryRepository.existsBySlugIgnoreCase(normalizedSlug)) {
            throw new IllegalArgumentException("이미 사용 중인 카테고리 slug입니다.");
        }

        Category category = categoryRepository.save(new Category(
            normalizedSlug,
            request.name().trim(),
            request.description().trim(),
            request.accentColor().trim(),
            request.displayOrder(),
            request.visible(),
            request.coverImageUrl().trim(),
            request.coverImageAlt().trim(),
            request.heroTitle().trim(),
            request.heroSubtitle().trim()
        ));

        return toCategoryResponse(category);
    }

    public AdminCategoryResponse updateCategory(Long categoryId, UpdateAdminCategoryRequest request) {
        Category category = categoryRepository.findById(categoryId)
            .orElseThrow(() -> new ResourceNotFoundException("카테고리를 찾을 수 없습니다."));

        String normalizedSlug = normalizeSlug(request.slug());
        if (categoryRepository.existsBySlugIgnoreCaseAndIdNot(normalizedSlug, categoryId)) {
            throw new IllegalArgumentException("이미 사용 중인 카테고리 slug입니다.");
        }

        category.updateForAdmin(
            normalizedSlug,
            request.name().trim(),
            request.description().trim(),
            request.accentColor().trim(),
            request.displayOrder(),
            request.visible(),
            request.coverImageUrl().trim(),
            request.coverImageAlt().trim(),
            request.heroTitle().trim(),
            request.heroSubtitle().trim()
        );

        return toCategoryResponse(category);
    }

    public DeleteAdminCategoryResponse deleteCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
            .orElseThrow(() -> new ResourceNotFoundException("카테고리를 찾을 수 없습니다."));

        if (productRepository.countByCategory_Id(categoryId) > 0) {
            throw new IllegalArgumentException("상품이 연결된 카테고리는 삭제할 수 없습니다. 먼저 비노출 처리하거나 상품을 이동해 주세요.");
        }

        categoryRepository.delete(category);
        return new DeleteAdminCategoryResponse(categoryId);
    }

    private AdminDisplaySettings getDisplaySettings() {
        return adminDisplaySettingsRepository.findById(DISPLAY_SETTINGS_ID)
            .orElseGet(() -> adminDisplaySettingsRepository.save(new AdminDisplaySettings(
                DISPLAY_SETTINGS_ID,
                "리듬과 계절을 따라 고른 이번 시즌 셀렉션",
                "리빙, 키친, 웰니스 카테고리에서 지금 바로 보기 좋은 신상품과 인기 상품을 묶어 제안합니다.",
                "컬렉션 보기",
                "/search",
                now()
            )));
    }

    private List<DisplaySection> ensureDisplaySections() {
        List<DisplaySection> sections = displaySectionRepository.findAllByOrderByDisplayOrderAscIdAsc();
        if (!sections.isEmpty()) {
            return sections;
        }

        OffsetDateTime current = now();
        return displaySectionRepository.saveAll(List.of(
            new DisplaySection(DisplaySectionCode.HERO, "시즌 대표 배너", "메인 비주얼과 CTA를 함께 노출합니다.", 10, true, current),
            new DisplaySection(DisplaySectionCode.FEATURED_CATEGORY, "카테고리 셀렉션", "운영 중인 주요 카테고리를 전면에서 소개합니다.", 20, true, current),
            new DisplaySection(DisplaySectionCode.CURATED_PICK, "큐레이션 픽", "지금 보여주고 싶은 추천 상품을 강조합니다.", 30, true, current),
            new DisplaySection(DisplaySectionCode.NEW_ARRIVALS, "신상품 드롭", "최근 등록된 상품을 우선 노출합니다.", 40, true, current),
            new DisplaySection(DisplaySectionCode.BEST_SELLERS, "베스트셀러", "인기 점수가 높은 상품을 중심으로 구성합니다.", 50, true, current),
            new DisplaySection(DisplaySectionCode.PROMOTION, "프로모션 배너", "기획전과 프로모션 링크를 하단 섹션에 노출합니다.", 60, true, current)
        ));
    }

    private DisplaySection getSectionByCode(String code) {
        DisplaySectionCode sectionCode = parseSectionCode(code);
        ensureDisplaySections();
        return displaySectionRepository.findByCode(sectionCode)
            .orElseThrow(() -> new ResourceNotFoundException("전시 섹션을 찾을 수 없습니다."));
    }

    private DisplaySectionCode parseSectionCode(String code) {
        try {
            return DisplaySectionCode.valueOf(code.trim().toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("유효하지 않은 전시 섹션 코드입니다.");
        }
    }

    private void validateDisplaySchedule(OffsetDateTime startsAt, OffsetDateTime endsAt) {
        if (startsAt != null && endsAt != null && startsAt.isAfter(endsAt)) {
            throw new IllegalArgumentException("노출 시작 시각은 종료 시각보다 앞서야 합니다.");
        }
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String normalizeSlug(String slug) {
        String normalized = slug.trim().toLowerCase();
        if (!SLUG_ALLOWED.matcher(normalized).matches()) {
            throw new IllegalArgumentException("카테고리 slug는 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다.");
        }
        return normalized;
    }

    private OrderStatus normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }
        return normalizeRequiredStatus(status);
    }

    private OrderStatus normalizeRequiredStatus(String status) {
        try {
            return OrderStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("유효한 주문 상태가 아닙니다.");
        }
    }

    private Map<Long, OrderPayment> getPaymentMap(List<CustomerOrder> orders) {
        return orderPaymentRepository.findByOrder_IdIn(
            orders.stream().map(CustomerOrder::getId).toList()
        ).stream().collect(Collectors.toMap(payment -> payment.getOrder().getId(), Function.identity()));
    }

    private AdminDisplaySectionResponse toDisplaySectionResponse(DisplaySection section) {
        return new AdminDisplaySectionResponse(
            section.getId(),
            section.getCode().name(),
            section.getTitle(),
            section.getSubtitle(),
            section.getDisplayOrder(),
            section.isVisible(),
            section.getItems().stream()
                .sorted(DISPLAY_ITEM_ORDER)
                .map(this::toDisplayItemResponse)
                .toList()
        );
    }

    private AdminDisplayItemResponse toDisplayItemResponse(DisplayItem item) {
        return new AdminDisplayItemResponse(
            item.getId(),
            item.getTitle(),
            item.getSubtitle(),
            item.getImageUrl(),
            item.getImageAlt(),
            item.getHref(),
            item.getCtaLabel(),
            item.getAccentColor(),
            item.getDisplayOrder(),
            item.isVisible(),
            item.getStartsAt(),
            item.getEndsAt()
        );
    }

    private AdminProductResponse toProductResponse(Product product) {
        return new AdminProductResponse(
            product.getId(),
            product.getSlug(),
            product.getCategory().getSlug(),
            product.getCategory().getName(),
            product.getName(),
            product.getSummary(),
            product.getPrice(),
            product.getBadge(),
            product.isFeatured(),
            product.getStock(),
            product.getPopularityScore(),
            product.getImageUrl(),
            product.getImageAlt()
        );
    }

    private AdminCategoryResponse toCategoryResponse(Category category) {
        return new AdminCategoryResponse(
            category.getId(),
            category.getSlug(),
            category.getName(),
            category.getDescription(),
            category.getAccentColor(),
            category.getDisplayOrder(),
            category.isVisible(),
            category.getCoverImageUrl(),
            category.getCoverImageAlt(),
            category.getHeroTitle(),
            category.getHeroSubtitle(),
            productRepository.countByCategory_Id(category.getId())
        );
    }

    private AdminOrderResponse toOrderResponse(CustomerOrder order, OrderPayment payment) {
        return new AdminOrderResponse(
            order.getOrderNumber(),
            order.getStatus().name(),
            payment != null ? payment.getPaymentStatus().name() : "READY",
            payment != null ? payment.getPaymentMethod().name() : "CARD",
            order.getCustomerType().name(),
            order.getCustomerName(),
            order.getPhone(),
            order.getTotal(),
            order.getCreatedAt(),
            order.getLines().stream().mapToInt(CustomerOrderLine::getQuantity).sum()
        );
    }

    private AdminOrderResponse toOrderResponse(com.vibeshop.api.order.OrderDtos.OrderResponse order) {
        return new AdminOrderResponse(
            order.orderNumber(),
            order.status(),
            order.paymentStatus(),
            order.paymentMethod(),
            order.customerType(),
            order.customerName(),
            order.phone(),
            order.total(),
            order.createdAt(),
            order.lines().stream().mapToInt(com.vibeshop.api.order.OrderDtos.CheckoutLineResponse::quantity).sum()
        );
    }

    private OffsetDateTime now() {
        return OffsetDateTime.now(SEOUL);
    }
}
