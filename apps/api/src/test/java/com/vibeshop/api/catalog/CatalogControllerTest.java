package com.vibeshop.api.catalog;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class CatalogControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcClient jdbcClient;

    @BeforeEach
    void setUp() {
        jdbcClient.sql("DELETE FROM wishlist_items").update();
        jdbcClient.sql("DELETE FROM product_reviews").update();
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
            ) VALUES
              (1, 'living', 'Living', 'Living edit', '#ff8d6b', 10, TRUE, '/images/products/living-01.jpg', 'Living cover', 'Living hero', 'Living subtitle'),
              (2, 'kitchen', 'Kitchen', 'Kitchen edit', '#ffbf5f', 20, TRUE, '/images/products/kitchen-01.jpg', 'Kitchen cover', 'Kitchen hero', 'Kitchen subtitle'),
              (3, 'wellness', 'Wellness', 'Wellness edit', '#68b78e', 30, TRUE, '/images/products/wellness-01.jpg', 'Wellness cover', 'Wellness hero', 'Wellness subtitle')
            """).update();

        insertProduct(
            10L,
            1L,
            "linen-bed-set",
            "Linen Bed Set",
            "Living best seller",
            89000,
            true,
            980,
            OffsetDateTime.of(2026, 2, 1, 9, 0, 0, 0, ZoneOffset.ofHours(9))
        );
        insertProduct(
            11L,
            1L,
            "arch-wall-mirror",
            "Arch Wall Mirror",
            "Living new arrival",
            149000,
            false,
            620,
            OffsetDateTime.of(2026, 3, 10, 9, 0, 0, 0, ZoneOffset.ofHours(9))
        );
        insertProduct(
            12L,
            2L,
            "stone-plate-set",
            "Stone Plate Set",
            "Kitchen best seller",
            42000,
            true,
            970,
            OffsetDateTime.of(2026, 3, 12, 9, 0, 0, 0, ZoneOffset.ofHours(9))
        );
        insertProduct(
            13L,
            3L,
            "balance-yoga-mat",
            "Balance Yoga Mat",
            "Wellness popular item",
            68000,
            false,
            860,
            OffsetDateTime.of(2026, 3, 13, 9, 0, 0, 0, ZoneOffset.ofHours(9))
        );
    }

    @Test
    void homeIncludesDisplaySectionsAndCategoryMetadata() throws Exception {
        mockMvc.perform(get("/api/v1/home"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.heroCtaLabel").isNotEmpty())
            .andExpect(jsonPath("$.displaySections.length()").value(6))
            .andExpect(jsonPath("$.displaySections[0].code").value("HERO"))
            .andExpect(jsonPath("$.featuredCategories.length()").value(3))
            .andExpect(jsonPath("$.featuredCategories[0].slug").value("living"))
            .andExpect(jsonPath("$.featuredCategories[0].coverImageUrl").value("/images/products/living-01.jpg"))
            .andExpect(jsonPath("$.curatedPicks.length()").value(2))
            .andExpect(jsonPath("$.newArrivals[0].slug").value("balance-yoga-mat"))
            .andExpect(jsonPath("$.bestSellers[0].slug").value("linen-bed-set"));
    }

    @Test
    void productsSupportNewestAndPopularSorts() throws Exception {
        mockMvc.perform(get("/api/v1/products").param("sort", "newest"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].slug").value("balance-yoga-mat"))
            .andExpect(jsonPath("$[1].slug").value("stone-plate-set"));

        mockMvc.perform(get("/api/v1/products").param("sort", "popular"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].slug").value("linen-bed-set"))
            .andExpect(jsonPath("$[1].slug").value("stone-plate-set"));
    }

    @Test
    void searchCanFilterByCategoryAndKeyword() throws Exception {
        mockMvc.perform(get("/api/v1/products")
                .param("category", "living")
                .param("q", "living")
                .param("sort", "newest"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].slug").value("arch-wall-mirror"));
    }

    private void insertProduct(
        Long id,
        Long categoryId,
        String slug,
        String name,
        String summary,
        int price,
        boolean featured,
        int popularityScore,
        OffsetDateTime createdAt
    ) {
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
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """)
            .params(
                id,
                categoryId,
                slug,
                name,
                summary,
                name + " detail",
                price,
                featured ? "FEATURED" : "STANDARD",
                "#29339b",
                "/images/products/test.jpg",
                name + " image",
                featured,
                20,
                popularityScore,
                createdAt
            )
            .update();
    }
}
