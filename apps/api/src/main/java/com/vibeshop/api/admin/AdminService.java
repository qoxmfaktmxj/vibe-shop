package com.vibeshop.api.admin;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vibeshop.api.admin.AdminDtos.AdminDashboardResponse;
import com.vibeshop.api.admin.AdminDtos.AdminDisplayResponse;
import com.vibeshop.api.admin.AdminDtos.AdminOrderResponse;
import com.vibeshop.api.admin.AdminDtos.AdminProductResponse;
import com.vibeshop.api.admin.AdminDtos.UpdateAdminDisplayRequest;
import com.vibeshop.api.admin.AdminDtos.UpdateAdminProductRequest;
import com.vibeshop.api.auth.UserRepository;
import com.vibeshop.api.auth.UserRole;
import com.vibeshop.api.catalog.Product;
import com.vibeshop.api.catalog.ProductRepository;
import com.vibeshop.api.common.ResourceNotFoundException;
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
    private static final String DEFAULT_HERO_TITLE = "리빙의 결을 따라 고른 이번 시즌 셀렉션";
    private static final String DEFAULT_HERO_SUBTITLE =
        "리빙, 키친, 웰니스 카테고리에서 지금 바로 보기 좋은 신상품과 인기 상품만 따로 제안합니다.";

    private final ProductRepository productRepository;
    private final CustomerOrderRepository customerOrderRepository;
    private final OrderPaymentRepository orderPaymentRepository;
    private final UserRepository userRepository;
    private final AdminDisplaySettingsRepository adminDisplaySettingsRepository;
    private final OrderService orderService;

    public AdminService(
        ProductRepository productRepository,
        CustomerOrderRepository customerOrderRepository,
        OrderPaymentRepository orderPaymentRepository,
        UserRepository userRepository,
        AdminDisplaySettingsRepository adminDisplaySettingsRepository,
        OrderService orderService
    ) {
        this.productRepository = productRepository;
        this.customerOrderRepository = customerOrderRepository;
        this.orderPaymentRepository = orderPaymentRepository;
        this.userRepository = userRepository;
        this.adminDisplaySettingsRepository = adminDisplaySettingsRepository;
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

    public AdminOrderResponse updateOrderStatus(String orderNumber, String status) {
        OrderStatus nextStatus = normalizeRequiredStatus(status);
        return toOrderResponse(orderService.updateStatusForAdmin(orderNumber, nextStatus));
    }

    @Transactional(readOnly = true)
    public AdminDisplayResponse getDisplay() {
        AdminDisplaySettings settings = getDisplaySettings();
        return new AdminDisplayResponse(settings.getHeroTitle(), settings.getHeroSubtitle());
    }

    public AdminDisplayResponse updateDisplay(UpdateAdminDisplayRequest request) {
        AdminDisplaySettings settings = getDisplaySettings();
        settings.update(
            request.heroTitle().trim(),
            request.heroSubtitle().trim(),
            OffsetDateTime.now(SEOUL)
        );
        return new AdminDisplayResponse(settings.getHeroTitle(), settings.getHeroSubtitle());
    }

    private AdminDisplaySettings getDisplaySettings() {
        return adminDisplaySettingsRepository.findById(DISPLAY_SETTINGS_ID)
            .orElseGet(() -> adminDisplaySettingsRepository.save(new AdminDisplaySettings(
                DISPLAY_SETTINGS_ID,
                DEFAULT_HERO_TITLE,
                DEFAULT_HERO_SUBTITLE,
                OffsetDateTime.now(SEOUL)
            )));
    }

    private Map<Long, OrderPayment> getPaymentMap(List<CustomerOrder> orders) {
        return orderPaymentRepository.findByOrder_IdIn(
            orders.stream().map(CustomerOrder::getId).toList()
        ).stream().collect(Collectors.toMap(payment -> payment.getOrder().getId(), Function.identity()));
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

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
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
}
