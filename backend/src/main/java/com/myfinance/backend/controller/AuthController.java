package com.myfinance.backend.controller;

import com.myfinance.backend.dto.LoginRequest;
import com.myfinance.backend.dto.LoginResponse;
import com.myfinance.backend.model.Settings;
import com.myfinance.backend.model.User;
import com.myfinance.backend.repository.SettingsRepository;
import com.myfinance.backend.repository.UserRepository;
import com.myfinance.backend.security.JwtService;
import com.myfinance.backend.security.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final SettingsRepository settingsRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UserRepository userRepository, SettingsRepository settingsRepository,
            PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.settingsRepository = settingsRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return userRepository.findByUsernameIgnoreCase(request.username())
                .filter(user -> passwordEncoder.matches(request.password(), user.getPasswordHash()))
                .map(user -> ResponseEntity.ok(toResponse(user)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    // Lets the frontend re-fetch who's logged in (and their displayName) without a fresh
    // login - e.g. after a page reload with a token already in localStorage.
    @GetMapping("/me")
    public ResponseEntity<LoginResponse> me() {
        User user = userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> new IllegalStateException("Authenticated user no longer exists."));
        return ResponseEntity.ok(toResponse(user));
    }

    private LoginResponse toResponse(User user) {
        String token = jwtService.generateToken(user.getId(), user.getUsername());
        String displayName = settingsRepository.findByUserId(user.getId())
                .map(Settings::getDisplayName)
                .orElse(user.getUsername());
        return new LoginResponse(token, user.getId(), user.getUsername(), displayName);
    }
}
