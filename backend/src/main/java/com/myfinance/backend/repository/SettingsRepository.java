package com.myfinance.backend.repository;

import com.myfinance.backend.model.Settings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SettingsRepository extends JpaRepository<Settings, UUID> {

    Optional<Settings> findByUserId(UUID userId);
}
