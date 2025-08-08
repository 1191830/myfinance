package com.myfinance.backend.service;

import com.myfinance.backend.model.Investment;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InvestmentService {

    List<Investment> getAllInvestments();

    Optional<Investment> getInvestmentById(UUID id);

    Investment createInvestment(Investment investment);

    Investment updateInvestment(UUID id, Investment investment);

    void deleteInvestment(UUID id);

    List<Investment> getInvestmentsByType(String type);

    List<Investment> getInvestmentsByTicker(String ticker);

    List<Investment> getInvestmentsByCurrentValueGreaterThan(Double amount);

    List<Investment> getInvestmentsLastSyncedBefore(LocalDateTime dateTime);
}
