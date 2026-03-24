package com.vibeshop.api.config;

import java.util.Locale;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.demo.seed")
public record DemoSeedProperties(
    boolean enabled,
    int targetCustomerCount,
    int targetProductsPerCategory,
    String adminEmail,
    String adminPassword,
    String adminName
) {

    public DemoSeedProperties {
        targetCustomerCount = targetCustomerCount <= 0 ? 3000 : targetCustomerCount;
        targetProductsPerCategory = targetProductsPerCategory <= 0 ? 100 : targetProductsPerCategory;
        adminEmail = adminEmail == null || adminEmail.isBlank()
            ? "admin@vibeshop.local"
            : adminEmail.trim().toLowerCase(Locale.ROOT);
        adminPassword = adminPassword == null ? "" : adminPassword;
        adminName = adminName == null || adminName.isBlank() ? "Vibe Shop Admin" : adminName.trim();
    }
}
