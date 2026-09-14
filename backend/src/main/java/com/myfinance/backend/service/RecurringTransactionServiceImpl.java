package com.myfinance.backend.service;

import com.myfinance.backend.model.Category;
import com.myfinance.backend.model.RecurringTransaction;
import com.myfinance.backend.model.User;
import com.myfinance.backend.repository.CategoryRepository;
import com.myfinance.backend.repository.RecurringTransactionRepository;
import com.myfinance.backend.repository.UserRepository;
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
    private final TransactionService transactionService;

    public RecurringTransactionServiceImpl(RecurringTransactionRepository recurringTransactionRepository,
            CategoryRepository categoryRepository, UserRepository userRepository,
            TransactionService transactionService) {
        this.recurringTransactionRepository = recurringTransactionRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.transactionService = transactionService;
    }

    /**
     * See TransactionServiceImpl.resolveCategory: the category on an incoming
     * RecurringTransaction is a bare, never-loaded Jackson-deserialized instance and must be
     * re-resolved against the real row (or null) before saving. Scoped to the current user.
     */
    private void resolveCategory(RecurringTransaction recurringTransaction, UUID userId) {
        Category category = recurringTransaction.getCategory();
        if (category == null || category.getId() == null) {
            recurringTransaction.setCategory(null);
            return;
        }
        recurringTransaction.setCategory(categoryRepository.findByIdAndUserId(category.getId(), userId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found.")));
    }

    @Override
    public List<RecurringTransaction> getAllRecurringTransactions() {
        return recurringTransactionRepository.findByUserId(SecurityUtils.currentUserId());
    }

    @Override
    public Optional<RecurringTransaction> getRecurringTransactionById(UUID id) {
        return recurringTransactionRepository.findByIdAndUserId(id, SecurityUtils.currentUserId());
    }

    @Override
    public RecurringTransaction createRecurringTransaction(RecurringTransaction recurringTransaction) {
        UUID userId = SecurityUtils.currentUserId();
        resolveCategory(recurringTransaction, userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("Authenticated user no longer exists."));
        recurringTransaction.setUser(user);
        RecurringTransaction saved = recurringTransactionRepository.save(recurringTransaction);
        // Backfill immediately - the caller shouldn't have to visit /transactions/generate
        // separately to see a past startDate's occurrences materialize.
        transactionService.generateMonthlyTransactions();
        return saved;
    }

    @Override
    public RecurringTransaction updateRecurringTransaction(UUID id, RecurringTransaction recurringTransaction) {
        UUID userId = SecurityUtils.currentUserId();
        resolveCategory(recurringTransaction, userId);
        return recurringTransactionRepository.findByIdAndUserId(id, userId)
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
                .findByIdAndUserId(id, SecurityUtils.currentUserId())
                .orElseThrow(() -> new IllegalArgumentException("Recurring transaction not found."));
        recurringTransactionRepository.delete(existing);
    }

    @Override
    public List<RecurringTransaction> getActiveRecurringTransactions() {
        return recurringTransactionRepository.findByUserIdAndActiveTrue(SecurityUtils.currentUserId());
    }
}
