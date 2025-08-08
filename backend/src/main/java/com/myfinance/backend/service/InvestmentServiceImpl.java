package com.myfinance.backend.service;

import com.myfinance.backend.model.Investment;
import com.myfinance.backend.repository.InvestmentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class InvestmentServiceImpl implements InvestmentService {

    private final InvestmentRepository investmentRepository;

    public InvestmentServiceImpl(InvestmentRepository investmentRepository) {
        this.investmentRepository = investmentRepository;
    }

    @Override
    public List<Investment> getAllInvestments() {
        return investmentRepository.findAll();
    }

    @Override
    public Optional<Investment> getInvestmentById(UUID id) {
        return investmentRepository.findById(id);
    }

    @Override
    public Investment createInvestment(Investment investment) {
        return investmentRepository.save(investment);
    }

    @Override
    public Investment updateInvestment(UUID id, Investment investment) {
        return investmentRepository.findById(id)
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
        investmentRepository.deleteById(id);
    }

    @Override
    public List<Investment> getInvestmentsByType(String type) {
        return investmentRepository.findByTypeIgnoreCaseOrderByStartDateDesc(type);
    }

    @Override
    public List<Investment> getInvestmentsByTicker(String ticker) {
        return investmentRepository.findByTickerIgnoreCase(ticker);
    }

    @Override
    public List<Investment> getInvestmentsByCurrentValueGreaterThan(Double amount) {
        return investmentRepository.findByCurrentValueGreaterThanOrderByCurrentValueDesc(amount);
    }

    @Override
    public List<Investment> getInvestmentsLastSyncedBefore(LocalDateTime dateTime) {
        return investmentRepository.findByLastSyncedBeforeOrderByLastSyncedAsc(dateTime);
    }
}
