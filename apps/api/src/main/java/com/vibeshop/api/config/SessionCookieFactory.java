package com.vibeshop.api.config;

import java.time.Duration;

import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public class SessionCookieFactory {

    private final SessionCookieProperties properties;

    public SessionCookieFactory(SessionCookieProperties properties) {
        this.properties = properties;
    }

    public String create(String cookieName, String value, Duration maxAge) {
        return ResponseCookie.from(cookieName, value)
            .httpOnly(true)
            .secure(properties.secure())
            .sameSite(properties.sameSite())
            .path("/")
            .maxAge(maxAge)
            .build()
            .toString();
    }

    public String clear(String cookieName) {
        return create(cookieName, "", Duration.ZERO);
    }
}
