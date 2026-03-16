package com.vibeshop.api.admin;

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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class AdminControllerTest {

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
        jdbcClient.sql("DELETE FROM products").update();
        jdbcClient.sql("DELETE FROM categories").update();
        jdbcClient.sql("DELETE FROM admin_display_settings").update();

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
    void adminLoginCanBootstrapSessionAndReadDashboard() throws Exception {
        Cookie adminCookie = loginAsAdmin();

        mockMvc.perform(get("/api/v1/admin/session").cookie(adminCookie))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.authenticated").value(true))
            .andExpect(jsonPath("$.user.email").value("admin@vibeshop.local"))
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
                      "heroSubtitle": "Admin subtitle updated from dashboard."
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.heroTitle").value("Admin Hero Title"));

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

    private Cookie loginAsAdmin() throws Exception {
        MvcResult loginResult = mockMvc.perform(post("/api/v1/admin/session/login")
                .contentType("application/json")
                .content("""
                    {
                      "email": "admin@vibeshop.local",
                      "password": "admin1234!"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(cookie().exists("vibe_shop_admin_session"))
            .andReturn();

        return loginResult.getResponse().getCookie("vibe_shop_admin_session");
    }
}
