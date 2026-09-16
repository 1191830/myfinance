package com.myfinance.backend.repository;

import com.myfinance.backend.model.Investment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InvestmentRepository extends JpaRepository<Investment, UUID> {

    List<Investment> findByHouseholdId(UUID householdId);

    Optional<Investment> findByIdAndHouseholdId(UUID id, UUID householdId);

    // Encontrar investimentos por tipo (ex: ETF, Stock, Crypto), deste agregado familiar
    List<Investment> findByHouseholdIdAndTypeIgnoreCaseOrderByStartDateDesc(UUID householdId, String type);

    // Encontrar investimento por ticker, deste agregado familiar
    List<Investment> findByHouseholdIdAndTickerIgnoreCase(UUID householdId, String ticker);

    // Encontrar investimentos cujo valor atual está acima de um determinado valor
    List<Investment> findByHouseholdIdAndCurrentValueGreaterThanOrderByCurrentValueDesc(
            UUID householdId, Double amount);

    // Encontrar investimentos que foram sincronizados antes de uma certa data
    List<Investment> findByHouseholdIdAndLastSyncedBeforeOrderByLastSyncedAsc(
            UUID householdId, LocalDateTime dateTime);

    // Candidatos à sincronização de preço: têm ticker definido (quantidade é opcional -
    // sem ela só currentPrice é atualizado, não currentValue)
    List<Investment> findByHouseholdIdAndTickerIsNotNull(UUID householdId);

    // Mesmo critério, mas sem escopo - usado apenas pelo agendador diário
    List<Investment> findByTickerIsNotNull();
}
