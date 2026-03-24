package com.vibeshop.api.account;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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
class AccountControllerTest {

    @Autowired
    private MockMvc mockMvc;

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
    void accountEndpointsRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/v1/account"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.code").value("unauthorized"));

        mockMvc.perform(post("/api/v1/account/addresses")
                .contentType("application/json")
                .content("""
                    {
                      "label": "Home",
                      "recipientName": "Guest User",
                      "phone": "01012345678",
                      "postalCode": "06236",
                      "address1": "Teheran-ro 123",
                      "address2": "8F",
                      "isDefault": true
                    }
                    """))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void memberCanManageProfileAndShippingAddresses() throws Exception {
        Cookie authCookie = signUpAndGetSessionCookie("mypage@example.com", "My Page User");

        mockMvc.perform(post("/api/v1/orders")
                .cookie(authCookie)
                .contentType("application/json")
                .content("""
                    {
                      "idempotencyKey": "account-order-1",
                      "customerName": "My Page User",
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

        mockMvc.perform(get("/api/v1/account").cookie(authCookie))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("My Page User"))
            .andExpect(jsonPath("$.email").value("mypage@example.com"))
            .andExpect(jsonPath("$.orderCount").value(1))
            .andExpect(jsonPath("$.addressCount").value(0));

        mockMvc.perform(put("/api/v1/account")
                .cookie(authCookie)
                .contentType("application/json")
                .content("""
                    {
                      "name": "Renamed User"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Renamed User"));

        mockMvc.perform(post("/api/v1/account/addresses")
                .cookie(authCookie)
                .contentType("application/json")
                .content("""
                    {
                      "label": "Home",
                      "recipientName": "Renamed User",
                      "phone": "01012345678",
                      "postalCode": "06236",
                      "address1": "Teheran-ro 123",
                      "address2": "8F",
                      "isDefault": false
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.label").value("Home"))
            .andExpect(jsonPath("$.isDefault").value(true));

        mockMvc.perform(post("/api/v1/account/addresses")
                .cookie(authCookie)
                .contentType("application/json")
                .content("""
                    {
                      "label": "Studio",
                      "recipientName": "Renamed User",
                      "phone": "01077778888",
                      "postalCode": "04524",
                      "address1": "Seongsu-ro 88",
                      "address2": "3F",
                      "isDefault": true
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.label").value("Studio"))
            .andExpect(jsonPath("$.isDefault").value(true));

        mockMvc.perform(get("/api/v1/account/addresses").cookie(authCookie))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].label").value("Studio"))
            .andExpect(jsonPath("$[0].isDefault").value(true))
            .andExpect(jsonPath("$[1].label").value("Home"))
            .andExpect(jsonPath("$[1].isDefault").value(false));

        Long studioAddressId = jdbcClient.sql("SELECT id FROM shipping_addresses WHERE label = 'Studio'")
            .query(Long.class)
            .single();

        mockMvc.perform(delete("/api/v1/account/addresses/{addressId}", studioAddressId).cookie(authCookie))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.addressId").value(studioAddressId));

        mockMvc.perform(get("/api/v1/account/addresses").cookie(authCookie))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].label").value("Home"))
            .andExpect(jsonPath("$[0].isDefault").value(true));

        mockMvc.perform(get("/api/v1/account").cookie(authCookie))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Renamed User"))
            .andExpect(jsonPath("$.orderCount").value(1))
            .andExpect(jsonPath("$.addressCount").value(1));
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
}
