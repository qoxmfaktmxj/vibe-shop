package com.vibeshop.api.order;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.servlet.http.Cookie;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.test.web.servlet.MockMvc;

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
                'Summary',
                'Description',
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
                      "items": [
                        { "productId": 10, "quantity": 1 }
                      ]
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("RECEIVED"));

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
            .andExpect(jsonPath("$.customerType").value("MEMBER"));

        mockMvc.perform(get("/api/v1/orders/{orderNumber}", orderNumber).cookie(memberBCookie))
            .andExpect(status().isNotFound());

        mockMvc.perform(post("/api/v1/orders/{orderNumber}/cancel", orderNumber).cookie(memberBCookie))
            .andExpect(status().isNotFound());
    }

    @Test
    void guestOrderRequiresMatchingPhoneForDetailAndCancel() throws Exception {
        mockMvc.perform(post("/api/v1/orders")
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
                      "items": [
                        { "productId": 10, "quantity": 1 }
                      ]
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("RECEIVED"));

        String orderNumber = jdbcClient.sql("SELECT order_number FROM customer_orders WHERE idempotency_key = 'guest-order-1'")
            .query(String.class)
            .single();

        mockMvc.perform(get("/api/v1/orders/{orderNumber}", orderNumber))
            .andExpect(status().isBadRequest());

        mockMvc.perform(get("/api/v1/orders/{orderNumber}", orderNumber).param("phone", "01000000000"))
            .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/v1/orders/{orderNumber}", orderNumber).param("phone", "01099998888"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.orderNumber").value(orderNumber))
            .andExpect(jsonPath("$.customerType").value("GUEST"));

        mockMvc.perform(post("/api/v1/orders/{orderNumber}/cancel", orderNumber))
            .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/v1/orders/{orderNumber}/cancel", orderNumber).param("phone", "01099998888"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("CANCELLED"));
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
