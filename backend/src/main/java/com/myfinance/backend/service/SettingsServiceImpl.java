package com.myfinance.backend.service;

import com.myfinance.backend.model.Settings;
import com.myfinance.backend.model.User;
import com.myfinance.backend.repository.SettingsRepository;
import com.myfinance.backend.repository.UserRepository;
import com.myfinance.backend.security.SecurityUtils;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class SettingsServiceImpl implements SettingsService {

    private final SettingsRepository settingsRepository;
    private final UserRepository userRepository;

    public SettingsServiceImpl(SettingsRepository settingsRepository, UserRepository userRepository) {
        this.settingsRepository = settingsRepository;
        this.userRepository = userRepository;
    }

    @Override
    public Settings getSettings() {
        UUID userId = SecurityUtils.currentUserId();
        return settingsRepository.findByUserId(userId).orElseGet(() -> {
            // Admin-created users have no settings row until their first visit here -
            // lazily provision one instead of requiring a separate seeding step.
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalStateException("Authenticated user no longer exists."));
            Settings settings = new Settings();
            settings.setUser(user);
            settings.setDisplayName(user.getUsername());
            return settingsRepository.save(settings);
        });
    }

    @Override
    public Settings updateSettings(UUID id, Settings settings) {
        Settings existing = settingsRepository.findByUserId(SecurityUtils.currentUserId())
                .orElseThrow(() -> new IllegalArgumentException("Settings not found."));
        if (!existing.getId().equals(id)) {
            throw new IllegalArgumentException("Settings not found.");
        }
        existing.setDisplayName(settings.getDisplayName());
        return settingsRepository.save(existing);
    }
}
