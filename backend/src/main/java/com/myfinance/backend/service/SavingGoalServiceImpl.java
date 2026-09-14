package com.myfinance.backend.service;

import com.myfinance.backend.model.SavingGoal;
import com.myfinance.backend.model.User;
import com.myfinance.backend.repository.SavingGoalRepository;
import com.myfinance.backend.repository.UserRepository;
import com.myfinance.backend.security.SecurityUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class SavingGoalServiceImpl implements SavingGoalService {

    private final SavingGoalRepository savingGoalRepository;
    private final UserRepository userRepository;

    public SavingGoalServiceImpl(SavingGoalRepository savingGoalRepository, UserRepository userRepository) {
        this.savingGoalRepository = savingGoalRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<SavingGoal> getAllSavingGoals() {
        return savingGoalRepository.findByUserIdOrderByStartDateDesc(SecurityUtils.currentUserId());
    }

    @Override
    public Optional<SavingGoal> getSavingGoalById(UUID id) {
        return savingGoalRepository.findByIdAndUserId(id, SecurityUtils.currentUserId());
    }

    @Override
    public SavingGoal createSavingGoal(SavingGoal savingGoal) {
        User user = userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> new IllegalStateException("Authenticated user no longer exists."));
        savingGoal.setUser(user);
        return savingGoalRepository.save(savingGoal);
    }

    @Override
    public SavingGoal updateSavingGoal(UUID id, SavingGoal savingGoal) {
        return savingGoalRepository.findByIdAndUserId(id, SecurityUtils.currentUserId())
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
        SavingGoal existing = savingGoalRepository.findByIdAndUserId(id, SecurityUtils.currentUserId())
                .orElseThrow(() -> new IllegalArgumentException("Saving Goal not found."));
        savingGoalRepository.delete(existing);
    }

    @Override
    public List<SavingGoal> getSavingGoalsOrderedByStartDate() {
        return savingGoalRepository.findByUserIdOrderByStartDateDesc(SecurityUtils.currentUserId());
    }

    @Override
    public List<SavingGoal> getSavingGoalsEndingBefore(LocalDate date) {
        return savingGoalRepository.findByUserIdAndEndDateBeforeOrderByEndDateAsc(
                SecurityUtils.currentUserId(), date);
    }

    @Override
    public List<SavingGoal> getActiveSavingGoals(LocalDate date) {
        return savingGoalRepository.findActiveByUserId(SecurityUtils.currentUserId(), date);
    }

    @Override
    public List<SavingGoal> getSavingGoalsWithProgressLessThan(Double amount) {
        return savingGoalRepository.findByUserIdAndCurrentAmountLessThanOrderByStartDateDesc(
                SecurityUtils.currentUserId(), amount);
    }

    @Override
    public List<SavingGoal> searchSavingGoalsByName(String name) {
        return savingGoalRepository.findByUserIdAndNameIgnoreCaseContainingOrderByStartDateDesc(
                SecurityUtils.currentUserId(), name);
    }
}
