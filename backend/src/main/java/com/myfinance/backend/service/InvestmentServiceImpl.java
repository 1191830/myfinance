package com.myfinance.backend.service;

import com.myfinance.backend.model.Investment;
import com.myfinance.backend.model.User;
import com.myfinance.backend.repository.InvestmentRepository;
import com.myfinance.backend.repository.UserRepository;
import com.myfinance.backend.security.CurrentHousehold;
import com.myfinance.backend.security.SecurityUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class InvestmentServiceImpl implements InvestmentService {

    private final InvestmentRepository investmentRepository;
    private final UserRepository userRepository;
    private final CurrentHousehold currentHousehold;

    public InvestmentServiceImpl(InvestmentRepository investmentRepository, UserRepository userRepository,
            CurrentHousehold currentHousehold) {
        this.investmentRepository = investmentRepository;
        this.userRepository = userRepository;
        this.currentHousehold = currentHousehold;
    }

    @Override
    public List<Investment> getAllInvestments() {
        return investmentRepository.findByHouseholdId(currentHousehold.resolve());
    }

    @Override
    public Optional<Investment> getInvestmentById(UUID id) {
        return investmentRepository.findByIdAndHouseholdId(id, currentHousehold.resolve());
    }

    @Override
    public Investment createInvestment(Investment investment) {
        User user = userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> new IllegalStateException("Authenticated user no longer exists."));
        investment.setUser(user);
        investment.setHouseholdId(currentHousehold.resolve());
        return investmentRepository.save(investment);
    }

    @Override
    public Investment updateInvestment(UUID id, Investment investment) {
        return investmentRepository.findByIdAndHouseholdId(id, currentHousehold.resolve())
                .map(existing -> {
                    existing.setType(investment.getType());
                    existing.setTicker(investment.getTicker());
                    existing.setAmountInvested(investment.getAmountInvested());
                    existing.setCurrentValue(investment.getCurrentValue());
                    existing.setStartDate(investment.getStartDate());
                    existing.setNotes(investment.getNotes());
                    existing.setLastSynced(investment.getLastSynced());
                    return investmentRepository.save(existing);
                }).orElseThrow(() -> new IllegalArgumentException("Investment not found."));
    }

    @Override
    public void deleteInvestment(UUID id) {
        Investment existing = investmentRepository.findByIdAndHouseholdId(id, currentHousehold.resolve())
                .orElseThrow(() -> new IllegalArgumentException("Investment not found."));
        investmentRepository.delete(existing);
    }

    @Override
    public List<Investment> getInvestmentsByType(String type) {
        return investmentRepository.findByHouseholdIdAndTypeIgnoreCaseOrderByStartDateDesc(
                currentHousehold.resolve(), type);
    }

    @Override
    public List<Investment> getInvestmentsByTicker(String ticker) {
        return investmentRepository.findByHouseholdIdAndTickerIgnoreCase(currentHousehold.resolve(), ticker);
    }

    @Override
    public List<Investment> getInvestmentsByCurrentValueGreaterThan(Double amount) {
        return investmentRepository.findByHouseholdIdAndCurrentValueGreaterThanOrderByCurrentValueDesc(
                currentHousehold.resolve(), amount);
    }

    @Override
    public List<Investment> getInvestmentsLastSyncedBefore(LocalDateTime dateTime) {
        return investmentRepository.findByHouseholdIdAndLastSyncedBeforeOrderByLastSyncedAsc(
                currentHousehold.resolve(), dateTime);
    }
}
