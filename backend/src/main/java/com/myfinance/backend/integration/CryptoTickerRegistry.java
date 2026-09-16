package com.myfinance.backend.integration;

import java.util.Map;
import java.util.Optional;

/**
 * Small, hand-maintained ticker -> CoinGecko coin id map. Not exhaustive - an unmapped
 * ticker is skipped by price sync rather than treated as an error. Extend as needed.
 */
public final class CryptoTickerRegistry {

    private static final Map<String, String> TICKER_TO_COINGECKO_ID = Map.ofEntries(
            Map.entry("BTC", "bitcoin"),
            Map.entry("ETH", "ethereum"),
            Map.entry("USDT", "tether"),
            Map.entry("USDC", "usd-coin"),
            Map.entry("BNB", "binancecoin"),
            Map.entry("SOL", "solana"),
            Map.entry("XRP", "ripple"),
            Map.entry("ADA", "cardano"),
            Map.entry("DOGE", "dogecoin"),
            Map.entry("TRX", "tron"),
            Map.entry("DOT", "polkadot"),
            Map.entry("MATIC", "polygon"),
            Map.entry("LTC", "litecoin"),
            Map.entry("SHIB", "shiba-inu"),
            Map.entry("AVAX", "avalanche-2"),
            Map.entry("LINK", "chainlink"),
            Map.entry("ATOM", "cosmos"),
            Map.entry("XLM", "stellar"),
            Map.entry("UNI", "uniswap"),
            Map.entry("ETC", "ethereum-classic"));

    private CryptoTickerRegistry() {
    }

    public static Optional<String> coinGeckoId(String ticker) {
        if (ticker == null || ticker.isBlank()) {
            return Optional.empty();
        }
        return Optional.ofNullable(TICKER_TO_COINGECKO_ID.get(ticker.trim().toUpperCase()));
    }
}
