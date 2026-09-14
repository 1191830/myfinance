package com.myfinance.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
        @NotBlank(message = "A palavra-passe atual é obrigatória") String currentPassword,
        @NotBlank(message = "A nova palavra-passe é obrigatória")
        @Size(min = 8, message = "A nova palavra-passe deve ter pelo menos 8 carateres")
        String newPassword) {
}
