package com.myfinance.backend.dto;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Total amount and transaction count for one category over a date range. {@code categoryId}
 * is null for transactions with no category ({@code categoryName} = "Sem categoria").
 */
public record CategoryTotal(
        UUID categoryId,
        String categoryName,
        BigDecimal total,
        long count) {
}
