package com.vibeshop.api.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.OffsetDateTime;
import java.time.ZoneId;

import jakarta.servlet.http.Cookie;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
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
            .andExpect(header().doesNotExist("X-Session-Token"))
            .andExpect(cookie().exists("vibe_shop_session"))
            .andExpect(jsonPath("$.authenticated").value(true))
            .andExpect(jsonPath("$.user.email").value("minsu@example.com"))
            .andExpect(jsonPath("$.sessionToken").doesNotExist())
            .andReturn();

        Cookie authCookie = signUpResult.getResponse().getCookie("vibe_shop_session");
        assertThat(authCookie).isNotNull();
        assertThat(authCookie.isHttpOnly()).isTrue();
        assertThat(authCookie.getSecure()).isFalse();
        assertThat(signUpResult.getResponse().getHeader("Set-Cookie")).contains("SameSite=Lax");

        mockMvc.perform(get("/api/v1/auth/session").cookie(authCookie))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.authenticated").value(true))
            .andExpect(jsonPath("$.user.name").value("Kim Minsu"))
            .andExpect(jsonPath("$.sessionToken").doesNotExist());
    }

    @Test
    void loginMergesGuestCartIntoMemberCart() throws Exception {
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
                marketing_opt_in,
                created_at
            )
            VALUES (100, 'Kim Minsu', 'minsu@example.com', ?, 'LOCAL', 'CUSTOMER', 'ACTIVE', FALSE, ?)
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
            .andExpect(header().doesNotExist("X-Session-Token"))
            .andExpect(cookie().exists("vibe_shop_session"))
            .andExpect(jsonPath("$.authenticated").value(true))
            .andExpect(jsonPath("$.sessionToken").doesNotExist())
            .andReturn();

        Cookie authCookie = loginResult.getResponse().getCookie("vibe_shop_session");
        assertThat(authCookie).isNotNull();
        assertThat(authCookie.getSecure()).isFalse();

        mockMvc.perform(get("/api/v1/cart").cookie(authCookie))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.itemCount").value(2))
            .andExpect(jsonPath("$.items[0].productId").value(10));
    }

    @Test
    void socialExchangeCreatesAuthenticatedSessionCookie() throws Exception {
        mockMvc.perform(post("/api/v1/auth/social/exchange")
                .contentType("application/json")
                .content("""
                    {
                      "provider": "GOOGLE",
                      "accessToken": "fake-token-for-test"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(header().doesNotExist("X-Session-Token"))
            .andExpect(cookie().exists("vibe_shop_session"))
            .andExpect(jsonPath("$.authenticated").value(true))
            .andExpect(jsonPath("$.sessionToken").doesNotExist())
            .andExpect(jsonPath("$.user.email").value("social@example.com"))
            .andExpect(jsonPath("$.user.provider").value("GOOGLE"));
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
            .andExpect(jsonPath("$.authenticated").value(false))
            .andExpect(jsonPath("$.sessionToken").doesNotExist());

        mockMvc.perform(get("/api/v1/auth/session").cookie(authCookie))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.authenticated").value(false));
    }

    @Test
    void blockedUserCannotLoginAndExistingSessionExpires() throws Exception {
        MvcResult signUpResult = mockMvc.perform(post("/api/v1/auth/signup")
                .contentType("application/json")
                .content("""
                    {
                      "name": "Blocked User",
                      "email": "blocked@example.com",
                      "password": "password123"
                    }
                    """))
            .andExpect(status().isOk())
            .andReturn();

        Cookie authCookie = signUpResult.getResponse().getCookie("vibe_shop_session");

        jdbcClient.sql("""
            UPDATE users
            SET status = 'BLOCKED'
            WHERE email = 'blocked@example.com'
            """).update();

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType("application/json")
                .content("""
                    {
                      "email": "blocked@example.com",
                      "password": "password123"
                    }
                    """))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").value("차단된 계정입니다. 관리자에게 문의해 주세요."));

        mockMvc.perform(get("/api/v1/auth/session").cookie(authCookie))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.authenticated").value(false));
    }

    @TestConfiguration
    static class SocialVerifierTestConfig {
        @Bean
        @Primary
        SocialIdentityVerifier socialIdentityVerifier() {
            return (provider, accessToken) -> {
                if (provider != AuthProviderType.GOOGLE || !"fake-token-for-test".equals(accessToken)) {
                    throw new IllegalArgumentException("소셜 계정을 확인할 수 없습니다.");
                }
                return new SocialIdentity(
                    AuthProviderType.GOOGLE,
                    "google-user-1",
                    "social@example.com",
                    "Social Shopper",
                    true
                );
            };
        }
    }
}
