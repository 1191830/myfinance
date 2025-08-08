package com.myfinance.backend.service;

import com.myfinance.backend.model.Transaction;
import com.myfinance.backend.model.TransactionType;
import com.myfinance.backend.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;

    public TransactionServiceImpl(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
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
}
