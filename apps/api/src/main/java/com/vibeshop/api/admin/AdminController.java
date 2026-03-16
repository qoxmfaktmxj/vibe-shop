package com.vibeshop.api.admin;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.vibeshop.api.admin.AdminDtos.AdminDashboardResponse;
import com.vibeshop.api.admin.AdminDtos.AdminDisplayResponse;
import com.vibeshop.api.admin.AdminDtos.AdminOrderResponse;
import com.vibeshop.api.admin.AdminDtos.AdminProductResponse;
import com.vibeshop.api.admin.AdminDtos.UpdateAdminDisplayRequest;
import com.vibeshop.api.admin.AdminDtos.UpdateAdminOrderStatusRequest;
import com.vibeshop.api.admin.AdminDtos.UpdateAdminProductRequest;
import com.vibeshop.api.auth.AuthService;
import com.vibeshop.api.common.UnauthorizedException;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private static final String ADMIN_SESSION_COOKIE = "vibe_shop_admin_session";

    private final AdminService adminService;
    private final AuthService authService;

    public AdminController(AdminService adminService, AuthService authService) {
        this.adminService = adminService;
        this.authService = authService;
    }

    @GetMapping("/dashboard")
    AdminDashboardResponse dashboard(
        @CookieValue(value = ADMIN_SESSION_COOKIE, required = false) String adminSessionToken
    ) {
        requireAdmin(adminSessionToken);
        return adminService.getDashboard();
    }

    @GetMapping("/products")
    List<AdminProductResponse> products(
        @CookieValue(value = ADMIN_SESSION_COOKIE, required = false) String adminSessionToken,
        @RequestParam(required = false) String category,
        @RequestParam(required = false, name = "q") String keyword
    ) {
        requireAdmin(adminSessionToken);
        return adminService.getProducts(category, keyword);
    }

    @PutMapping("/products/{productId}")
    AdminProductResponse updateProduct(
        @CookieValue(value = ADMIN_SESSION_COOKIE, required = false) String adminSessionToken,
        @PathVariable Long productId,
        @Valid @RequestBody UpdateAdminProductRequest request
    ) {
        requireAdmin(adminSessionToken);
        return adminService.updateProduct(productId, request);
    }

    @GetMapping("/orders")
    List<AdminOrderResponse> orders(
        @CookieValue(value = ADMIN_SESSION_COOKIE, required = false) String adminSessionToken,
        @RequestParam(required = false) String status
    ) {
        requireAdmin(adminSessionToken);
        return adminService.getOrders(status);
    }

    @PutMapping("/orders/{orderNumber}/status")
    AdminOrderResponse updateOrderStatus(
        @CookieValue(value = ADMIN_SESSION_COOKIE, required = false) String adminSessionToken,
        @PathVariable String orderNumber,
        @Valid @RequestBody UpdateAdminOrderStatusRequest request
    ) {
        requireAdmin(adminSessionToken);
        return adminService.updateOrderStatus(orderNumber, request.status());
    }

    @GetMapping("/display")
    AdminDisplayResponse display(
        @CookieValue(value = ADMIN_SESSION_COOKIE, required = false) String adminSessionToken
    ) {
        requireAdmin(adminSessionToken);
        return adminService.getDisplay();
    }

    @PutMapping("/display")
    AdminDisplayResponse updateDisplay(
        @CookieValue(value = ADMIN_SESSION_COOKIE, required = false) String adminSessionToken,
        @Valid @RequestBody UpdateAdminDisplayRequest request
    ) {
        requireAdmin(adminSessionToken);
        return adminService.updateDisplay(request);
    }

    private void requireAdmin(String adminSessionToken) {
        if (authService.resolveAdminUser(adminSessionToken).isEmpty()) {
            throw new UnauthorizedException("관리자 로그인이 필요합니다.");
        }
    }
}
