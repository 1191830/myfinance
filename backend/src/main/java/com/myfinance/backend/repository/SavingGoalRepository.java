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

    Optional<SavingGoal> findByIdAndUserId(UUID id, UUID userId);

    // Buscar todos os objetivos deste utilizador, ordenados pela data de início (mais recentes primeiro)
    List<SavingGoal> findByUserIdOrderByStartDateDesc(UUID userId);

    // Buscar objetivos que terminam antes de uma certa data (útil para metas expiradas)
    List<SavingGoal> findByUserIdAndEndDateBeforeOrderByEndDateAsc(UUID userId, LocalDate date);

    // Buscar objetivos ainda em progresso (sem data de fim ou fim no futuro) - a condição "OR"
    // exige @Query em vez de um nome derivado, para não perder o escopo por utilizador no
    // segundo ramo da condição.
    @Query("SELECT g FROM SavingGoal g WHERE g.user.id = :userId "
            + "AND (g.endDate IS NULL OR g.endDate > :date) ORDER BY g.startDate DESC")
    List<SavingGoal> findActiveByUserId(@Param("userId") UUID userId, @Param("date") LocalDate date);

    // Buscar objetivos com progresso abaixo de um certo valor
    List<SavingGoal> findByUserIdAndCurrentAmountLessThanOrderByStartDateDesc(UUID userId, Double amount);

    // Buscar objetivos pelo nome, filtro por texto ignorando maiúsculas/minúsculas
    List<SavingGoal> findByUserIdAndNameIgnoreCaseContainingOrderByStartDateDesc(UUID userId, String name);
}
