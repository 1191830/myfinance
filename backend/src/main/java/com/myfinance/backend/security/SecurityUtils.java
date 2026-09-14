package com.myfinance.backend.security;

import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

/**
 * The JWT filter puts the authenticated user's id (a bare UUID, no Spring UserDetails
 * involved) as the Authentication principal - this reads it back out for use in every
 * service that needs to scope a query to "the current user".
 */
public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static UUID currentUserId() {
        return (UUID) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
