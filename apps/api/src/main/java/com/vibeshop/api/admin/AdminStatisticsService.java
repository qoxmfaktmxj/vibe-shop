package com.vibeshop.api.admin;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vibeshop.api.admin.AdminDtos.AdminCategorySalesResponse;
import com.vibeshop.api.admin.AdminDtos.AdminDailyMetricResponse;
import com.vibeshop.api.admin.AdminDtos.AdminStatisticsResponse;
import com.vibeshop.api.admin.AdminDtos.AdminStatisticsSummaryResponse;
import com.vibeshop.api.admin.AdminDtos.AdminTopProductResponse;
import com.vibeshop.api.auth.User;
import com.vibeshop.api.auth.UserRepository;
import com.vibeshop.api.auth.UserRole;
import com.vibeshop.api.catalog.Category;
import com.vibeshop.api.catalog.Product;
import com.vibeshop.api.catalog.ProductRepository;
import com.vibeshop.api.order.CustomerOrder;
import com.vibeshop.api.order.CustomerOrderLine;
import com.vibeshop.api.order.CustomerOrderRepository;
import com.vibeshop.api.order.OrderPayment;
import com.vibeshop.api.order.OrderPaymentRepository;
import com.vibeshop.api.order.OrderStatus;
import com.vibeshop.api.order.PaymentStatus;

@Service
@Transactional(readOnly = true)
public class AdminStatisticsService {

    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final BigDecimal ZERO = BigDecimal.ZERO;

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CustomerOrderRepository customerOrderRepository;
    private final OrderPaymentRepository orderPaymentRepository;

    public AdminStatisticsService(
        UserRepository userRepository,
        ProductRepository productRepository,
        CustomerOrderRepository customerOrderRepository,
        OrderPaymentRepository orderPaymentRepository
    ) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.customerOrderRepository = customerOrderRepository;
        this.orderPaymentRepository = orderPaymentRepository;
    }

    public AdminStatisticsResponse getStatistics() {
        List<CustomerOrder> orders = customerOrderRepository.findAllByOrderByCreatedAtDesc();
        Map<Long, OrderPayment> paymentByOrderId = getPaymentByOrderId(orders);
        List<User> members = userRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
            .filter(user -> user.getRole() == UserRole.CUSTOMER)
            .toList();

        return new AdminStatisticsResponse(
            buildSummary(7, orders, paymentByOrderId, members),
            buildSummary(30, orders, paymentByOrderId, members),
            buildDailyMetrics(7, orders, paymentByOrderId, members),
            buildCategorySales(orders, paymentByOrderId),
            buildTopProducts(orders, paymentByOrderId)
        );
    }

    private AdminStatisticsSummaryResponse buildSummary(
        int days,
        List<CustomerOrder> orders,
        Map<Long, OrderPayment> paymentByOrderId,
        List<User> members
    ) {
        OffsetDateTime cutoff = OffsetDateTime.now(SEOUL).minusDays(days);
        List<CustomerOrder> windowOrders = orders.stream()
            .filter(order -> !order.getCreatedAt().isBefore(cutoff))
            .toList();

        BigDecimal paidRevenue = windowOrders.stream()
            .filter(order -> hasSucceededPayment(order, paymentByOrderId))
            .map(CustomerOrder::getTotal)
            .reduce(ZERO, BigDecimal::add);

        long newMemberCount = members.stream()
            .filter(member -> !member.getCreatedAt().isBefore(cutoff))
            .count();

        long cancelledOrderCount = windowOrders.stream()
            .filter(order -> order.getStatus() == OrderStatus.CANCELLED)
            .count();

        long refundedOrderCount = windowOrders.stream()
            .filter(order -> order.getStatus() == OrderStatus.REFUNDED)
            .count();

        return new AdminStatisticsSummaryResponse(
            days,
            windowOrders.size(),
            paidRevenue,
            newMemberCount,
            cancelledOrderCount,
            refundedOrderCount
        );
    }

    private List<AdminDailyMetricResponse> buildDailyMetrics(
        int days,
        List<CustomerOrder> orders,
        Map<Long, OrderPayment> paymentByOrderId,
        List<User> members
    ) {
        LocalDate today = LocalDate.now(SEOUL);
        return java.util.stream.IntStream.rangeClosed(0, days - 1)
            .mapToObj(offset -> today.minusDays(days - 1L - offset))
            .map(date -> new AdminDailyMetricResponse(
                DATE_FORMAT.format(date),
                orders.stream().filter(order -> toSeoulDate(order.getCreatedAt()).isEqual(date)).count(),
                orders.stream()
                    .filter(order -> toSeoulDate(order.getCreatedAt()).isEqual(date))
                    .filter(order -> hasSucceededPayment(order, paymentByOrderId))
                    .map(CustomerOrder::getTotal)
                    .reduce(ZERO, BigDecimal::add),
                members.stream().filter(member -> toSeoulDate(member.getCreatedAt()).isEqual(date)).count()
            ))
            .toList();
    }

    private List<AdminCategorySalesResponse> buildCategorySales(
        List<CustomerOrder> orders,
        Map<Long, OrderPayment> paymentByOrderId
    ) {
        List<CustomerOrderLine> lines = getPaidLines(orders, paymentByOrderId);
        if (lines.isEmpty()) {
            return List.of();
        }
        Map<Long, Product> productsById = productRepository.findAllByIdIn(
            lines.stream().map(CustomerOrderLine::getProductId).collect(Collectors.toSet())
        ).stream().collect(Collectors.toMap(Product::getId, Function.identity()));

        Map<Long, QuantityRevenueAggregate> aggregates = lines.stream()
            .filter(line -> productsById.containsKey(line.getProductId()))
            .collect(Collectors.toMap(
                line -> productsById.get(line.getProductId()).getCategory().getId(),
                line -> new QuantityRevenueAggregate(line.getQuantity(), line.getLineTotal()),
                QuantityRevenueAggregate::merge
            ));

        Map<Long, Category> categoriesById = productsById.values().stream()
            .map(Product::getCategory)
            .collect(Collectors.toMap(Category::getId, Function.identity(), (left, right) -> left));

        return aggregates.entrySet().stream()
            .map(entry -> {
                Category category = categoriesById.get(entry.getKey());
                return new AdminCategorySalesResponse(
                    category.getSlug(),
                    category.getName(),
                    entry.getValue().quantity(),
                    entry.getValue().revenue()
                );
            })
            .sorted(Comparator.comparing(AdminCategorySalesResponse::revenue).reversed())
            .limit(5)
            .toList();
    }

    private List<AdminTopProductResponse> buildTopProducts(
        List<CustomerOrder> orders,
        Map<Long, OrderPayment> paymentByOrderId
    ) {
        List<CustomerOrderLine> lines = getPaidLines(orders, paymentByOrderId);
        if (lines.isEmpty()) {
            return List.of();
        }
        Map<Long, Product> productsById = productRepository.findAllByIdIn(
            lines.stream().map(CustomerOrderLine::getProductId).collect(Collectors.toSet())
        ).stream().collect(Collectors.toMap(Product::getId, Function.identity()));

        return lines.stream()
            .filter(line -> productsById.containsKey(line.getProductId()))
            .collect(Collectors.toMap(
                CustomerOrderLine::getProductId,
                line -> new QuantityRevenueAggregate(line.getQuantity(), line.getLineTotal()),
                QuantityRevenueAggregate::merge
            ))
            .entrySet().stream()
            .map(entry -> {
                Product product = productsById.get(entry.getKey());
                return new AdminTopProductResponse(
                    product.getId(),
                    product.getName(),
                    product.getCategory().getName(),
                    entry.getValue().quantity(),
                    entry.getValue().revenue()
                );
            })
            .sorted(Comparator.comparing(AdminTopProductResponse::revenue).reversed())
            .limit(5)
            .toList();
    }

    private List<CustomerOrderLine> getPaidLines(
        List<CustomerOrder> orders,
        Map<Long, OrderPayment> paymentByOrderId
    ) {
        return orders.stream()
            .filter(order -> hasSucceededPayment(order, paymentByOrderId))
            .map(CustomerOrder::getLines)
            .flatMap(List::stream)
            .toList();
    }

    private Map<Long, OrderPayment> getPaymentByOrderId(List<CustomerOrder> orders) {
        if (orders.isEmpty()) {
            return Map.of();
        }

        return orderPaymentRepository.findByOrder_IdIn(orders.stream().map(CustomerOrder::getId).toList()).stream()
            .collect(Collectors.toMap(payment -> payment.getOrder().getId(), Function.identity()));
    }

    private boolean hasSucceededPayment(CustomerOrder order, Map<Long, OrderPayment> paymentByOrderId) {
        OrderPayment payment = paymentByOrderId.get(order.getId());
        return payment != null && payment.getPaymentStatus() == PaymentStatus.SUCCEEDED;
    }

    private LocalDate toSeoulDate(OffsetDateTime value) {
        return value.atZoneSameInstant(SEOUL).toLocalDate();
    }

    private record QuantityRevenueAggregate(long quantity, BigDecimal revenue) {
        private QuantityRevenueAggregate merge(QuantityRevenueAggregate other) {
            return new QuantityRevenueAggregate(quantity + other.quantity, revenue.add(other.revenue));
        }
    }
}
