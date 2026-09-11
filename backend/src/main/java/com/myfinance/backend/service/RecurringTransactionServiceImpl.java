package com.myfinance.backend.service;

import com.myfinance.backend.model.RecurringTransaction;
import com.myfinance.backend.repository.RecurringTransactionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class RecurringTransactionServiceImpl implements RecurringTransactionService {

    private final RecurringTransactionRepository recurringTransactionRepository;

    public RecurringTransactionServiceImpl(RecurringTransactionRepository recurringTransactionRepository) {
        this.recurringTransactionRepository = recurringTransactionRepository;
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
        return recurringTransactionRepository.save(recurringTransaction);
    }

    @Override
    public RecurringTransaction updateRecurringTransaction(UUID id, RecurringTransaction recurringTransaction) {
        return recurringTransactionRepository.findById(id)
                .map(existing -> {
                    existing.setType(recurringTransaction.getType());
                    existing.setFrequency(recurringTransaction.getFrequency());
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
