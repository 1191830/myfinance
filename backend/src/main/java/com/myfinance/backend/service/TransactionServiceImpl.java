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
     * Generate transactions for the current month based on active recurring
     * templates.
     */
    @Override
    @Transactional
    public int generateMonthlyTransactions() {
        LocalDate now = LocalDate.now();
        List<RecurringTransaction> activeRecurring = recurringTransactionRepository.findByActiveTrue();
        int created = 0;

        for (RecurringTransaction template : activeRecurring) {
            // Skip if the template has not started yet or its end date has passed
            if (template.getStartDate() != null && now.isBefore(template.getStartDate()))
                continue;
            if (template.getEndDate() != null && now.isAfter(template.getEndDate()))
                continue;

            // Check if a transaction already exists for this month
            boolean exists = transactionRepository.findByDateBetweenOrderByDateDesc(
                    now.withDayOfMonth(1),
                    now.withDayOfMonth(now.lengthOfMonth())).stream()
                    .anyMatch(t -> t.getRecurringTransaction() != null
                            && t.getRecurringTransaction().getId().equals(template.getId()));

            if (!exists) {
                int day = Math.min(template.getStartDate().getDayOfMonth(), now.lengthOfMonth());
                Transaction t = new Transaction();
                t.setRecurringTransaction(template);
                t.setType(template.getType());
                t.setFrequency(template.getFrequency());
                t.setCategory(template.getCategory());
                t.setAmount(template.getAmount());
                t.setDate(now.withDayOfMonth(day));
                t.setDescription(template.getDescription());
                transactionRepository.save(t);
                created++;
            }
        }
        return created;
    }
}
