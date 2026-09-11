package com.myfinance.backend.repository;

import com.myfinance.backend.model.RecurringTransaction;
import com.myfinance.backend.model.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RecurringTransactionRepository extends JpaRepository<RecurringTransaction, UUID> {

    // Find all active recurring transactions
    List<RecurringTransaction> findByActiveTrue();

    // Find by type (INCOME / EXPENSE)
    List<RecurringTransaction> findByTypeAndActiveTrue(TransactionType type);

    // Find by category
    List<RecurringTransaction> findByCategoryIdAndActiveTrue(UUID categoryId);
}
