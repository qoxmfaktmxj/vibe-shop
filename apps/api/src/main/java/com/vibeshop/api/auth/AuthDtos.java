package com.vibeshop.api.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthDtos {

    private AuthDtos() {
    }

    public record SignUpRequest(
        @NotBlank(message = "이름을 입력해 주세요.") String name,
        @NotBlank(message = "이메일을 입력해 주세요.")
        @Email(message = "올바른 이메일 형식을 입력해 주세요.") String email,
        @NotBlank(message = "비밀번호를 입력해 주세요.")
        @Size(min = 8, message = "비밀번호는 8자 이상이어야 합니다.") String password
    ) {
    }

    public record LoginRequest(
        @NotBlank(message = "이메일을 입력해 주세요.")
        @Email(message = "올바른 이메일 형식을 입력해 주세요.") String email,
        @NotBlank(message = "비밀번호를 입력해 주세요.") String password
    ) {
    }

    public record SocialExchangeRequest(
        @NotBlank(message = "provider를 입력해 주세요.") String provider,
        @NotBlank(message = "accessToken을 입력해 주세요.") String accessToken
    ) {
    }

    public record AuthenticatedUserResponse(
        Long id,
        String name,
        String email,
        String provider
    ) {
    }

    public record AuthSessionResponse(
        boolean authenticated,
        AuthenticatedUserResponse user
    ) {
        public static AuthSessionResponse unauthenticated() {
            return new AuthSessionResponse(false, null);
        }
    }
}
