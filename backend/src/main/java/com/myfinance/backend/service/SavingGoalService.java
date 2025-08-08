package com.myfinance.backend.service;

import com.myfinance.backend.model.SavingGoal;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SavingGoalService {

    List<SavingGoal> getAllSavingGoals();

    Optional<SavingGoal> getSavingGoalById(UUID id);

    SavingGoal createSavingGoal(SavingGoal savingGoal);

    SavingGoal updateSavingGoal(UUID id, SavingGoal savingGoal);

    void deleteSavingGoal(UUID id);

    List<SavingGoal> getSavingGoalsOrderedByStartDate();

    List<SavingGoal> getSavingGoalsEndingBefore(LocalDate date);

    List<SavingGoal> getActiveSavingGoals(LocalDate date);

    List<SavingGoal> getSavingGoalsWithProgressLessThan(Double amount);

    List<SavingGoal> searchSavingGoalsByName(String name);
}
