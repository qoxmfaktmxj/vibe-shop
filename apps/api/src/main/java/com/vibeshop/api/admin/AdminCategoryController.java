package com.vibeshop.api.admin;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vibeshop.api.admin.AdminDtos.AdminCategoryResponse;
import com.vibeshop.api.admin.AdminDtos.CreateAdminCategoryRequest;
import com.vibeshop.api.admin.AdminDtos.DeleteAdminCategoryResponse;
import com.vibeshop.api.admin.AdminDtos.UpdateAdminCategoryRequest;

@RestController
@RequestMapping("/api/v1/admin/categories")
public class AdminCategoryController {

    private static final String ADMIN_SESSION_COOKIE = "vibe_shop_admin_session";

    private final AdminService adminService;
    private final AdminAccessGuard adminAccessGuard;

    public AdminCategoryController(AdminService adminService, AdminAccessGuard adminAccessGuard) {
        this.adminService = adminService;
        this.adminAccessGuard = adminAccessGuard;
    }

    @GetMapping
    List<AdminCategoryResponse> categories(
        @CookieValue(value = ADMIN_SESSION_COOKIE, required = false) String adminSessionToken
    ) {
        adminAccessGuard.requireAdmin(adminSessionToken);
        return adminService.getCategories();
    }

    @PostMapping
    AdminCategoryResponse createCategory(
        @CookieValue(value = ADMIN_SESSION_COOKIE, required = false) String adminSessionToken,
        @Valid @RequestBody CreateAdminCategoryRequest request
    ) {
        adminAccessGuard.requireAdmin(adminSessionToken);
        return adminService.createCategory(request);
    }

    @PutMapping("/{categoryId}")
    AdminCategoryResponse updateCategory(
        @CookieValue(value = ADMIN_SESSION_COOKIE, required = false) String adminSessionToken,
        @PathVariable Long categoryId,
        @Valid @RequestBody UpdateAdminCategoryRequest request
    ) {
        adminAccessGuard.requireAdmin(adminSessionToken);
        return adminService.updateCategory(categoryId, request);
    }

    @DeleteMapping("/{categoryId}")
    DeleteAdminCategoryResponse deleteCategory(
        @CookieValue(value = ADMIN_SESSION_COOKIE, required = false) String adminSessionToken,
        @PathVariable Long categoryId
    ) {
        adminAccessGuard.requireAdmin(adminSessionToken);
        return adminService.deleteCategory(categoryId);
    }
}
