package com.vibeshop.api.order;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.simple.JdbcClient;

import com.vibeshop.api.order.OrderDtos.CancelOrderResponse;
import com.vibeshop.api.order.OrderDtos.CheckoutItemRequest;
import com.vibeshop.api.order.OrderDtos.CreateOrderRequest;
import com.vibeshop.api.order.OrderDtos.CreateOrderResponse;
import com.vibeshop.api.order.OrderDtos.GuestOrderLookupRequest;
import com.vibeshop.api.order.OrderDtos.GuestOrderLookupResponse;
import com.vibeshop.api.order.OrderDtos.OrderResponse;
import com.vibeshop.api.order.OrderDtos.OrderSummaryResponse;

@SpringBootTest
class OrderServiceTest {

    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");

    @Autowired
    private OrderService orderService;

    @Autowired
    private JdbcClient jdbcClient;

    @BeforeEach
    void setUp() {
        jdbcClient.sql("DELETE FROM shopping_cart_items").update();
        jdbcClient.sql("DELETE FROM customer_order_lines").update();
        jdbcClient.sql("DELETE FROM order_payments").update();
        jdbcClient.sql("DELETE FROM customer_orders").update();
        jdbcClient.sql("DELETE FROM user_sessions").update();
        jdbcClient.sql("DELETE FROM users").update();
        jdbcClient.sql("DELETE FROM products").update();
        jdbcClient.sql("DELETE FROM categories").update();

        jdbcClient.sql("""
            INSERT INTO categories (id, slug, name, description, accent_color)
            VALUES (1, 'living', 'Living', 'Living category', '#29339b')
            """).update();

        jdbcClient.sql("""
            INSERT INTO products (
                id,
                category_id,
                slug,
                name,
                summary,
                description,
                price,
                badge,
                accent_color,
                image_url,
                image_alt,
                featured,
                stock
            ) VALUES (
                10,
                1,
                'linen-bed-set',
                'Linen Bed Set',
                'Soft linen bedding set',
                'Product description',
                89000,
                'BEST',
                '#29339b',
                '/images/products/living-01.jpg',
                'Linen Bed Set image',
                TRUE,
                10
            )
            """).update();
    }

    @Test
    void createReturnsExistingPaidOrderForSameIdempotencyKey() {
        CreateOrderRequest request = new CreateOrderRequest(
            "idem-order-1",
            "Kim Minsu",
            "01012345678",
            "06236",
            "Teheran-ro 123",
            "8F",
            "Leave at the door.",
            PaymentMethod.CARD,
            List.of(new CheckoutItemRequest(10L, 1))
        );

        CreateOrderResponse first = orderService.create(request);
        CreateOrderResponse second = orderService.create(request);

        Integer orderCount = jdbcClient.sql("SELECT COUNT(*) FROM customer_orders")
            .query(Integer.class)
            .single();
        Integer paymentCount = jdbcClient.sql("SELECT COUNT(*) FROM order_payments")
            .query(Integer.class)
            .single();

        assertThat(first.orderNumber()).isEqualTo(second.orderNumber());
        assertThat(first.status()).isEqualTo("PAID");
        assertThat(first.paymentStatus()).isEqualTo("SUCCEEDED");
        assertThat(second.status()).isEqualTo("PAID");
        assertThat(orderCount).isEqualTo(1);
        assertThat(paymentCount).isEqualTo(1);
    }

    @Test
    void bankTransferOrderStaysPendingAndCanBeLookedUp() {
        CreateOrderResponse created = orderService.create(new CreateOrderRequest(
            "idem-order-lookup",
            "Kim Minsu",
            "01012345678",
            "06236",
            "Teheran-ro 123",
            "8F",
            "Leave at the door.",
            PaymentMethod.BANK_TRANSFER,
            List.of(new CheckoutItemRequest(10L, 1))
        ));

        GuestOrderLookupResponse found = orderService.lookup(new GuestOrderLookupRequest(
            created.orderNumber(),
            "01012345678"
        ));
        OrderResponse order = orderService.getGuest(found.orderNumber(), "01012345678");

        assertThat(found.orderNumber()).isEqualTo(created.orderNumber());
        assertThat(order.status()).isEqualTo("PENDING_PAYMENT");
        assertThat(order.paymentStatus()).isEqualTo("PENDING");
        assertThat(order.paymentMethod()).isEqualTo("BANK_TRANSFER");
    }

    @Test
    void cancelPaidOrderMarksRefundedAndRestoresStock() {
        CreateOrderResponse created = orderService.create(new CreateOrderRequest(
            "idem-order-cancel",
            "Kim Minsu",
            "01012345678",
            "06236",
            "Teheran-ro 123",
            "8F",
            "Leave at the door.",
            PaymentMethod.CARD,
            List.of(new CheckoutItemRequest(10L, 2))
        ));

        Integer stockAfterCreate = jdbcClient.sql("SELECT stock FROM products WHERE id = 10")
            .query(Integer.class)
            .single();

        CancelOrderResponse cancelled = orderService.cancel(created.orderNumber());
        OrderResponse order = orderService.get(created.orderNumber());

        Integer stockAfterCancel = jdbcClient.sql("SELECT stock FROM products WHERE id = 10")
            .query(Integer.class)
            .single();

        assertThat(cancelled.orderNumber()).isEqualTo(created.orderNumber());
        assertThat(cancelled.status()).isEqualTo("REFUNDED");
        assertThat(order.status()).isEqualTo("REFUNDED");
        assertThat(order.paymentStatus()).isEqualTo("REFUNDED");
        assertThat(stockAfterCreate).isEqualTo(8);
        assertThat(stockAfterCancel).isEqualTo(10);
    }

    @Test
    void failedMobilePaymentCancelsOrderAndRestoresStockImmediately() {
        CreateOrderResponse created = orderService.create(new CreateOrderRequest(
            "idem-order-fail",
            "Kim Minsu",
            "01012345678",
            "06236",
            "Teheran-ro 123",
            "8F",
            "Leave at the door.",
            PaymentMethod.MOBILE,
            List.of(new CheckoutItemRequest(10L, 2))
        ));

        OrderResponse order = orderService.getGuest(created.orderNumber(), "01012345678");
        Integer stockAfterFailure = jdbcClient.sql("SELECT stock FROM products WHERE id = 10")
            .query(Integer.class)
            .single();

        assertThat(created.status()).isEqualTo("CANCELLED");
        assertThat(created.paymentStatus()).isEqualTo("FAILED");
        assertThat(order.status()).isEqualTo("CANCELLED");
        assertThat(order.paymentStatus()).isEqualTo("FAILED");
        assertThat(stockAfterFailure).isEqualTo(10);
    }

    @Test
    void listByPhoneReturnsLatestGuestOrdersFirst() {
        orderService.create(new CreateOrderRequest(
            "idem-order-list-1",
            "Kim Minsu",
            "01012345678",
            "06236",
            "Teheran-ro 123",
            "8F",
            "Leave at the door.",
            PaymentMethod.CARD,
            List.of(new CheckoutItemRequest(10L, 1))
        ));

        orderService.create(new CreateOrderRequest(
            "idem-order-list-2",
            "Kim Minsu",
            "01012345678",
            "06236",
            "Teheran-ro 123",
            "8F",
            "Leave at the door.",
            PaymentMethod.BANK_TRANSFER,
            List.of(new CheckoutItemRequest(10L, 1))
        ));

        List<OrderSummaryResponse> orders = orderService.listByPhone("01012345678");

        assertThat(orders).hasSize(2);
        assertThat(orders.getFirst().createdAt()).isAfterOrEqualTo(orders.get(1).createdAt());
        assertThat(orders.getFirst().customerType()).isEqualTo("GUEST");
        assertThat(orders.getFirst().itemCount()).isEqualTo(1);
    }

    @Test
    void listByUserIdReturnsOnlyMemberOrders() {
        OffsetDateTime now = OffsetDateTime.now(SEOUL);
        jdbcClient.sql("""
            INSERT INTO users (id, name, email, password_hash, provider, created_at)
            VALUES (301, 'Kim Minsu', 'member@example.com', 'encoded-password', 'LOCAL', ?)
            """)
            .param(now)
            .update();

        orderService.create(new CreateOrderRequest(
            "idem-member-order",
            "Kim Minsu",
            "01012345678",
            "06236",
            "Teheran-ro 123",
            "8F",
            "Leave at the door.",
            PaymentMethod.CARD,
            List.of(new CheckoutItemRequest(10L, 1))
        ), 301L);

        orderService.create(new CreateOrderRequest(
            "idem-guest-order",
            "Guest User",
            "01012345678",
            "06236",
            "Teheran-ro 123",
            "8F",
            "Leave at the door.",
            PaymentMethod.BANK_TRANSFER,
            List.of(new CheckoutItemRequest(10L, 1))
        ));

        List<OrderSummaryResponse> memberOrders = orderService.listByUserId(301L);
        List<OrderSummaryResponse> guestOrders = orderService.listByPhone("01012345678");

        assertThat(memberOrders).hasSize(1);
        assertThat(memberOrders.getFirst().customerType()).isEqualTo("MEMBER");
        assertThat(guestOrders).hasSize(1);
        assertThat(guestOrders.getFirst().customerType()).isEqualTo("GUEST");
    }
}
