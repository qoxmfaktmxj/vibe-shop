package com.vibeshop.api.order;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private static final DateTimeFormatter ORDER_FORMAT = DateTimeFormatter.ofPattern("yyMMddHHmmss");

    private final ProductRepository productRepository;
    private final CustomerOrderRepository customerOrderRepository;
    private final OrderPaymentRepository orderPaymentRepository;
    private final PaymentGatewayAdapter paymentGatewayAdapter;

    public OrderService(
        ProductRepository productRepository,
        CustomerOrderRepository customerOrderRepository,
        OrderPaymentRepository orderPaymentRepository,
        PaymentGatewayAdapter paymentGatewayAdapter
    ) {
        this.productRepository = productRepository;
        this.customerOrderRepository = customerOrderRepository;
        this.orderPaymentRepository = orderPaymentRepository;
        this.paymentGatewayAdapter = paymentGatewayAdapter;
    }

    @Transactional(readOnly = true)
    public CheckoutPreviewResponse preview(CheckoutPreviewRequest request) {
        ResolvedOrder resolvedOrder = resolveOrder(request.items());
        return resolvedOrder.preview();
    }

    @Transactional
    public CreateOrderResponse create(CreateOrderRequest request) {
        return create(request, null);
    }

    @Transactional
    public CreateOrderResponse create(CreateOrderRequest request, Long userId) {
        String idempotencyKey = request.idempotencyKey().trim();
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

        customerOrderRepository.save(order);

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
        orderPaymentRepository.save(payment);

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

    @Transactional(readOnly = true)
    public OrderResponse getGuest(String orderNumber, String phone) {
        CustomerOrder order = findGuestOrder(orderNumber, phone);
        return toOrderResponse(order, findPayment(order));
    }

    @Transactional(readOnly = true)
    public GuestOrderLookupResponse lookup(GuestOrderLookupRequest request) {
        CustomerOrder order = findGuestOrder(request.orderNumber(), request.phone());
        return new GuestOrderLookupResponse(order.getOrderNumber());
    }

    @Transactional
    public CancelOrderResponse cancel(String orderNumber) {
        CustomerOrder order = customerOrderRepository.findByOrderNumber(orderNumber.trim())
            .orElseThrow(() -> new ResourceNotFoundException("주문 정보를 찾을 수 없습니다."));
        return cancel(order);
    }

    @Transactional
    public CancelOrderResponse cancelForUser(String orderNumber, Long userId) {
        return cancel(findMemberOrder(orderNumber, userId));
    }

    @Transactional
    public CancelOrderResponse cancelGuest(String orderNumber, String phone) {
        return cancel(findGuestOrder(orderNumber, phone));
    }

    @Transactional(readOnly = true)
    public List<OrderSummaryResponse> listByPhone(String phone) {
        if (phone == null || phone.isBlank()) {
            throw new IllegalArgumentException("연락처를 입력해 주세요.");
        }

        return customerOrderRepository.findByPhoneOrderByCreatedAtDesc(phone.trim()).stream()
            .filter(order -> order.getCustomerType() == CustomerType.GUEST)
            .map(this::toSummaryResponse)
            .toList();
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
        CustomerOrder order = customerOrderRepository.findByOrderNumber(orderNumber.trim())
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
        return new OrderResponse(
            order.getOrderNumber(),
            order.getStatus().name(),
            order.getCustomerType().name(),
            payment.getPaymentStatus().name(),
            payment.getPaymentMethod().name(),
            payment.getMessage(),
            order.getCustomerName(),
            order.getPhone(),
            order.getPostalCode(),
            order.getAddress1(),
            order.getAddress2(),
            order.getNote(),
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

    private CustomerOrder findGuestOrder(String orderNumber, String phone) {
        if (phone == null || phone.isBlank()) {
            throw new IllegalArgumentException("비회원 주문 조회에는 연락처가 필요합니다.");
        }

        CustomerOrder order = customerOrderRepository.findByOrderNumber(orderNumber.trim())
            .orElseThrow(() -> new ResourceNotFoundException("주문 정보를 찾을 수 없습니다."));

        if (order.getCustomerType() != CustomerType.GUEST || !order.getPhone().equals(phone.trim())) {
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
        return "VS" + OffsetDateTime.now(SEOUL).format(ORDER_FORMAT) + ThreadLocalRandom.current().nextInt(100, 999);
    }

    private void reserveStock(List<CheckoutLineResponse> lines) {
        Map<Long, Product> products = productRepository.findAllByIdIn(
            lines.stream().map(CheckoutLineResponse::productId).toList()
        ).stream().collect(Collectors.toMap(Product::getId, Function.identity()));

        for (CheckoutLineResponse line : lines) {
            Product product = products.get(line.productId());
            if (product == null) {
                throw new ResourceNotFoundException("상품을 찾을 수 없습니다.");
            }
            product.decreaseStock(line.quantity());
        }
    }

    private void restoreStock(CustomerOrder order) {
        Map<Long, Product> products = productRepository.findAllByIdIn(
            order.getLines().stream().map(CustomerOrderLine::getProductId).toList()
        ).stream().collect(Collectors.toMap(Product::getId, Function.identity()));

        for (CustomerOrderLine line : order.getLines()) {
            Product product = products.get(line.getProductId());
            if (product != null) {
                product.increaseStock(line.getQuantity());
            }
        }
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
