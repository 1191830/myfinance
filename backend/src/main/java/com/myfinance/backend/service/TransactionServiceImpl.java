package com.myfinance.backend.service;

import com.myfinance.backend.model.Category;
import com.myfinance.backend.model.RecurringTransaction;
import com.myfinance.backend.model.Transaction;
import com.myfinance.backend.model.TransactionType;
import com.myfinance.backend.model.User;
import com.myfinance.backend.repository.CategoryRepository;
import com.myfinance.backend.repository.RecurringTransactionRepository;
import com.myfinance.backend.repository.TransactionRepository;
import com.myfinance.backend.repository.UserRepository;
import com.myfinance.backend.security.CurrentHousehold;
import com.myfinance.backend.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final RecurringTransactionRepository recurringTransactionRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final CurrentHousehold currentHousehold;
    private final Clock clock;

    public TransactionServiceImpl(TransactionRepository transactionRepository,
            RecurringTransactionRepository recurringTransactionRepository,
            CategoryRepository categoryRepository, UserRepository userRepository,
            CurrentHousehold currentHousehold, Clock clock) {
        this.transactionRepository = transactionRepository;
        this.recurringTransactionRepository = recurringTransactionRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.currentHousehold = currentHousehold;
        this.clock = clock;
    }

    /**
     * The category on an incoming Transaction is whatever Jackson deserialized from the
     * request body - a bare, never-loaded Category instance. Hibernate can't tell that
     * apart from a genuinely transient row (UUID ids have no "unsaved-value" signal) and
     * refuses to flush it as a foreign key, so re-resolve it against the real row (or null)
     * before saving. Scoped to the household - either person can post against either
     * person's categories, since categories are shared too.
     */
    private void resolveCategory(Transaction transaction, UUID householdId) {
        Category category = transaction.getCategory();
        if (category == null || category.getId() == null) {
            transaction.setCategory(null);
            return;
        }
        transaction.setCategory(categoryRepository.findByIdAndHouseholdId(category.getId(), householdId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found.")));
    }

    @Override
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findByHouseholdIdOrderByDateDesc(currentHousehold.resolve());
    }

    @Override
    public Optional<Transaction> getTransactionById(UUID id) {
        return transactionRepository.findByIdAndHouseholdId(id, currentHousehold.resolve());
    }

    @Override
    public Transaction createTransaction(Transaction transaction) {
        UUID householdId = currentHousehold.resolve();
        resolveCategory(transaction, householdId);
        User user = userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> new IllegalStateException("Authenticated user no longer exists."));
        transaction.setUser(user);
        transaction.setHouseholdId(householdId);
        return transactionRepository.save(transaction);
    }

    @Override
    public Transaction updateTransaction(UUID id, Transaction transaction) {
        UUID householdId = currentHousehold.resolve();
        resolveCategory(transaction, householdId);
        return transactionRepository.findByIdAndHouseholdId(id, householdId)
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
        Transaction existing = transactionRepository.findByIdAndHouseholdId(id, currentHousehold.resolve())
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found."));
        transactionRepository.delete(existing);
    }

    @Override
    public List<Transaction> getTransactionsByCategoryId(UUID categoryId) {
        return transactionRepository.findByHouseholdIdAndCategoryIdOrderByDateDesc(
                currentHousehold.resolve(), categoryId);
    }

    @Override
    public List<Transaction> getTransactionsByType(TransactionType type) {
        return transactionRepository.findByHouseholdIdAndTypeOrderByDateDesc(currentHousehold.resolve(), type);
    }

    @Override
    public List<Transaction> getTransactionsByDateRange(LocalDate startDate, LocalDate endDate) {
        return transactionRepository.findByHouseholdIdAndDateBetweenOrderByDateDesc(
                currentHousehold.resolve(), startDate, endDate);
    }

    @Override
    public List<Transaction> getTransactionsByFrequency(String frequency) {
        return transactionRepository.findByHouseholdIdAndFrequencyOrderByDateDesc(
                currentHousehold.resolve(), frequency);
    }

    @Override
    public List<Transaction> getTransactionsByDescription(String description) {
        return transactionRepository.findByHouseholdIdAndDescriptionIgnoreCaseContainingOrderByDateDesc(
                currentHousehold.resolve(), description);
    }

    @Override
    @Transactional
    public int generateMonthlyTransactions() {
        List<RecurringTransaction> activeRecurring =
                recurringTransactionRepository.findByHouseholdIdAndActiveTrue(currentHousehold.resolve());
        return generateFor(activeRecurring);
    }

    @Override
    @Transactional
    public int generateMonthlyTransactionsForAllUsers() {
        List<RecurringTransaction> activeRecurring = recurringTransactionRepository.findByActiveTrue();
        return generateFor(activeRecurring);
    }

    /**
     * Materializes every due occurrence, for every given active recurring template, from its
     * startDate up to today - interval-aware (monthly/quarterly/yearly), idempotent per
     * template per period (the transactions table is the source of truth, no separate
     * "last generated" state), bounded by endDate, and never generates into the future.
     * Also doubles as catch-up: if this hasn't run in a while, every missed period in
     * between gets materialized on the next call. Each generated Transaction inherits its
     * owner and household from the template, not from "the current user" - the scheduler
     * that calls the all-users variant has no current user at all.
     */
    private int generateFor(List<RecurringTransaction> activeRecurring) {
        LocalDate today = LocalDate.now(clock);
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
                    t.setUser(template.getUser());
                    t.setHouseholdId(template.getHouseholdId());
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
