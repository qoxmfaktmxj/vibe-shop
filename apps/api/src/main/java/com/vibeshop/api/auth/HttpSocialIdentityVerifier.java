package com.vibeshop.api.auth;

import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class HttpSocialIdentityVerifier implements SocialIdentityVerifier {

    private final RestTemplate restTemplate;

    public HttpSocialIdentityVerifier() {
        this.restTemplate = new RestTemplate();
    }

    @Override
    public SocialIdentity verify(AuthProviderType provider, String accessToken) {
        if (provider == AuthProviderType.GOOGLE) {
            return verifyGoogle(accessToken);
        }
        if (provider == AuthProviderType.KAKAO) {
            return verifyKakao(accessToken);
        }
        throw new IllegalArgumentException("지원하지 않는 소셜 로그인 공급자입니다.");
    }

    private SocialIdentity verifyGoogle(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        ResponseEntity<Map> response = restTemplate.exchange(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            HttpMethod.GET,
            new HttpEntity<>(headers),
            Map.class
        );

        Map body = response.getBody();
        if (body == null || body.get("sub") == null || body.get("email") == null) {
            throw new IllegalArgumentException("구글 사용자 검증에 실패했습니다.");
        }

        String sub = String.valueOf(body.get("sub"));
        String email = String.valueOf(body.get("email")).trim().toLowerCase();
        String name = body.get("name") == null ? email : String.valueOf(body.get("name")).trim();
        boolean emailVerified = Boolean.parseBoolean(String.valueOf(body.get("email_verified")));

        return new SocialIdentity(AuthProviderType.GOOGLE, sub, email, name, emailVerified);
    }

    private SocialIdentity verifyKakao(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        ResponseEntity<Map> response = restTemplate.exchange(
            "https://kapi.kakao.com/v2/user/me",
            HttpMethod.GET,
            new HttpEntity<>(headers),
            Map.class
        );

        Map body = response.getBody();
        if (body == null || body.get("id") == null) {
            throw new IllegalArgumentException("카카오 사용자 검증에 실패했습니다.");
        }

        String id = String.valueOf(body.get("id"));
        Map kakaoAccount = body.get("kakao_account") instanceof Map ? (Map) body.get("kakao_account") : Map.of();
        Map profile = kakaoAccount.get("profile") instanceof Map ? (Map) kakaoAccount.get("profile") : Map.of();

        Object emailObj = kakaoAccount.get("email");
        if (emailObj == null) {
            throw new IllegalArgumentException("카카오 계정 이메일이 없습니다.");
        }

        String email = String.valueOf(emailObj).trim().toLowerCase();
        String name = profile.get("nickname") == null ? email : String.valueOf(profile.get("nickname")).trim();
        boolean emailVerified = Boolean.TRUE.equals(kakaoAccount.get("is_email_verified"));

        return new SocialIdentity(AuthProviderType.KAKAO, id, email, name, emailVerified);
    }
}
