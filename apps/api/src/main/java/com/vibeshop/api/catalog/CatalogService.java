package com.vibeshop.api.catalog;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.List;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vibeshop.api.admin.AdminDisplaySettings;
import com.vibeshop.api.admin.AdminDisplaySettingsRepository;
import com.vibeshop.api.common.ResourceNotFoundException;
import com.vibeshop.api.display.DisplayItem;
import com.vibeshop.api.display.DisplaySection;
import com.vibeshop.api.display.DisplaySectionCode;
import com.vibeshop.api.display.DisplaySectionRepository;
import com.vibeshop.api.review.ReviewService;
import com.vibeshop.api.review.ReviewService.ProductReviewSnapshot;
import com.vibeshop.api.wishlist.WishlistService;

@Service
@Transactional(readOnly = true)
public class CatalogService {

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

    private static final Comparator<DisplayItem> DISPLAY_ITEM_ORDER = Comparator
        .comparing(DisplayItem::getDisplayOrder)
        .thenComparing(DisplayItem::getId);

    private static final long DISPLAY_SETTINGS_ID = 1L;
    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final AdminDisplaySettingsRepository adminDisplaySettingsRepository;
    private final DisplaySectionRepository displaySectionRepository;
    private final WishlistService wishlistService;
    private final ReviewService reviewService;

    public CatalogService(
        CategoryRepository categoryRepository,
        ProductRepository productRepository,
        AdminDisplaySettingsRepository adminDisplaySettingsRepository,
        DisplaySectionRepository displaySectionRepository,
        WishlistService wishlistService,
        ReviewService reviewService
    ) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.adminDisplaySettingsRepository = adminDisplaySettingsRepository;
        this.displaySectionRepository = displaySectionRepository;
        this.wishlistService = wishlistService;
        this.reviewService = reviewService;
    }

    public HomeResponse getHome(Long userId) {
        List<CategorySummary> categories = categoryRepository.findAllByVisibleTrueOrderByDisplayOrderAscIdAsc().stream()
            .map(this::toCategorySummary)
            .toList();
        List<Product> allProducts = productRepository.findAllByCategory_VisibleTrueOrderByFeaturedDescIdAsc();
        Set<Long> wishlistedProductIds = wishlistService.getWishlistedProductIds(
            userId,
            allProducts.stream().map(Product::getId).toList()
        );
        AdminDisplaySettings displaySettings = getDisplaySettings();
        OffsetDateTime current = now();

        return new HomeResponse(
            displaySettings.getHeroTitle(),
            displaySettings.getHeroSubtitle(),
            displaySettings.getHeroCtaLabel(),
            displaySettings.getHeroCtaHref(),
            ensureDisplaySections().stream()
                .map(section -> toHomeDisplaySectionResponse(section, current))
                .toList(),
            categories,
            allProducts.stream()
                .filter(Product::isFeatured)
                .sorted(POPULAR_ORDER)
                .limit(6)
                .map(product -> toProductSummary(product, wishlistedProductIds.contains(product.getId())))
                .toList(),
            allProducts.stream()
                .sorted(NEWEST_ORDER)
                .limit(8)
                .map(product -> toProductSummary(product, wishlistedProductIds.contains(product.getId())))
                .toList(),
            allProducts.stream()
                .sorted(POPULAR_ORDER)
                .limit(8)
                .map(product -> toProductSummary(product, wishlistedProductIds.contains(product.getId())))
                .toList()
        );
    }

    public List<CategorySummary> getCategories() {
        return categoryRepository.findAllByVisibleTrueOrderByDisplayOrderAscIdAsc().stream()
            .map(this::toCategorySummary)
            .toList();
    }

    public List<ProductSummary> getProducts(String categorySlug, String keyword, String sort, Long userId) {
        String normalizedCategorySlug = categorySlug == null || categorySlug.isBlank() ? null : categorySlug.trim();
        String normalizedKeyword = keyword == null || keyword.isBlank() ? null : keyword.trim();
        String normalizedSort = sort == null || sort.isBlank() ? "recommended" : sort.trim();

        List<Product> products = normalizedKeyword == null
            ? (
                normalizedCategorySlug == null
                    ? productRepository.findAllByCategory_VisibleTrueOrderByFeaturedDescIdAsc()
                    : productRepository.findByCategory_SlugAndCategory_VisibleTrueOrderByFeaturedDescIdAsc(normalizedCategorySlug)
            )
            : productRepository.searchVisible(normalizedCategorySlug, normalizedKeyword);

        applySort(products, normalizedSort);
        Set<Long> wishlistedProductIds = wishlistService.getWishlistedProductIds(
            userId,
            products.stream().map(Product::getId).toList()
        );
        return products.stream()
            .map(product -> toProductSummary(product, wishlistedProductIds.contains(product.getId())))
            .toList();
    }

    public PagedProductResponse getProductsPaged(String categorySlug, String sort, int page, int size, Long userId) {
        String normalizedCategorySlug = categorySlug == null || categorySlug.isBlank() ? null : categorySlug.trim();
        String normalizedSort = sort == null || sort.isBlank() ? "recommended" : sort.trim();

        Sort springSort = toSpringSort(normalizedSort);
        PageRequest pageRequest = PageRequest.of(page, size, springSort);

        Page<Product> productPage = normalizedCategorySlug == null
            ? productRepository.findAllByCategory_VisibleTrue(pageRequest)
            : productRepository.findByCategory_SlugAndCategory_VisibleTrue(normalizedCategorySlug, pageRequest);

        Set<Long> wishlistedProductIds = wishlistService.getWishlistedProductIds(
            userId,
            productPage.getContent().stream().map(Product::getId).toList()
        );

        List<ProductSummary> items = productPage.getContent().stream()
            .map(product -> toProductSummary(product, wishlistedProductIds.contains(product.getId())))
            .toList();

        return new PagedProductResponse(
            items,
            productPage.getNumber(),
            productPage.getSize(),
            productPage.getTotalElements(),
            productPage.getTotalPages(),
            productPage.hasNext(),
            productPage.hasPrevious()
        );
    }

    public ProductDetailResponse getProduct(String slug, Long userId) {
        Product product = productRepository.findBySlugAndCategory_VisibleTrue(slug)
            .orElseThrow(() -> new ResourceNotFoundException("상품을 찾을 수 없습니다."));
        ProductReviewSnapshot reviewSnapshot = reviewService.getProductReviewSnapshot(product.getId(), userId);

        return new ProductDetailResponse(
            product.getId(),
            product.getSlug(),
            product.getName(),
            product.getCategory().getSlug(),
            product.getCategory().getName(),
            product.getSummary(),
            product.getDescription(),
            product.getPrice(),
            product.getBadge(),
            product.getAccentColor(),
            product.getImageUrl(),
            product.getImageAlt(),
            product.getStock(),
            wishlistService.isWishlisted(userId, product.getId()),
            reviewSnapshot.canWriteReview(),
            reviewSnapshot.hasReviewed(),
            reviewSnapshot.summary(),
            reviewSnapshot.reviews()
        );
    }

    private AdminDisplaySettings getDisplaySettings() {
        return adminDisplaySettingsRepository.findById(DISPLAY_SETTINGS_ID)
            .orElseGet(() -> adminDisplaySettingsRepository.save(new AdminDisplaySettings(
                DISPLAY_SETTINGS_ID,
                "리빙의 결을 따라 고른 이번 시즌 셀렉션",
                "리빙, 키친, 웰니스 카테고리에서 지금 바로 보기 좋은 신상품과 인기 상품만 따로 제안합니다.",
                "컬렉션 보기",
                "/search",
                now()
            )));
    }

    private List<DisplaySection> ensureDisplaySections() {
        List<DisplaySection> sections = displaySectionRepository.findAllByOrderByDisplayOrderAscIdAsc();
        if (!sections.isEmpty()) {
            return sections;
        }

        OffsetDateTime current = now();
        return displaySectionRepository.saveAll(List.of(
            new DisplaySection(DisplaySectionCode.HERO, "메인 배너", "메인 비주얼과 CTA를 함께 보여줍니다.", 10, true, current),
            new DisplaySection(DisplaySectionCode.FEATURED_CATEGORY, "카테고리 셀렉션", "운영 중인 주요 카테고리를 전면에서 소개합니다.", 20, true, current),
            new DisplaySection(DisplaySectionCode.CURATED_PICK, "추천 상품", "지금 보여주기 좋은 상품을 모아 보여줍니다.", 30, true, current),
            new DisplaySection(DisplaySectionCode.NEW_ARRIVALS, "신상품", "최근 등록된 상품을 먼저 보여줍니다.", 40, true, current),
            new DisplaySection(DisplaySectionCode.BEST_SELLERS, "인기 상품", "인기와 반응이 좋은 상품을 중심으로 구성합니다.", 50, true, current),
            new DisplaySection(DisplaySectionCode.PROMOTION, "기획전", "기획전과 프로모션 링크를 함께 보여줍니다.", 60, true, current)
        ));
    }

    private CategorySummary toCategorySummary(Category category) {
        return new CategorySummary(
            category.getId(),
            category.getSlug(),
            category.getName(),
            category.getDescription(),
            category.getAccentColor(),
            category.getDisplayOrder(),
            category.getCoverImageUrl(),
            category.getCoverImageAlt(),
            category.getHeroTitle(),
            category.getHeroSubtitle()
        );
    }

    private ProductSummary toProductSummary(Product product, boolean wishlisted) {
        return new ProductSummary(
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
            wishlisted
        );
    }

    private HomeDisplaySectionResponse toHomeDisplaySectionResponse(DisplaySection section, OffsetDateTime current) {
        return new HomeDisplaySectionResponse(
            section.getCode().name(),
            section.getTitle(),
            section.getSubtitle(),
            section.isVisible(),
            section.getItems().stream()
                .filter(item -> item.isActiveAt(current))
                .sorted(DISPLAY_ITEM_ORDER)
                .map(item -> new HomeDisplayItemResponse(
                    item.getId(),
                    item.getTitle(),
                    item.getSubtitle(),
                    item.getImageUrl(),
                    item.getImageAlt(),
                    item.getHref(),
                    item.getCtaLabel(),
                    item.getAccentColor()
                ))
                .toList()
        );
    }

    private void applySort(List<Product> products, String sort) {
        Comparator<Product> comparator = switch (sort) {
            case "newest" -> NEWEST_ORDER;
            case "popular" -> POPULAR_ORDER;
            case "price-asc" -> PRICE_ASC_ORDER;
            case "price-desc" -> PRICE_DESC_ORDER;
            default -> RECOMMENDED_ORDER;
        };

        products.sort(comparator);
    }

    private Sort toSpringSort(String sort) {
        return switch (sort) {
            case "newest" -> Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by(Sort.Direction.DESC, "id"));
            case "popular" -> Sort.by(Sort.Direction.DESC, "popularityScore")
                .and(Sort.by(Sort.Direction.DESC, "featured"))
                .and(Sort.by(Sort.Direction.DESC, "createdAt"))
                .and(Sort.by(Sort.Direction.ASC, "id"));
            case "price-asc" -> Sort.by(Sort.Direction.ASC, "price").and(Sort.by(Sort.Direction.ASC, "id"));
            case "price-desc" -> Sort.by(Sort.Direction.DESC, "price").and(Sort.by(Sort.Direction.ASC, "id"));
            default -> Sort.by(Sort.Direction.DESC, "featured")
                .and(Sort.by(Sort.Direction.DESC, "popularityScore"))
                .and(Sort.by(Sort.Direction.DESC, "createdAt"))
                .and(Sort.by(Sort.Direction.ASC, "id"));
        };
    }

    private OffsetDateTime now() {
        return OffsetDateTime.now(SEOUL);
    }
}
