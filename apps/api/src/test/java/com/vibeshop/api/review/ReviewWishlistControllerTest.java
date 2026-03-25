package com.vibeshop.api.review;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
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

    private static final String ADMIN_EMAIL = "owner@maru.local";
    private static final String ADMIN_PASSWORD = "owner1234!";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcClient jdbcClient;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        jdbcClient.sql("DELETE FROM review_helpful_votes").update();
        jdbcClient.sql("DELETE FROM review_images").update();
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
        jdbcClient.sql("DELETE FROM product_view_events").update();
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
    void memberCanCreateManageHelpfulFilterAndAdminCanHideReview() throws Exception {
        Cookie reviewerCookie = signUpAndGetSessionCookie("reviewer@example.com", "Reviewer");

        mockMvc.perform(post("/api/v1/account/wishlist/items/10").cookie(reviewerCookie))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.productId").value(10))
            .andExpect(jsonPath("$.wishlisted").value(true));

        createPaidOrder(reviewerCookie, "review-order-1");

        mockMvc.perform(post("/api/v1/products/10/reviews")
                .cookie(reviewerCookie)
                .contentType("application/json")
                .content("""
                    {
                      "rating": 5,
                      "title": "Excellent texture",
                      "content": "Matches the room tone perfectly.",
                      "fitTag": "공간포인트",
                      "repurchaseYn": true,
                      "deliverySatisfaction": 5,
                      "packagingSatisfaction": 4,
                      "imageUrls": [
                        "https://example.com/reviews/linen-1.jpg",
                        "https://example.com/reviews/linen-2.jpg"
                      ]
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.productSlug").value("linen-bed-set"))
            .andExpect(jsonPath("$.buyerReview").value(true))
            .andExpect(jsonPath("$.images.length()").value(2))
            .andExpect(jsonPath("$.status").value("PUBLISHED"));

        mockMvc.perform(get("/api/v1/products/linen-bed-set").cookie(reviewerCookie))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.wishlisted").value(true))
            .andExpect(jsonPath("$.canWriteReview").value(false))
            .andExpect(jsonPath("$.hasReviewed").value(true))
            .andExpect(jsonPath("$.reviewSummary.reviewCount").value(1))
            .andExpect(jsonPath("$.reviewSummary.photoReviewCount").value(1))
            .andExpect(jsonPath("$.reviewSummary.buyerReviewCount").value(1))
            .andExpect(jsonPath("$.reviewSummary.ratingDistribution[0].rating").value(5))
            .andExpect(jsonPath("$.reviews[0].title").value("Excellent texture"))
            .andExpect(jsonPath("$.reviews[0].buyerReview").value(true))
            .andExpect(jsonPath("$.reviews[0].images.length()").value(2));

        Long reviewId = jdbcClient.sql("SELECT id FROM product_reviews WHERE title = 'Excellent texture'")
            .query(Long.class)
            .single();

        Cookie helperCookie = signUpAndGetSessionCookie("helper@example.com", "Helpful User");

        mockMvc.perform(post("/api/v1/products/10/reviews/{reviewId}/helpful", reviewId).cookie(helperCookie))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.reviewId").value(reviewId))
            .andExpect(jsonPath("$.helpfulCount").value(1))
            .andExpect(jsonPath("$.helpfulVoted").value(true));

        mockMvc.perform(get("/api/v1/products/10/reviews?sort=helpful&photoOnly=true&rating=5").cookie(helperCookie))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.summary.reviewCount").value(1))
            .andExpect(jsonPath("$.reviews.length()").value(1))
            .andExpect(jsonPath("$.reviews[0].helpfulCount").value(1))
            .andExpect(jsonPath("$.reviews[0].helpfulVoted").value(true))
            .andExpect(jsonPath("$.reviews[0].hasPhotos").value(true));

        mockMvc.perform(put("/api/v1/account/reviews/{reviewId}", reviewId)
                .cookie(reviewerCookie)
                .contentType("application/json")
                .content("""
                    {
                      "rating": 4,
                      "title": "Updated texture",
                      "content": "Still good after a week of use.",
                      "fitTag": "차분한톤",
                      "repurchaseYn": true,
                      "deliverySatisfaction": 4,
                      "packagingSatisfaction": 4,
                      "imageUrls": [
                        "https://example.com/reviews/linen-updated.jpg"
                      ]
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.title").value("Updated texture"))
            .andExpect(jsonPath("$.images.length()").value(1));

        mockMvc.perform(get("/api/v1/account/reviews").cookie(reviewerCookie))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].title").value("Updated texture"))
            .andExpect(jsonPath("$[0].fitTag").value("차분한톤"));

        Cookie adminCookie = loginAsAdmin();

        mockMvc.perform(get("/api/v1/admin/reviews").cookie(adminCookie))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].title").value("Updated texture"))
            .andExpect(jsonPath("$[0].buyerReview").value(true))
            .andExpect(jsonPath("$[0].helpfulCount").value(1))
            .andExpect(jsonPath("$[0].photoCount").value(1));

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
    void reviewRequiresPurchasePreventsDuplicateHelpfulDuplicatesAndSupportsDelete() throws Exception {
        Cookie reviewerCookie = signUpAndGetSessionCookie("duplicate-review@example.com", "Duplicate Reviewer");

        mockMvc.perform(post("/api/v1/products/10/reviews")
                .cookie(reviewerCookie)
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

        createPaidOrder(reviewerCookie, "review-order-2");

        mockMvc.perform(post("/api/v1/products/10/reviews")
                .cookie(reviewerCookie)
                .contentType("application/json")
                .content("""
                    {
                      "rating": 4,
                      "title": "After purchase",
                      "content": "This should work.",
                      "deliverySatisfaction": 4,
                      "packagingSatisfaction": 5
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("PUBLISHED"));

        Long reviewId = jdbcClient.sql("SELECT id FROM product_reviews WHERE title = 'After purchase'")
            .query(Long.class)
            .single();

        mockMvc.perform(post("/api/v1/products/10/reviews")
                .cookie(reviewerCookie)
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

        mockMvc.perform(post("/api/v1/products/10/reviews/{reviewId}/helpful", reviewId).cookie(reviewerCookie))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("bad_request"));

        Cookie helperCookie = signUpAndGetSessionCookie("helper-2@example.com", "Helper Two");

        mockMvc.perform(post("/api/v1/products/10/reviews/{reviewId}/helpful", reviewId).cookie(helperCookie))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.helpfulCount").value(1));

        mockMvc.perform(post("/api/v1/products/10/reviews/{reviewId}/helpful", reviewId).cookie(helperCookie))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.helpfulCount").value(1))
            .andExpect(jsonPath("$.helpfulVoted").value(true));

        mockMvc.perform(delete("/api/v1/products/10/reviews/{reviewId}/helpful", reviewId).cookie(helperCookie))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.helpfulCount").value(0))
            .andExpect(jsonPath("$.helpfulVoted").value(false));

        mockMvc.perform(get("/api/v1/products/10/reviews?rating=9"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("bad_request"));

        mockMvc.perform(delete("/api/v1/account/reviews/{reviewId}", reviewId).cookie(reviewerCookie))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.reviewId").value(reviewId));

        mockMvc.perform(get("/api/v1/products/linen-bed-set"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.reviewSummary.reviewCount").value(0))
            .andExpect(jsonPath("$.reviews.length()").value(0));
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
