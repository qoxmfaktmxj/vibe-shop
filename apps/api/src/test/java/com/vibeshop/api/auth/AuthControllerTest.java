package com.vibeshop.api.auth;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.OffsetDateTime;
import java.time.ZoneId;

import jakarta.servlet.http.Cookie;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcClient jdbcClient;

    @Autowired
    private PasswordEncoder passwordEncoder;

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
    void signUpCreatesAuthenticatedSessionCookie() throws Exception {
        MvcResult signUpResult = mockMvc.perform(post("/api/v1/auth/signup")
                .contentType("application/json")
                .content("""
                    {
                      "name": "Kim Minsu",
                      "email": "minsu@example.com",
                      "password": "password123"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(cookie().exists("vibe_shop_session"))
            .andExpect(jsonPath("$.authenticated").value(true))
            .andExpect(jsonPath("$.user.email").value("minsu@example.com"))
            .andReturn();

        Cookie authCookie = signUpResult.getResponse().getCookie("vibe_shop_session");

        mockMvc.perform(get("/api/v1/auth/session").cookie(authCookie))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.authenticated").value(true))
            .andExpect(jsonPath("$.user.name").value("Kim Minsu"));
    }

    @Test
    void loginMergesGuestCartIntoMemberCart() throws Exception {
        OffsetDateTime now = OffsetDateTime.now(SEOUL);
        jdbcClient.sql("""
            INSERT INTO users (id, name, email, password_hash, provider, created_at)
            VALUES (100, 'Kim Minsu', 'minsu@example.com', ?, 'LOCAL', ?)
            """)
            .param(passwordEncoder.encode("password123"))
            .param(now)
            .update();

        jdbcClient.sql("""
            INSERT INTO shopping_cart_items (session_token, product_id, quantity, created_at, updated_at)
            VALUES ('guest-session-merge', 10, 2, ?, ?)
            """)
            .param(now)
            .param(now)
            .update();

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                .cookie(new Cookie("vibe_shop_cart", "guest-session-merge"))
                .contentType("application/json")
                .content("""
                    {
                      "email": "minsu@example.com",
                      "password": "password123"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(cookie().exists("vibe_shop_session"))
            .andExpect(jsonPath("$.authenticated").value(true))
            .andReturn();

        Cookie authCookie = loginResult.getResponse().getCookie("vibe_shop_session");

        mockMvc.perform(get("/api/v1/cart").cookie(authCookie))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.itemCount").value(2))
            .andExpect(jsonPath("$.items[0].productId").value(10));
    }

    @Test
    void logoutClearsSession() throws Exception {
        MvcResult signUpResult = mockMvc.perform(post("/api/v1/auth/signup")
                .contentType("application/json")
                .content("""
                    {
                      "name": "Kim Minsu",
                      "email": "logout@example.com",
                      "password": "password123"
                    }
                    """))
            .andExpect(status().isOk())
            .andReturn();

        Cookie authCookie = signUpResult.getResponse().getCookie("vibe_shop_session");

        mockMvc.perform(post("/api/v1/auth/logout").cookie(authCookie))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.authenticated").value(false));

        mockMvc.perform(get("/api/v1/auth/session").cookie(authCookie))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.authenticated").value(false));
    }
}
