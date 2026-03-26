package com.vibeshop.api.admin;

import org.springframework.stereotype.Component;

import com.vibeshop.api.auth.AuthService;
import com.vibeshop.api.auth.User;
import com.vibeshop.api.auth.UserRole;
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

    public User requireOwner(String adminSessionToken) {
        User user = authService.resolveAdminUser(adminSessionToken)
            .orElseThrow(() -> new UnauthorizedException("관리자 로그인이 필요합니다."));
        if (user.getRole() != UserRole.OWNER) {
            throw new UnauthorizedException("OWNER 권한이 필요합니다.");
        }
        return user;
    }
}
