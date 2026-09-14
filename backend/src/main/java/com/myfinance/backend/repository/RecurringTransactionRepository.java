package com.myfinance.backend.repository;

import com.myfinance.backend.model.RecurringTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RecurringTransactionRepository extends JpaRepository<RecurringTransaction, UUID> {

    Optional<RecurringTransaction> findByIdAndUserId(UUID id, UUID userId);

    List<RecurringTransaction> findByUserId(UUID userId);

    // Scoped to one user - used by the manual "generate" endpoint and template listings.
    List<RecurringTransaction> findByUserIdAndActiveTrue(UUID userId);

    // Unscoped, all users - used only by the daily scheduler, which has no "current user".
    List<RecurringTransaction> findByActiveTrue();
}
