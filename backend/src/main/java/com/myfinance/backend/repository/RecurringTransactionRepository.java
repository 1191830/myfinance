package com.myfinance.backend.repository;

import com.myfinance.backend.model.RecurringTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RecurringTransactionRepository extends JpaRepository<RecurringTransaction, UUID> {

    Optional<RecurringTransaction> findByIdAndHouseholdId(UUID id, UUID householdId);

    List<RecurringTransaction> findByHouseholdId(UUID householdId);

    // Scoped to one household - used by the manual "generate" endpoint and template listings.
    List<RecurringTransaction> findByHouseholdIdAndActiveTrue(UUID householdId);

    // Unscoped, all households - used only by the daily scheduler, which has no "current user".
    List<RecurringTransaction> findByActiveTrue();
}
