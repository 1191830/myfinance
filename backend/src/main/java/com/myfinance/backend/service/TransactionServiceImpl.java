package com.myfinance.backend.service;

import com.myfinance.backend.model.Category;
import com.myfinance.backend.model.RecurringTransaction;
import com.myfinance.backend.model.Transaction;
import com.myfinance.backend.model.TransactionType;
import com.myfinance.backend.repository.CategoryRepository;
import com.myfinance.backend.repository.RecurringTransactionRepository;
import com.myfinance.backend.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final RecurringTransactionRepository recurringTransactionRepository;
    private final CategoryRepository categoryRepository;

    public TransactionServiceImpl(TransactionRepository transactionRepository,
            RecurringTransactionRepository recurringTransactionRepository,
            CategoryRepository categoryRepository) {
        this.transactionRepository = transactionRepository;
        this.recurringTransactionRepository = recurringTransactionRepository;
        this.categoryRepository = categoryRepository;
    }

    /**
     * The category on an incoming Transaction is whatever Jackson deserialized from the
     * request body - a bare, never-loaded Category instance. Hibernate can't tell that
     * apart from a genuinely transient row (UUID ids have no "unsaved-value" signal) and
     * refuses to flush it as a foreign key, so re-resolve it against the real row (or null)
     * before saving.
     */
    private void resolveCategory(Transaction transaction) {
        Category category = transaction.getCategory();
        if (category == null || category.getId() == null) {
            transaction.setCategory(null);
            return;
        }
        transaction.setCategory(categoryRepository.findById(category.getId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found.")));
    }

    @Override
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    @Override
    public Optional<Transaction> getTransactionById(UUID id) {
        return transactionRepository.findById(id);
    }

    @Override
    public Transaction createTransaction(Transaction transaction) {
        resolveCategory(transaction);
        return transactionRepository.save(transaction);
    }

    @Override
    public Transaction updateTransaction(UUID id, Transaction transaction) {
        resolveCategory(transaction);
        return transactionRepository.findById(id)
                .map(existing -> {
                    existing.setType(transaction.getType());
                    existing.setFrequency(transaction.getFrequency());
                    existing.setCategory(transaction.getCategory());
                    existing.setAmount(transaction.getAmount());
                    existing.setDate(transaction.getDate());
                    existing.setDescription(transaction.getDescription());
                    return transactionRepository.save(existing);
                }).orElseThrow(() -> new IllegalArgumentException("Transaction not found."));
    }

    @Override
    public void deleteTransaction(UUID id) {
        transactionRepository.deleteById(id);
    }

    @Override
    public List<Transaction> getTransactionsByCategoryId(UUID categoryId) {
        return transactionRepository.findByCategoryIdOrderByDateDesc(categoryId);
    }

    @Override
    public List<Transaction> getTransactionsByType(TransactionType type) {
        return transactionRepository.findByTypeOrderByDateDesc(type);
    }

    @Override
    public List<Transaction> getTransactionsByDateRange(LocalDate startDate, LocalDate endDate) {
        return transactionRepository.findByDateBetweenOrderByDateDesc(startDate, endDate);
    }

    @Override
    public List<Transaction> getTransactionsByFrequency(String frequency) {
        return transactionRepository.findByFrequencyOrderByDateDesc(frequency);
    }

    @Override
    public List<Transaction> getTransactionsByDescription(String description) {
        return transactionRepository.findByDescriptionIgnoreCaseContainingOrderByDateDesc(description);
    }

    /**
     * Materializes every due occurrence, for every active recurring template, from its
     * startDate up to today - interval-aware (monthly/quarterly/yearly), idempotent per
     * template per period (the transactions table is the source of truth, no separate
     * "last generated" state), bounded by endDate, and never generates into the future.
     * Also doubles as catch-up: if this hasn't run in a while, every missed period in
     * between gets materialized on the next call.
     */
    @Override
    @Transactional
    public int generateMonthlyTransactions() {
        LocalDate today = LocalDate.now();
        List<RecurringTransaction> activeRecurring = recurringTransactionRepository.findByActiveTrue();
        int created = 0;

        for (RecurringTransaction template : activeRecurring) {
            if (template.getStartDate() == null) {
                continue;
            }

            int monthsStep = switch (template.getRecurrenceInterval()) {
                case MONTHLY -> 1;
                case QUARTERLY -> 3;
                case YEARLY -> 12;
            };

            LocalDate periodAnchor = template.getStartDate();
            while (!periodAnchor.isAfter(today)) {
                if (template.getEndDate() != null && periodAnchor.isAfter(template.getEndDate())) {
                    break;
                }

                int day = Math.min(template.getStartDate().getDayOfMonth(), periodAnchor.lengthOfMonth());
                LocalDate occurrenceDate = periodAnchor.withDayOfMonth(day);
                LocalDate monthStart = periodAnchor.withDayOfMonth(1);
                LocalDate monthEnd = periodAnchor.withDayOfMonth(periodAnchor.lengthOfMonth());

                boolean exists = transactionRepository.existsByRecurringTransactionAndDateBetween(
                        template, monthStart, monthEnd);

                if (!exists) {
                    Transaction t = new Transaction();
                    t.setRecurringTransaction(template);
                    t.setType(template.getType());
                    t.setFrequency(template.getFrequency());
                    t.setCategory(template.getCategory());
                    t.setAmount(template.getAmount());
                    t.setDate(occurrenceDate);
                    t.setDescription(template.getDescription());
                    transactionRepository.save(t);
                    created++;
                }

                periodAnchor = periodAnchor.plusMonths(monthsStep);
            }
        }
        return created;
    }
}
