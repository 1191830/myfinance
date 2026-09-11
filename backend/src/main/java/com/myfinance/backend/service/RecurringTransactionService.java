package com.myfinance.backend.service;

import com.myfinance.backend.model.RecurringTransaction;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RecurringTransactionService {

    List<RecurringTransaction> getAllRecurringTransactions();

    Optional<RecurringTransaction> getRecurringTransactionById(UUID id);

    RecurringTransaction createRecurringTransaction(RecurringTransaction recurringTransaction);

    RecurringTransaction updateRecurringTransaction(UUID id, RecurringTransaction recurringTransaction);

    void deleteRecurringTransaction(UUID id);

    List<RecurringTransaction> getActiveRecurringTransactions();
}
