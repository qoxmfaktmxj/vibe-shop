package com.vibeshop.api.cart;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.simple.JdbcClient;

import com.vibeshop.api.cart.CartDtos.CartResponse;

@SpringBootTest
class CartServiceTest {

    @Autowired
    private CartService cartService;

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
    void putItemStoresServerCartBySessionToken() {
        String sessionToken = "guest-session-1";

        CartResponse response = cartService.putItem(sessionToken, 10L, 2);

        assertThat(response.items()).hasSize(1);
        assertThat(response.items().getFirst().productId()).isEqualTo(10L);
        assertThat(response.items().getFirst().quantity()).isEqualTo(2);
        assertThat(response.itemCount()).isEqualTo(2);
        assertThat(response.subtotal()).isEqualByComparingTo("178000");
        assertThat(cartService.get(sessionToken).items()).hasSize(1);
    }

    @Test
    void clearRemovesStoredCartItems() {
        String sessionToken = "guest-session-2";
        cartService.putItem(sessionToken, 10L, 1);

        CartResponse clearedCart = cartService.clear(sessionToken);

        assertThat(clearedCart.items()).isEmpty();
        assertThat(clearedCart.itemCount()).isZero();
        assertThat(clearedCart.subtotal()).isEqualByComparingTo("0");
        assertThat(cartService.get(sessionToken).items()).isEmpty();
    }
}
