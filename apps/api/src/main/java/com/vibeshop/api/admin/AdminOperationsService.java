package com.vibeshop.api.admin;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vibeshop.api.admin.AdminDtos.AdminLowRatingReviewResponse;
import com.vibeshop.api.admin.AdminDtos.AdminLowStockProductResponse;
import com.vibeshop.api.admin.AdminDtos.AdminOperationsResponse;
import com.vibeshop.api.admin.AdminDtos.AdminOperationsSummaryResponse;
import com.vibeshop.api.admin.AdminDtos.AdminSuspiciousOrderResponse;
import com.vibeshop.api.admin.AdminDtos.AdminTrendingProductDetailResponse;
import com.vibeshop.api.catalog.Product;
import com.vibeshop.api.catalog.ProductRepository;
import com.vibeshop.api.order.CustomerOrder;
import com.vibeshop.api.order.CustomerOrderLine;
import com.vibeshop.api.order.CustomerOrderRepository;
import com.vibeshop.api.order.OrderPayment;
import com.vibeshop.api.order.OrderPaymentRepository;
import com.vibeshop.api.order.OrderStatus;
import com.vibeshop.api.order.PaymentMethod;
import com.vibeshop.api.order.PaymentStatus;
import com.vibeshop.api.review.ProductReview;
import com.vibeshop.api.review.ProductReviewRepository;

@Service
@Transactional(readOnly = true)
public class AdminOperationsService {

    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");
    private static final int DEFAULT_LOW_STOCK_THRESHOLD = 5;
    private static final int DEFAULT_LOW_RATING_THRESHOLD = 2;
    private static final int DEFAULT_SUSPICIOUS_SCORE_THRESHOLD = 3;

    private final ProductRepository productRepository;
    private final CustomerOrderRepository customerOrderRepository;
    private final OrderPaymentRepository orderPaymentRepository;
    private final ProductReviewRepository productReviewRepository;
    private final JdbcClient jdbcClient;

    public AdminOperationsService(
        ProductRepository productRepository,
        CustomerOrderRepository customerOrderRepository,
        OrderPaymentRepository orderPaymentRepository,
        ProductReviewRepository productReviewRepository,
        JdbcClient jdbcClient
    ) {
        this.productRepository = productRepository;
        this.customerOrderRepository = customerOrderRepository;
        this.orderPaymentRepository = orderPaymentRepository;
        this.productReviewRepository = productReviewRepository;
        this.jdbcClient = jdbcClient;
    }

    public AdminOperationsResponse getOperations(Integer lowStockThreshold, Integer lowRatingThreshold, Integer suspiciousScoreThreshold) {
        int normalizedLowStockThreshold = normalizeThreshold(lowStockThreshold, DEFAULT_LOW_STOCK_THRESHOLD, 1, 50);
        int normalizedLowRatingThreshold = normalizeThreshold(lowRatingThreshold, DEFAULT_LOW_RATING_THRESHOLD, 1, 5);
        int normalizedSuspiciousScoreThreshold = normalizeThreshold(suspiciousScoreThreshold, DEFAULT_SUSPICIOUS_SCORE_THRESHOLD, 1, 10);

        List<Product> products = productRepository.findAllByCategory_VisibleTrueOrderByFeaturedDescIdAsc();
        List<CustomerOrder> orders = customerOrderRepository.findAllByOrderByCreatedAtDesc();
        Map<Long, OrderPayment> paymentByOrderId = resolvePaymentByOrderId(orders);

        List<AdminLowStockProductResponse> lowStockProducts = products.stream()
            .filter(product -> product.getStock() <= normalizedLowStockThreshold)
            .sorted(Comparator.comparing(Product::getStock)
                .thenComparing(Product::getPopularityScore, Comparator.reverseOrder())
                .thenComparing(Product::getId))
            .limit(8)
            .map(product -> new AdminLowStockProductResponse(
                product.getId(),
                product.getName(),
                product.getCategory().getName(),
                product.getStock(),
                product.getPopularityScore(),
                product.isFeatured()
            ))
            .toList();

        Map<String, Long> recentPhoneOrderCounts = buildRecentPhoneOrderCounts(orders, 48);
        List<AdminSuspiciousOrderResponse> suspiciousOrders = orders.stream()
            .map(order -> assessOrder(order, paymentByOrderId.get(order.getId()), recentPhoneOrderCounts))
            .filter(result -> result.riskScore() >= normalizedSuspiciousScoreThreshold)
            .sorted(Comparator.comparing(AdminSuspiciousOrderResponse::riskScore, Comparator.reverseOrder())
                .thenComparing(AdminSuspiciousOrderResponse::createdAt, Comparator.reverseOrder())
                .thenComparing(AdminSuspiciousOrderResponse::orderNumber))
            .limit(8)
            .toList();

        List<AdminTrendingProductDetailResponse> trendingProducts = buildTrendingProducts(products);

        List<AdminLowRatingReviewResponse> lowRatingReviews = productReviewRepository.findAllByOrderByCreatedAtDesc().stream()
            .filter(review -> review.getRating() <= normalizedLowRatingThreshold)
            .sorted(Comparator.comparing(ProductReview::getRating)
                .thenComparing(ProductReview::getHelpfulCount, Comparator.reverseOrder())
                .thenComparing(ProductReview::getCreatedAt, Comparator.reverseOrder())
                .thenComparing(ProductReview::getId))
            .limit(8)
            .map(review -> new AdminLowRatingReviewResponse(
                review.getId(),
                review.getProduct().getId(),
                review.getProduct().getName(),
                review.getUser().getName(),
                review.getUser().getEmail(),
                review.getRating(),
                review.getTitle(),
                review.getStatus().name(),
                review.getHelpfulCount(),
                review.isBuyerReview(),
                review.getCreatedAt()
            ))
            .toList();

        long fulfillmentAttentionCount = orders.stream()
            .filter(order -> order.getStatus() == OrderStatus.PAID || order.getStatus() == OrderStatus.PREPARING)
            .count();

        return new AdminOperationsResponse(
            new AdminOperationsSummaryResponse(
                normalizedLowStockThreshold,
                normalizedSuspiciousScoreThreshold,
                normalizedLowRatingThreshold,
                products.stream().filter(product -> product.getStock() <= normalizedLowStockThreshold).count(),
                orders.stream()
                    .map(order -> assessOrder(order, paymentByOrderId.get(order.getId()), recentPhoneOrderCounts))
                    .filter(result -> result.riskScore() >= normalizedSuspiciousScoreThreshold)
                    .count(),
                trendingProducts.size(),
                productReviewRepository.findAllByOrderByCreatedAtDesc().stream()
                    .filter(review -> review.getRating() <= normalizedLowRatingThreshold)
                    .count(),
                fulfillmentAttentionCount
            ),
            lowStockProducts,
            suspiciousOrders,
            trendingProducts,
            lowRatingReviews
        );
    }

    private Map<String, Long> buildRecentPhoneOrderCounts(List<CustomerOrder> orders, int windowHours) {
        OffsetDateTime cutoff = OffsetDateTime.now(SEOUL).minusHours(windowHours);
        return orders.stream()
            .filter(order -> order.getPhone() != null && !order.getPhone().isBlank())
            .filter(order -> order.getCreatedAt().isAfter(cutoff))
            .collect(Collectors.groupingBy(order -> order.getPhone().trim(), Collectors.counting()));
    }

    private AdminSuspiciousOrderResponse assessOrder(
        CustomerOrder order,
        OrderPayment payment,
        Map<String, Long> recentPhoneOrderCounts
    ) {
        int riskScore = 0;
        List<String> reasons = new ArrayList<>();
        int itemCount = order.getLines().stream().mapToInt(CustomerOrderLine::getQuantity).sum();
        long recentOrderCount = recentPhoneOrderCounts.getOrDefault(order.getPhone(), 0L);

        if (order.getTotal().intValue() >= 300_000) {
            riskScore += 2;
            reasons.add("고액 주문(30만원 이상)");
        }
        if (order.getCustomerType().name().equals("GUEST") && order.getTotal().intValue() >= 150_000) {
            riskScore += 1;
            reasons.add("비회원 고액 주문");
        }
        if (itemCount >= 5) {
            riskScore += 1;
            reasons.add("대량 수량 주문");
        }
        if (recentOrderCount >= 3) {
            riskScore += 2;
            reasons.add("같은 연락처의 48시간 내 반복 주문");
        }
        if (payment != null
            && (payment.getPaymentMethod() == PaymentMethod.BANK_TRANSFER || payment.getPaymentMethod() == PaymentMethod.VIRTUAL_ACCOUNT)
            && payment.getPaymentStatus() == PaymentStatus.PENDING
            && order.getTotal().intValue() >= 100_000) {
            riskScore += 1;
            reasons.add("고액 무통장/가상계좌 대기 주문");
        }
        if (order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.REFUNDED) {
            riskScore = Math.max(0, riskScore - 1);
        }

        String riskLevel = riskScore >= 4 ? "HIGH" : riskScore >= 3 ? "MEDIUM" : "LOW";
        return new AdminSuspiciousOrderResponse(
            order.getOrderNumber(),
            order.getCustomerName(),
            order.getCustomerType().name(),
            order.getPhone(),
            order.getStatus().name(),
            payment == null ? "UNKNOWN" : payment.getPaymentStatus().name(),
            payment == null ? "UNKNOWN" : payment.getPaymentMethod().name(),
            order.getTotal(),
            itemCount,
            riskLevel,
            riskScore,
            reasons,
            order.getCreatedAt()
        );
    }

    private List<AdminTrendingProductDetailResponse> buildTrendingProducts(List<Product> products) {
        Map<Long, Long> viewCounts = jdbcClient.sql("""
            SELECT product_id, COUNT(*) AS metric_value
            FROM product_view_events
            WHERE viewed_at >= ?
            GROUP BY product_id
            """)
            .param(OffsetDateTime.now(SEOUL).minusDays(30))
            .query((rs, rowNum) -> Map.entry(rs.getLong("product_id"), rs.getLong("metric_value")))
            .list()
            .stream()
            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

        Map<Long, Long> paidQuantities = jdbcClient.sql("""
            SELECT line.product_id, COALESCE(SUM(line.quantity), 0) AS metric_value
            FROM customer_order_lines line
            JOIN customer_orders orders ON orders.id = line.order_id
            JOIN order_payments payments ON payments.order_id = orders.id
            WHERE payments.payment_status = 'SUCCEEDED'
              AND orders.status NOT IN ('CANCELLED', 'REFUNDED')
            GROUP BY line.product_id
            """)
            .query((rs, rowNum) -> Map.entry(rs.getLong("product_id"), rs.getLong("metric_value")))
            .list()
            .stream()
            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

        Map<Long, Long> wishlistCounts = jdbcClient.sql("""
            SELECT product_id, COUNT(*) AS metric_value
            FROM wishlist_items
            GROUP BY product_id
            """)
            .query((rs, rowNum) -> Map.entry(rs.getLong("product_id"), rs.getLong("metric_value")))
            .list()
            .stream()
            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

        return products.stream()
            .map(product -> {
                long views = viewCounts.getOrDefault(product.getId(), 0L);
                long paidOrders = paidQuantities.getOrDefault(product.getId(), 0L);
                long wishlists = wishlistCounts.getOrDefault(product.getId(), 0L);
                int trendScore = product.getPopularityScore()
                    + (int) (views * 4)
                    + (int) (paidOrders * 7)
                    + (int) (wishlists * 5)
                    + (product.isFeatured() ? 10 : 0);
                return new AdminTrendingProductDetailResponse(
                    product.getId(),
                    product.getName(),
                    product.getCategory().getName(),
                    product.getStock(),
                    views,
                    paidOrders,
                    wishlists,
                    trendScore
                );
            })
            .sorted(Comparator.comparing(AdminTrendingProductDetailResponse::trendScore, Comparator.reverseOrder())
                .thenComparing(AdminTrendingProductDetailResponse::paidOrderQuantity, Comparator.reverseOrder())
                .thenComparing(AdminTrendingProductDetailResponse::recentViewCount, Comparator.reverseOrder())
                .thenComparing(AdminTrendingProductDetailResponse::productId))
            .limit(8)
            .toList();
    }

    private Map<Long, OrderPayment> resolvePaymentByOrderId(List<CustomerOrder> orders) {
        if (orders.isEmpty()) {
            return Map.of();
        }
        return orderPaymentRepository.findByOrder_IdIn(orders.stream().map(CustomerOrder::getId).toList()).stream()
            .collect(Collectors.toMap(payment -> payment.getOrder().getId(), Function.identity()));
    }

    private int normalizeThreshold(Integer value, int defaultValue, int min, int max) {
        if (value == null) {
            return defaultValue;
        }
        return Math.max(min, Math.min(max, value));
    }
}
