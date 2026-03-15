package com.vibeshop.api.order;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.simple.JdbcClient;

import com.vibeshop.api.order.OrderDtos.CheckoutItemRequest;
import com.vibeshop.api.order.OrderDtos.CreateOrderRequest;
import com.vibeshop.api.order.OrderDtos.CreateOrderResponse;
import com.vibeshop.api.order.OrderDtos.GuestOrderLookupRequest;
import com.vibeshop.api.order.OrderDtos.GuestOrderLookupResponse;

@SpringBootTest
class OrderServiceTest {

    @Autowired
    private OrderService orderService;

    @Autowired
    private JdbcClient jdbcClient;

    @BeforeEach
    void setUp() {
        jdbcClient.sql("DELETE FROM shopping_cart_items").update();
        jdbcClient.sql("DELETE FROM customer_order_lines").update();
        jdbcClient.sql("DELETE FROM customer_orders").update();
        jdbcClient.sql("DELETE FROM products").update();
        jdbcClient.sql("DELETE FROM categories").update();

        jdbcClient.sql("""
            INSERT INTO categories (id, slug, name, description, accent_color)
            VALUES (1, 'living', '리빙', '리빙 카테고리', '#29339b')
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
                featured,
                stock
            ) VALUES (
                10,
                1,
                'linen-bed-set',
                '린넨 베드 세트',
                '대표 상품',
                '대표 상품 설명',
                89000,
                'BEST',
                '#29339b',
                TRUE,
                10
            )
            """).update();
    }

    @Test
    void createReturnsExistingOrderForSameIdempotencyKey() {
        CreateOrderRequest request = new CreateOrderRequest(
            "idem-order-1",
            "Kim Minsu",
            "01012345678",
            "06236",
            "Teheran-ro 123",
            "8F",
            "Leave at the door.",
            List.of(new CheckoutItemRequest(10L, 1))
        );

        CreateOrderResponse first = orderService.create(request);
        CreateOrderResponse second = orderService.create(request);

        Integer orderCount = jdbcClient.sql("SELECT COUNT(*) FROM customer_orders")
            .query(Integer.class)
            .single();

        assertThat(first.orderNumber()).isEqualTo(second.orderNumber());
        assertThat(first.status()).isEqualTo("RECEIVED");
        assertThat(second.status()).isEqualTo("RECEIVED");
        assertThat(orderCount).isEqualTo(1);
    }

    @Test
    void lookupReturnsOrderWhenPhoneMatches() {
        CreateOrderResponse created = orderService.create(new CreateOrderRequest(
            "idem-order-lookup",
            "Kim Minsu",
            "01012345678",
            "06236",
            "Teheran-ro 123",
            "8F",
            "Leave at the door.",
            List.of(new CheckoutItemRequest(10L, 1))
        ));

        GuestOrderLookupResponse found = orderService.lookup(new GuestOrderLookupRequest(
            created.orderNumber(),
            "01012345678"
        ));

        assertThat(found.orderNumber()).isEqualTo(created.orderNumber());
    }
}
