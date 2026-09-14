package com.myfinance.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Single source of CORS config for the API. Allowed origins come from the ALLOWED_ORIGINS
 * env var (comma-separated) so a deployed frontend's origin can be added without a code
 * change; defaults to the Vite dev server, reachable as both localhost and 127.0.0.1 (Node
 * binds IPv4 loopback).
 */
@Configuration
public class WebCorsConfig implements WebMvcConfigurer {

    private final String[] allowedOrigins;

    public WebCorsConfig(@Value("${app.cors.allowed-origins}") String allowedOrigins) {
        this.allowedOrigins = allowedOrigins.split("\\s*,\\s*");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
