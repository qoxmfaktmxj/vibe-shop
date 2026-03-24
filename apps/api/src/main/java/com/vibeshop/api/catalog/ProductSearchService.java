package com.vibeshop.api.catalog;

import static com.vibeshop.api.catalog.SearchDtos.AppliedFilterResponse;
import static com.vibeshop.api.catalog.SearchDtos.ParsedSearchQueryResponse;
import static com.vibeshop.api.catalog.SearchDtos.ProductSearchResponse;
import static com.vibeshop.api.catalog.SearchDtos.SearchFallbackResponse;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vibeshop.api.wishlist.WishlistService;

@Service
@Transactional(readOnly = true)
public class ProductSearchService {

    private static final Comparator<Product> RECOMMENDED_ORDER = Comparator
        .comparing(Product::isFeatured)
        .reversed()
        .thenComparing(Product::getPopularityScore, Comparator.reverseOrder())
        .thenComparing(Product::getCreatedAt, Comparator.reverseOrder())
        .thenComparing(Product::getId);

    private static final Comparator<Product> NEWEST_ORDER = Comparator
        .comparing(Product::getCreatedAt, Comparator.reverseOrder())
        .thenComparing(Product::getId, Comparator.reverseOrder());

    private static final Comparator<Product> POPULAR_ORDER = Comparator
        .comparing(Product::getPopularityScore, Comparator.reverseOrder())
        .thenComparing(Product::isFeatured, Comparator.reverseOrder())
        .thenComparing(Product::getCreatedAt, Comparator.reverseOrder())
        .thenComparing(Product::getId);

    private static final Comparator<Product> PRICE_ASC_ORDER = Comparator
        .comparing(Product::getPrice)
        .thenComparing(Product::getId);

    private static final Comparator<Product> PRICE_DESC_ORDER = Comparator
        .comparing(Product::getPrice, Comparator.reverseOrder())
        .thenComparing(Product::getId);

    private static final Pattern PRICE_MAX_MAN_WON = Pattern.compile("(\\d+)\\s*만\\s*원?\\s*(이하|미만|under)");
    private static final Pattern PRICE_MIN_MAN_WON = Pattern.compile("(\\d+)\\s*만\\s*원?\\s*(이상|over)");
    private static final Pattern PRICE_RANGE_MAN_WON = Pattern.compile("(\\d+)\\s*만\\s*원?대");
    private static final Pattern PRICE_MAX_WON = Pattern.compile("(\\d{4,})\\s*원\\s*(이하|미만|under)");
    private static final Pattern PRICE_MIN_WON = Pattern.compile("(\\d{4,})\\s*원\\s*(이상|over)");

    private static final Map<String, List<String>> COLOR_ALIASES = Map.of(
        "black", List.of("black", "블랙", "검정", "검은"),
        "white", List.of("white", "화이트", "아이보리", "cream", "크림"),
        "beige", List.of("beige", "베이지", "linen", "린넨"),
        "green", List.of("green", "그린", "sage", "세이지"),
        "brown", List.of("brown", "브라운", "wood", "우드")
    );

    private static final Map<String, List<String>> SEASON_ALIASES = Map.of(
        "spring", List.of("spring", "봄"),
        "summer", List.of("summer", "여름"),
        "fall", List.of("fall", "autumn", "가을"),
        "winter", List.of("winter", "겨울"),
        "all_season", List.of("all season", "all-season", "사계절")
    );

    private static final Map<String, List<String>> USE_CASE_ALIASES = Map.of(
        "gift", List.of("gift", "선물", "집들이"),
        "dining", List.of("dining", "식탁", "주방", "키친", "테이블"),
        "relax", List.of("relax", "휴식", "릴랙스", "아로마"),
        "wellness", List.of("wellness", "웰니스", "요가"),
        "home", List.of("home", "living", "홈", "리빙", "거실"),
        "daily", List.of("daily", "데일리", "매일")
    );

    private static final Map<String, List<String>> GENDER_ALIASES = Map.of(
        "female", List.of("female", "women", "여성"),
        "male", List.of("male", "men", "남성"),
        "unisex", List.of("unisex", "공용", "남녀공용")
    );

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final WishlistService wishlistService;
    private final JdbcClient jdbcClient;

    public ProductSearchService(
        CategoryRepository categoryRepository,
        ProductRepository productRepository,
        WishlistService wishlistService,
        JdbcClient jdbcClient
    ) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.wishlistService = wishlistService;
        this.jdbcClient = jdbcClient;
    }

    public ProductSearchResponse search(String rawQuery, String explicitCategory, String sort, Long userId) {
        SearchCriteria parsedCriteria = parse(rawQuery, explicitCategory);
        SearchExecution primaryExecution = execute(parsedCriteria, sort, userId);
        if (!primaryExecution.items().isEmpty() || !parsedCriteria.hasSearchSignals()) {
            return new ProductSearchResponse(
                primaryExecution.items(),
                toParsedQuery(parsedCriteria),
                buildAppliedFilters(parsedCriteria),
                null
            );
        }

        SearchExecution relaxedExecution = execute(parsedCriteria.relaxOptionalSignals(), sort, userId);
        if (!relaxedExecution.items().isEmpty()) {
            return new ProductSearchResponse(
                relaxedExecution.items(),
                toParsedQuery(parsedCriteria),
                buildAppliedFilters(parsedCriteria.relaxOptionalSignals()),
                new SearchFallbackResponse(
                    true,
                    "세부 조건이 너무 촘촘해서 색상·시즌·용도 조건을 완화한 결과를 보여드렸습니다.",
                    List.of("color", "season", "useCase", "gender")
                )
            );
        }

        SearchCriteria broaderCriteria = parsedCriteria.relaxPriceAndQueryCategory();
        SearchExecution broaderExecution = execute(broaderCriteria, sort, userId);
        if (!broaderExecution.items().isEmpty()) {
            List<String> relaxedFilters = new ArrayList<>(List.of("minPrice", "maxPrice"));
            if (parsedCriteria.categoryFromQuery()) {
                relaxedFilters.add("category");
            }
            return new ProductSearchResponse(
                broaderExecution.items(),
                toParsedQuery(parsedCriteria),
                buildAppliedFilters(broaderCriteria),
                new SearchFallbackResponse(
                    true,
                    "가격대와 질의 내 카테고리 조건을 조금 넓혀서 검색 결과를 보여드렸습니다.",
                    relaxedFilters
                )
            );
        }

        return new ProductSearchResponse(
            List.of(),
            toParsedQuery(parsedCriteria),
            buildAppliedFilters(parsedCriteria),
            null
        );
    }

    private SearchExecution execute(SearchCriteria criteria, String sort, Long userId) {
        List<Long> productIds = queryProductIds(criteria);
        if (productIds.isEmpty()) {
            return new SearchExecution(List.of());
        }

        Map<Long, Product> productMap = productRepository.findAllByIdIn(productIds).stream()
            .collect(Collectors.toMap(Product::getId, Function.identity()));
        List<Product> products = productIds.stream()
            .map(productMap::get)
            .filter(product -> product != null && product.getCategory().isVisible())
            .collect(Collectors.toCollection(ArrayList::new));
        applySort(products, sort);

        Set<Long> wishlistedProductIds = wishlistService.getWishlistedProductIds(
            userId,
            products.stream().map(Product::getId).toList()
        );

        return new SearchExecution(products.stream()
            .map(product -> new ProductSummary(
                product.getId(),
                product.getSlug(),
                product.getName(),
                product.getCategory().getSlug(),
                product.getCategory().getName(),
                product.getSummary(),
                product.getPrice(),
                product.getBadge(),
                product.getAccentColor(),
                product.getImageUrl(),
                product.getImageAlt(),
                wishlistedProductIds.contains(product.getId())
            ))
            .toList());
    }

    private List<Long> queryProductIds(SearchCriteria criteria) {
        StringBuilder sql = new StringBuilder("""
            SELECT p.id
            FROM products p
            JOIN categories c ON c.id = p.category_id
            WHERE c.is_visible = TRUE
            """);
        List<Object> params = new ArrayList<>();

        if (criteria.category() != null) {
            sql.append(" AND c.slug = ?");
            params.add(criteria.category());
        }
        if (criteria.color() != null) {
            sql.append(" AND LOWER(COALESCE(p.color, '')) = ?");
            params.add(criteria.color());
        }
        if (criteria.season() != null) {
            sql.append(" AND LOWER(COALESCE(p.season_tag, '')) LIKE ?");
            params.add("%" + criteria.season() + "%");
        }
        if (criteria.useCase() != null) {
            sql.append(" AND LOWER(COALESCE(p.use_case_tag, '')) LIKE ?");
            params.add("%" + criteria.useCase() + "%");
        }
        if (criteria.gender() != null) {
            sql.append(" AND LOWER(COALESCE(p.gender_tag, '')) LIKE ?");
            params.add("%" + criteria.gender() + "%");
        }
        if (criteria.minPrice() != null) {
            sql.append(" AND p.price >= ?");
            params.add(BigDecimal.valueOf(criteria.minPrice()));
        }
        if (criteria.maxPrice() != null) {
            sql.append(" AND p.price <= ?");
            params.add(BigDecimal.valueOf(criteria.maxPrice()));
        }
        if (criteria.keyword() != null) {
            String like = "%" + criteria.keyword() + "%";
            sql.append("""
                 AND (
                    LOWER(p.name) LIKE ?
                    OR LOWER(p.summary) LIKE ?
                    OR LOWER(p.description) LIKE ?
                    OR LOWER(COALESCE(p.search_keywords, '')) LIKE ?
                    OR LOWER(p.slug) LIKE ?
                    OR LOWER(c.name) LIKE ?
                 )
                """);
            params.add(like);
            params.add(like);
            params.add(like);
            params.add(like);
            params.add(like);
            params.add(like);
        }

        JdbcClient.StatementSpec statement = jdbcClient.sql(sql.toString());
        for (Object param : params) {
            statement = statement.param(param);
        }
        return statement.query(Long.class).list();
    }

    private SearchCriteria parse(String rawQuery, String explicitCategory) {
        String normalizedRaw = normalize(rawQuery);
        String remaining = normalizedRaw;

        Integer minPrice = null;
        Integer maxPrice = null;

        Matcher maxManWonMatcher = PRICE_MAX_MAN_WON.matcher(remaining);
        if (maxManWonMatcher.find()) {
            maxPrice = Integer.parseInt(maxManWonMatcher.group(1)) * 10_000;
            remaining = maxManWonMatcher.replaceFirst(" ");
        }

        Matcher minManWonMatcher = PRICE_MIN_MAN_WON.matcher(remaining);
        if (minManWonMatcher.find()) {
            minPrice = Integer.parseInt(minManWonMatcher.group(1)) * 10_000;
            remaining = minManWonMatcher.replaceFirst(" ");
        }

        Matcher rangeManWonMatcher = PRICE_RANGE_MAN_WON.matcher(remaining);
        if (rangeManWonMatcher.find()) {
            int base = Integer.parseInt(rangeManWonMatcher.group(1)) * 10_000;
            minPrice = base;
            maxPrice = base + 9_999;
            remaining = rangeManWonMatcher.replaceFirst(" ");
        }

        Matcher maxWonMatcher = PRICE_MAX_WON.matcher(remaining);
        if (maxWonMatcher.find()) {
            maxPrice = Integer.parseInt(maxWonMatcher.group(1));
            remaining = maxWonMatcher.replaceFirst(" ");
        }

        Matcher minWonMatcher = PRICE_MIN_WON.matcher(remaining);
        if (minWonMatcher.find()) {
            minPrice = Integer.parseInt(minWonMatcher.group(1));
            remaining = minWonMatcher.replaceFirst(" ");
        }

        String color = matchAlias(COLOR_ALIASES, remaining);
        remaining = stripAlias(remaining, color == null ? List.of() : COLOR_ALIASES.get(color));

        String season = matchAlias(SEASON_ALIASES, remaining);
        remaining = stripAlias(remaining, season == null ? List.of() : SEASON_ALIASES.get(season));

        CategoryMatch categoryMatch = matchCategory(remaining);
        if (categoryMatch != null) {
            remaining = stripAlias(remaining, categoryMatch.aliases());
        }

        String useCase = matchAlias(USE_CASE_ALIASES, remaining);
        remaining = stripAlias(remaining, useCase == null ? List.of() : USE_CASE_ALIASES.get(useCase));

        String gender = matchAlias(GENDER_ALIASES, remaining);
        remaining = stripAlias(remaining, gender == null ? List.of() : GENDER_ALIASES.get(gender));

        String explicitCategorySlug = normalize(explicitCategory);
        String resolvedCategory = explicitCategorySlug != null ? explicitCategorySlug : categoryMatch == null ? null : categoryMatch.slug();
        boolean categoryFromQuery = explicitCategorySlug == null && categoryMatch != null;

        String keyword = normalizeKeyword(remaining);

        return new SearchCriteria(
            rawQuery == null ? "" : rawQuery.trim(),
            normalizedRaw == null ? "" : normalizedRaw,
            keyword,
            resolvedCategory,
            categoryFromQuery,
            color,
            season,
            useCase,
            gender,
            minPrice,
            maxPrice
        );
    }

    private CategoryMatch matchCategory(String normalizedQuery) {
        if (normalizedQuery == null || normalizedQuery.isBlank()) {
            return null;
        }

        List<Category> categories = categoryRepository.findAllByVisibleTrueOrderByDisplayOrderAscIdAsc();
        Map<String, List<String>> manualAliases = new LinkedHashMap<>();
        manualAliases.put("living", List.of("living", "리빙", "거실"));
        manualAliases.put("kitchen", List.of("kitchen", "키친", "주방"));
        manualAliases.put("wellness", List.of("wellness", "웰니스", "휴식", "요가"));

        for (Category category : categories) {
            List<String> aliases = new ArrayList<>();
            aliases.add(category.getSlug().toLowerCase(Locale.ROOT));
            aliases.add(category.getName().toLowerCase(Locale.ROOT));
            aliases.addAll(manualAliases.getOrDefault(category.getSlug(), List.of()));
            for (String alias : aliases) {
                if (normalizedQuery.contains(alias.toLowerCase(Locale.ROOT))) {
                    return new CategoryMatch(category.getSlug(), List.copyOf(new LinkedHashSet<>(aliases)));
                }
            }
        }

        return null;
    }

    private String matchAlias(Map<String, List<String>> aliasesByCode, String normalizedQuery) {
        if (normalizedQuery == null || normalizedQuery.isBlank()) {
            return null;
        }

        for (Map.Entry<String, List<String>> entry : aliasesByCode.entrySet()) {
            for (String alias : entry.getValue()) {
                if (normalizedQuery.contains(alias.toLowerCase(Locale.ROOT))) {
                    return entry.getKey();
                }
            }
        }
        return null;
    }

    private String stripAlias(String text, List<String> aliases) {
        String result = text == null ? "" : text;
        for (String alias : aliases) {
            result = result.replace(alias.toLowerCase(Locale.ROOT), " ");
        }
        return normalize(result);
    }

    private String normalizeKeyword(String text) {
        String normalized = normalize(text);
        if (normalized == null) {
            return null;
        }
        String compact = List.of(normalized.split("\\s+"))
            .stream()
            .filter(token -> !token.isBlank())
            .distinct()
            .collect(Collectors.joining(" "));
        return compact.isBlank() ? null : compact;
    }

    private ParsedSearchQueryResponse toParsedQuery(SearchCriteria criteria) {
        return new ParsedSearchQueryResponse(
            criteria.raw(),
            criteria.normalized(),
            criteria.keyword(),
            criteria.category(),
            criteria.color(),
            criteria.minPrice(),
            criteria.maxPrice(),
            criteria.season(),
            criteria.useCase(),
            criteria.gender()
        );
    }

    private List<AppliedFilterResponse> buildAppliedFilters(SearchCriteria criteria) {
        List<AppliedFilterResponse> filters = new ArrayList<>();
        if (criteria.category() != null) {
            filters.add(new AppliedFilterResponse("category", criteria.category(), "카테고리 · " + criteria.category()));
        }
        if (criteria.color() != null) {
            filters.add(new AppliedFilterResponse("color", criteria.color(), "색상 · " + criteria.color()));
        }
        if (criteria.minPrice() != null) {
            filters.add(new AppliedFilterResponse("minPrice", String.valueOf(criteria.minPrice()), "최소 · " + criteria.minPrice() + "원"));
        }
        if (criteria.maxPrice() != null) {
            filters.add(new AppliedFilterResponse("maxPrice", String.valueOf(criteria.maxPrice()), "최대 · " + criteria.maxPrice() + "원"));
        }
        if (criteria.season() != null) {
            filters.add(new AppliedFilterResponse("season", criteria.season(), "시즌 · " + criteria.season()));
        }
        if (criteria.useCase() != null) {
            filters.add(new AppliedFilterResponse("useCase", criteria.useCase(), "용도 · " + criteria.useCase()));
        }
        if (criteria.gender() != null) {
            filters.add(new AppliedFilterResponse("gender", criteria.gender(), "성별 · " + criteria.gender()));
        }
        if (criteria.keyword() != null) {
            filters.add(new AppliedFilterResponse("keyword", criteria.keyword(), "키워드 · " + criteria.keyword()));
        }
        return filters;
    }

    private void applySort(List<Product> products, String sort) {
        Comparator<Product> comparator = switch (sort == null || sort.isBlank() ? "recommended" : sort.trim()) {
            case "newest" -> NEWEST_ORDER;
            case "popular" -> POPULAR_ORDER;
            case "price-asc" -> PRICE_ASC_ORDER;
            case "price-desc" -> PRICE_DESC_ORDER;
            default -> RECOMMENDED_ORDER;
        };
        products.sort(comparator);
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim().toLowerCase(Locale.ROOT)
            .replaceAll("[,_]+", " ")
            .replaceAll("\\s+", " ");
        return normalized.isBlank() ? null : normalized;
    }

    private record SearchExecution(List<ProductSummary> items) {
    }

    private record CategoryMatch(String slug, List<String> aliases) {
    }

    private record SearchCriteria(
        String raw,
        String normalized,
        String keyword,
        String category,
        boolean categoryFromQuery,
        String color,
        String season,
        String useCase,
        String gender,
        Integer minPrice,
        Integer maxPrice
    ) {
        private boolean hasSearchSignals() {
            return keyword != null
                || category != null
                || color != null
                || season != null
                || useCase != null
                || gender != null
                || minPrice != null
                || maxPrice != null;
        }

        private SearchCriteria relaxOptionalSignals() {
            return new SearchCriteria(
                raw,
                normalized,
                keyword,
                category,
                categoryFromQuery,
                null,
                null,
                null,
                null,
                minPrice,
                maxPrice
            );
        }

        private SearchCriteria relaxPriceAndQueryCategory() {
            return new SearchCriteria(
                raw,
                normalized,
                keyword,
                categoryFromQuery ? null : category,
                false,
                null,
                null,
                null,
                null,
                null,
                null
            );
        }
    }
}
