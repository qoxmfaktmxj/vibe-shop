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

    public OrderService(ProductRepository productRepository, CustomerOrderRepository customerOrderRepository) {
        this.productRepository = productRepository;
        this.customerOrderRepository = customerOrderRepository;
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
            return new CreateOrderResponse(existingOrder.getOrderNumber(), existingOrder.getStatus().name());
        }

        ResolvedOrder resolvedOrder = resolveOrder(request.items());
        reserveStock(resolvedOrder.lines());

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
            OrderStatus.RECEIVED,
            OffsetDateTime.now(SEOUL)
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
        return new CreateOrderResponse(order.getOrderNumber(), order.getStatus().name());
    }

    @Transactional(readOnly = true)
    public OrderResponse get(String orderNumber) {
        CustomerOrder order = customerOrderRepository.findByOrderNumber(orderNumber)
            .orElseThrow(() -> new ResourceNotFoundException("二쇰Ц ?뺣낫瑜?李얠쓣 ???놁뒿?덈떎."));
        return toOrderResponse(order);
    }

    @Transactional(readOnly = true)
    public OrderResponse getForUser(String orderNumber, Long userId) {
        return toOrderResponse(findMemberOrder(orderNumber, userId));
    }

    @Transactional(readOnly = true)
    public OrderResponse getGuest(String orderNumber, String phone) {
        return toOrderResponse(findGuestOrder(orderNumber, phone));
    }

    @Transactional(readOnly = true)
    public GuestOrderLookupResponse lookup(GuestOrderLookupRequest request) {
        CustomerOrder order = findGuestOrder(request.orderNumber(), request.phone());
        return new GuestOrderLookupResponse(order.getOrderNumber());
    }

    @Transactional
    public CancelOrderResponse cancel(String orderNumber) {
        CustomerOrder order = customerOrderRepository.findByOrderNumber(orderNumber)
            .orElseThrow(() -> new ResourceNotFoundException("二쇰Ц ?뺣낫瑜?李얠쓣 ???놁뒿?덈떎."));
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
            throw new IllegalArgumentException("?곕씫泥섎? ?낅젰?댁＜?몄슂.");
        }

        return customerOrderRepository.findByPhoneOrderByCreatedAtDesc(phone.trim()).stream()
            .filter(order -> order.getCustomerType() == CustomerType.GUEST)
            .map(this::toSummaryResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<OrderSummaryResponse> listByUserId(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("濡쒓렇???뺣낫媛 ?꾩슂?⑸땲??");
        }

        return customerOrderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
            .filter(order -> order.getCustomerType() == CustomerType.MEMBER)
            .map(this::toSummaryResponse)
            .toList();
    }

    private OrderResponse toOrderResponse(CustomerOrder order) {
        return new OrderResponse(
            order.getOrderNumber(),
            order.getStatus().name(),
            order.getCustomerType().name(),
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
        if (order.getStatus() != OrderStatus.RECEIVED) {
            throw new IllegalArgumentException("?꾩옱 ?곹깭?먯꽌??二쇰Ц??痍⑥냼?????놁뒿?덈떎.");
        }

        restoreStock(order);
        order.changeStatus(OrderStatus.CANCELLED);
        return new CancelOrderResponse(order.getOrderNumber(), order.getStatus().name());
    }

    private CustomerOrder findMemberOrder(String orderNumber, Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("濡쒓렇???뺣낫媛 ?꾩슂?⑸땲??");
        }

        return customerOrderRepository.findByOrderNumberAndUserId(orderNumber.trim(), userId)
            .filter(order -> order.getCustomerType() == CustomerType.MEMBER)
            .orElseThrow(() -> new ResourceNotFoundException("二쇰Ц ?뺣낫瑜?李얠쓣 ???놁뒿?덈떎."));
    }

    private CustomerOrder findGuestOrder(String orderNumber, String phone) {
        if (phone == null || phone.isBlank()) {
            throw new IllegalArgumentException("鍮꾪쉶??二쇰Ц???뚯쑀 議고쉶瑜?위빐 ?곕씫泥섎? ?낅젰?댁＜?몄슂.");
        }

        CustomerOrder order = customerOrderRepository.findByOrderNumber(orderNumber.trim())
            .orElseThrow(() -> new ResourceNotFoundException("二쇰Ц ?뺣낫瑜?李얠쓣 ???놁뒿?덈떎."));

        if (order.getCustomerType() != CustomerType.GUEST || !order.getPhone().equals(phone.trim())) {
            throw new ResourceNotFoundException("二쇰Ц ?뺣낫瑜?李얠쓣 ???놁뒿?덈떎.");
        }

        return order;
    }

    private ResolvedOrder resolveOrder(List<CheckoutItemRequest> items) {
        Map<Long, Integer> normalizedItems = normalize(items);
        List<Product> products = productRepository.findAllByIdIn(normalizedItems.keySet());
        Map<Long, Product> productMap = products.stream().collect(Collectors.toMap(Product::getId, Function.identity()));

        if (productMap.size() != normalizedItems.size()) {
            throw new IllegalArgumentException("?쇰? ?곹뭹??李얠쓣 ???놁뒿?덈떎.");
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
            throw new IllegalArgumentException("?섎웾? 1媛??댁긽?댁뼱???⑸땲??");
        }
        if (product.getStock() < quantity) {
            throw new IllegalArgumentException(product.getName() + " ?ш퀬媛 遺議깊빀?덈떎.");
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
                throw new ResourceNotFoundException("?곹뭹??李얠쓣 ???놁뒿?덈떎.");
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
