package com.vibeshop.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.demo.seed")
public record DemoSeedProperties(
    boolean enabled,
    int targetCustomerCount,
    int targetProductsPerCategory
) {

    public DemoSeedProperties {
        targetCustomerCount = targetCustomerCount <= 0 ? 3000 : targetCustomerCount;
        targetProductsPerCategory = targetProductsPerCategory <= 0 ? 100 : targetProductsPerCategory;
    }
}
