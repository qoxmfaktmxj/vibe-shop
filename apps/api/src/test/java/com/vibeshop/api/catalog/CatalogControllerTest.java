package com.vibeshop.api.catalog;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.servlet.http.Cookie;

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
        jdbcClient.sql("DELETE FROM review_helpful_votes").update();
        jdbcClient.sql("DELETE FROM review_images").update();
        jdbcClient.sql("DELETE FROM product_reviews").update();
        jdbcClient.sql("DELETE FROM product_view_events").update();
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

    @Test
    void recentlyViewedAndRecommendationEndpointsUseDeterministicRules() throws Exception {
        Cookie visitorCookie = mockMvc.perform(post("/api/v1/recently-viewed/items/{productId}", 10L)
                .param("source", "PRODUCT_DETAIL"))
            .andExpect(status().isOk())
            .andExpect(cookie().exists("vibe_shop_visitor"))
            .andExpect(jsonPath("$.productId").value(10))
            .andReturn()
            .getResponse()
            .getCookie("vibe_shop_visitor");

        mockMvc.perform(get("/api/v1/recently-viewed").cookie(visitorCookie))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items.length()").value(1))
            .andExpect(jsonPath("$.items[0].slug").value("linen-bed-set"));

        mockMvc.perform(get("/api/v1/recommendations/home").cookie(visitorCookie))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.context").value("home"))
            .andExpect(jsonPath("$.items[0].slug").value("arch-wall-mirror"))
            .andExpect(jsonPath("$.items[0].reasonCode").value("RECENT_CATEGORY"));

        mockMvc.perform(get("/api/v1/recommendations/products/{productId}", 10L).cookie(visitorCookie))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.context").value("product"))
            .andExpect(jsonPath("$.items[0].slug").value("arch-wall-mirror"))
            .andExpect(jsonPath("$.items[0].reasonCode").value("SAME_CATEGORY"));

        mockMvc.perform(get("/api/v1/recommendations/recently-viewed").cookie(visitorCookie))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.context").value("recently-viewed"))
            .andExpect(jsonPath("$.items[0].slug").value("arch-wall-mirror"));
    }

    @Test
    void cartRecommendationsUseCurrentCartContext() throws Exception {
        Cookie cartCookie = mockMvc.perform(put("/api/v1/cart/items/{productId}", 10L)
                .contentType("application/json")
                .content("""
                    {
                      "quantity": 1
                    }
                    """))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getCookie("vibe_shop_cart");

        mockMvc.perform(get("/api/v1/recommendations/cart").cookie(cartCookie))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.context").value("cart"))
            .andExpect(jsonPath("$.items[0].slug").value("arch-wall-mirror"))
            .andExpect(jsonPath("$.items[0].reasonCode").exists());
    }

    @Test
    void naturalLanguageSearchReturnsParsedFiltersAndFallback() throws Exception {
        mockMvc.perform(get("/api/v1/search/products")
                .param("q", "여름 리빙 베이지 10만원 이하"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.parsedQuery.color").value("beige"))
            .andExpect(jsonPath("$.parsedQuery.season").value("summer"))
            .andExpect(jsonPath("$.parsedQuery.category").value("living"))
            .andExpect(jsonPath("$.parsedQuery.maxPrice").value(100000))
            .andExpect(jsonPath("$.items.length()").value(1))
            .andExpect(jsonPath("$.items[0].slug").value("linen-bed-set"));

        mockMvc.perform(get("/api/v1/search/products")
                .param("q", "여름 리빙 베이지 5만원 이하"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.fallback.applied").value(true))
            .andExpect(jsonPath("$.items[0].slug").value("linen-bed-set"));
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
                color,
                season_tag,
                use_case_tag,
                gender_tag,
                material_tag,
                search_keywords,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                colorFor(slug),
                seasonFor(slug),
                useCaseFor(slug),
                genderFor(slug),
                materialFor(slug),
                searchKeywordsFor(slug, name, summary),
                createdAt
            )
            .update();
    }

    private String colorFor(String slug) {
        if (slug.contains("linen")) {
            return "beige";
        }
        if (slug.contains("mirror")) {
            return "black";
        }
        if (slug.contains("plate")) {
            return "white";
        }
        return "green";
    }

    private String seasonFor(String slug) {
        if (slug.contains("linen")) {
            return "summer";
        }
        return "all_season";
    }

    private String useCaseFor(String slug) {
        if (slug.contains("plate")) {
            return "gift,dining";
        }
        if (slug.contains("yoga")) {
            return "wellness,relax";
        }
        return "daily,home";
    }

    private String genderFor(String slug) {
        return "unisex";
    }

    private String materialFor(String slug) {
        if (slug.contains("linen")) {
            return "linen";
        }
        if (slug.contains("plate")) {
            return "ceramic";
        }
        return "cotton";
    }

    private String searchKeywordsFor(String slug, String name, String summary) {
        return String.join(", ", name, summary, slug, colorFor(slug), seasonFor(slug), useCaseFor(slug));
    }
}
