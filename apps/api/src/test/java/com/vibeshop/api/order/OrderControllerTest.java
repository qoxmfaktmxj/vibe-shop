package com.vibeshop.api.order;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.servlet.http.Cookie;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.HttpHeaders;

@SpringBootTest
@AutoConfigureMockMvc
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcClient jdbcClient;

    @BeforeEach
    void setUp() {
        jdbcClient.sql("DELETE FROM shopping_cart_items").update();
        jdbcClient.sql("DELETE FROM customer_order_lines").update();
        jdbcClient.sql("DELETE FROM order_payments").update();
        jdbcClient.sql("DELETE FROM guest_order_access_tokens").update();
        jdbcClient.sql("DELETE FROM guest_order_access_audit_logs").update();
        jdbcClient.sql("DELETE FROM customer_orders").update();
        jdbcClient.sql("DELETE FROM shipping_addresses").update();
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
    }

    @Test
    void authenticatedMemberOrderEndpointsAreScopedToTheOwner() throws Exception {
        Cookie memberACookie = signUpAndGetSessionCookie("member-a@example.com");
        Cookie memberBCookie = signUpAndGetSessionCookie("member-b@example.com");

        mockMvc.perform(post("/api/v1/orders")
                .cookie(memberACookie)
                .contentType("application/json")
                .content("""
                    {
                      "idempotencyKey": "member-order-1",
                      "customerName": "Member A",
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
            .andExpect(jsonPath("$.status").value("PAID"))
            .andExpect(jsonPath("$.paymentStatus").value("SUCCEEDED"));

        String orderNumber = jdbcClient.sql("SELECT order_number FROM customer_orders WHERE idempotency_key = 'member-order-1'")
            .query(String.class)
            .single();

        mockMvc.perform(get("/api/v1/orders").cookie(memberACookie))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].orderNumber").value(orderNumber))
            .andExpect(jsonPath("$[0].customerType").value("MEMBER"));

        mockMvc.perform(get("/api/v1/orders/{orderNumber}", orderNumber).cookie(memberACookie))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.orderNumber").value(orderNumber))
            .andExpect(jsonPath("$.customerType").value("MEMBER"))
            .andExpect(jsonPath("$.paymentStatus").value("SUCCEEDED"));

        mockMvc.perform(get("/api/v1/orders/{orderNumber}", orderNumber).cookie(memberBCookie))
            .andExpect(status().isNotFound());

        mockMvc.perform(post("/api/v1/orders/{orderNumber}/cancel", orderNumber).cookie(memberBCookie))
            .andExpect(status().isNotFound());
    }

    @Test
    void guestOrderRequiresShortLivedAccessCookieForDetailAndCancel() throws Exception {
        Cookie accessCookie = mockMvc.perform(post("/api/v1/orders")
                .contentType("application/json")
                .content("""
                    {
                      "idempotencyKey": "guest-order-1",
                      "customerName": "Guest User",
                      "phone": "01099998888",
                      "postalCode": "06236",
                      "address1": "Teheran-ro 123",
                      "address2": "8F",
                      "note": "Leave at the door",
                      "paymentMethod": "BANK_TRANSFER",
                      "items": [
                        { "productId": 10, "quantity": 1 }
                      ]
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("PENDING_PAYMENT"))
            .andExpect(jsonPath("$.paymentStatus").value("PENDING"))
            .andExpect(header().string(HttpHeaders.SET_COOKIE, org.hamcrest.Matchers.containsString("HttpOnly")))
            .andExpect(header().string(HttpHeaders.SET_COOKIE, org.hamcrest.Matchers.containsString("SameSite=Lax")))
            .andReturn()
            .getResponse()
            .getCookie("vibe_shop_guest_order_access");

        String orderNumber = jdbcClient.sql("SELECT order_number FROM customer_orders WHERE idempotency_key = 'guest-order-1'")
            .query(String.class)
            .single();

        mockMvc.perform(get("/api/v1/orders/{orderNumber}", orderNumber))
            .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/v1/orders/{orderNumber}", orderNumber).param("phone", "01099998888"))
            .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/v1/orders/{orderNumber}", orderNumber).cookie(accessCookie))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.orderNumber").value(orderNumber))
            .andExpect(jsonPath("$.customerType").value("GUEST"))
            .andExpect(jsonPath("$.paymentStatus").value("PENDING"))
            .andExpect(jsonPath("$.phone").value("010-****-8888"))
            .andExpect(jsonPath("$.postalCode").value("*****"))
            .andExpect(jsonPath("$.address2").value(""))
            .andExpect(jsonPath("$.note").value(""));

        mockMvc.perform(get("/api/v1/orders").param("phone", "01099998888"))
            .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/v1/orders/{orderNumber}/cancel", orderNumber))
            .andExpect(status().isNotFound());

        mockMvc.perform(post("/api/v1/orders/{orderNumber}/cancel", orderNumber).cookie(accessCookie))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("CANCELLED"));
    }

    @Test
    void guestLookupIssuesAccessCookieAndRateLimitsRepeatedFailures() throws Exception {
        mockMvc.perform(post("/api/v1/orders")
                .contentType("application/json")
                .content("""
                    {
                      "idempotencyKey": "guest-lookup-rate-limit",
                      "customerName": "Guest User",
                      "phone": "01077776666",
                      "postalCode": "06236",
                      "address1": "Teheran-ro 123",
                      "address2": "8F",
                      "note": "Leave at the door",
                      "paymentMethod": "BANK_TRANSFER",
                      "items": [{ "productId": 10, "quantity": 1 }]
                    }
                    """))
            .andExpect(status().isOk());

        String orderNumber = jdbcClient.sql(
                "SELECT order_number FROM customer_orders WHERE idempotency_key = 'guest-lookup-rate-limit'"
            )
            .query(String.class)
            .single();

        Cookie accessCookie = mockMvc.perform(post("/api/v1/orders/lookup")
                .contentType("application/json")
                .content("""
                    { "orderNumber": "%s", "phone": "01077776666" }
                    """.formatted(orderNumber)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.orderNumber").value(orderNumber))
            .andReturn()
            .getResponse()
            .getCookie("vibe_shop_guest_order_access");

        org.assertj.core.api.Assertions.assertThat(accessCookie).isNotNull();
        org.assertj.core.api.Assertions.assertThat(accessCookie.isHttpOnly()).isTrue();
        org.assertj.core.api.Assertions.assertThat(accessCookie.getMaxAge()).isEqualTo(1200);

        for (int attempt = 0; attempt < 5; attempt++) {
            String wrongPhone = "0100000000" + attempt;
            mockMvc.perform(post("/api/v1/orders/lookup")
                    .contentType("application/json")
                    .content("""
                        { "orderNumber": "%s", "phone": "%s" }
                        """.formatted(orderNumber, wrongPhone)))
                .andExpect(status().isNotFound());
        }

        mockMvc.perform(post("/api/v1/orders/lookup")
                .contentType("application/json")
                .content("""
                    { "orderNumber": "%s", "phone": "01000000000" }
                    """.formatted(orderNumber)))
            .andExpect(status().isTooManyRequests())
            .andExpect(jsonPath("$.code").value("too_many_requests"));

        Integer failedAuditCount = jdbcClient.sql("""
                SELECT COUNT(*)
                FROM guest_order_access_audit_logs
                WHERE action = 'LOOKUP' AND succeeded = FALSE
                """)
            .query(Integer.class)
            .single();
        org.assertj.core.api.Assertions.assertThat(failedAuditCount).isEqualTo(5);
    }

    private Cookie signUpAndGetSessionCookie(String email) throws Exception {
        return mockMvc.perform(post("/api/v1/auth/signup")
                .contentType("application/json")
                .content("""
                    {
                      "name": "Member",
                      "email": "%s",
                      "password": "password123"
                    }
                    """.formatted(email)))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getCookie("vibe_shop_session");
    }
}
