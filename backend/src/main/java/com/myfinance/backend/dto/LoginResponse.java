package com.myfinance.backend.dto;

import java.util.UUID;

public record LoginResponse(String token, UUID userId, String username, String displayName,
        boolean mustChangePassword) {
}
