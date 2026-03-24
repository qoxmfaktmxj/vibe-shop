package com.vibeshop.api.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;

import org.junit.jupiter.api.Test;

class SessionCookieFactoryTest {

    @Test
    void createsCookieWithConfiguredSecurityAttributes() {
        SessionCookieFactory factory = new SessionCookieFactory(
            new SessionCookieProperties(true, "None")
        );

        String cookie = factory.create("vibe_shop_session", "token", Duration.ofDays(30));

        assertThat(cookie)
            .contains("vibe_shop_session=token")
            .contains("HttpOnly")
            .contains("Secure")
            .contains("SameSite=None")
            .contains("Path=/");
    }

    @Test
    void clearsCookieWithZeroMaxAge() {
        SessionCookieFactory factory = new SessionCookieFactory(
            new SessionCookieProperties(false, "Lax")
        );

        String cookie = factory.clear("vibe_shop_session");

        assertThat(cookie)
            .contains("vibe_shop_session=")
            .contains("Max-Age=0")
            .contains("SameSite=Lax");
    }
}
