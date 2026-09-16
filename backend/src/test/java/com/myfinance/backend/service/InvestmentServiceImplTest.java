package com.myfinance.backend.service;

import com.myfinance.backend.integration.CoinGeckoClient;
import com.myfinance.backend.model.Investment;
import com.myfinance.backend.repository.InvestmentRepository;
import com.myfinance.backend.repository.UserRepository;
import com.myfinance.backend.security.CurrentHousehold;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InvestmentServiceImplTest {

    private static final UUID TEST_HOUSEHOLD_ID = UUID.randomUUID();

    @Mock
    private InvestmentRepository investmentRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private CurrentHousehold currentHousehold;
    @Mock
    private CoinGeckoClient coinGeckoClient;

    private InvestmentServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new InvestmentServiceImpl(investmentRepository, userRepository, currentHousehold, coinGeckoClient);
    }

    private static Investment investment(String ticker, BigDecimal quantity) {
        Investment investment = new Investment();
        investment.setId(UUID.randomUUID());
        investment.setType("Crypto");
        investment.setTicker(ticker);
        investment.setQuantity(quantity);
        investment.setAmountInvested(BigDecimal.TEN);
        investment.setCurrentValue(BigDecimal.TEN);
        investment.setStartDate(LocalDate.now());
        return investment;
    }

    @Test
    void syncPrices_updatesCurrentValueAndLastSyncedForAKnownTickerWithQuantity() {
        Investment btc = investment("btc", new BigDecimal("0.5"));
        when(currentHousehold.resolve()).thenReturn(TEST_HOUSEHOLD_ID);
        when(investmentRepository.findByHouseholdIdAndTickerIsNotNullAndQuantityIsNotNull(TEST_HOUSEHOLD_ID))
                .thenReturn(List.of(btc));
        when(coinGeckoClient.fetchPricesEur(Set.of("bitcoin")))
                .thenReturn(Map.of("bitcoin", new BigDecimal("50000")));
        when(investmentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        int synced = service.syncPrices();

        assertThat(synced).isEqualTo(1);
        ArgumentCaptor<Investment> captor = ArgumentCaptor.forClass(Investment.class);
        verify(investmentRepository).save(captor.capture());
        assertThat(captor.getValue().getCurrentValue()).isEqualByComparingTo("25000");
        assertThat(captor.getValue().getLastSynced()).isNotNull();
    }

    @Test
    void syncPrices_skipsATickerCoinGeckoDoesNotPrice() {
        Investment btc = investment("BTC", BigDecimal.ONE);
        when(currentHousehold.resolve()).thenReturn(TEST_HOUSEHOLD_ID);
        when(investmentRepository.findByHouseholdIdAndTickerIsNotNullAndQuantityIsNotNull(TEST_HOUSEHOLD_ID))
                .thenReturn(List.of(btc));
        when(coinGeckoClient.fetchPricesEur(Set.of("bitcoin"))).thenReturn(Map.of());

        int synced = service.syncPrices();

        assertThat(synced).isZero();
        verify(investmentRepository, never()).save(any());
    }

    @Test
    void syncPrices_skipsATickerNotInTheRegistry() {
        Investment unknown = investment("NOTACOIN", BigDecimal.ONE);
        when(currentHousehold.resolve()).thenReturn(TEST_HOUSEHOLD_ID);
        when(investmentRepository.findByHouseholdIdAndTickerIsNotNullAndQuantityIsNotNull(TEST_HOUSEHOLD_ID))
                .thenReturn(List.of(unknown));

        int synced = service.syncPrices();

        assertThat(synced).isZero();
        verify(investmentRepository, never()).save(any());
        verify(coinGeckoClient, never()).fetchPricesEur(any());
    }

    @Test
    void syncPricesForAllHouseholds_delegatesToTheUnscopedRepositoryFinder() {
        when(investmentRepository.findByTickerIsNotNullAndQuantityIsNotNull()).thenReturn(List.of());

        int synced = service.syncPricesForAllHouseholds();

        assertThat(synced).isZero();
        verify(investmentRepository).findByTickerIsNotNullAndQuantityIsNotNull();
    }
}
