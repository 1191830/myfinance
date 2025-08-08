package com.myfinance.backend.service;

import com.myfinance.backend.model.Transaction;
import com.myfinance.backend.model.TransactionType;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TransactionService {

    List<Transaction> getAllTransactions();

    Optional<Transaction> getTransactionById(UUID id);

    Transaction createTransaction(Transaction transaction);

    Transaction updateTransaction(UUID id, Transaction transaction);

    void deleteTransaction(UUID id);

    List<Transaction> getTransactionsByCategoryId(UUID categoryId);

    List<Transaction> getTransactionsByType(TransactionType type);

    List<Transaction> getTransactionsByDateRange(LocalDate startDate, LocalDate endDate);

    List<Transaction> getTransactionsByFrequency(String frequency);

    List<Transaction> getTransactionsByDescription(String description);
}
