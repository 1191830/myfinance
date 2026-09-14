package com.myfinance.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "O nome de utilizador é obrigatório") String username,
        @NotBlank(message = "A palavra-passe é obrigatória") String password) {
}
