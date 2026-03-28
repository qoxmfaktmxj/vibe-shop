package com.vibeshop.api.config;

import java.util.List;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    CorsFilter corsFilter(
        @Value("${app.cors.allowed-origins:http://localhost:3000,http://127.0.0.1:3000,http://localhost:4100,http://127.0.0.1:4100}") List<String> allowedOrigins
    ) {
        CorsConfiguration configuration = new CorsConfiguration();
        Stream.concat(
            Stream.of(
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "http://localhost:4100",
                "http://127.0.0.1:4100"
            ),
            allowedOrigins.stream().map(String::trim).filter(origin -> !origin.isEmpty())
        )
            .distinct()
            .forEach(configuration::addAllowedOrigin);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return new CorsFilter(source);
    }
}
