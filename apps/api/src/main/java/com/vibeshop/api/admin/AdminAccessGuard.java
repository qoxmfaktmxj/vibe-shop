package com.vibeshop.api.admin;

import org.springframework.stereotype.Component;

import com.vibeshop.api.auth.AuthService;
import com.vibeshop.api.common.UnauthorizedException;

@Component
public class AdminAccessGuard {

    private final AuthService authService;

    public AdminAccessGuard(AuthService authService) {
        this.authService = authService;
    }

    public void requireAdmin(String adminSessionToken) {
        if (authService.resolveAdminUser(adminSessionToken).isEmpty()) {
            throw new UnauthorizedException("관리자 로그인이 필요합니다.");
        }
    }
}
