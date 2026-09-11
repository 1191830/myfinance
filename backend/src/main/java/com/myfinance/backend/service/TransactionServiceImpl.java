package com.myfinance.backend.service;

import com.myfinance.backend.model.RecurringTransaction;
import com.myfinance.backend.model.Transaction;
import com.myfinance.backend.model.TransactionType;
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

    public TransactionServiceImpl(TransactionRepository transactionRepository,
            RecurringTransactionRepository recurringTransactionRepository) {
        this.transactionRepository = transactionRepository;
        this.recurringTransactionRepository = recurringTransactionRepository;
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
        return transactionRepository.save(transaction);
    }

    @Override
    public Transaction updateTransaction(UUID id, Transaction transaction) {
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
