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

    Optional<Transaction> findByIdAndHouseholdId(UUID id, UUID householdId);

    // Buscar transações deste agregado familiar, mais recentes primeiro
    List<Transaction> findByHouseholdIdOrderByDateDesc(UUID householdId);

    // Buscar transações por tipo (INCOME ou EXPENSE)
    List<Transaction> findByHouseholdIdAndTypeOrderByDateDesc(UUID householdId, TransactionType type);

    // Buscar transações por categoria
    List<Transaction> findByHouseholdIdAndCategoryIdOrderByDateDesc(UUID householdId, UUID categoryId);

    // Buscar transações por intervalo de datas
    List<Transaction> findByHouseholdIdAndDateBetweenOrderByDateDesc(
            UUID householdId, LocalDate startDate, LocalDate endDate);

    // Buscar transações frequentes (recorrentes)
    List<Transaction> findByHouseholdIdAndFrequencyOrderByDateDesc(UUID householdId, String frequency);

    // Buscar transações por descrição contendo texto (case insensitive)
    List<Transaction> findByHouseholdIdAndDescriptionIgnoreCaseContainingOrderByDateDesc(
            UUID householdId, String description);

    // Idempotência do gerador: já existe uma transação deste template neste período? O
    // template já pertence a um agregado familiar, por isso não precisa de escopo adicional aqui.
    boolean existsByRecurringTransactionAndDateBetween(RecurringTransaction recurringTransaction,
            LocalDate start, LocalDate end);
}
