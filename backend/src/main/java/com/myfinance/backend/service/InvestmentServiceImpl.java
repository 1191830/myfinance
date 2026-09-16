package com.myfinance.backend.service;

import com.myfinance.backend.integration.CoinGeckoClient;
import com.myfinance.backend.integration.CryptoTickerRegistry;
import com.myfinance.backend.model.Investment;
import com.myfinance.backend.model.User;
import com.myfinance.backend.repository.InvestmentRepository;
import com.myfinance.backend.repository.UserRepository;
import com.myfinance.backend.security.CurrentHousehold;
import com.myfinance.backend.security.SecurityUtils;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class InvestmentServiceImpl implements InvestmentService {

    private final InvestmentRepository investmentRepository;
    private final UserRepository userRepository;
    private final CurrentHousehold currentHousehold;
    private final CoinGeckoClient coinGeckoClient;

    public InvestmentServiceImpl(InvestmentRepository investmentRepository, UserRepository userRepository,
            CurrentHousehold currentHousehold, CoinGeckoClient coinGeckoClient) {
        this.investmentRepository = investmentRepository;
        this.userRepository = userRepository;
        this.currentHousehold = currentHousehold;
        this.coinGeckoClient = coinGeckoClient;
    }

    @Override
    public List<Investment> getAllInvestments() {
        return investmentRepository.findByHouseholdId(currentHousehold.resolve());
    }

    @Override
    public Optional<Investment> getInvestmentById(UUID id) {
        return investmentRepository.findByIdAndHouseholdId(id, currentHousehold.resolve());
    }

    @Override
    public Investment createInvestment(Investment investment) {
        User user = userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> new IllegalStateException("Authenticated user no longer exists."));
        investment.setUser(user);
        investment.setHouseholdId(currentHousehold.resolve());
        return investmentRepository.save(investment);
    }

    @Override
    public Investment updateInvestment(UUID id, Investment investment) {
        return investmentRepository.findByIdAndHouseholdId(id, currentHousehold.resolve())
                .map(existing -> {
                    existing.setType(investment.getType());
                    existing.setTicker(investment.getTicker());
                    existing.setAmountInvested(investment.getAmountInvested());
                    existing.setCurrentValue(investment.getCurrentValue());
                    existing.setStartDate(investment.getStartDate());
                    existing.setNotes(investment.getNotes());
                    existing.setQuantity(investment.getQuantity());
                    return investmentRepository.save(existing);
                }).orElseThrow(() -> new IllegalArgumentException("Investment not found."));
    }

    @Override
    public void deleteInvestment(UUID id) {
        Investment existing = investmentRepository.findByIdAndHouseholdId(id, currentHousehold.resolve())
                .orElseThrow(() -> new IllegalArgumentException("Investment not found."));
        investmentRepository.delete(existing);
    }

    @Override
    public List<Investment> getInvestmentsByType(String type) {
        return investmentRepository.findByHouseholdIdAndTypeIgnoreCaseOrderByStartDateDesc(
                currentHousehold.resolve(), type);
    }

    @Override
    public List<Investment> getInvestmentsByTicker(String ticker) {
        return investmentRepository.findByHouseholdIdAndTickerIgnoreCase(currentHousehold.resolve(), ticker);
    }

    @Override
    public List<Investment> getInvestmentsByCurrentValueGreaterThan(Double amount) {
        return investmentRepository.findByHouseholdIdAndCurrentValueGreaterThanOrderByCurrentValueDesc(
                currentHousehold.resolve(), amount);
    }

    @Override
    public List<Investment> getInvestmentsLastSyncedBefore(LocalDateTime dateTime) {
        return investmentRepository.findByHouseholdIdAndLastSyncedBeforeOrderByLastSyncedAsc(
                currentHousehold.resolve(), dateTime);
    }

    @Override
    public int syncPrices() {
        return syncFor(investmentRepository.findByHouseholdIdAndTickerIsNotNull(currentHousehold.resolve()));
    }

    @Override
    public int syncPricesForAllHouseholds() {
        return syncFor(investmentRepository.findByTickerIsNotNull());
    }

    /**
     * Resolves each candidate's ticker to a CoinGecko coin id (skipping unmapped ones),
     * batch-fetches EUR prices in a single call, and updates currentPrice/lastSynced for
     * every investment CoinGecko actually priced - quantity is optional, only needed to
     * also roll the per-unit price up into a total currentValue.
     */
    private int syncFor(List<Investment> candidates) {
        Map<String, String> coinGeckoIdByTicker = new HashMap<>();
        for (Investment investment : candidates) {
            CryptoTickerRegistry.coinGeckoId(investment.getTicker())
                    .ifPresent(id -> coinGeckoIdByTicker.put(investment.getTicker().trim().toUpperCase(), id));
        }
        if (coinGeckoIdByTicker.isEmpty()) {
            return 0;
        }

        Map<String, BigDecimal> priceByCoinGeckoId = coinGeckoClient.fetchPricesEur(
                new HashSet<>(coinGeckoIdByTicker.values()));

        int synced = 0;
        for (Investment investment : candidates) {
            String coinGeckoId = coinGeckoIdByTicker.get(investment.getTicker().trim().toUpperCase());
            BigDecimal price = coinGeckoId == null ? null : priceByCoinGeckoId.get(coinGeckoId);
            if (price == null) {
                continue;
            }
            investment.setCurrentPrice(price);
            if (investment.getQuantity() != null) {
                investment.setCurrentValue(investment.getQuantity().multiply(price));
            }
            investment.setLastSynced(LocalDateTime.now());
            investmentRepository.save(investment);
            synced++;
        }
        return synced;
    }

    @Override
    public Investment addPurchase(UUID id, BigDecimal quantity, BigDecimal unitPrice) {
        Investment existing = investmentRepository.findByIdAndHouseholdId(id, currentHousehold.resolve())
                .orElseThrow(() -> new IllegalArgumentException("Investment not found."));
        BigDecimal existingQuantity = existing.getQuantity() != null ? existing.getQuantity() : BigDecimal.ZERO;
        BigDecimal purchaseCost = quantity.multiply(unitPrice);
        existing.setQuantity(existingQuantity.add(quantity));
        existing.setAmountInvested(existing.getAmountInvested().add(purchaseCost));
        existing.setCurrentValue(existing.getCurrentValue().add(purchaseCost));
        return investmentRepository.save(existing);
    }
}
