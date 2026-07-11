package com.vibeshop.api.order;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import com.vibeshop.api.catalog.Product;
import com.vibeshop.api.catalog.ProductRepository;
import com.vibeshop.api.common.ResourceNotFoundException;
import com.vibeshop.api.order.OrderDtos.CancelOrderResponse;
import com.vibeshop.api.order.OrderDtos.CheckoutItemRequest;
import com.vibeshop.api.order.OrderDtos.CheckoutLineResponse;
import com.vibeshop.api.order.OrderDtos.CheckoutPreviewRequest;
import com.vibeshop.api.order.OrderDtos.CheckoutPreviewResponse;
import com.vibeshop.api.order.OrderDtos.CreateOrderRequest;
import com.vibeshop.api.order.OrderDtos.CreateOrderResponse;
import com.vibeshop.api.order.OrderDtos.GuestOrderLookupRequest;
import com.vibeshop.api.order.OrderDtos.GuestOrderLookupResponse;
import com.vibeshop.api.order.OrderDtos.OrderResponse;
import com.vibeshop.api.order.OrderDtos.OrderSummaryResponse;

@Service
public class OrderService {

    private static final BigDecimal SHIPPING_FEE = BigDecimal.valueOf(3000);
    private static final BigDecimal FREE_SHIPPING_THRESHOLD = BigDecimal.valueOf(150000);
    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final ProductRepository productRepository;
    private final CustomerOrderRepository customerOrderRepository;
    private final OrderPaymentRepository orderPaymentRepository;
    private final PaymentGatewayAdapter paymentGatewayAdapter;
    private final GuestOrderAccessService guestOrderAccessService;
    private final TransactionTemplate transactionTemplate;

    public OrderService(
        ProductRepository productRepository,
        CustomerOrderRepository customerOrderRepository,
        OrderPaymentRepository orderPaymentRepository,
        PaymentGatewayAdapter paymentGatewayAdapter,
        GuestOrderAccessService guestOrderAccessService,
        PlatformTransactionManager transactionManager
    ) {
        this.productRepository = productRepository;
        this.customerOrderRepository = customerOrderRepository;
        this.orderPaymentRepository = orderPaymentRepository;
        this.paymentGatewayAdapter = paymentGatewayAdapter;
        this.guestOrderAccessService = guestOrderAccessService;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
    }

    @Transactional(readOnly = true)
    public CheckoutPreviewResponse preview(CheckoutPreviewRequest request) {
        ResolvedOrder resolvedOrder = resolveOrder(request.items());
        return resolvedOrder.preview();
    }

    public CreateOrderResponse create(CreateOrderRequest request) {
        return create(request, null);
    }

    public CreateOrderResponse create(CreateOrderRequest request, Long userId) {
        String idempotencyKey = request.idempotencyKey().trim();
        try {
            return Objects.requireNonNull(transactionTemplate.execute(
                status -> createInTransaction(request, userId, idempotencyKey)
            ));
        } catch (DataIntegrityViolationException exception) {
            CreateOrderResponse existing = transactionTemplate.execute(status -> customerOrderRepository
                .findByIdempotencyKey(idempotencyKey)
                .map(order -> toCreateResponse(order, findPayment(order)))
                .orElse(null));
            if (existing != null) {
                return existing;
            }
            throw exception;
        }
    }

    private CreateOrderResponse createInTransaction(
        CreateOrderRequest request,
        Long userId,
        String idempotencyKey
    ) {
        CustomerOrder existingOrder = customerOrderRepository.findByIdempotencyKey(idempotencyKey).orElse(null);
        if (existingOrder != null) {
            return toCreateResponse(existingOrder, findPayment(existingOrder));
        }

        ResolvedOrder resolvedOrder = resolveOrder(request.items());
        reserveStock(resolvedOrder.lines());

        OffsetDateTime now = OffsetDateTime.now(SEOUL);
        CustomerOrder order = new CustomerOrder(
            generateOrderNumber(),
            idempotencyKey,
            userId != null ? CustomerType.MEMBER : CustomerType.GUEST,
            userId,
            request.customerName().trim(),
            request.phone().trim(),
            request.postalCode().trim(),
            request.address1().trim(),
            request.address2() == null ? "" : request.address2().trim(),
            request.note() == null ? "" : request.note().trim(),
            resolvedOrder.subtotal(),
            resolvedOrder.shippingFee(),
            resolvedOrder.total(),
            OrderStatus.PENDING_PAYMENT,
            now
        );

        for (CheckoutLineResponse line : resolvedOrder.lines()) {
            order.addLine(new CustomerOrderLine(
                line.productId(),
                line.productName(),
                line.quantity(),
                line.unitPrice(),
                line.lineTotal()
            ));
        }

        customerOrderRepository.saveAndFlush(order);

        PaymentGatewayAdapter.AuthorizationResult paymentResult = paymentGatewayAdapter.authorize(
            order,
            request.paymentMethod()
        );

        OrderPayment payment = new OrderPayment(
            order,
            request.paymentMethod(),
            paymentResult.providerCode(),
            paymentResult.referenceCode(),
            now
        );
        applyAuthorizationResult(order, payment, paymentResult);
        orderPaymentRepository.saveAndFlush(payment);

        return toCreateResponse(order, payment);
    }

    @Transactional(readOnly = true)
    public OrderResponse get(String orderNumber) {
        CustomerOrder order = customerOrderRepository.findByOrderNumber(orderNumber.trim())
            .orElseThrow(() -> new ResourceNotFoundException("주문 정보를 찾을 수 없습니다."));
        return toOrderResponse(order, findPayment(order));
    }

    @Transactional(readOnly = true)
    public OrderResponse getForUser(String orderNumber, Long userId) {
        CustomerOrder order = findMemberOrder(orderNumber, userId);
        return toOrderResponse(order, findPayment(order));
    }

    public OrderResponse getGuest(String orderNumber, String accessToken) {
        Long orderId = guestOrderAccessService.authorize("DETAIL", orderNumber, accessToken);
        CustomerOrder order = customerOrderRepository.findWithLinesById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("주문 정보를 찾을 수 없습니다."));
        return toOrderResponse(order, findPayment(order), true);
    }

    public GuestOrderAccessService.AccessGrant lookup(GuestOrderLookupRequest request) {
        return guestOrderAccessService.lookup(request);
    }

    public GuestOrderAccessService.AccessGrant issueGuestAccessForCreatedOrder(String orderNumber, String phone) {
        return guestOrderAccessService.issueForCreatedOrder(orderNumber, phone);
    }

    @Transactional
    public CancelOrderResponse cancel(String orderNumber) {
        CustomerOrder order = customerOrderRepository.findByOrderNumberForUpdate(orderNumber.trim())
            .orElseThrow(() -> new ResourceNotFoundException("주문 정보를 찾을 수 없습니다."));
        return cancel(order);
    }

    @Transactional
    public CancelOrderResponse cancelForUser(String orderNumber, Long userId) {
        return cancel(findMemberOrderForUpdate(orderNumber, userId));
    }

    public CancelOrderResponse cancelGuest(String orderNumber, String accessToken) {
        Long orderId = guestOrderAccessService.authorize("CANCEL", orderNumber, accessToken);
        return Objects.requireNonNull(transactionTemplate.execute(status -> {
            CustomerOrder order = customerOrderRepository.findByIdForUpdate(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("주문 정보를 찾을 수 없습니다."));
            return cancel(order);
        }));
    }

    @Transactional(readOnly = true)
    public List<OrderSummaryResponse> listByUserId(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("로그인 정보가 필요합니다.");
        }

        return customerOrderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
            .filter(order -> order.getCustomerType() == CustomerType.MEMBER)
            .map(this::toSummaryResponse)
            .toList();
    }

    @Transactional
    public OrderResponse updateStatusForAdmin(String orderNumber, OrderStatus nextStatus) {
        CustomerOrder order = customerOrderRepository.findByOrderNumberForUpdate(orderNumber.trim())
            .orElseThrow(() -> new ResourceNotFoundException("주문 정보를 찾을 수 없습니다."));
        OrderPayment payment = findPayment(order);
        OffsetDateTime now = OffsetDateTime.now(SEOUL);

        if (order.getStatus() == nextStatus) {
            return toOrderResponse(order, payment);
        }

        switch (nextStatus) {
            case PAID -> markAsPaid(order, payment, now);
            case PREPARING -> moveStatus(order, OrderStatus.PAID, OrderStatus.PREPARING);
            case SHIPPED -> moveStatus(order, OrderStatus.PREPARING, OrderStatus.SHIPPED);
            case DELIVERED -> moveStatus(order, OrderStatus.SHIPPED, OrderStatus.DELIVERED);
            case REFUND_REQUESTED -> markRefundRequested(order);
            case CANCELLED, REFUNDED -> cancel(order);
            default -> throw new IllegalArgumentException("관리자 화면에서 변경할 수 없는 주문 상태입니다.");
        }

        return toOrderResponse(order, findPayment(order));
    }

    private CreateOrderResponse toCreateResponse(CustomerOrder order, OrderPayment payment) {
        return new CreateOrderResponse(
            order.getOrderNumber(),
            order.getStatus().name(),
            payment.getPaymentStatus().name(),
            payment.getPaymentMethod().name()
        );
    }

    private OrderResponse toOrderResponse(CustomerOrder order, OrderPayment payment) {
        return toOrderResponse(order, payment, false);
    }

    private OrderResponse toOrderResponse(CustomerOrder order, OrderPayment payment, boolean maskPersonalData) {
        return new OrderResponse(
            order.getOrderNumber(),
            order.getStatus().name(),
            order.getCustomerType().name(),
            payment.getPaymentStatus().name(),
            payment.getPaymentMethod().name(),
            payment.getMessage(),
            maskPersonalData ? maskName(order.getCustomerName()) : order.getCustomerName(),
            maskPersonalData ? maskPhone(order.getPhone()) : order.getPhone(),
            maskPersonalData ? "*****" : order.getPostalCode(),
            maskPersonalData ? maskAddress(order.getAddress1()) : order.getAddress1(),
            maskPersonalData ? "" : order.getAddress2(),
            maskPersonalData ? "" : order.getNote(),
            order.getLines().stream()
                .map(line -> new CheckoutLineResponse(
                    line.getProductId(),
                    line.getProductName(),
                    line.getQuantity(),
                    line.getUnitPrice(),
                    line.getLineTotal()
                ))
                .toList(),
            order.getSubtotal(),
            order.getShippingFee(),
            order.getTotal(),
            order.getCreatedAt()
        );
    }

    private OrderSummaryResponse toSummaryResponse(CustomerOrder order) {
        return new OrderSummaryResponse(
            order.getOrderNumber(),
            order.getStatus().name(),
            order.getCustomerType().name(),
            order.getCustomerName(),
            order.getTotal(),
            order.getCreatedAt(),
            order.getLines().stream().mapToInt(CustomerOrderLine::getQuantity).sum()
        );
    }

    private CancelOrderResponse cancel(CustomerOrder order) {
        if (order.getStatus() != OrderStatus.PAID && order.getStatus() != OrderStatus.PENDING_PAYMENT) {
            throw new IllegalArgumentException("현재 상태에서는 주문을 취소할 수 없습니다.");
        }

        restoreStock(order);
        OrderPayment payment = findPayment(order);
        PaymentGatewayAdapter.CancellationResult cancellationResult = paymentGatewayAdapter.cancel(order, payment);

        switch (cancellationResult.paymentStatus()) {
            case CANCELLED -> {
                payment.markCancelled(cancellationResult.message(), cancellationResult.processedAt());
                order.changeStatus(OrderStatus.CANCELLED);
            }
            case REFUNDED -> {
                payment.markRefunded(cancellationResult.message(), cancellationResult.processedAt());
                order.changeStatus(OrderStatus.REFUNDED);
            }
            default -> throw new IllegalStateException(
                "Unsupported cancellation status: " + cancellationResult.paymentStatus()
            );
        }

        return new CancelOrderResponse(order.getOrderNumber(), order.getStatus().name());
    }

    private void markAsPaid(CustomerOrder order, OrderPayment payment, OffsetDateTime now) {
        if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
            throw new IllegalArgumentException("결제 대기 상태인 주문만 결제 완료로 변경할 수 있습니다.");
        }

        order.changeStatus(OrderStatus.PAID);
        payment.markSucceeded("관리자 수동 승인", now, now);
    }

    private void moveStatus(CustomerOrder order, OrderStatus currentStatus, OrderStatus nextStatus) {
        if (order.getStatus() != currentStatus) {
            throw new IllegalArgumentException(
                currentStatus.name() + " 상태의 주문만 " + nextStatus.name() + " 상태로 변경할 수 있습니다."
            );
        }

        order.changeStatus(nextStatus);
    }

    private void markRefundRequested(CustomerOrder order) {
        if (
            order.getStatus() != OrderStatus.PAID
                && order.getStatus() != OrderStatus.PREPARING
                && order.getStatus() != OrderStatus.SHIPPED
        ) {
            throw new IllegalArgumentException("결제 완료 이후 주문만 환불 요청 상태로 변경할 수 있습니다.");
        }

        order.changeStatus(OrderStatus.REFUND_REQUESTED);
    }

    private void applyAuthorizationResult(
        CustomerOrder order,
        OrderPayment payment,
        PaymentGatewayAdapter.AuthorizationResult paymentResult
    ) {
        switch (paymentResult.paymentStatus()) {
            case SUCCEEDED -> {
                order.changeStatus(OrderStatus.PAID);
                payment.markSucceeded(
                    paymentResult.message(),
                    paymentResult.processedAt(),
                    paymentResult.processedAt()
                );
            }
            case PENDING -> {
                order.changeStatus(OrderStatus.PENDING_PAYMENT);
                payment.markPending(paymentResult.message(), paymentResult.processedAt());
            }
            case FAILED -> {
                order.changeStatus(OrderStatus.CANCELLED);
                payment.markFailed(paymentResult.message(), paymentResult.processedAt());
                restoreStock(order);
            }
            default -> throw new IllegalStateException("Unsupported payment status: " + paymentResult.paymentStatus());
        }
    }

    private CustomerOrder findMemberOrder(String orderNumber, Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("로그인 정보가 필요합니다.");
        }

        return customerOrderRepository.findByOrderNumberAndUserId(orderNumber.trim(), userId)
            .filter(order -> order.getCustomerType() == CustomerType.MEMBER)
            .orElseThrow(() -> new ResourceNotFoundException("주문 정보를 찾을 수 없습니다."));
    }

    private CustomerOrder findMemberOrderForUpdate(String orderNumber, Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("로그인 정보가 필요합니다.");
        }

        CustomerOrder order = customerOrderRepository.findByOrderNumberForUpdate(orderNumber.trim())
            .orElseThrow(() -> new ResourceNotFoundException("주문 정보를 찾을 수 없습니다."));
        if (order.getCustomerType() != CustomerType.MEMBER || !userId.equals(order.getUserId())) {
            throw new ResourceNotFoundException("주문 정보를 찾을 수 없습니다.");
        }
        return order;
    }

    private OrderPayment findPayment(CustomerOrder order) {
        return orderPaymentRepository.findByOrder_Id(order.getId())
            .orElseThrow(() -> new ResourceNotFoundException("결제 정보를 찾을 수 없습니다."));
    }

    private ResolvedOrder resolveOrder(List<CheckoutItemRequest> items) {
        Map<Long, Integer> normalizedItems = normalize(items);
        List<Product> products = productRepository.findAllByIdIn(normalizedItems.keySet());
        Map<Long, Product> productMap = products.stream().collect(Collectors.toMap(Product::getId, Function.identity()));

        if (productMap.size() != normalizedItems.size()) {
            throw new IllegalArgumentException("일부 상품을 찾을 수 없습니다.");
        }

        List<CheckoutLineResponse> lines = normalizedItems.entrySet().stream()
            .map(entry -> toLine(productMap.get(entry.getKey()), entry.getValue()))
            .toList();

        BigDecimal subtotal = lines.stream()
            .map(CheckoutLineResponse::lineTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal shippingFee = subtotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0 ? BigDecimal.ZERO : SHIPPING_FEE;

        return new ResolvedOrder(lines, subtotal, shippingFee, subtotal.add(shippingFee));
    }

    private Map<Long, Integer> normalize(List<CheckoutItemRequest> items) {
        Map<Long, Integer> normalizedItems = new LinkedHashMap<>();
        for (CheckoutItemRequest item : items) {
            normalizedItems.merge(item.productId(), item.quantity(), Integer::sum);
        }
        return normalizedItems;
    }

    private CheckoutLineResponse toLine(Product product, int quantity) {
        if (quantity < 1) {
            throw new IllegalArgumentException("수량은 1개 이상이어야 합니다.");
        }
        if (product.getStock() < quantity) {
            throw new IllegalArgumentException(product.getName() + " 재고가 부족합니다.");
        }

        BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(quantity));
        return new CheckoutLineResponse(product.getId(), product.getName(), quantity, product.getPrice(), lineTotal);
    }

    private String generateOrderNumber() {
        long timestamp = System.currentTimeMillis() & 0xFFFFFFFFFFFFL;
        long mostSignificantBits = (timestamp << 16)
            | 0x7000L
            | SECURE_RANDOM.nextInt(1 << 12);
        long leastSignificantBits = (SECURE_RANDOM.nextLong() & 0x3FFFFFFFFFFFFFFFL)
            | 0x8000000000000000L;
        return "VS-" + new UUID(mostSignificantBits, leastSignificantBits).toString().toUpperCase(Locale.ROOT);
    }

    private void reserveStock(List<CheckoutLineResponse> lines) {
        for (CheckoutLineResponse line : lines) {
            int updatedRows = productRepository.decreaseStockIfAvailable(line.productId(), line.quantity());
            if (updatedRows != 1) {
                throw new IllegalArgumentException(line.productName() + " 재고가 부족합니다.");
            }
        }
    }

    private void restoreStock(CustomerOrder order) {
        for (CustomerOrderLine line : order.getLines()) {
            int updatedRows = productRepository.increaseStock(line.getProductId(), line.getQuantity());
            if (updatedRows != 1) {
                throw new ResourceNotFoundException("재고를 복구할 상품을 찾을 수 없습니다.");
            }
        }
    }

    private String maskName(String name) {
        if (name == null || name.isBlank()) {
            return "***";
        }
        if (name.length() == 1) {
            return "*";
        }
        return name.substring(0, 1) + "*".repeat(Math.max(1, name.length() - 1));
    }

    private String maskPhone(String phone) {
        String digits = phone == null ? "" : phone.replaceAll("\\D", "");
        if (digits.length() < 7) {
            return "***-****";
        }
        return digits.substring(0, 3) + "-****-" + digits.substring(digits.length() - 4);
    }

    private String maskAddress(String address) {
        if (address == null || address.isBlank()) {
            return "배송지 비공개";
        }
        String[] parts = address.trim().split("\\s+");
        int visibleParts = Math.min(2, parts.length);
        return String.join(" ", java.util.Arrays.copyOf(parts, visibleParts)) + " 이하 비공개";
    }

    private record ResolvedOrder(
        List<CheckoutLineResponse> lines,
        BigDecimal subtotal,
        BigDecimal shippingFee,
        BigDecimal total
    ) {
        CheckoutPreviewResponse preview() {
            return new CheckoutPreviewResponse(lines, subtotal, shippingFee, total);
        }
    }
}
