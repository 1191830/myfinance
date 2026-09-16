package com.myfinance.backend.integration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class CoinGeckoClientImpl implements CoinGeckoClient {

    private static final Logger log = LoggerFactory.getLogger(CoinGeckoClientImpl.class);

    private final RestClient restClient = RestClient.create("https://api.coingecko.com/api/v3");

    @Override
    public Map<String, BigDecimal> fetchPricesEur(Set<String> coinGeckoIds) {
        if (coinGeckoIds == null || coinGeckoIds.isEmpty()) {
            return Collections.emptyMap();
        }
        try {
            Map<String, Map<String, Object>> response = restClient.get()
                    .uri("/simple/price?ids={ids}&vs_currencies=eur", String.join(",", coinGeckoIds))
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Map<String, Object>>>() {
                    });
            if (response == null) {
                return Collections.emptyMap();
            }
            return response.entrySet().stream()
                    .filter(e -> e.getValue() != null && e.getValue().get("eur") != null)
                    .collect(Collectors.toMap(Map.Entry::getKey,
                            e -> new BigDecimal(e.getValue().get("eur").toString())));
        } catch (Exception e) {
            // A network hiccup or CoinGecko outage shouldn't fail the whole sync - just
            // means nothing gets updated this run.
            log.warn("CoinGecko price fetch failed for ids {}: {}", coinGeckoIds, e.getMessage());
            return Collections.emptyMap();
        }
    }
}
