package com.myfinance.backend.repository;

import com.myfinance.backend.model.Investment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface InvestmentRepository extends JpaRepository<Investment, UUID> {

    // Encontrar investimentos por tipo (ex: ETF, Stock, Crypto)
    List<Investment> findByTypeIgnoreCaseOrderByStartDateDesc(String type);

    // Encontrar investimento por ticker (ex: para ETFs)
    List<Investment> findByTickerIgnoreCase(String ticker);

    // Encontrar investimentos cujo valor atual está acima de um determinado valor
    List<Investment> findByCurrentValueGreaterThanOrderByCurrentValueDesc(Double amount);

    // Encontrar investimentos que foram sincronizados antes de uma certa data (útil para atualizações)
    List<Investment> findByLastSyncedBeforeOrderByLastSyncedAsc(java.time.LocalDateTime dateTime);

}
