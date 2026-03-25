package com.vibeshop.api.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.OffsetDateTime;
import java.time.ZoneId;

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
class AdminControllerTest {

    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");
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
        jdbcClient.sql("DELETE FROM shopping_cart_items").update();
        jdbcClient.sql("DELETE FROM wishlist_items").update();
        jdbcClient.sql("DELETE FROM review_helpful_votes").update();
        jdbcClient.sql("DELETE FROM review_images").update();
        jdbcClient.sql("DELETE FROM product_reviews").update();
        jdbcClient.sql("DELETE FROM product_view_events").update();
        jdbcClient.sql("DELETE FROM customer_order_lines").update();
        jdbcClient.sql("DELETE FROM order_payments").update();
        jdbcClient.sql("DELETE FROM customer_orders").update();
        jdbcClient.sql("DELETE FROM shipping_addresses").update();
        jdbcClient.sql("DELETE FROM display_items").update();
        jdbcClient.sql("DELETE FROM display_sections").update();
        jdbcClient.sql("DELETE FROM user_sessions").update();
        jdbcClient.sql("DELETE FROM users").update();
        jdbcClient.sql("DELETE FROM products").update();
        jdbcClient.sql("DELETE FROM categories").update();
        jdbcClient.sql("DELETE FROM admin_display_settings").update();

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
    void adminLoginCanBootstrapSessionAndReadDashboard() throws Exception {
        Cookie adminCookie = loginAsAdmin();

        mockMvc.perform(get("/api/v1/admin/session").cookie(adminCookie))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.authenticated").value(true))
            .andExpect(jsonPath("$.user.email").value(ADMIN_EMAIL))
            .andExpect(jsonPath("$.user.role").value("OWNER"));

        mockMvc.perform(get("/api/v1/admin/dashboard").cookie(adminCookie))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.productCount").value(1))
            .andExpect(jsonPath("$.featuredProductCount").value(1))
            .andExpect(jsonPath("$.display.heroTitle").isNotEmpty());
    }

    @Test
    void adminCanUpdateDisplayProductAndOrderStatus() throws Exception {
        mockMvc.perform(post("/api/v1/orders")
                .contentType("application/json")
                .content("""
                    {
                      "idempotencyKey": "admin-order-1",
                      "customerName": "Admin Order",
                      "phone": "01012345678",
                      "postalCode": "06236",
                      "address1": "Teheran-ro 123",
                      "address2": "8F",
                      "note": "Leave at concierge",
                      "paymentMethod": "CARD",
                      "items": [
                        { "productId": 10, "quantity": 1 }
                      ]
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("PAID"));

        String orderNumber = jdbcClient.sql("SELECT order_number FROM customer_orders WHERE idempotency_key = 'admin-order-1'")
            .query(String.class)
            .single();

        Cookie adminCookie = loginAsAdmin();

        mockMvc.perform(put("/api/v1/admin/display")
                .cookie(adminCookie)
                .contentType("application/json")
                .content("""
                    {
                      "heroTitle": "Admin Hero Title",
                      "heroSubtitle": "Admin subtitle updated from dashboard.",
                      "heroCtaLabel": "Admin CTA",
                      "heroCtaHref": "/search?sort=popular"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.heroTitle").value("Admin Hero Title"))
            .andExpect(jsonPath("$.heroCtaLabel").value("Admin CTA"));

        mockMvc.perform(get("/api/v1/home"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.heroTitle").value("Admin Hero Title"));

        mockMvc.perform(put("/api/v1/admin/products/10")
                .cookie(adminCookie)
                .contentType("application/json")
                .content("""
                    {
                      "name": "Admin Updated Product",
                      "summary": "Updated summary",
                      "badge": "MD PICK",
                      "price": 99000,
                      "stock": 4,
                      "popularityScore": 1110,
                      "featured": true
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Admin Updated Product"))
            .andExpect(jsonPath("$.stock").value(4))
            .andExpect(jsonPath("$.popularityScore").value(1110));

        mockMvc.perform(put("/api/v1/admin/orders/{orderNumber}/status", orderNumber)
                .cookie(adminCookie)
                .contentType("application/json")
                .content("""
                    {
                      "status": "PREPARING"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.orderNumber").value(orderNumber))
            .andExpect(jsonPath("$.status").value("PREPARING"));
    }

    @Test
    void adminCanManageMembersAndReadStatistics() throws Exception {
        OffsetDateTime now = OffsetDateTime.now(SEOUL);

        jdbcClient.sql("""
            INSERT INTO users (
                id,
                name,
                email,
                password_hash,
                provider,
                role,
                status,
                phone,
                marketing_opt_in,
                created_at,
                last_login_at
            )
            VALUES (
                101,
                'Member Active',
                'member-active@example.com',
                ?,
                'LOCAL',
                'CUSTOMER',
                'ACTIVE',
                '01011112222',
                TRUE,
                ?,
                ?
            )
            """)
            .param(passwordEncoder.encode("password123"))
            .param(now.minusDays(2))
            .param(now.minusHours(1))
            .update();

        jdbcClient.sql("""
            INSERT INTO users (
                id,
                name,
                email,
                password_hash,
                provider,
                role,
                status,
                phone,
                marketing_opt_in,
                created_at,
                last_login_at
            )
            VALUES (
                102,
                'Member Dormant',
                'member-dormant@example.com',
                ?,
                'GOOGLE',
                'CUSTOMER',
                'DORMANT',
                NULL,
                FALSE,
                ?,
                ?
            )
            """)
            .param(passwordEncoder.encode("password123"))
            .param(now.minusDays(14))
            .param(now.minusDays(8))
            .update();

        jdbcClient.sql("""
            INSERT INTO shipping_addresses (
                id,
                user_id,
                label,
                recipient_name,
                phone,
                postal_code,
                address1,
                address2,
                is_default,
                created_at,
                updated_at
            )
            VALUES (
                501,
                101,
                '집',
                'Member Active',
                '01011112222',
                '06236',
                'Teheran-ro 123',
                '8F',
                TRUE,
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
            )
            """).update();

        jdbcClient.sql("""
            INSERT INTO customer_orders (
                id,
                order_number,
                idempotency_key,
                customer_type,
                user_id,
                customer_name,
                phone,
                postal_code,
                address1,
                address2,
                note,
                subtotal,
                shipping_fee,
                total,
                status,
                created_at
            )
            VALUES (
                701,
                'VSSTAT701',
                'stats-order-701',
                'MEMBER',
                101,
                'Member Active',
                '01011112222',
                '06236',
                'Teheran-ro 123',
                '8F',
                '',
                89000,
                0,
                89000,
                'PAID',
                ?
            )
            """)
            .param(now.minusDays(1))
            .update();

        jdbcClient.sql("""
            INSERT INTO customer_orders (
                id,
                order_number,
                idempotency_key,
                customer_type,
                user_id,
                customer_name,
                phone,
                postal_code,
                address1,
                address2,
                note,
                subtotal,
                shipping_fee,
                total,
                status,
                created_at
            )
            VALUES (
                702,
                'VSSTAT702',
                'stats-order-702',
                'GUEST',
                NULL,
                'Guest Cancel',
                '01099998888',
                '06236',
                'Teheran-ro 222',
                '5F',
                '',
                89000,
                0,
                89000,
                'CANCELLED',
                ?
            )
            """)
            .param(now.minusDays(2))
            .update();

        jdbcClient.sql("""
            INSERT INTO customer_order_lines (
                id,
                order_id,
                product_id,
                product_name,
                quantity,
                unit_price,
                line_total
            )
            VALUES
            (801, 701, 10, 'Linen Bed Set', 1, 89000, 89000),
            (802, 702, 10, 'Linen Bed Set', 1, 89000, 89000)
            """).update();

        jdbcClient.sql("""
            INSERT INTO order_payments (
                id,
                order_id,
                payment_method,
                payment_status,
                provider_code,
                reference_code,
                message,
                approved_at,
                created_at,
                updated_at
            )
            VALUES (
                901,
                701,
                'CARD',
                'SUCCEEDED',
                'mock',
                'stats-payment-701',
                'ok',
                ?,
                ?,
                ?
            )
            """)
            .param(now.minusDays(1))
            .param(now.minusDays(1))
            .param(now.minusDays(1))
            .update();

        jdbcClient.sql("""
            INSERT INTO order_payments (
                id,
                order_id,
                payment_method,
                payment_status,
                provider_code,
                reference_code,
                message,
                approved_at,
                created_at,
                updated_at
            )
            VALUES (
                902,
                702,
                'CARD',
                'CANCELLED',
                'mock',
                'stats-payment-702',
                'cancelled',
                NULL,
                ?,
                ?
            )
            """)
            .param(now.minusDays(2))
            .param(now.minusDays(2))
            .update();

        Cookie adminCookie = loginAsAdmin();

        mockMvc.perform(get("/api/v1/admin/members").cookie(adminCookie))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].email").value("member-active@example.com"))
            .andExpect(jsonPath("$[0].orderCount").value(1))
            .andExpect(jsonPath("$[0].shippingAddressCount").value(1))
            .andExpect(jsonPath("$[0].totalSpent").value(89000));

        mockMvc.perform(put("/api/v1/admin/members/{memberId}/status", 101)
                .cookie(adminCookie)
                .contentType("application/json")
                .content("""
                    {
                      "status": "BLOCKED"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("BLOCKED"));

        mockMvc.perform(get("/api/v1/admin/statistics").cookie(adminCookie))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.sevenDay.orderCount").value(2))
            .andExpect(jsonPath("$.sevenDay.paidRevenue").value(89000))
            .andExpect(jsonPath("$.sevenDay.newMemberCount").value(1))
            .andExpect(jsonPath("$.sevenDay.cancelledOrderCount").value(1))
            .andExpect(jsonPath("$.categorySales[0].categorySlug").value("living"))
            .andExpect(jsonPath("$.topProducts[0].productId").value(10));
    }

    @Test
    void adminOperationsDashboardAggregatesOperationalSignals() throws Exception {
        OffsetDateTime now = OffsetDateTime.now(SEOUL);

        jdbcClient.sql("UPDATE products SET stock = 2, popularity_score = 880 WHERE id = 10").update();

        jdbcClient.sql("""
            INSERT INTO users (
                id,
                name,
                email,
                password_hash,
                provider,
                role,
                status,
                phone,
                marketing_opt_in,
                created_at,
                last_login_at
            ) VALUES (
                101,
                'Reviewer',
                'reviewer@example.com',
                ?,
                'LOCAL',
                'CUSTOMER',
                'ACTIVE',
                '01055556666',
                FALSE,
                ?,
                ?
            )
            """)
            .param(passwordEncoder.encode("password123"))
            .param(now.minusDays(5))
            .param(now.minusHours(2))
            .update();

        jdbcClient.sql("""
            INSERT INTO customer_orders (
                id,
                order_number,
                idempotency_key,
                customer_type,
                user_id,
                customer_name,
                phone,
                postal_code,
                address1,
                address2,
                note,
                subtotal,
                shipping_fee,
                total,
                status,
                created_at
            ) VALUES (
                701,
                'VS-OPS-701',
                'ops-701',
                'GUEST',
                NULL,
                'Risk Guest',
                '01099998888',
                '06236',
                'Teheran-ro 1',
                '9F',
                'ops note',
                320000,
                0,
                320000,
                'PENDING_PAYMENT',
                ?
            )
            """)
            .param(now.minusHours(3))
            .update();

        jdbcClient.sql("""
            INSERT INTO customer_order_lines (
                id,
                order_id,
                product_id,
                product_name,
                quantity,
                unit_price,
                line_total
            ) VALUES
                (801, 701, 10, 'Linen Bed Set', 5, 64000, 320000)
            """).update();

        jdbcClient.sql("""
            INSERT INTO order_payments (
                id,
                order_id,
                payment_method,
                payment_status,
                provider_code,
                reference_code,
                message,
                approved_at,
                created_at,
                updated_at
            ) VALUES (
                901,
                701,
                'BANK_TRANSFER',
                'PENDING',
                'mock',
                'ops-payment-701',
                'pending',
                NULL,
                ?,
                ?
            )
            """)
            .param(now.minusHours(3))
            .param(now.minusHours(3))
            .update();

        jdbcClient.sql("""
            INSERT INTO customer_orders (
                id,
                order_number,
                idempotency_key,
                customer_type,
                user_id,
                customer_name,
                phone,
                postal_code,
                address1,
                address2,
                note,
                subtotal,
                shipping_fee,
                total,
                status,
                created_at
            ) VALUES (
                702,
                'VS-OPS-702',
                'ops-702',
                'GUEST',
                NULL,
                'Risk Guest Repeat',
                '01099998888',
                '06236',
                'Teheran-ro 1',
                '9F',
                'repeat',
                120000,
                0,
                120000,
                'PAID',
                ?
            )
            """)
            .param(now.minusHours(2))
            .update();

        jdbcClient.sql("""
            INSERT INTO customer_order_lines (
                id,
                order_id,
                product_id,
                product_name,
                quantity,
                unit_price,
                line_total
            ) VALUES
                (802, 702, 10, 'Linen Bed Set', 2, 60000, 120000)
            """).update();

        jdbcClient.sql("""
            INSERT INTO order_payments (
                id,
                order_id,
                payment_method,
                payment_status,
                provider_code,
                reference_code,
                message,
                approved_at,
                created_at,
                updated_at
            ) VALUES (
                902,
                702,
                'CARD',
                'SUCCEEDED',
                'mock',
                'ops-payment-702',
                'paid',
                ?,
                ?,
                ?
            )
            """)
            .param(now.minusHours(2))
            .param(now.minusHours(2))
            .param(now.minusHours(2))
            .update();

        jdbcClient.sql("""
            INSERT INTO product_view_events (product_id, user_id, visitor_key, source, viewed_at)
            VALUES
                (10, NULL, 'guest-1', 'PRODUCT_DETAIL', ?),
                (10, NULL, 'guest-2', 'PRODUCT_DETAIL', ?)
            """)
            .param(now.minusHours(1))
            .param(now.minusHours(4))
            .update();

        jdbcClient.sql("""
            INSERT INTO wishlist_items (user_id, product_id, created_at)
            VALUES (101, 10, ?)
            """)
            .param(now.minusDays(1))
            .update();

        jdbcClient.sql("""
            INSERT INTO product_reviews (
                id,
                product_id,
                user_id,
                rating,
                title,
                content,
                fit_tag,
                repurchase_yn,
                delivery_satisfaction,
                packaging_satisfaction,
                status,
                helpful_count,
                is_buyer_review,
                created_at,
                updated_at
            ) VALUES (
                1001,
                10,
                101,
                2,
                '포장 개선 필요',
                '생각보다 아쉬웠습니다.',
                NULL,
                FALSE,
                2,
                2,
                'PUBLISHED',
                0,
                TRUE,
                ?,
                ?
            )
            """)
            .param(now.minusHours(5))
            .param(now.minusHours(5))
            .update();

        Cookie adminCookie = loginAsAdmin();

        mockMvc.perform(get("/api/v1/admin/operations")
                .cookie(adminCookie)
                .param("lowStockThreshold", "5")
                .param("lowRatingThreshold", "2")
                .param("suspiciousScoreThreshold", "3"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.summary.lowStockCount").value(1))
            .andExpect(jsonPath("$.summary.suspiciousOrderCount").value(1))
            .andExpect(jsonPath("$.summary.lowRatingReviewCount").value(1))
            .andExpect(jsonPath("$.lowStockProducts[0].productId").value(10))
            .andExpect(jsonPath("$.suspiciousOrders[0].orderNumber").value("VS-OPS-701"))
            .andExpect(jsonPath("$.trendingProducts[0].productId").value(10))
            .andExpect(jsonPath("$.lowRatingReviews[0].reviewId").value(1001));
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
            .andExpect(header().doesNotExist("X-Admin-Session-Token"))
            .andExpect(cookie().exists("vibe_shop_admin_session"))
            .andExpect(jsonPath("$.sessionToken").doesNotExist())
            .andReturn();

        Cookie adminCookie = loginResult.getResponse().getCookie("vibe_shop_admin_session");
        assertThat(adminCookie).isNotNull();
        assertThat(adminCookie.isHttpOnly()).isTrue();
        assertThat(adminCookie.getSecure()).isFalse();
        assertThat(loginResult.getResponse().getHeader("Set-Cookie")).contains("SameSite=Lax");
        return adminCookie;
    }
}
