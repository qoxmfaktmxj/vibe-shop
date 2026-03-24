package com.vibeshop.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.session-cookie")
public record SessionCookieProperties(
    boolean secure,
    String sameSite
) {

    public SessionCookieProperties {
        sameSite = sameSite == null || sameSite.isBlank() ? "Lax" : sameSite.trim();
    }
}
