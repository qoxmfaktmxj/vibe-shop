package com.vibeshop.api.recommendation;

import static com.vibeshop.api.recommendation.RecommendationDtos.RecentlyViewedItemResponse;
import static com.vibeshop.api.recommendation.RecommendationDtos.RecentlyViewedResponse;
import static com.vibeshop.api.recommendation.RecommendationDtos.RecommendationCollectionResponse;
import static com.vibeshop.api.recommendation.RecommendationDtos.RecommendationProductResponse;
import static com.vibeshop.api.recommendation.RecommendationDtos.TrackProductViewResponse;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vibeshop.api.catalog.Product;
import com.vibeshop.api.catalog.ProductRepository;
import com.vibeshop.api.common.ResourceNotFoundException;
import com.vibeshop.api.order.CustomerOrder;
import com.vibeshop.api.order.CustomerOrderLine;
import com.vibeshop.api.order.CustomerOrderRepository;
import com.vibeshop.api.order.OrderPayment;
import com.vibeshop.api.order.OrderPaymentRepository;
import com.vibeshop.api.order.OrderStatus;
import com.vibeshop.api.order.PaymentStatus;
import com.vibeshop.api.wishlist.WishlistItem;
import com.vibeshop.api.wishlist.WishlistItemRepository;
import com.vibeshop.api.wishlist.WishlistService;

@Service
@Transactional
public class RecommendationService {

    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");
    private static final int MAX_RECENTLY_VIEWED = 6;
    private static final int MAX_RECOMMENDATIONS = 6;
    private static final String DEFAULT_SOURCE = "PRODUCT_DETAIL";

    private final ProductRepository productRepository;
    private final ProductViewEventRepository productViewEventRepository;
    private final WishlistItemRepository wishlistItemRepository;
    private final WishlistService wishlistService;
    private final CustomerOrderRepository customerOrderRepository;
    private final OrderPaymentRepository orderPaymentRepository;
    private final JdbcClient jdbcClient;

    public RecommendationService(
        ProductRepository productRepository,
        ProductViewEventRepository productViewEventRepository,
        WishlistItemRepository wishlistItemRepository,
        WishlistService wishlistService,
        CustomerOrderRepository customerOrderRepository,
        OrderPaymentRepository orderPaymentRepository,
        JdbcClient jdbcClient
    ) {
        this.productRepository = productRepository;
        this.productViewEventRepository = productViewEventRepository;
        this.wishlistItemRepository = wishlistItemRepository;
        this.wishlistService = wishlistService;
        this.customerOrderRepository = customerOrderRepository;
        this.orderPaymentRepository = orderPaymentRepository;
        this.jdbcClient = jdbcClient;
    }

    public TrackViewResult trackView(Long productId, Long userId, String visitorKey, String source) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("상품을 찾을 수 없습니다."));

        String normalizedVisitorKey = normalizeVisitorKey(visitorKey);
        if (userId != null && normalizedVisitorKey != null) {
            productViewEventRepository.assignGuestHistoryToUser(normalizedVisitorKey, userId);
        }

        String resolvedVisitorKey = userId == null ? ensureVisitorKey(normalizedVisitorKey) : normalizedVisitorKey;
        OffsetDateTime viewedAt = now();
        productViewEventRepository.save(new ProductViewEvent(
            product,
            userId,
            userId == null ? resolvedVisitorKey : null,
            normalizeSource(source),
            viewedAt
        ));

        return new TrackViewResult(new TrackProductViewResponse(productId, viewedAt), resolvedVisitorKey);
    }

    @Transactional(readOnly = true)
    public RecentlyViewedResponse getRecentlyViewed(Long userId, String visitorKey) {
        ViewerProfile viewerProfile = buildViewerProfile(userId, normalizeVisitorKey(visitorKey));
        return new RecentlyViewedResponse(toRecentlyViewedItems(viewerProfile.recentlyViewedProducts(), userId, viewerProfile.latestViewedAtByProductId()));
    }

    @Transactional(readOnly = true)
    public RecommendationCollectionResponse getHomeRecommendations(Long userId, String visitorKey) {
        ViewerProfile viewerProfile = buildViewerProfile(userId, normalizeVisitorKey(visitorKey));
        if (viewerProfile.recentlyViewedProducts().isEmpty() && userId == null) {
            return new RecommendationCollectionResponse(
                "home",
                "지금 반응이 좋은 상품",
                "조회·주문·위시리스트 집계를 기준으로 최근 반응이 좋은 상품을 먼저 보여드립니다.",
                recommendTrendingProducts(Set.of(), userId)
            );
        }

        Set<Long> excludedProductIds = viewerProfile.recentlyViewedProducts().stream()
            .map(Product::getId)
            .collect(Collectors.toCollection(LinkedHashSet::new));

        return new RecommendationCollectionResponse(
            "home",
            "최근 본 흐름 기반 추천",
            "최근 본 카테고리와 회원 선호 신호를 기준으로 다음 탐색 상품을 골랐습니다.",
            rankCandidates(
                productRepository.findAllByCategory_VisibleTrueOrderByFeaturedDescIdAsc(),
                excludedProductIds,
                candidate -> scoreHomeCandidate(candidate, viewerProfile),
                userId
            )
        );
    }

    @Transactional(readOnly = true)
    public RecommendationCollectionResponse getProductRecommendations(Long productId, Long userId, String visitorKey) {
        Product anchor = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("상품을 찾을 수 없습니다."));
        ViewerProfile viewerProfile = buildViewerProfile(userId, normalizeVisitorKey(visitorKey));

        return new RecommendationCollectionResponse(
            "product",
            "이 상품과 잘 어울리는 추천",
            "같은 카테고리, 비슷한 가격대, 최근 반응을 함께 반영했습니다.",
            rankCandidates(
                productRepository.findAllByCategory_VisibleTrueOrderByFeaturedDescIdAsc(),
                Set.of(anchor.getId()),
                candidate -> scoreProductCandidate(anchor, candidate, viewerProfile),
                userId
            )
        );
    }

    @Transactional(readOnly = true)
    public RecommendationCollectionResponse getCartRecommendations(
        Long userId,
        String visitorKey,
        Collection<Long> cartProductIds
    ) {
        ViewerProfile viewerProfile = buildViewerProfile(userId, normalizeVisitorKey(visitorKey));
        Set<Long> normalizedCartProductIds = cartProductIds.stream()
            .filter(id -> id != null)
            .collect(Collectors.toCollection(LinkedHashSet::new));

        if (normalizedCartProductIds.isEmpty()) {
            return new RecommendationCollectionResponse(
                "cart",
                "장바구니 추천",
                "장바구니가 비어 있어 최근 인기 상품을 먼저 보여드립니다.",
                recommendTrendingProducts(Set.of(), userId)
            );
        }

        Map<Long, Integer> coPurchaseWeights = buildCoPurchaseWeights(normalizedCartProductIds);
        return new RecommendationCollectionResponse(
            "cart",
            "함께 담기 좋은 상품",
            "같은 주문에서 함께 구매된 흐름과 장바구니 카테고리를 기준으로 정리했습니다.",
            rankCandidates(
                productRepository.findAllByCategory_VisibleTrueOrderByFeaturedDescIdAsc(),
                normalizedCartProductIds,
                candidate -> scoreCartCandidate(candidate, viewerProfile, normalizedCartProductIds, coPurchaseWeights),
                userId
            )
        );
    }

    @Transactional(readOnly = true)
    public RecommendationCollectionResponse getRecentlyViewedRecommendations(Long userId, String visitorKey) {
        ViewerProfile viewerProfile = buildViewerProfile(userId, normalizeVisitorKey(visitorKey));
        List<Product> recentlyViewed = viewerProfile.recentlyViewedProducts();
        if (recentlyViewed.isEmpty()) {
            return new RecommendationCollectionResponse(
                "recently-viewed",
                "최근 본 상품 기반 추천",
                "아직 최근 본 상품이 없어 인기 상품을 먼저 보여드립니다.",
                recommendTrendingProducts(Set.of(), userId)
            );
        }

        Product anchor = recentlyViewed.getFirst();
        Set<Long> excludedProductIds = recentlyViewed.stream().map(Product::getId).collect(Collectors.toSet());
        return new RecommendationCollectionResponse(
            "recently-viewed",
            "최근 본 상품 이어보기",
            "가장 최근에 본 상품과 비슷한 카테고리·가격대 중심으로 이어서 제안합니다.",
            rankCandidates(
                productRepository.findAllByCategory_VisibleTrueOrderByFeaturedDescIdAsc(),
                excludedProductIds,
                candidate -> scoreRecentlyViewedCandidate(anchor, candidate, viewerProfile),
                userId
            )
        );
    }

    public void mergeGuestHistoryIntoUser(String visitorKey, Long userId) {
        String normalizedVisitorKey = normalizeVisitorKey(visitorKey);
        if (normalizedVisitorKey == null || userId == null) {
            return;
        }
        productViewEventRepository.assignGuestHistoryToUser(normalizedVisitorKey, userId);
    }

    private ViewerProfile buildViewerProfile(Long userId, String visitorKey) {
        List<Product> recentlyViewedProducts = getRecentlyViewedProducts(userId, visitorKey, MAX_RECENTLY_VIEWED);
        Map<Long, Integer> recentCategoryWeights = weighCategories(recentlyViewedProducts, 4);
        Map<Long, Integer> wishlistCategoryWeights = buildWishlistCategoryWeights(userId);
        Map<Long, Integer> orderedCategoryWeights = buildOrderedCategoryWeights(userId);
        Map<Long, Integer> trendingScores = buildTrendingScores();
        Map<Long, OffsetDateTime> latestViewedAtByProductId = resolveLatestViewedAt(userId, visitorKey);

        return new ViewerProfile(
            recentlyViewedProducts,
            recentCategoryWeights,
            wishlistCategoryWeights,
            orderedCategoryWeights,
            trendingScores,
            latestViewedAtByProductId
        );
    }

    private List<Product> getRecentlyViewedProducts(Long userId, String visitorKey, int limit) {
        List<ProductViewEvent> events = userId != null
            ? productViewEventRepository.findTop80ByUserIdOrderByViewedAtDesc(userId)
            : visitorKey == null ? List.of() : productViewEventRepository.findTop80ByVisitorKeyOrderByViewedAtDesc(visitorKey);

        LinkedHashMap<Long, Product> uniqueProducts = new LinkedHashMap<>();
        for (ProductViewEvent event : events) {
            Product product = event.getProduct();
            if (!product.getCategory().isVisible()) {
                continue;
            }
            uniqueProducts.putIfAbsent(product.getId(), product);
            if (uniqueProducts.size() == limit) {
                break;
            }
        }

        return List.copyOf(uniqueProducts.values());
    }

    private List<RecentlyViewedItemResponse> toRecentlyViewedItems(
        List<Product> products,
        Long userId,
        Map<Long, OffsetDateTime> latestViewedAtByProductId
    ) {
        if (products.isEmpty()) {
            return List.of();
        }

        Map<Long, Boolean> wishlisted = resolveWishlistedMap(userId, products.stream().map(Product::getId).toList());
        return products.stream()
            .map(product -> new RecentlyViewedItemResponse(
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
                wishlisted.getOrDefault(product.getId(), false),
                latestViewedAtByProductId.getOrDefault(product.getId(), product.getCreatedAt())
            ))
            .toList();
    }

    private Map<Long, OffsetDateTime> resolveLatestViewedAt(Long userId, String visitorKey) {
        List<ProductViewEvent> events = userId != null
            ? productViewEventRepository.findTop80ByUserIdOrderByViewedAtDesc(userId)
            : visitorKey == null ? List.of() : productViewEventRepository.findTop80ByVisitorKeyOrderByViewedAtDesc(visitorKey);
        if (events.isEmpty()) {
            return Map.of();
        }

        Map<Long, OffsetDateTime> result = new HashMap<>();
        for (ProductViewEvent event : events) {
            result.putIfAbsent(event.getProduct().getId(), event.getViewedAt());
        }
        return result;
    }

    private List<RecommendationProductResponse> recommendTrendingProducts(Set<Long> excludedProductIds, Long userId) {
        Map<Long, Integer> trendingScores = buildTrendingScores();
        return rankCandidates(
            productRepository.findAllByCategory_VisibleTrueOrderByFeaturedDescIdAsc(),
            excludedProductIds,
            candidate -> scoreTrendingCandidate(candidate, trendingScores),
            userId
        );
    }

    private List<RecommendationProductResponse> rankCandidates(
        List<Product> products,
        Set<Long> excludedProductIds,
        Function<Product, CandidateScore> scorer,
        Long userId
    ) {
        List<CandidateScore> scored = products.stream()
            .filter(product -> !excludedProductIds.contains(product.getId()))
            .map(scorer)
            .filter(candidate -> candidate.totalScore() > 0)
            .sorted(CandidateScore.ORDER)
            .limit(MAX_RECOMMENDATIONS)
            .toList();

        if (scored.isEmpty()) {
            return List.of();
        }

        Map<Long, Boolean> wishlisted = resolveWishlistedMap(
            userId,
            scored.stream().map(candidate -> candidate.product().getId()).toList()
        );

        return scored.stream()
            .map(candidate -> toRecommendationProduct(candidate, wishlisted.getOrDefault(candidate.product().getId(), false)))
            .toList();
    }

    private CandidateScore scoreHomeCandidate(Product candidate, ViewerProfile viewerProfile) {
        List<Contribution> contributions = new ArrayList<>();
        addCategoryWeightContribution(contributions, candidate, viewerProfile.recentCategoryWeights(), 8, "RECENT_CATEGORY", "최근 본 카테고리", "최근 둘러본 카테고리 흐름을 이어갑니다.");
        addCategoryWeightContribution(contributions, candidate, viewerProfile.wishlistCategoryWeights(), 6, "WISHLIST_SIGNAL", "위시리스트 신호", "찜한 상품과 비슷한 카테고리를 우선 반영했습니다.");
        addCategoryWeightContribution(contributions, candidate, viewerProfile.orderedCategoryWeights(), 5, "ORDER_SIGNAL", "구매 이력 신호", "기존 구매 흐름과 가까운 카테고리를 우선 추천합니다.");
        addTrendingContribution(contributions, candidate, viewerProfile.trendingScores(), "TRENDING", "인기 상승", "최근 조회·주문·위시리스트 집계에서 반응이 좋습니다.");
        return CandidateScore.of(candidate, contributions, viewerProfile.trendingScores().getOrDefault(candidate.getId(), 0));
    }

    private CandidateScore scoreProductCandidate(Product anchor, Product candidate, ViewerProfile viewerProfile) {
        List<Contribution> contributions = new ArrayList<>();
        if (anchor.getCategory().getId().equals(candidate.getCategory().getId())) {
            contributions.add(new Contribution(36, "SAME_CATEGORY", "같은 카테고리", anchor.getCategory().getName() + " 카테고리 안에서 함께 보기 좋습니다."));
        }
        if (isSimilarPrice(anchor, candidate)) {
            contributions.add(new Contribution(18, "SIMILAR_PRICE", "비슷한 가격대", "현재 보고 있는 상품과 예산대가 가깝습니다."));
        }
        addCategoryWeightContribution(contributions, candidate, viewerProfile.recentCategoryWeights(), 5, "RECENT_CATEGORY", "최근 본 취향", "최근 탐색한 카테고리 흐름도 함께 반영했습니다.");
        addTrendingContribution(contributions, candidate, viewerProfile.trendingScores(), "TRENDING", "지금 반응이 좋은 상품", "최근 인기 지표가 안정적으로 높습니다.");
        return CandidateScore.of(candidate, contributions, viewerProfile.trendingScores().getOrDefault(candidate.getId(), 0));
    }

    private CandidateScore scoreRecentlyViewedCandidate(Product anchor, Product candidate, ViewerProfile viewerProfile) {
        List<Contribution> contributions = new ArrayList<>();
        if (anchor.getCategory().getId().equals(candidate.getCategory().getId())) {
            contributions.add(new Contribution(34, "RECENTLY_VIEWED_CATEGORY", "최근 본 카테고리", "가장 최근에 본 상품과 같은 카테고리입니다."));
        }
        if (isSimilarPrice(anchor, candidate)) {
            contributions.add(new Contribution(20, "RECENTLY_VIEWED_PRICE", "최근 본 가격대", "최근 본 상품과 가격대가 비슷합니다."));
        }
        addTrendingContribution(contributions, candidate, viewerProfile.trendingScores(), "TRENDING", "실시간 인기", "최근 반응이 높은 상품을 함께 섞었습니다.");
        return CandidateScore.of(candidate, contributions, viewerProfile.trendingScores().getOrDefault(candidate.getId(), 0));
    }

    private CandidateScore scoreCartCandidate(
        Product candidate,
        ViewerProfile viewerProfile,
        Set<Long> cartProductIds,
        Map<Long, Integer> coPurchaseWeights
    ) {
        List<Contribution> contributions = new ArrayList<>();
        Integer coPurchaseWeight = coPurchaseWeights.get(candidate.getId());
        if (coPurchaseWeight != null && coPurchaseWeight > 0) {
            contributions.add(new Contribution(
                Math.min(42, 12 + (coPurchaseWeight * 4)),
                "CART_COMPLEMENT",
                "함께 구매된 상품",
                "기존 주문에서 장바구니 상품과 함께 담긴 빈도가 높습니다."
            ));
        }

        Set<Long> cartCategoryIds = productRepository.findAllByIdIn(cartProductIds).stream()
            .map(product -> product.getCategory().getId())
            .collect(Collectors.toSet());
        if (cartCategoryIds.contains(candidate.getCategory().getId())) {
            contributions.add(new Contribution(16, "CART_CATEGORY", "장바구니 카테고리", "장바구니와 같은 카테고리라 함께 담기 좋습니다."));
        }

        addCategoryWeightContribution(contributions, candidate, viewerProfile.recentCategoryWeights(), 4, "RECENT_CATEGORY", "최근 본 흐름", "최근 본 카테고리도 함께 반영했습니다.");
        addTrendingContribution(contributions, candidate, viewerProfile.trendingScores(), "TRENDING", "인기 상품", "최근 반응이 높아 장바구니 보완용으로 적합합니다.");
        return CandidateScore.of(candidate, contributions, viewerProfile.trendingScores().getOrDefault(candidate.getId(), 0));
    }

    private CandidateScore scoreTrendingCandidate(Product candidate, Map<Long, Integer> trendingScores) {
        List<Contribution> contributions = new ArrayList<>();
        addTrendingContribution(contributions, candidate, trendingScores, "TRENDING", "실시간 인기", "조회·주문·위시리스트 집계를 기준으로 반응이 높습니다.");
        return CandidateScore.of(candidate, contributions, trendingScores.getOrDefault(candidate.getId(), 0));
    }

    private void addCategoryWeightContribution(
        List<Contribution> contributions,
        Product candidate,
        Map<Long, Integer> categoryWeights,
        int scoreUnit,
        String code,
        String label,
        String detail
    ) {
        Integer weight = categoryWeights.get(candidate.getCategory().getId());
        if (weight == null || weight < 1) {
            return;
        }
        contributions.add(new Contribution(Math.min(32, weight * scoreUnit), code, label, detail));
    }

    private void addTrendingContribution(
        List<Contribution> contributions,
        Product candidate,
        Map<Long, Integer> trendingScores,
        String code,
        String label,
        String detail
    ) {
        int trendingScore = trendingScores.getOrDefault(candidate.getId(), 0);
        if (trendingScore < 1) {
            return;
        }
        contributions.add(new Contribution(Math.min(24, 8 + (trendingScore / 80)), code, label, detail));
    }

    private Map<Long, Integer> buildTrendingScores() {
        OffsetDateTime cutoff = now().minusDays(30);
        Map<Long, Integer> viewCounts = jdbcClient.sql("""
            SELECT product_id, COUNT(*) AS value_count
            FROM product_view_events
            WHERE viewed_at >= ?
            GROUP BY product_id
            """)
            .param(cutoff)
            .query((rs, rowNum) -> Map.entry(rs.getLong("product_id"), rs.getInt("value_count")))
            .list()
            .stream()
            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

        Map<Long, Integer> orderQuantities = jdbcClient.sql("""
            SELECT line.product_id, COALESCE(SUM(line.quantity), 0) AS value_count
            FROM customer_order_lines line
            JOIN customer_orders orders ON orders.id = line.order_id
            JOIN order_payments payments ON payments.order_id = orders.id
            WHERE payments.payment_status = 'SUCCEEDED'
              AND orders.status NOT IN ('CANCELLED', 'REFUNDED')
            GROUP BY line.product_id
            """)
            .query((rs, rowNum) -> Map.entry(rs.getLong("product_id"), rs.getInt("value_count")))
            .list()
            .stream()
            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

        Map<Long, Integer> wishlistCounts = jdbcClient.sql("""
            SELECT product_id, COUNT(*) AS value_count
            FROM wishlist_items
            GROUP BY product_id
            """)
            .query((rs, rowNum) -> Map.entry(rs.getLong("product_id"), rs.getInt("value_count")))
            .list()
            .stream()
            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

        Map<Long, Integer> scores = new HashMap<>();
        for (Product product : productRepository.findAllByCategory_VisibleTrueOrderByFeaturedDescIdAsc()) {
            int score = product.getPopularityScore();
            score += viewCounts.getOrDefault(product.getId(), 0) * 4;
            score += orderQuantities.getOrDefault(product.getId(), 0) * 7;
            score += wishlistCounts.getOrDefault(product.getId(), 0) * 5;
            if (product.isFeatured()) {
                score += 12;
            }
            scores.put(product.getId(), score);
        }
        return scores;
    }

    private Map<Long, Integer> buildWishlistCategoryWeights(Long userId) {
        if (userId == null) {
            return Map.of();
        }

        List<WishlistItem> items = wishlistItemRepository.findByUser_IdOrderByCreatedAtDesc(userId);
        LinkedHashMap<Long, Integer> weights = new LinkedHashMap<>();
        int boost = items.size() + 2;
        for (WishlistItem item : items) {
            weights.merge(item.getProduct().getCategory().getId(), Math.max(1, boost), Integer::sum);
            boost = Math.max(1, boost - 1);
        }
        return weights;
    }

    private Map<Long, Integer> buildOrderedCategoryWeights(Long userId) {
        if (userId == null) {
            return Map.of();
        }

        List<CustomerOrder> orders = customerOrderRepository.findByUserIdOrderByCreatedAtDesc(userId);
        Map<Long, OrderPayment> payments = resolvePaymentMap(orders);
        LinkedHashMap<Long, Integer> weights = new LinkedHashMap<>();
        int boost = orders.size() + 1;

        for (CustomerOrder order : orders) {
            OrderPayment payment = payments.get(order.getId());
            if (payment == null || payment.getPaymentStatus() != PaymentStatus.SUCCEEDED) {
                continue;
            }
            if (order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.REFUNDED) {
                continue;
            }
            for (CustomerOrderLine line : order.getLines()) {
                Product product = productRepository.findById(line.getProductId()).orElse(null);
                if (product == null || !product.getCategory().isVisible()) {
                    continue;
                }
                weights.merge(product.getCategory().getId(), Math.max(1, boost + line.getQuantity()), Integer::sum);
            }
            boost = Math.max(1, boost - 1);
        }
        return weights;
    }

    private Map<Long, Integer> weighCategories(List<Product> products, int startWeight) {
        LinkedHashMap<Long, Integer> weights = new LinkedHashMap<>();
        int weight = startWeight;
        for (Product product : products) {
            weights.merge(product.getCategory().getId(), Math.max(1, weight), Integer::sum);
            weight = Math.max(1, weight - 1);
        }
        return weights;
    }

    private Map<Long, Integer> buildCoPurchaseWeights(Set<Long> cartProductIds) {
        List<CustomerOrder> orders = customerOrderRepository.findAllByOrderByCreatedAtDesc();
        Map<Long, OrderPayment> payments = resolvePaymentMap(orders);
        Map<Long, Integer> weights = new HashMap<>();

        for (CustomerOrder order : orders) {
            OrderPayment payment = payments.get(order.getId());
            if (payment == null || payment.getPaymentStatus() != PaymentStatus.SUCCEEDED) {
                continue;
            }
            if (order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.REFUNDED) {
                continue;
            }

            boolean sharesCartProduct = order.getLines().stream()
                .anyMatch(line -> cartProductIds.contains(line.getProductId()));
            if (!sharesCartProduct) {
                continue;
            }

            for (CustomerOrderLine line : order.getLines()) {
                if (cartProductIds.contains(line.getProductId())) {
                    continue;
                }
                weights.merge(line.getProductId(), Math.max(1, line.getQuantity()), Integer::sum);
            }
        }

        return weights;
    }

    private Map<Long, OrderPayment> resolvePaymentMap(List<CustomerOrder> orders) {
        if (orders.isEmpty()) {
            return Map.of();
        }
        return orderPaymentRepository.findByOrder_IdIn(orders.stream().map(CustomerOrder::getId).toList()).stream()
            .collect(Collectors.toMap(payment -> payment.getOrder().getId(), Function.identity()));
    }

    private Map<Long, Boolean> resolveWishlistedMap(Long userId, List<Long> productIds) {
        if (userId == null || productIds.isEmpty()) {
            return Map.of();
        }

        Set<Long> wishlistedIds = new HashSet<>(wishlistService.getWishlistedProductIds(userId, productIds));
        return productIds.stream().collect(Collectors.toMap(Function.identity(), wishlistedIds::contains));
    }

    private RecommendationProductResponse toRecommendationProduct(CandidateScore candidate, boolean wishlisted) {
        Product product = candidate.product();
        return new RecommendationProductResponse(
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
            wishlisted,
            candidate.primaryContribution().code(),
            candidate.primaryContribution().label(),
            candidate.primaryContribution().detail(),
            candidate.totalScore()
        );
    }

    private boolean isSimilarPrice(Product anchor, Product candidate) {
        if (anchor.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            return false;
        }
        BigDecimal priceGap = anchor.getPrice().subtract(candidate.getPrice()).abs();
        BigDecimal allowedGap = anchor.getPrice().multiply(BigDecimal.valueOf(0.25));
        return priceGap.compareTo(allowedGap.max(BigDecimal.valueOf(15000))) <= 0;
    }

    private String normalizeSource(String source) {
        if (source == null || source.isBlank()) {
            return DEFAULT_SOURCE;
        }
        return source.trim().toUpperCase(Locale.ROOT);
    }

    private String normalizeVisitorKey(String visitorKey) {
        if (visitorKey == null) {
            return null;
        }
        String normalized = visitorKey.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private String ensureVisitorKey(String visitorKey) {
        return visitorKey != null ? visitorKey : UUID.randomUUID().toString().replace("-", "");
    }

    private OffsetDateTime now() {
        return OffsetDateTime.now(SEOUL);
    }

    public record TrackViewResult(TrackProductViewResponse response, String visitorKey) {
    }

    private record ViewerProfile(
        List<Product> recentlyViewedProducts,
        Map<Long, Integer> recentCategoryWeights,
        Map<Long, Integer> wishlistCategoryWeights,
        Map<Long, Integer> orderedCategoryWeights,
        Map<Long, Integer> trendingScores,
        Map<Long, OffsetDateTime> latestViewedAtByProductId
    ) {
    }

    private record Contribution(int score, String code, String label, String detail) {
    }

    private record CandidateScore(
        Product product,
        int totalScore,
        Contribution primaryContribution,
        int trendingScore
    ) {
        private static final Comparator<CandidateScore> ORDER = Comparator
            .comparing(CandidateScore::totalScore, Comparator.reverseOrder())
            .thenComparing(CandidateScore::trendingScore, Comparator.reverseOrder())
            .thenComparing(candidate -> candidate.product().getCreatedAt(), Comparator.reverseOrder())
            .thenComparing(candidate -> candidate.product().getId());

        private static CandidateScore of(Product product, List<Contribution> contributions, int trendingScore) {
            if (contributions.isEmpty()) {
                return new CandidateScore(product, 0, new Contribution(0, "NONE", "", ""), trendingScore);
            }

            int totalScore = contributions.stream().mapToInt(Contribution::score).sum();
            Contribution primaryContribution = contributions.stream()
                .max(Comparator.comparing(Contribution::score).thenComparing(Contribution::label))
                .orElseGet(() -> contributions.getFirst());
            return new CandidateScore(product, totalScore, primaryContribution, trendingScore);
        }
    }
}
