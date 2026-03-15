package com.vibeshop.api.catalog;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class CatalogController {

    private final CatalogService catalogService;

    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping("/home")
    HomeResponse home() {
        return catalogService.getHome();
    }

    @GetMapping("/categories")
    List<CategorySummary> categories() {
        return catalogService.getCategories();
    }

    @GetMapping("/products")
    List<ProductSummary> products(
        @RequestParam(required = false) String category,
        @RequestParam(required = false, name = "q") String keyword
    ) {
        return catalogService.getProducts(category, keyword);
    }

    @GetMapping("/products/{slug}")
    ProductDetailResponse product(@PathVariable String slug) {
        return catalogService.getProduct(slug);
    }
}
