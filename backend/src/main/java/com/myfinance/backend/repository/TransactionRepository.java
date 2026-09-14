package com.myfinance.backend.repository;

import com.myfinance.backend.model.Transaction;
import com.myfinance.backend.model.TransactionType;
import com.myfinance.backend.model.RecurringTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    Optional<Transaction> findByIdAndUserId(UUID id, UUID userId);

    // Buscar transações deste utilizador, mais recentes primeiro
    List<Transaction> findByUserIdOrderByDateDesc(UUID userId);

    // Buscar transações por tipo (INCOME ou EXPENSE)
    List<Transaction> findByUserIdAndTypeOrderByDateDesc(UUID userId, TransactionType type);

    // Buscar transações por categoria
    List<Transaction> findByUserIdAndCategoryIdOrderByDateDesc(UUID userId, UUID categoryId);

    // Buscar transações por intervalo de datas
    List<Transaction> findByUserIdAndDateBetweenOrderByDateDesc(UUID userId, LocalDate startDate, LocalDate endDate);

    // Buscar transações frequentes (recorrentes)
    List<Transaction> findByUserIdAndFrequencyOrderByDateDesc(UUID userId, String frequency);

    // Buscar transações por descrição contendo texto (case insensitive)
    List<Transaction> findByUserIdAndDescriptionIgnoreCaseContainingOrderByDateDesc(UUID userId, String description);

    // Idempotência do gerador: já existe uma transação deste template neste período? O
    // template já pertence a um utilizador, por isso não precisa de escopo adicional aqui.
    boolean existsByRecurringTransactionAndDateBetween(RecurringTransaction recurringTransaction,
            LocalDate start, LocalDate end);
}
