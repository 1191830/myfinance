package com.myfinance.backend.repository;

import com.myfinance.backend.model.Transaction;
import com.myfinance.backend.model.TransactionType;
import com.myfinance.backend.model.TransactionFrequency;
import com.myfinance.backend.model.RecurringTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    // Buscar transações por tipo (INCOME ou EXPENSE)
    List<Transaction> findByTypeOrderByDateDesc(TransactionType type);

    // Buscar transações por categoria
    List<Transaction> findByCategoryIdOrderByDateDesc(UUID categoryId);

    // Buscar transações por intervalo de datas
    List<Transaction> findByDateBetweenOrderByDateDesc(LocalDate startDate, LocalDate endDate);

    // Buscar transações frequentes (recorrentes)
    List<Transaction> findByFrequencyOrderByDateDesc(String frequency);

    // Buscar transações por descrição contendo texto (case insensitive)
    List<Transaction> findByDescriptionIgnoreCaseContainingOrderByDateDesc(String description);

    // Buscar transações geradas a partir de um template recorrente específico
    List<Transaction> findByRecurringTransactionOrderByDateDesc(RecurringTransaction recurringTransaction);

    // Idempotência do gerador: já existe uma transação deste template neste período?
    boolean existsByRecurringTransactionAndDateBetween(RecurringTransaction recurringTransaction,
            LocalDate start, LocalDate end);
}
