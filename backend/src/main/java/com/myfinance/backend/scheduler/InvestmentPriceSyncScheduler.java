package com.myfinance.backend.scheduler;

import com.myfinance.backend.service.InvestmentService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class InvestmentPriceSyncScheduler {

    private final InvestmentService investmentService;

    public InvestmentPriceSyncScheduler(InvestmentService investmentService) {
        this.investmentService = investmentService;
    }

    // Daily at 00:15 server time (offset from the 00:05 recurring-transaction job) - syncs
    // crypto prices for every ticker+quantity investment across every household.
    @Scheduled(cron = "0 15 0 * * *")
    public void syncDueInvestmentPrices() {
        investmentService.syncPricesForAllHouseholds();
    }
}
