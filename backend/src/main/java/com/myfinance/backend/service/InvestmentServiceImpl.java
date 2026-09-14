package com.myfinance.backend.service;

import com.myfinance.backend.model.Investment;
import com.myfinance.backend.model.User;
import com.myfinance.backend.repository.InvestmentRepository;
import com.myfinance.backend.repository.UserRepository;
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

    public InvestmentServiceImpl(InvestmentRepository investmentRepository, UserRepository userRepository) {
        this.investmentRepository = investmentRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<Investment> getAllInvestments() {
        return investmentRepository.findByUserId(SecurityUtils.currentUserId());
    }

    @Override
    public Optional<Investment> getInvestmentById(UUID id) {
        return investmentRepository.findByIdAndUserId(id, SecurityUtils.currentUserId());
    }

    @Override
    public Investment createInvestment(Investment investment) {
        User user = userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> new IllegalStateException("Authenticated user no longer exists."));
        investment.setUser(user);
        return investmentRepository.save(investment);
    }

    @Override
    public Investment updateInvestment(UUID id, Investment investment) {
        return investmentRepository.findByIdAndUserId(id, SecurityUtils.currentUserId())
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
        Investment existing = investmentRepository.findByIdAndUserId(id, SecurityUtils.currentUserId())
                .orElseThrow(() -> new IllegalArgumentException("Investment not found."));
        investmentRepository.delete(existing);
    }

    @Override
    public List<Investment> getInvestmentsByType(String type) {
        return investmentRepository.findByUserIdAndTypeIgnoreCaseOrderByStartDateDesc(
                SecurityUtils.currentUserId(), type);
    }

    @Override
    public List<Investment> getInvestmentsByTicker(String ticker) {
        return investmentRepository.findByUserIdAndTickerIgnoreCase(SecurityUtils.currentUserId(), ticker);
    }

    @Override
    public List<Investment> getInvestmentsByCurrentValueGreaterThan(Double amount) {
        return investmentRepository.findByUserIdAndCurrentValueGreaterThanOrderByCurrentValueDesc(
                SecurityUtils.currentUserId(), amount);
    }

    @Override
    public List<Investment> getInvestmentsLastSyncedBefore(LocalDateTime dateTime) {
        return investmentRepository.findByUserIdAndLastSyncedBeforeOrderByLastSyncedAsc(
                SecurityUtils.currentUserId(), dateTime);
    }
}
