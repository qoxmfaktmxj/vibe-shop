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

import com.vibeshop.api.admin.AdminDtos.AdminManagedAccountResponse;
import com.vibeshop.api.admin.AdminDtos.AdminMemberResponse;
import com.vibeshop.api.admin.AdminDtos.CreateAdminAccountRequest;
import com.vibeshop.api.admin.AdminDtos.UpdateAdminMemberStatusRequest;

@RestController
@RequestMapping("/api/v1/admin/members")
public class AdminMemberController {

    private static final String ADMIN_SESSION_COOKIE = "vibe_shop_admin_session";

    private final AdminMemberService adminMemberService;
    private final AdminAccessGuard adminAccessGuard;

    public AdminMemberController(AdminMemberService adminMemberService, AdminAccessGuard adminAccessGuard) {
        this.adminMemberService = adminMemberService;
        this.adminAccessGuard = adminAccessGuard;
    }

    @GetMapping
    List<AdminMemberResponse> members(
        @CookieValue(value = ADMIN_SESSION_COOKIE, required = false) String adminSessionToken,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String provider,
        @RequestParam(required = false, name = "q") String keyword
    ) {
        adminAccessGuard.requireAdmin(adminSessionToken);
        return adminMemberService.getMembers(status, provider, keyword);
    }

    @GetMapping("/admins")
    List<AdminManagedAccountResponse> adminAccounts(
        @CookieValue(value = ADMIN_SESSION_COOKIE, required = false) String adminSessionToken
    ) {
        adminAccessGuard.requireOwner(adminSessionToken);
        return adminMemberService.getAdminAccounts();
    }

    @PostMapping("/admins")
    AdminManagedAccountResponse createAdminAccount(
        @CookieValue(value = ADMIN_SESSION_COOKIE, required = false) String adminSessionToken,
        @Valid @RequestBody CreateAdminAccountRequest request
    ) {
        adminAccessGuard.requireOwner(adminSessionToken);
        return adminMemberService.createAdminAccount(request);
    }

    @PutMapping("/{memberId}/status")
    AdminMemberResponse updateMemberStatus(
        @CookieValue(value = ADMIN_SESSION_COOKIE, required = false) String adminSessionToken,
        @PathVariable Long memberId,
        @Valid @RequestBody UpdateAdminMemberStatusRequest request
    ) {
        adminAccessGuard.requireAdmin(adminSessionToken);
        return adminMemberService.updateMemberStatus(memberId, request);
    }
}
