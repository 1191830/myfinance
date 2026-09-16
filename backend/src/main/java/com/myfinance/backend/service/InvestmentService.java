package com.myfinance.backend.service;

import com.myfinance.backend.model.Investment;

import java.math.BigDecimal;
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

    /** Syncs crypto prices for the current household's ticker+quantity investments. */
    int syncPrices();

    /** Same as {@link #syncPrices()} but across every household - the daily scheduler's job. */
    int syncPricesForAllHouseholds();

    /**
     * Records a new purchase: blends into the existing quantity/amountInvested (both are
     * simply summed, which is exactly the weighted-average-cost formula) rather than
     * requiring the caller to hand-compute new totals.
     */
    Investment addPurchase(UUID id, BigDecimal quantity, BigDecimal unitPrice);
}
