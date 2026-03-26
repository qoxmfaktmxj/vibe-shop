package com.vibeshop.api.admin;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.vibeshop.api.admin.AdminDtos.AdminDashboardResponse;
import com.vibeshop.api.admin.AdminDtos.AdminOrderResponse;
import com.vibeshop.api.admin.AdminDtos.AdminProductResponse;
import com.vibeshop.api.admin.AdminDtos.CreateAdminProductRequest;
import com.vibeshop.api.admin.AdminDtos.UpdateAdminOrderStatusRequest;
import com.vibeshop.api.admin.AdminDtos.UpdateAdminProductRequest;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private static final String ADMIN_SESSION_COOKIE = "vibe_shop_admin_session";

    private final AdminService adminService;
    private final AdminAccessGuard adminAccessGuard;

    public AdminController(AdminService adminService, AdminAccessGuard adminAccessGuard) {
        this.adminService = adminService;
        this.adminAccessGuard = adminAccessGuard;
    }

    @GetMapping("/dashboard")
    AdminDashboardResponse dashboard(
        @CookieValue(value = ADMIN_SESSION_COOKIE, required = false) String adminSessionToken
    ) {
        adminAccessGuard.requireAdmin(adminSessionToken);
        return adminService.getDashboard();
    }

    @GetMapping("/products")
    List<AdminProductResponse> products(
        @CookieValue(value = ADMIN_SESSION_COOKIE, required = false) String adminSessionToken,
        @RequestParam(required = false) String category,
        @RequestParam(required = false, name = "q") String keyword
    ) {
        adminAccessGuard.requireAdmin(adminSessionToken);
        return adminService.getProducts(category, keyword);
    }

    @PostMapping("/products")
    AdminProductResponse createProduct(
        @CookieValue(value = ADMIN_SESSION_COOKIE, required = false) String adminSessionToken,
        @Valid @RequestBody CreateAdminProductRequest request
    ) {
        adminAccessGuard.requireAdmin(adminSessionToken);
        return adminService.createProduct(request);
    }

    @PutMapping("/products/{productId}")
    AdminProductResponse updateProduct(
        @CookieValue(value = ADMIN_SESSION_COOKIE, required = false) String adminSessionToken,
        @PathVariable Long productId,
        @Valid @RequestBody UpdateAdminProductRequest request
    ) {
        adminAccessGuard.requireAdmin(adminSessionToken);
        return adminService.updateProduct(productId, request);
    }

    @GetMapping("/orders")
    List<AdminOrderResponse> orders(
        @CookieValue(value = ADMIN_SESSION_COOKIE, required = false) String adminSessionToken,
        @RequestParam(required = false) String status
    ) {
        adminAccessGuard.requireAdmin(adminSessionToken);
        return adminService.getOrders(status);
    }

    @PutMapping("/orders/{orderNumber}/status")
    AdminOrderResponse updateOrderStatus(
        @CookieValue(value = ADMIN_SESSION_COOKIE, required = false) String adminSessionToken,
        @PathVariable String orderNumber,
        @Valid @RequestBody UpdateAdminOrderStatusRequest request
    ) {
        adminAccessGuard.requireAdmin(adminSessionToken);
        return adminService.updateOrderStatus(orderNumber, request);
    }
}
