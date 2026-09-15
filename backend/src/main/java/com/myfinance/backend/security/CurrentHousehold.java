package com.myfinance.backend.security;

import com.myfinance.backend.repository.UserRepository;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Resolves the authenticated user's household id on demand. Not embedded in the JWT - a
 * plain lookup keeps household moves effective immediately, at the cost of one indexed PK
 * read per call, which is negligible at this scale.
 */
@Component
public class CurrentHousehold {

    private final UserRepository userRepository;

    public CurrentHousehold(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UUID resolve() {
        return userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> new IllegalStateException("Authenticated user no longer exists."))
                .getHouseholdId();
    }
}
