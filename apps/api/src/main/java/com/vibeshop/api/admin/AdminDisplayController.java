package com.vibeshop.api.admin;

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

import com.vibeshop.api.admin.AdminDtos.AdminDisplayItemResponse;
import com.vibeshop.api.admin.AdminDtos.AdminDisplayResponse;
import com.vibeshop.api.admin.AdminDtos.AdminDisplaySectionResponse;
import com.vibeshop.api.admin.AdminDtos.CreateAdminDisplayItemRequest;
import com.vibeshop.api.admin.AdminDtos.DeleteAdminDisplayItemResponse;
import com.vibeshop.api.admin.AdminDtos.UpdateAdminDisplayItemRequest;
import com.vibeshop.api.admin.AdminDtos.UpdateAdminDisplayRequest;
import com.vibeshop.api.admin.AdminDtos.UpdateAdminDisplaySectionRequest;

@RestController
@RequestMapping("/api/v1/admin/display")
public class AdminDisplayController {

    private static final String ADMIN_SESSION_COOKIE = "vibe_shop_admin_session";

    private final AdminService adminService;
    private final AdminAccessGuard adminAccessGuard;

    public AdminDisplayController(AdminService adminService, AdminAccessGuard adminAccessGuard) {
        this.adminService = adminService;
        this.adminAccessGuard = adminAccessGuard;
    }

    @GetMapping
    AdminDisplayResponse display(
        @CookieValue(value = ADMIN_SESSION_COOKIE, required = false) String adminSessionToken
    ) {
        adminAccessGuard.requireAdmin(adminSessionToken);
        return adminService.getDisplay();
    }

    @PutMapping
    AdminDisplayResponse updateDisplay(
        @CookieValue(value = ADMIN_SESSION_COOKIE, required = false) String adminSessionToken,
        @Valid @RequestBody UpdateAdminDisplayRequest request
    ) {
        adminAccessGuard.requireAdmin(adminSessionToken);
        return adminService.updateDisplay(request);
    }

    @PutMapping("/sections/{code}")
    AdminDisplaySectionResponse updateDisplaySection(
        @CookieValue(value = ADMIN_SESSION_COOKIE, required = false) String adminSessionToken,
        @PathVariable String code,
        @Valid @RequestBody UpdateAdminDisplaySectionRequest request
    ) {
        adminAccessGuard.requireAdmin(adminSessionToken);
        return adminService.updateDisplaySection(code, request);
    }

    @PostMapping("/items")
    AdminDisplayItemResponse createDisplayItem(
        @CookieValue(value = ADMIN_SESSION_COOKIE, required = false) String adminSessionToken,
        @Valid @RequestBody CreateAdminDisplayItemRequest request
    ) {
        adminAccessGuard.requireAdmin(adminSessionToken);
        return adminService.createDisplayItem(request);
    }

    @PutMapping("/items/{itemId}")
    AdminDisplayItemResponse updateDisplayItem(
        @CookieValue(value = ADMIN_SESSION_COOKIE, required = false) String adminSessionToken,
        @PathVariable Long itemId,
        @Valid @RequestBody UpdateAdminDisplayItemRequest request
    ) {
        adminAccessGuard.requireAdmin(adminSessionToken);
        return adminService.updateDisplayItem(itemId, request);
    }

    @DeleteMapping("/items/{itemId}")
    DeleteAdminDisplayItemResponse deleteDisplayItem(
        @CookieValue(value = ADMIN_SESSION_COOKIE, required = false) String adminSessionToken,
        @PathVariable Long itemId
    ) {
        adminAccessGuard.requireAdmin(adminSessionToken);
        return adminService.deleteDisplayItem(itemId);
    }
}
