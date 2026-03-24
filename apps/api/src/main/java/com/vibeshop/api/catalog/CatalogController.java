package com.vibeshop.api.catalog;

import java.util.List;

import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.vibeshop.api.auth.AuthService;
import com.vibeshop.api.catalog.SearchDtos.ProductSearchResponse;

@RestController
@RequestMapping("/api/v1")
public class CatalogController {

    private static final String AUTH_SESSION_COOKIE = "vibe_shop_session";

    private final CatalogService catalogService;
    private final ProductSearchService productSearchService;
    private final AuthService authService;

    public CatalogController(
        CatalogService catalogService,
        ProductSearchService productSearchService,
        AuthService authService
    ) {
        this.catalogService = catalogService;
        this.productSearchService = productSearchService;
        this.authService = authService;
    }

    @GetMapping("/home")
    HomeResponse home(
        @CookieValue(value = AUTH_SESSION_COOKIE, required = false) String authSessionToken
    ) {
        return catalogService.getHome(authService.resolveAuthenticatedUserId(authSessionToken));
    }

    @GetMapping("/categories")
    List<CategorySummary> categories() {
        return catalogService.getCategories();
    }

    @GetMapping("/products")
    List<ProductSummary> products(
        @CookieValue(value = AUTH_SESSION_COOKIE, required = false) String authSessionToken,
        @RequestParam(required = false) String category,
        @RequestParam(required = false, name = "q") String keyword,
        @RequestParam(required = false) String sort
    ) {
        return catalogService.getProducts(
            category,
            keyword,
            sort,
            authService.resolveAuthenticatedUserId(authSessionToken)
        );
    }

    @GetMapping("/products/{slug}")
    ProductDetailResponse product(
        @CookieValue(value = AUTH_SESSION_COOKIE, required = false) String authSessionToken,
        @PathVariable String slug
    ) {
        return catalogService.getProduct(slug, authService.resolveAuthenticatedUserId(authSessionToken));
    }

    @GetMapping("/search/products")
    ProductSearchResponse searchProducts(
        @CookieValue(value = AUTH_SESSION_COOKIE, required = false) String authSessionToken,
        @RequestParam(required = false, name = "q") String keyword,
        @RequestParam(required = false) String category,
        @RequestParam(required = false) String sort
    ) {
        return productSearchService.search(
            keyword,
            category,
            sort,
            authService.resolveAuthenticatedUserId(authSessionToken)
        );
    }
}
