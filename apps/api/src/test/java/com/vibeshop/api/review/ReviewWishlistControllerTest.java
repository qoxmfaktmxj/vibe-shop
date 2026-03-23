package com.vibeshop.api.review;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.servlet.http.Cookie;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class ReviewWishlistControllerTest {

    private static final String ADMIN_EMAIL = "owner@vibeshop.local";
    private static final String ADMIN_PASSWORD = "owner1234!";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcClient jdbcClient;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        jdbcClient.sql("DELETE FROM wishlist_items").update();
        jdbcClient.sql("DELETE FROM product_reviews").update();
        jdbcClient.sql("DELETE FROM shopping_cart_items").update();
        jdbcClient.sql("DELETE FROM customer_order_lines").update();
        jdbcClient.sql("DELETE FROM order_payments").update();
        jdbcClient.sql("DELETE FROM customer_orders").update();
        jdbcClient.sql("DELETE FROM shipping_addresses").update();
        jdbcClient.sql("DELETE FROM display_items").update();
        jdbcClient.sql("DELETE FROM display_sections").update();
        jdbcClient.sql("DELETE FROM admin_display_settings").update();
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
                'Living',
                'Living category',
                '#29339b',
                10,
                TRUE,
                '/images/products/living-01.jpg',
                'Living category cover',
                'Living category hero',
                'Living category subtitle'
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
                'Linen Bed Set',
                'Summary',
                'Description',
                89000,
                'BEST',
                '#29339b',
                '/images/products/living-01.jpg',
                'Linen Bed Set image',
                TRUE,
                10,
                900,
                CURRENT_TIMESTAMP
            )
            """).update();

        jdbcClient.sql("""
            INSERT INTO users (
                id,
                name,
                email,
                password_hash,
                provider,
                role,
                status,
                marketing_opt_in,
                created_at,
                last_login_at
            )
            VALUES (
                900,
                'Owner',
                ?,
                ?,
                'LOCAL',
                'OWNER',
                'ACTIVE',
                FALSE,
                CURRENT_TIMESTAMP,
                NULL
            )
            """)
            .param(ADMIN_EMAIL)
            .param(passwordEncoder.encode(ADMIN_PASSWORD))
            .update();
    }

    @Test
    void memberCanWishlistReviewAndAdminCanHideReview() throws Exception {
        Cookie authCookie = signUpAndGetSessionCookie("reviewer@example.com", "Reviewer");

        mockMvc.perform(post("/api/v1/account/wishlist/items/10").cookie(authCookie))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.productId").value(10))
            .andExpect(jsonPath("$.wishlisted").value(true));

        mockMvc.perform(get("/api/v1/account/wishlist").cookie(authCookie))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].productId").value(10))
            .andExpect(jsonPath("$[0].slug").value("linen-bed-set"));

        createPaidOrder(authCookie, "review-order-1");

        mockMvc.perform(post("/api/v1/products/10/reviews")
                .cookie(authCookie)
                .contentType("application/json")
                .content("""
                    {
                      "rating": 5,
                      "title": "Excellent texture",
                      "content": "Matches the room tone perfectly."
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.productSlug").value("linen-bed-set"))
            .andExpect(jsonPath("$.status").value("PUBLISHED"));

        mockMvc.perform(get("/api/v1/products/linen-bed-set").cookie(authCookie))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.wishlisted").value(true))
            .andExpect(jsonPath("$.canWriteReview").value(false))
            .andExpect(jsonPath("$.hasReviewed").value(true))
            .andExpect(jsonPath("$.reviewSummary.reviewCount").value(1))
            .andExpect(jsonPath("$.reviews[0].title").value("Excellent texture"));

        Cookie adminCookie = loginAsAdmin();
        Long reviewId = jdbcClient.sql("SELECT id FROM product_reviews WHERE title = 'Excellent texture'")
            .query(Long.class)
            .single();

        mockMvc.perform(get("/api/v1/admin/reviews").cookie(adminCookie))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].title").value("Excellent texture"))
            .andExpect(jsonPath("$[0].status").value("PUBLISHED"));

        mockMvc.perform(put("/api/v1/admin/reviews/{reviewId}/status", reviewId)
                .cookie(adminCookie)
                .contentType("application/json")
                .content("""
                    {
                      "status": "HIDDEN"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("HIDDEN"));

        mockMvc.perform(get("/api/v1/products/linen-bed-set"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.reviewSummary.reviewCount").value(0))
            .andExpect(jsonPath("$.reviews.length()").value(0));
    }

    @Test
    void reviewRequiresPurchaseAndCannotBeCreatedTwice() throws Exception {
        Cookie authCookie = signUpAndGetSessionCookie("duplicate-review@example.com", "Duplicate Reviewer");

        mockMvc.perform(post("/api/v1/products/10/reviews")
                .cookie(authCookie)
                .contentType("application/json")
                .content("""
                    {
                      "rating": 4,
                      "title": "Before purchase",
                      "content": "This should fail."
                    }
                    """))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("bad_request"));

        createPaidOrder(authCookie, "review-order-2");

        mockMvc.perform(post("/api/v1/products/10/reviews")
                .cookie(authCookie)
                .contentType("application/json")
                .content("""
                    {
                      "rating": 4,
                      "title": "After purchase",
                      "content": "This should work."
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("PUBLISHED"));

        mockMvc.perform(post("/api/v1/products/10/reviews")
                .cookie(authCookie)
                .contentType("application/json")
                .content("""
                    {
                      "rating": 5,
                      "title": "Second review",
                      "content": "This should fail."
                    }
                    """))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("bad_request"));
    }

    private Cookie signUpAndGetSessionCookie(String email, String name) throws Exception {
        return mockMvc.perform(post("/api/v1/auth/signup")
                .contentType("application/json")
                .content("""
                    {
                      "name": "%s",
                      "email": "%s",
                      "password": "password123"
                    }
                    """.formatted(name, email)))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getCookie("vibe_shop_session");
    }

    private void createPaidOrder(Cookie authCookie, String idempotencyKey) throws Exception {
        mockMvc.perform(post("/api/v1/orders")
                .cookie(authCookie)
                .contentType("application/json")
                .content("""
                    {
                      "idempotencyKey": "%s",
                      "customerName": "Reviewer",
                      "phone": "01012345678",
                      "postalCode": "06236",
                      "address1": "Teheran-ro 123",
                      "address2": "8F",
                      "note": "Review flow order",
                      "paymentMethod": "CARD",
                      "items": [
                        { "productId": 10, "quantity": 1 }
                      ]
                    }
                    """.formatted(idempotencyKey)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("PAID"));
    }

    private Cookie loginAsAdmin() throws Exception {
        MvcResult loginResult = mockMvc.perform(post("/api/v1/admin/session/login")
                .contentType("application/json")
                .content("""
                    {
                      "email": "%s",
                      "password": "%s"
                    }
                    """.formatted(ADMIN_EMAIL, ADMIN_PASSWORD)))
            .andExpect(status().isOk())
            .andExpect(cookie().exists("vibe_shop_admin_session"))
            .andReturn();

        return loginResult.getResponse().getCookie("vibe_shop_admin_session");
    }
}
