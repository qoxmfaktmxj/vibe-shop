package com.vibeshop.api.config;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.sql.PreparedStatement;
import java.sql.Types;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
@Profile({ "local", "dev" })
public class DemoDataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);
    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final String DEMO_PASSWORD = "Password123!";

    private final DemoSeedProperties properties;
    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;

    public DemoDataSeeder(
        DemoSeedProperties properties,
        JdbcTemplate jdbcTemplate,
        PasswordEncoder passwordEncoder
    ) {
        this.properties = properties;
        this.jdbcTemplate = jdbcTemplate;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!properties.enabled()) {
            return;
        }

        seedAdminUser();
        seedCustomers();
        seedProducts();
        seedReviews();
    }

    private void seedAdminUser() {
        Integer adminCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM users WHERE LOWER(email) = LOWER(?)",
            Integer.class,
            properties.adminEmail()
        );
        if (adminCount != null && adminCount > 0) {
            return;
        }

        String adminPassword = properties.adminPassword().isBlank()
            ? generateAdminPassword()
            : properties.adminPassword();
        OffsetDateTime now = OffsetDateTime.now(SEOUL);
        jdbcTemplate.update(
            """
                INSERT INTO users (
                    name,
                    email,
                    password_hash,
                    provider,
                    role,
                    status,
                    phone,
                    marketing_opt_in,
                    last_login_at,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
            properties.adminName(),
            properties.adminEmail(),
            passwordEncoder.encode(adminPassword),
            "LOCAL",
            "OWNER",
            "ACTIVE",
            "01099990000",
            false,
            now,
            now
        );

        log.warn(
            "Seeded local demo admin account email={} password={}. Set APP_DEMO_ADMIN_PASSWORD to override.",
            properties.adminEmail(),
            adminPassword
        );
    }

    private String generateAdminPassword() {
        byte[] randomBytes = new byte[18];
        SECURE_RANDOM.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    private void seedCustomers() {
        Integer currentCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM users WHERE role = 'CUSTOMER'",
            Integer.class
        );
        int existing = currentCount == null ? 0 : currentCount;
        if (existing >= properties.targetCustomerCount()) {
            return;
        }

        int needed = properties.targetCustomerCount() - existing;
        String passwordHash = passwordEncoder.encode(DEMO_PASSWORD);
        OffsetDateTime now = OffsetDateTime.now(SEOUL);
        List<Object[]> batch = new ArrayList<>(needed);

        for (int i = 1; i <= needed; i++) {
            int ordinal = existing + i;
            String name = "데모고객 " + ordinal;
            String email = "demo-user-" + ordinal + "@vibeshop.local";
            String provider = switch (ordinal % 4) {
                case 0 -> "GOOGLE";
                case 1 -> "LOCAL";
                case 2 -> "KAKAO";
                default -> "LOCAL";
            };
            String status = ordinal % 37 == 0 ? "DORMANT" : "ACTIVE";
            String phone = String.format(Locale.ROOT, "010%08d", ordinal % 100_000_000);
            boolean marketingOptIn = ordinal % 3 == 0;
            OffsetDateTime createdAt = now.minusDays((long) (ordinal % 365)).minusHours(ordinal % 24);
            OffsetDateTime lastLoginAt = status.equals("ACTIVE") ? createdAt.plusDays(ordinal % 30L) : null;
            batch.add(new Object[] {
                name,
                email,
                passwordHash,
                provider,
                "CUSTOMER",
                status,
                phone,
                marketingOptIn,
                lastLoginAt,
                createdAt
            });
        }

        jdbcTemplate.batchUpdate(
            """
                INSERT INTO users (
                    name,
                    email,
                    password_hash,
                    provider,
                    role,
                    status,
                    phone,
                    marketing_opt_in,
                    last_login_at,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
            batch
        );
    }

    private void seedProducts() {
        Map<String, Long> categoryIds = new LinkedHashMap<>();
        jdbcTemplate.query(
            "SELECT slug, id FROM categories ORDER BY id",
            (rs, rowNum) -> Map.entry(rs.getString("slug"), rs.getLong("id"))
        ).forEach(entry -> categoryIds.put(entry.getKey(), entry.getValue()));

        seedProductsForCategory(categoryIds.get("living"), "living", "리빙", "living-room", livingProductTypes());
        seedProductsForCategory(categoryIds.get("kitchen"), "kitchen", "키친", "kitchen", kitchenProductTypes());
        seedProductsForCategory(categoryIds.get("wellness"), "wellness", "웰니스", "spa", wellnessProductTypes());
    }

    private void seedProductsForCategory(
        Long categoryId,
        String categorySlug,
        String categoryLabel,
        String imageKeyword,
        List<String> productTypes
    ) {
        if (categoryId == null) {
            return;
        }

        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM products WHERE category_id = ?",
            Integer.class,
            categoryId
        );
        int existing = count == null ? 0 : count;
        if (existing >= properties.targetProductsPerCategory()) {
            return;
        }

        int needed = properties.targetProductsPerCategory() - existing;
        List<String> prefixes = List.of(
            "시그니처", "에센셜", "모던", "소프트", "데일리", "프리미엄", "밸런스", "클래식", "노르딕", "컴포트"
        );
        List<String> accents = List.of(
            "블랙", "화이트", "베이지", "세이지", "네이비", "스톤", "우드", "크림", "차콜", "올리브"
        );
        OffsetDateTime now = OffsetDateTime.now(SEOUL);
        List<Object[]> batch = new ArrayList<>(needed);

        for (int i = 1; i <= needed; i++) {
            int ordinal = existing + i;
            String productType = productTypes.get((ordinal - 1) % productTypes.size());
            String prefix = prefixes.get((ordinal - 1) % prefixes.size());
            String accent = accents.get((ordinal - 1) % accents.size());
            String name = prefix + " " + accent + " " + productType;
            String slug = categorySlug + "-demo-" + String.format(Locale.ROOT, "%03d", ordinal);
            String summary = categoryLabel + " 카테고리 테스트용 확장 상품 " + ordinal;
            String description = name + " 상품입니다. 검색, 추천, 리뷰, 관리자 테스트를 위해 준비한 대량 예시 데이터입니다.";
            BigDecimal price = BigDecimal.valueOf(basePrice(categorySlug) + ((ordinal % 20) * 7000L));
            String badge = ordinal % 9 == 0 ? "TREND" : ordinal % 5 == 0 ? "NEW" : "DEMO";
            String accentColor = switch (ordinal % 6) {
                case 0 -> "#1f2937";
                case 1 -> "#475569";
                case 2 -> "#8b5e3c";
                case 3 -> "#6b7280";
                case 4 -> "#5b6c5d";
                default -> "#9a8c98";
            };
            boolean featured = ordinal % 11 == 0;
            int stock = 3 + (ordinal % 55);
            int popularityScore = 120 + ((properties.targetProductsPerCategory() - ordinal) * 3) + (featured ? 90 : 0);
            String imageUrl = "https://loremflickr.com/1200/1600/" + imageKeyword + "?lock="
                + imageLockBase(categorySlug) + ordinal;
            String imageAlt = name + " 대표 이미지";
            String color = normalizeColor(accent);
            String seasonTag = switch (ordinal % 4) {
                case 0 -> "summer";
                case 1 -> "all_season";
                case 2 -> "winter";
                default -> "daily";
            };
            String useCaseTag = switch (categorySlug) {
                case "living" -> ordinal % 3 == 0 ? "gift,daily,home" : "daily,home";
                case "kitchen" -> ordinal % 3 == 0 ? "gift,dining,daily" : "daily,cooking";
                default -> ordinal % 3 == 0 ? "gift,relax,wellness" : "daily,wellness";
            };
            String genderTag = "unisex";
            String materialTag = switch (categorySlug) {
                case "living" -> ordinal % 2 == 0 ? "linen" : "wood";
                case "kitchen" -> ordinal % 2 == 0 ? "ceramic" : "stainless";
                default -> ordinal % 2 == 0 ? "cotton" : "natural";
            };
            String searchKeywords = String.join(", ", name, summary, description, badge, productType, categoryLabel, useCaseTag);
            OffsetDateTime createdAt = now.minusDays((long) (ordinal % 180)).minusHours(ordinal % 24);

            batch.add(new Object[] {
                categoryId,
                slug,
                name,
                summary,
                description,
                price,
                badge,
                accentColor,
                featured,
                stock,
                imageUrl,
                imageAlt,
                popularityScore,
                createdAt,
                color,
                seasonTag,
                useCaseTag,
                genderTag,
                materialTag,
                searchKeywords
            });
        }

        jdbcTemplate.batchUpdate(
            """
                INSERT INTO products (
                    category_id,
                    slug,
                    name,
                    summary,
                    description,
                    price,
                    badge,
                    accent_color,
                    featured,
                    stock,
                    image_url,
                    image_alt,
                    popularity_score,
                    created_at,
                    color,
                    season_tag,
                    use_case_tag,
                    gender_tag,
                    material_tag,
                    search_keywords
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
            batch
        );
    }

    private void seedReviews() {
        Integer existingDemoReviews = jdbcTemplate.queryForObject(
            """
                SELECT COUNT(*)
                FROM product_reviews review
                JOIN users user_account ON user_account.id = review.user_id
                WHERE user_account.email LIKE 'demo-user-%@vibeshop.local'
                """,
            Integer.class
        );
        if (existingDemoReviews != null && existingDemoReviews > 0) {
            return;
        }

        List<Long> demoUserIds = jdbcTemplate.query(
            "SELECT id FROM users WHERE email LIKE 'demo-user-%@vibeshop.local' ORDER BY id",
            (rs, rowNum) -> rs.getLong("id")
        );
        if (demoUserIds.isEmpty()) {
            return;
        }

        List<DemoProduct> products = jdbcTemplate.query(
            """
                SELECT product.id, product.slug, product.name, category.slug AS category_slug
                FROM products product
                JOIN categories category ON category.id = product.category_id
                ORDER BY product.id
                """,
            (rs, rowNum) -> new DemoProduct(
                rs.getLong("id"),
                rs.getString("slug"),
                rs.getString("name"),
                rs.getString("category_slug")
            )
        );
        if (products.isEmpty()) {
            return;
        }

        OffsetDateTime now = OffsetDateTime.now(SEOUL);
        for (int productIndex = 0; productIndex < products.size(); productIndex++) {
            DemoProduct product = products.get(productIndex);
            int reviewCount = targetReviewsForProduct(productIndex);
            LinkedHashSet<Long> usedUserIds = new LinkedHashSet<>();

            for (int reviewIndex = 0; reviewIndex < reviewCount; reviewIndex++) {
                Long reviewerId = pickDistinctUserId(demoUserIds, usedUserIds, productIndex, reviewIndex);
                boolean buyerReview = (productIndex + reviewIndex) % 7 != 0;
                int rating = ratingFor(productIndex, reviewIndex);
                boolean repurchase = buyerReview && rating >= 4 && (productIndex + reviewIndex) % 5 == 0;
                Integer deliverySatisfaction = (productIndex + reviewIndex) % 6 == 0 ? null : 3 + ((productIndex + reviewIndex) % 3);
                Integer packagingSatisfaction = (productIndex + reviewIndex * 2) % 7 == 0 ? null : 3 + ((productIndex + reviewIndex * 2) % 3);
                String fitTag = fitTagFor(product.categorySlug(), rating, reviewIndex);
                String title = reviewTitleFor(product.categorySlug(), rating, reviewIndex);
                String content = reviewContentFor(product.name(), product.categorySlug(), rating, buyerReview, reviewIndex);
                String status = (productIndex + reviewIndex) % 23 == 0 ? "HIDDEN" : "PUBLISHED";
                OffsetDateTime createdAt = now
                    .minusDays((productIndex * 5L + reviewIndex * 3L) % 240)
                    .minusHours((productIndex + reviewIndex) % 24)
                    .minusMinutes((productIndex * 11L + reviewIndex) % 60);
                OffsetDateTime updatedAt = createdAt.plusHours((productIndex + reviewIndex) % 6L);

                long reviewId = insertReview(
                    product.id(),
                    reviewerId,
                    rating,
                    title,
                    content,
                    fitTag,
                    repurchase,
                    deliverySatisfaction,
                    packagingSatisfaction,
                    0,
                    buyerReview,
                    status,
                    createdAt,
                    updatedAt
                );

                List<String> imageUrls = reviewImageUrlsFor(product, productIndex, reviewIndex);
                insertReviewImages(reviewId, imageUrls, createdAt.plusMinutes(1));

                int helpfulCount = insertHelpfulVotes(
                    reviewId,
                    reviewerId,
                    demoUserIds,
                    productIndex,
                    reviewIndex,
                    rating,
                    imageUrls.size(),
                    status.equals("PUBLISHED"),
                    createdAt.plusDays(1)
                );
                jdbcTemplate.update("UPDATE product_reviews SET helpful_count = ? WHERE id = ?", helpfulCount, reviewId);
            }
        }
    }

    private long insertReview(
        Long productId,
        Long userId,
        int rating,
        String title,
        String content,
        String fitTag,
        boolean repurchaseYn,
        Integer deliverySatisfaction,
        Integer packagingSatisfaction,
        int helpfulCount,
        boolean buyerReview,
        String status,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
    ) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement statement = connection.prepareStatement(
                """
                    INSERT INTO product_reviews (
                        product_id,
                        user_id,
                        rating,
                        title,
                        content,
                        fit_tag,
                        repurchase_yn,
                        delivery_satisfaction,
                        packaging_satisfaction,
                        helpful_count,
                        is_buyer_review,
                        status,
                        created_at,
                        updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                new String[] { "id" }
            );
            statement.setLong(1, productId);
            statement.setLong(2, userId);
            statement.setInt(3, rating);
            statement.setString(4, title);
            statement.setString(5, content);
            statement.setString(6, fitTag);
            statement.setBoolean(7, repurchaseYn);
            if (deliverySatisfaction == null) {
                statement.setNull(8, Types.INTEGER);
            } else {
                statement.setInt(8, deliverySatisfaction);
            }
            if (packagingSatisfaction == null) {
                statement.setNull(9, Types.INTEGER);
            } else {
                statement.setInt(9, packagingSatisfaction);
            }
            statement.setInt(10, helpfulCount);
            statement.setBoolean(11, buyerReview);
            statement.setString(12, status);
            statement.setObject(13, createdAt);
            statement.setObject(14, updatedAt);
            return statement;
        }, keyHolder);

        Number key = keyHolder.getKey();
        if (key == null) {
            throw new IllegalStateException("데모 리뷰 생성 키를 가져오지 못했습니다.");
        }
        return key.longValue();
    }

    private void insertReviewImages(Long reviewId, List<String> imageUrls, OffsetDateTime createdAt) {
        for (int index = 0; index < imageUrls.size(); index++) {
            jdbcTemplate.update(
                """
                    INSERT INTO review_images (review_id, image_url, display_order, created_at)
                    VALUES (?, ?, ?, ?)
                    """,
                reviewId,
                imageUrls.get(index),
                index,
                createdAt.plusMinutes(index)
            );
        }
    }

    private int insertHelpfulVotes(
        Long reviewId,
        Long reviewerId,
        List<Long> demoUserIds,
        int productIndex,
        int reviewIndex,
        int rating,
        int imageCount,
        boolean published,
        OffsetDateTime createdAt
    ) {
        if (!published) {
            return 0;
        }

        int targetVotes = Math.min(
            8,
            Math.max(0, (rating - 2) + imageCount + ((productIndex + reviewIndex) % 3))
        );
        int inserted = 0;
        LinkedHashSet<Long> voterIds = new LinkedHashSet<>();

        for (int offset = 0; offset < demoUserIds.size() && inserted < targetVotes; offset++) {
            Long voterId = demoUserIds.get((productIndex * 29 + reviewIndex * 13 + offset) % demoUserIds.size());
            if (voterId.equals(reviewerId) || !voterIds.add(voterId)) {
                continue;
            }
            jdbcTemplate.update(
                """
                    INSERT INTO review_helpful_votes (review_id, user_id, created_at)
                    VALUES (?, ?, ?)
                    """,
                reviewId,
                voterId,
                createdAt.plusHours(inserted)
            );
            inserted += 1;
        }

        return inserted;
    }

    private Long pickDistinctUserId(List<Long> demoUserIds, LinkedHashSet<Long> usedUserIds, int productIndex, int reviewIndex) {
        for (int offset = 0; offset < demoUserIds.size(); offset++) {
            Long candidate = demoUserIds.get((productIndex * 31 + reviewIndex * 17 + offset) % demoUserIds.size());
            if (usedUserIds.add(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("데모 리뷰 작성자를 선택할 수 없습니다.");
    }

    private int targetReviewsForProduct(int productIndex) {
        if (productIndex < 30) {
            return 14;
        }
        if (productIndex < 90) {
            return 8;
        }
        if (productIndex < 180) {
            return 4;
        }
        return 2;
    }

    private int ratingFor(int productIndex, int reviewIndex) {
        int value = (productIndex * 3 + reviewIndex * 5) % 10;
        if (value <= 3) {
            return 5;
        }
        if (value <= 6) {
            return 4;
        }
        if (value == 7) {
            return 3;
        }
        if (value == 8) {
            return 2;
        }
        return 1;
    }

    private String fitTagFor(String categorySlug, int rating, int reviewIndex) {
        List<String> tags = switch (categorySlug) {
            case "living" -> List.of("공간포인트", "톤다운", "포근함", "기본형");
            case "kitchen" -> List.of("손에잘맞음", "식탁포인트", "실사용형", "선물무드");
            default -> List.of("데일리케어", "가벼움", "은은한향", "휴식루틴");
        };
        return rating <= 2 ? tags.getLast() : tags.get(reviewIndex % tags.size());
    }

    private String reviewTitleFor(String categorySlug, int rating, int reviewIndex) {
        List<String> positive = switch (categorySlug) {
            case "living" -> List.of("공간 톤이 차분해져요", "방 분위기가 정리돼 보여요", "재구매 의사 있어요", "사진보다 실물이 더 좋아요");
            case "kitchen" -> List.of("매일 손이 가는 구성", "주방 무드가 깔끔해졌어요", "선물용으로도 괜찮아요", "식탁 분위기가 살아나요");
            default -> List.of("루틴에 자연스럽게 녹아요", "향과 사용감이 안정적이에요", "하루 마무리가 편안해져요", "가볍게 쓰기 좋아요");
        };
        List<String> critical = List.of("무난하지만 기대보단 아쉬워요", "취향은 조금 갈릴 수 있어요", "재구매는 고민돼요");
        return rating >= 4 ? positive.get(reviewIndex % positive.size()) : critical.get(reviewIndex % critical.size());
    }

    private String reviewContentFor(String productName, String categorySlug, int rating, boolean buyerReview, int reviewIndex) {
        String mood = switch (categorySlug) {
            case "living" -> "거실과 침실 톤을 정리하는 데 도움이 됐고";
            case "kitchen" -> "조리와 플레이팅 동선에서 부담이 적었고";
            default -> "샤워 후나 저녁 루틴에 자연스럽게 들어왔고";
        };
        String buyerText = buyerReview ? "실구매 후 며칠 사용해 보니" : "매장/지인 경험 기준으로는";
        String ratingText = switch (rating) {
            case 5 -> "전체적으로 만족도가 높았습니다.";
            case 4 -> "장점이 분명해서 추천할 만합니다.";
            case 3 -> "장단점이 모두 느껴지는 편입니다.";
            case 2 -> "기대했던 포인트는 조금 덜했습니다.";
            default -> "취향과는 맞지 않아 아쉬움이 컸습니다.";
        };
        return buyerText + " " + productName + "은 " + mood + " " + ratingText
            + " 마감, 색감, 사용감 기준으로 비교하기 좋았고, 리뷰 필터·통계·포토 영역 테스트용으로도 충분한 밀도를 갖도록 문장을 길게 구성했습니다."
            + " 상세 사용 후기는 시퀀스 " + (reviewIndex + 1) + " 기준으로 고정 생성됩니다.";
    }

    private List<String> reviewImageUrlsFor(DemoProduct product, int productIndex, int reviewIndex) {
        if ((productIndex + reviewIndex) % 3 != 0) {
            return List.of();
        }

        String keyword = switch (product.categorySlug()) {
            case "living" -> "living-room";
            case "kitchen" -> "kitchen";
            default -> "spa";
        };
        int lockBase = 9000 + (productIndex * 7) + (reviewIndex * 3);
        if ((productIndex + reviewIndex) % 5 == 0) {
            return List.of(
                "https://loremflickr.com/1200/1200/" + keyword + "?lock=" + lockBase,
                "https://loremflickr.com/1200/1200/" + keyword + "?lock=" + (lockBase + 1)
            );
        }
        return List.of("https://loremflickr.com/1200/1200/" + keyword + "?lock=" + lockBase);
    }

    private long basePrice(String categorySlug) {
        return switch (categorySlug) {
            case "living" -> 39000L;
            case "kitchen" -> 18000L;
            default -> 22000L;
        };
    }

    private int imageLockBase(String categorySlug) {
        return switch (categorySlug) {
            case "living" -> 5000;
            case "kitchen" -> 6000;
            default -> 7000;
        };
    }

    private String normalizeColor(String accent) {
        return switch (accent) {
            case "블랙", "차콜" -> "black";
            case "화이트", "크림" -> "white";
            case "베이지", "스톤" -> "beige";
            case "세이지", "올리브" -> "green";
            case "네이비" -> "navy";
            default -> "brown";
        };
    }

    private List<String> livingProductTypes() {
        return List.of(
            "소파 스로우", "플로어 램프", "사이드 테이블", "러그", "쿠션", "거울", "월 클락", "오브제 트레이", "북쉘프", "수납 벤치"
        );
    }

    private List<String> kitchenProductTypes() {
        return List.of(
            "머그 세트", "플레이트", "커팅 보드", "에이프런", "볼 세트", "트레이", "케틀", "오일 디스펜서", "수프 레이들", "커트러리 세트"
        );
    }

    private List<String> wellnessProductTypes() {
        return List.of(
            "바디워시", "향초", "배스 솔트", "요가 매트", "핸드크림", "아로마 오일", "필로우 미스트", "로브", "폼 롤러", "디퓨저"
        );
    }

    private record DemoProduct(Long id, String slug, String name, String categorySlug) {
    }
}
