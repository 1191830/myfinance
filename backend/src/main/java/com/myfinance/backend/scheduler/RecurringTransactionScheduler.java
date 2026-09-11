package com.myfinance.backend.scheduler;

import com.myfinance.backend.service.TransactionService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class RecurringTransactionScheduler {

    private final TransactionService transactionService;

    public RecurringTransactionScheduler(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    // Daily at 00:05 server time - materializes any due recurring occurrences.
    @Scheduled(cron = "0 5 0 * * *")
    public void generateDueRecurringTransactions() {
        transactionService.generateMonthlyTransactions();
    }
}
