package com.vibeshop.api.order;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.stream.Collectors;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.simple.JdbcClient;

import com.vibeshop.api.order.OrderDtos.CheckoutItemRequest;
import com.vibeshop.api.order.OrderDtos.CreateOrderRequest;
import com.vibeshop.api.order.OrderDtos.CreateOrderResponse;

@SpringBootTest
class OrderConcurrencyTest {

    @Autowired
    private OrderService orderService;

    @Autowired
    private JdbcClient jdbcClient;

    private ExecutorService executor;

    @BeforeEach
    void setUp() {
        executor = Executors.newFixedThreadPool(20);
        jdbcClient.sql("DELETE FROM shopping_cart_items").update();
        jdbcClient.sql("DELETE FROM customer_order_lines").update();
        jdbcClient.sql("DELETE FROM order_payments").update();
        jdbcClient.sql("DELETE FROM guest_order_access_tokens").update();
        jdbcClient.sql("DELETE FROM guest_order_access_audit_logs").update();
        jdbcClient.sql("DELETE FROM customer_orders").update();
        jdbcClient.sql("DELETE FROM review_helpful_votes").update();
        jdbcClient.sql("DELETE FROM review_images").update();
        jdbcClient.sql("DELETE FROM product_reviews").update();
        jdbcClient.sql("DELETE FROM wishlist_items").update();
        jdbcClient.sql("DELETE FROM product_view_events").update();
        jdbcClient.sql("DELETE FROM display_items").update();
        jdbcClient.sql("DELETE FROM products").update();
        jdbcClient.sql("DELETE FROM categories").update();

        jdbcClient.sql("""
            INSERT INTO categories (
                id, slug, name, description, accent_color, display_order, is_visible,
                cover_image_url, cover_image_alt, hero_title, hero_subtitle
            ) VALUES (
                1, 'living', 'Living', 'Living category', '#29339b', 10, TRUE,
                '/images/products/living-01.jpg', 'Living category cover',
                'Living category hero', 'Living category subtitle'
            )
            """).update();

        jdbcClient.sql("""
            INSERT INTO products (
                id, category_id, slug, name, summary, description, price, badge,
                accent_color, image_url, image_alt, featured, stock, popularity_score, created_at
            ) VALUES (
                10, 1, 'limited-item', 'Limited Item', 'Summary', 'Description', 10000,
                'LIMITED', '#29339b', '/images/products/living-01.jpg', 'Limited item image',
                TRUE, 10, 100, CURRENT_TIMESTAMP
            )
            """).update();
    }

    @AfterEach
    void tearDown() {
        executor.shutdownNow();
    }

    @Test
    void onlyAvailableStockSucceedsUnderFiftyParallelOrders() throws Exception {
        CountDownLatch start = new CountDownLatch(1);
        List<Future<CreateOrderResponse>> futures = new ArrayList<>();

        for (int index = 0; index < 50; index++) {
            int requestIndex = index;
            futures.add(executor.submit(() -> {
                start.await();
                return orderService.create(request("parallel-stock-" + requestIndex));
            }));
        }

        start.countDown();
        int succeeded = 0;
        int rejected = 0;
        for (Future<CreateOrderResponse> future : futures) {
            try {
                future.get();
                succeeded++;
            } catch (ExecutionException exception) {
                assertThat(rootCause(exception)).isInstanceOf(IllegalArgumentException.class);
                rejected++;
            }
        }

        assertThat(succeeded).isEqualTo(10);
        assertThat(rejected).isEqualTo(40);
        assertThat(queryInt("SELECT stock FROM products WHERE id = 10")).isZero();
        assertThat(queryInt("SELECT COUNT(*) FROM customer_orders")).isEqualTo(10);
        assertThat(queryInt("SELECT MIN(stock) FROM products")).isZero();
    }

    @Test
    void oneHundredParallelRequestsWithSameIdempotencyKeyReturnOneOrder() throws Exception {
        CountDownLatch start = new CountDownLatch(1);
        List<Future<CreateOrderResponse>> futures = new ArrayList<>();

        for (int index = 0; index < 100; index++) {
            futures.add(executor.submit(() -> {
                start.await();
                return orderService.create(request("same-idempotency-key"));
            }));
        }

        start.countDown();
        List<CreateOrderResponse> responses = new ArrayList<>();
        for (Future<CreateOrderResponse> future : futures) {
            responses.add(future.get());
        }

        Set<String> orderNumbers = responses.stream()
            .map(CreateOrderResponse::orderNumber)
            .collect(Collectors.toSet());

        assertThat(orderNumbers).hasSize(1);
        assertThat(orderNumbers.iterator().next()).matches(
            "VS-[0-9A-F]{8}-[0-9A-F]{4}-7[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}"
        );
        assertThat(queryInt("SELECT COUNT(*) FROM customer_orders")).isEqualTo(1);
        assertThat(queryInt("SELECT COUNT(*) FROM order_payments")).isEqualTo(1);
        assertThat(queryInt("SELECT stock FROM products WHERE id = 10")).isEqualTo(9);
    }

    private CreateOrderRequest request(String idempotencyKey) {
        return new CreateOrderRequest(
            idempotencyKey,
            "Parallel Guest",
            "01012345678",
            "06236",
            "Teheran-ro 123",
            "8F",
            "Leave at the door",
            PaymentMethod.CARD,
            List.of(new CheckoutItemRequest(10L, 1))
        );
    }

    private int queryInt(String sql) {
        return jdbcClient.sql(sql).query(Integer.class).single();
    }

    private Throwable rootCause(Throwable throwable) {
        Throwable current = throwable;
        while (current.getCause() != null) {
            current = current.getCause();
        }
        return current;
    }
}
