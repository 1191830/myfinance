package com.myfinance.backend.service;

import com.myfinance.backend.model.Category;
import com.myfinance.backend.model.RecurringTransaction;
import com.myfinance.backend.repository.CategoryRepository;
import com.myfinance.backend.repository.RecurringTransactionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class RecurringTransactionServiceImpl implements RecurringTransactionService {

    private final RecurringTransactionRepository recurringTransactionRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionService transactionService;

    public RecurringTransactionServiceImpl(RecurringTransactionRepository recurringTransactionRepository,
            CategoryRepository categoryRepository, TransactionService transactionService) {
        this.recurringTransactionRepository = recurringTransactionRepository;
        this.categoryRepository = categoryRepository;
        this.transactionService = transactionService;
    }

    /**
     * See TransactionServiceImpl.resolveCategory: the category on an incoming
     * RecurringTransaction is a bare, never-loaded Jackson-deserialized instance and must be
     * re-resolved against the real row (or null) before saving.
     */
    private void resolveCategory(RecurringTransaction recurringTransaction) {
        Category category = recurringTransaction.getCategory();
        if (category == null || category.getId() == null) {
            recurringTransaction.setCategory(null);
            return;
        }
        recurringTransaction.setCategory(categoryRepository.findById(category.getId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found.")));
    }

    @Override
    public List<RecurringTransaction> getAllRecurringTransactions() {
        return recurringTransactionRepository.findAll();
    }

    @Override
    public Optional<RecurringTransaction> getRecurringTransactionById(UUID id) {
        return recurringTransactionRepository.findById(id);
    }

    @Override
    public RecurringTransaction createRecurringTransaction(RecurringTransaction recurringTransaction) {
        resolveCategory(recurringTransaction);
        RecurringTransaction saved = recurringTransactionRepository.save(recurringTransaction);
        // Backfill immediately - the caller shouldn't have to visit /transactions/generate
        // separately to see a past startDate's occurrences materialize.
        transactionService.generateMonthlyTransactions();
        return saved;
    }

    @Override
    public RecurringTransaction updateRecurringTransaction(UUID id, RecurringTransaction recurringTransaction) {
        resolveCategory(recurringTransaction);
        return recurringTransactionRepository.findById(id)
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
        recurringTransactionRepository.deleteById(id);
    }

    @Override
    public List<RecurringTransaction> getActiveRecurringTransactions() {
        return recurringTransactionRepository.findByActiveTrue();
    }
}
