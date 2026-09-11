package com.myfinance.backend.dto;

import java.math.BigDecimal;

/**
 * Aggregate "patrimonio" figure for the dashboard sidebar. The data model has no accounts
 * or liabilities, so this is investments (current value) + saving goals (current amount).
 */
public record NetWorthSummary(
        BigDecimal investmentsValue,
        BigDecimal savingsValue,
        BigDecimal total) {
}
