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
        jdbcClient.sql("DELETE FROM order_payments").update();
        jdbcClient.sql("DELETE FROM customer_orders").update();
        jdbcClient.sql("DELETE FROM shipping_addresses").update();
        jdbcClient.sql("DELETE FROM user_sessions").update();
        jdbcClient.sql("DELETE FROM users").update();
        jdbcClient.sql("DELETE FROM products").update();
        jdbcClient.sql("DELETE FROM categories").update();

        jdbcClient.sql("""
            INSERT INTO categories (
                id,
                slug,
                name,
                description,
                accent_color,
                display_order,
                is_visible,
                cover_image_url,
                cover_image_alt,
                hero_title,
                hero_subtitle
            )
            VALUES (
                1,
                'living',
                '리빙',
                '리빙 카테고리',
                '#29339b',
                10,
                TRUE,
                '/images/products/living-01.jpg',
                '리빙 카테고리 커버',
                '리빙 카테고리 히어로',
                '리빙 카테고리 설명'
            )
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
                stock,
                popularity_score,
                created_at
            ) VALUES (
                10,
                1,
                'linen-bed-set',
                '리넨 베드 세트',
                '테스트 상품',
                '테스트 상품 설명',
                89000,
                'BEST',
                '#29339b',
                '/images/products/living-01.jpg',
                '리넨 베드 세트 상품 이미지',
                TRUE,
                10,
                900,
                CURRENT_TIMESTAMP
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

    @Test
    void mergeGuestCartIntoMemberCartMovesItemsToMemberBucket() {
        cartService.putItem("guest-session-3", 10L, 2);

        cartService.mergeGuestCartIntoMemberCart("guest-session-3", 77L);

        assertThat(cartService.get("guest-session-3").items()).isEmpty();
        assertThat(cartService.getForUser(77L).items()).hasSize(1);
        assertThat(cartService.getForUser(77L).items().getFirst().quantity()).isEqualTo(2);
    }
}
