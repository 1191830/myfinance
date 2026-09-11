package com.myfinance.backend.service;

import com.myfinance.backend.dto.CashflowBucket;
import com.myfinance.backend.dto.CategoryTotal;
import com.myfinance.backend.dto.Granularity;
import com.myfinance.backend.dto.NetWorthSummary;
import com.myfinance.backend.dto.PeriodSummary;
import com.myfinance.backend.model.TransactionType;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

/**
 * Read-only aggregation over transactions / investments / saving goals for the dashboard.
 * Aggregation is done in memory (personal-scale data); no persistence.
 */
public interface ReportService {

    NetWorthSummary getNetWorth();

    PeriodSummary getMonthSummary(YearMonth month);

    List<CashflowBucket> getCashflow(LocalDate from, LocalDate to, Granularity granularity);

    List<CategoryTotal> getCategoryTotals(LocalDate from, LocalDate to, TransactionType type);
}
