package com.myfinance.backend.integration;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Set;

/** Thin interface over CoinGecko's price API, purely so price-sync logic can be unit tested. */
public interface CoinGeckoClient {

    /** @return CoinGecko coin id -> EUR price, for whichever ids it actually knows about. */
    Map<String, BigDecimal> fetchPricesEur(Set<String> coinGeckoIds);
}
