package com.myfinance.backend.service;

import com.myfinance.backend.model.SavingGoal;
import com.myfinance.backend.repository.SavingGoalRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class SavingGoalServiceImpl implements SavingGoalService {

    private final SavingGoalRepository savingGoalRepository;

    public SavingGoalServiceImpl(SavingGoalRepository savingGoalRepository) {
        this.savingGoalRepository = savingGoalRepository;
    }

    @Override
    public List<SavingGoal> getAllSavingGoals() {
        return savingGoalRepository.findAll();
    }

    @Override
    public Optional<SavingGoal> getSavingGoalById(UUID id) {
        return savingGoalRepository.findById(id);
    }

    @Override
    public SavingGoal createSavingGoal(SavingGoal savingGoal) {
        return savingGoalRepository.save(savingGoal);
    }

    @Override
    public SavingGoal updateSavingGoal(UUID id, SavingGoal savingGoal) {
        return savingGoalRepository.findById(id)
                .map(existing -> {
                    existing.setName(savingGoal.getName());
                    existing.setTargetAmount(savingGoal.getTargetAmount());
                    existing.setCurrentAmount(savingGoal.getCurrentAmount());
                    existing.setStartDate(savingGoal.getStartDate());
                    existing.setEndDate(savingGoal.getEndDate());
                    return savingGoalRepository.save(existing);
                }).orElseThrow(() -> new IllegalArgumentException("Saving Goal not found."));
    }

    @Override
    public void deleteSavingGoal(UUID id) {
        savingGoalRepository.deleteById(id);
    }

    @Override
    public List<SavingGoal> getSavingGoalsOrderedByStartDate() {
        return savingGoalRepository.findAllByOrderByStartDateDesc();
    }

    @Override
    public List<SavingGoal> getSavingGoalsEndingBefore(LocalDate date) {
        return savingGoalRepository.findByEndDateBeforeOrderByEndDateAsc(date);
    }

    @Override
    public List<SavingGoal> getActiveSavingGoals(LocalDate date) {
        return savingGoalRepository.findByEndDateIsNullOrEndDateAfterOrderByStartDateDesc(date);
    }

    @Override
    public List<SavingGoal> getSavingGoalsWithProgressLessThan(Double amount) {
        return savingGoalRepository.findByCurrentAmountLessThanOrderByStartDateDesc(amount);
    }

    @Override
    public List<SavingGoal> searchSavingGoalsByName(String name) {
        return savingGoalRepository.findByNameIgnoreCaseContainingOrderByStartDateDesc(name);
    }
}
