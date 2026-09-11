package com.myfinance.backend.service;

import com.myfinance.backend.model.Settings;
import com.myfinance.backend.repository.SettingsRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class SettingsServiceImpl implements SettingsService {

    private final SettingsRepository settingsRepository;

    public SettingsServiceImpl(SettingsRepository settingsRepository) {
        this.settingsRepository = settingsRepository;
    }

    @Override
    public Settings getSettings() {
        // Single-user app: the V4 migration seeds exactly one row.
        return settingsRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new IllegalStateException("Settings row is missing."));
    }

    @Override
    public Settings updateSettings(UUID id, Settings settings) {
        return settingsRepository.findById(id)
                .map(existing -> {
                    existing.setDisplayName(settings.getDisplayName());
                    return settingsRepository.save(existing);
                }).orElseThrow(() -> new IllegalArgumentException("Settings not found."));
    }
}
