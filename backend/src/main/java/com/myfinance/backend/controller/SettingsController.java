package com.myfinance.backend.controller;

import com.myfinance.backend.model.Settings;
import com.myfinance.backend.service.SettingsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final SettingsService settingsService;

    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    // GET the single settings row
    @GetMapping
    public ResponseEntity<Settings> getSettings() {
        return ResponseEntity.ok(settingsService.getSettings());
    }

    // PUT update the settings row
    @PutMapping("/{id}")
    public ResponseEntity<Settings> updateSettings(@PathVariable UUID id, @Valid @RequestBody Settings settings) {
        try {
            return ResponseEntity.ok(settingsService.updateSettings(id, settings));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
