package com.myfinance.backend.repository;

import com.myfinance.backend.model.SavingGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SavingGoalRepository extends JpaRepository<SavingGoal, UUID> {

    Optional<SavingGoal> findByIdAndHouseholdId(UUID id, UUID householdId);

    // Buscar todos os objetivos deste agregado familiar, ordenados pela data de início (mais recentes primeiro)
    List<SavingGoal> findByHouseholdIdOrderByStartDateDesc(UUID householdId);

    // Buscar objetivos que terminam antes de uma certa data (útil para metas expiradas)
    List<SavingGoal> findByHouseholdIdAndEndDateBeforeOrderByEndDateAsc(UUID householdId, LocalDate date);

    // Buscar objetivos ainda em progresso (sem data de fim ou fim no futuro) - a condição "OR"
    // exige @Query em vez de um nome derivado, para não perder o escopo por agregado familiar
    // no segundo ramo da condição.
    @Query("SELECT g FROM SavingGoal g WHERE g.householdId = :householdId "
            + "AND (g.endDate IS NULL OR g.endDate > :date) ORDER BY g.startDate DESC")
    List<SavingGoal> findActiveByHouseholdId(@Param("householdId") UUID householdId, @Param("date") LocalDate date);

    // Buscar objetivos com progresso abaixo de um certo valor
    List<SavingGoal> findByHouseholdIdAndCurrentAmountLessThanOrderByStartDateDesc(
            UUID householdId, Double amount);

    // Buscar objetivos pelo nome, filtro por texto ignorando maiúsculas/minúsculas
    List<SavingGoal> findByHouseholdIdAndNameIgnoreCaseContainingOrderByStartDateDesc(
            UUID householdId, String name);
}
