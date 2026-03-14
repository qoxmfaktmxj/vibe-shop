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
import com.vibeshop.api.order.OrderDtos.CheckoutItemRequest;
import com.vibeshop.api.order.OrderDtos.CheckoutLineResponse;
import com.vibeshop.api.order.OrderDtos.CheckoutPreviewRequest;
import com.vibeshop.api.order.OrderDtos.CheckoutPreviewResponse;
import com.vibeshop.api.order.OrderDtos.CreateOrderRequest;
import com.vibeshop.api.order.OrderDtos.CreateOrderResponse;
import com.vibeshop.api.order.OrderDtos.OrderResponse;

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
        String idempotencyKey = request.idempotencyKey().trim();
        CustomerOrder existingOrder = customerOrderRepository.findByIdempotencyKey(idempotencyKey).orElse(null);
        if (existingOrder != null) {
            return new CreateOrderResponse(existingOrder.getOrderNumber(), existingOrder.getStatus().name());
        }

        ResolvedOrder resolvedOrder = resolveOrder(request.items());

        CustomerOrder order = new CustomerOrder(
            generateOrderNumber(),
            idempotencyKey,
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
            .orElseThrow(() -> new ResourceNotFoundException("주문 정보를 찾을 수 없습니다."));

        return new OrderResponse(
            order.getOrderNumber(),
            order.getStatus().name(),
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
