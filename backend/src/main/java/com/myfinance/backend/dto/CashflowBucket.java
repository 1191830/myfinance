package com.myfinance.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * One time bucket of a cash-flow series (day, week, month, quarter or year), with income /
 * expense / net over that span. {@code label} is a short human label for the bucket.
 */
public record CashflowBucket(
        LocalDate start,
        LocalDate end,
        String label,
        BigDecimal income,
        BigDecimal expense,
        BigDecimal net) {
}
