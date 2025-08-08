package com.myfinance.backend.repository;

import com.myfinance.backend.model.SavingGoal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface SavingGoalRepository extends JpaRepository<SavingGoal, UUID> {

    // Buscar todos os objetivos ordenados pela data de início (mais recentes primeiro)
    List<SavingGoal> findAllByOrderByStartDateDesc();

    // Buscar objetivos que terminam antes de uma certa data (útil para metas expiradas)
    List<SavingGoal> findByEndDateBeforeOrderByEndDateAsc(LocalDate date);

    // Buscar objetivos que ainda estão em progresso (sem data de fim ou fim no futuro)
    List<SavingGoal> findByEndDateIsNullOrEndDateAfterOrderByStartDateDesc(LocalDate date);

    // Buscar objetivos com progresso abaixo de um certo valor (em percentagem ou valor absoluto)
    List<SavingGoal> findByCurrentAmountLessThanOrderByStartDateDesc(Double amount);

    // Buscar objetivos pelo nome, filtro por texto ignorando maiúsculas/minúsculas
    List<SavingGoal> findByNameIgnoreCaseContainingOrderByStartDateDesc(String name);
}
