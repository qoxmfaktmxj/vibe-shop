package com.vibeshop.api.catalog;

import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vibeshop.api.common.ResourceNotFoundException;

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

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public CatalogService(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    public HomeResponse getHome() {
        List<CategorySummary> categories = categoryRepository.findAllByOrderByIdAsc().stream()
            .map(this::toCategorySummary)
            .toList();
        List<Product> allProducts = productRepository.findAllByOrderByFeaturedDescIdAsc();

        return new HomeResponse(
            "리빙의 결을 따라 고른 이번 시즌 셀렉션",
            "리빙, 키친, 웰니스 카테고리에서 지금 살펴보기 좋은 신상품과 인기 상품을 함께 제안합니다.",
            categories,
            allProducts.stream()
                .filter(Product::isFeatured)
                .sorted(POPULAR_ORDER)
                .limit(6)
                .map(this::toProductSummary)
                .toList(),
            allProducts.stream()
                .sorted(NEWEST_ORDER)
                .limit(8)
                .map(this::toProductSummary)
                .toList(),
            allProducts.stream()
                .sorted(POPULAR_ORDER)
                .limit(8)
                .map(this::toProductSummary)
                .toList()
        );
    }

    public List<CategorySummary> getCategories() {
        return categoryRepository.findAllByOrderByIdAsc().stream().map(this::toCategorySummary).toList();
    }

    public List<ProductSummary> getProducts(String categorySlug) {
        return getProducts(categorySlug, null, null);
    }

    public List<ProductSummary> getProducts(String categorySlug, String keyword) {
        return getProducts(categorySlug, keyword, null);
    }

    public List<ProductSummary> getProducts(String categorySlug, String keyword, String sort) {
        String normalizedCategorySlug = categorySlug == null || categorySlug.isBlank() ? null : categorySlug.trim();
        String normalizedKeyword = keyword == null || keyword.isBlank() ? null : keyword.trim();
        String normalizedSort = sort == null || sort.isBlank() ? "recommended" : sort.trim();

        List<Product> products = normalizedKeyword == null
            ? (
                normalizedCategorySlug == null
                    ? productRepository.findAllByOrderByFeaturedDescIdAsc()
                    : productRepository.findByCategory_SlugOrderByFeaturedDescIdAsc(normalizedCategorySlug)
            )
            : productRepository.search(normalizedCategorySlug, normalizedKeyword);

        applySort(products, normalizedSort);
        return products.stream().map(this::toProductSummary).toList();
    }

    public ProductDetailResponse getProduct(String slug) {
        Product product = productRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("상품을 찾을 수 없습니다."));

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
            product.getStock()
        );
    }

    private CategorySummary toCategorySummary(Category category) {
        return new CategorySummary(
            category.getId(),
            category.getSlug(),
            category.getName(),
            category.getDescription(),
            category.getAccentColor()
        );
    }

    private ProductSummary toProductSummary(Product product) {
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
            product.getImageAlt()
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
}
