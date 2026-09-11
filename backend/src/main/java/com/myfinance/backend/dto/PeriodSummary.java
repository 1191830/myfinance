package com.myfinance.backend.dto;

import java.math.BigDecimal;

/**
 * Income / expense / net for a single month, with month-over-month deltas (percent) and the
 * savings rate (net / income). Percent fields are scale-1; a null delta means the previous
 * month had a zero base.
 */
public record PeriodSummary(
        String month,
        BigDecimal income,
        BigDecimal expense,
        BigDecimal net,
        BigDecimal savingsRate,
        BigDecimal incomeDeltaPct,
        BigDecimal expenseDeltaPct,
        BigDecimal netDeltaPct) {
}
