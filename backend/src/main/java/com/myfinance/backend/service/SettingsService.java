package com.myfinance.backend.service;

import com.myfinance.backend.model.Settings;

import java.util.UUID;

public interface SettingsService {

    Settings getSettings();

    Settings updateSettings(UUID id, Settings settings);
}
