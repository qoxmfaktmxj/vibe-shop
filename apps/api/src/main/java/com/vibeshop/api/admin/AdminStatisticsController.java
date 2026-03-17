package com.vibeshop.api.admin;

import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vibeshop.api.admin.AdminDtos.AdminStatisticsResponse;

@RestController
@RequestMapping("/api/v1/admin/statistics")
public class AdminStatisticsController {

    private static final String ADMIN_SESSION_COOKIE = "vibe_shop_admin_session";

    private final AdminStatisticsService adminStatisticsService;
    private final AdminAccessGuard adminAccessGuard;

    public AdminStatisticsController(
        AdminStatisticsService adminStatisticsService,
        AdminAccessGuard adminAccessGuard
    ) {
        this.adminStatisticsService = adminStatisticsService;
        this.adminAccessGuard = adminAccessGuard;
    }

    @GetMapping
    AdminStatisticsResponse statistics(
        @CookieValue(value = ADMIN_SESSION_COOKIE, required = false) String adminSessionToken
    ) {
        adminAccessGuard.requireAdmin(adminSessionToken);
        return adminStatisticsService.getStatistics();
    }
}
