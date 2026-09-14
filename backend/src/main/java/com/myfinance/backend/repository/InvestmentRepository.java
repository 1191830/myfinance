package com.myfinance.backend.repository;

import com.myfinance.backend.model.Investment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InvestmentRepository extends JpaRepository<Investment, UUID> {

    List<Investment> findByUserId(UUID userId);

    Optional<Investment> findByIdAndUserId(UUID id, UUID userId);

    // Encontrar investimentos por tipo (ex: ETF, Stock, Crypto), deste utilizador
    List<Investment> findByUserIdAndTypeIgnoreCaseOrderByStartDateDesc(UUID userId, String type);

    // Encontrar investimento por ticker, deste utilizador
    List<Investment> findByUserIdAndTickerIgnoreCase(UUID userId, String ticker);

    // Encontrar investimentos cujo valor atual está acima de um determinado valor
    List<Investment> findByUserIdAndCurrentValueGreaterThanOrderByCurrentValueDesc(UUID userId, Double amount);

    // Encontrar investimentos que foram sincronizados antes de uma certa data
    List<Investment> findByUserIdAndLastSyncedBeforeOrderByLastSyncedAsc(UUID userId, LocalDateTime dateTime);
}
