package com.vibeshop.api.admin;

import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.vibeshop.api.admin.AdminDtos.AdminOperationsResponse;

@RestController
@RequestMapping("/api/v1/admin/operations")
public class AdminOperationsController {

    private static final String ADMIN_SESSION_COOKIE = "vibe_shop_admin_session";

    private final AdminAccessGuard adminAccessGuard;
    private final AdminOperationsService adminOperationsService;

    public AdminOperationsController(
        AdminAccessGuard adminAccessGuard,
        AdminOperationsService adminOperationsService
    ) {
        this.adminAccessGuard = adminAccessGuard;
        this.adminOperationsService = adminOperationsService;
    }

    @GetMapping
    AdminOperationsResponse operations(
        @CookieValue(value = ADMIN_SESSION_COOKIE, required = false) String adminSessionToken,
        @RequestParam(required = false) Integer lowStockThreshold,
        @RequestParam(required = false) Integer lowRatingThreshold,
        @RequestParam(required = false) Integer suspiciousScoreThreshold
    ) {
        adminAccessGuard.requireAdmin(adminSessionToken);
        return adminOperationsService.getOperations(
            lowStockThreshold,
            lowRatingThreshold,
            suspiciousScoreThreshold
        );
    }
}
