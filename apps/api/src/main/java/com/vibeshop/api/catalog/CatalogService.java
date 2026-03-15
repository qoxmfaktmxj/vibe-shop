package com.vibeshop.api.catalog;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vibeshop.api.common.ResourceNotFoundException;

@Service
@Transactional(readOnly = true)
public class CatalogService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public CatalogService(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    public HomeResponse getHome() {
        return new HomeResponse(
            "오늘의 감도로 공간을 채우는 셀렉트 숍",
            "리빙, 키친, 웰니스까지 하루의 리듬을 바꾸는 제품만 가볍게 묶었습니다.",
            categoryRepository.findAllByOrderByIdAsc().stream().map(this::toCategorySummary).toList(),
            productRepository.findTop4ByFeaturedTrueOrderByIdAsc().stream().map(this::toProductSummary).toList()
        );
    }

    public List<CategorySummary> getCategories() {
        return categoryRepository.findAllByOrderByIdAsc().stream().map(this::toCategorySummary).toList();
    }

    public List<ProductSummary> getProducts(String categorySlug) {
        return getProducts(categorySlug, null);
    }

    public List<ProductSummary> getProducts(String categorySlug, String keyword) {
        String normalizedCategorySlug = categorySlug == null || categorySlug.isBlank() ? null : categorySlug.trim();
        String normalizedKeyword = keyword == null || keyword.isBlank() ? null : keyword.trim();

        List<Product> products = normalizedKeyword == null
            ? (
                normalizedCategorySlug == null
                    ? productRepository.findAllByOrderByFeaturedDescIdAsc()
                    : productRepository.findByCategory_SlugOrderByFeaturedDescIdAsc(normalizedCategorySlug)
            )
            : productRepository.search(normalizedCategorySlug, normalizedKeyword);

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
            product.getAccentColor()
        );
    }
}
