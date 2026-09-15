package com.myfinance.backend.service;

import com.myfinance.backend.model.Category;
import com.myfinance.backend.model.RecurringTransaction;
import com.myfinance.backend.model.User;
import com.myfinance.backend.repository.CategoryRepository;
import com.myfinance.backend.repository.RecurringTransactionRepository;
import com.myfinance.backend.repository.UserRepository;
import com.myfinance.backend.security.CurrentHousehold;
import com.myfinance.backend.security.SecurityUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class RecurringTransactionServiceImpl implements RecurringTransactionService {

    private final RecurringTransactionRepository recurringTransactionRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final CurrentHousehold currentHousehold;
    private final TransactionService transactionService;

    public RecurringTransactionServiceImpl(RecurringTransactionRepository recurringTransactionRepository,
            CategoryRepository categoryRepository, UserRepository userRepository,
            CurrentHousehold currentHousehold, TransactionService transactionService) {
        this.recurringTransactionRepository = recurringTransactionRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.currentHousehold = currentHousehold;
        this.transactionService = transactionService;
    }

    /**
     * See TransactionServiceImpl.resolveCategory: the category on an incoming
     * RecurringTransaction is a bare, never-loaded Jackson-deserialized instance and must be
     * re-resolved against the real row (or null) before saving. Scoped to the household.
     */
    private void resolveCategory(RecurringTransaction recurringTransaction, UUID householdId) {
        Category category = recurringTransaction.getCategory();
        if (category == null || category.getId() == null) {
            recurringTransaction.setCategory(null);
            return;
        }
        recurringTransaction.setCategory(categoryRepository.findByIdAndHouseholdId(category.getId(), householdId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found.")));
    }

    @Override
    public List<RecurringTransaction> getAllRecurringTransactions() {
        return recurringTransactionRepository.findByHouseholdId(currentHousehold.resolve());
    }

    @Override
    public Optional<RecurringTransaction> getRecurringTransactionById(UUID id) {
        return recurringTransactionRepository.findByIdAndHouseholdId(id, currentHousehold.resolve());
    }

    @Override
    public RecurringTransaction createRecurringTransaction(RecurringTransaction recurringTransaction) {
        UUID householdId = currentHousehold.resolve();
        resolveCategory(recurringTransaction, householdId);
        User user = userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> new IllegalStateException("Authenticated user no longer exists."));
        recurringTransaction.setUser(user);
        recurringTransaction.setHouseholdId(householdId);
        RecurringTransaction saved = recurringTransactionRepository.save(recurringTransaction);
        // Backfill immediately - the caller shouldn't have to visit /transactions/generate
        // separately to see a past startDate's occurrences materialize.
        transactionService.generateMonthlyTransactions();
        return saved;
    }

    @Override
    public RecurringTransaction updateRecurringTransaction(UUID id, RecurringTransaction recurringTransaction) {
        UUID householdId = currentHousehold.resolve();
        resolveCategory(recurringTransaction, householdId);
        return recurringTransactionRepository.findByIdAndHouseholdId(id, householdId)
                .map(existing -> {
                    existing.setType(recurringTransaction.getType());
                    existing.setFrequency(recurringTransaction.getFrequency());
                    existing.setRecurrenceInterval(recurringTransaction.getRecurrenceInterval());
                    existing.setCategory(recurringTransaction.getCategory());
                    existing.setAmount(recurringTransaction.getAmount());
                    existing.setStartDate(recurringTransaction.getStartDate());
                    existing.setEndDate(recurringTransaction.getEndDate());
                    existing.setActive(recurringTransaction.isActive());
                    existing.setDescription(recurringTransaction.getDescription());
                    return recurringTransactionRepository.save(existing);
                }).orElseThrow(() -> new IllegalArgumentException("Recurring transaction not found."));
    }

    @Override
    public void deleteRecurringTransaction(UUID id) {
        RecurringTransaction existing = recurringTransactionRepository
                .findByIdAndHouseholdId(id, currentHousehold.resolve())
                .orElseThrow(() -> new IllegalArgumentException("Recurring transaction not found."));
        recurringTransactionRepository.delete(existing);
    }

    @Override
    public List<RecurringTransaction> getActiveRecurringTransactions() {
        return recurringTransactionRepository.findByHouseholdIdAndActiveTrue(currentHousehold.resolve());
    }
}
