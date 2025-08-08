package com.myfinance.backend.controller;

import com.myfinance.backend.model.Investment;
import com.myfinance.backend.service.InvestmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/investments")
public class InvestmentController {

    private final InvestmentService investmentService;

    public InvestmentController(InvestmentService investmentService) {
        this.investmentService = investmentService;
    }

    // GET all investments
    @GetMapping
    public ResponseEntity<List<Investment>> getAllInvestments() {
        List<Investment> investments = investmentService.getAllInvestments();
        return ResponseEntity.ok(investments);
    }

    // GET investment by id
    @GetMapping("/{id}")
    public ResponseEntity<Investment> getInvestmentById(@PathVariable UUID id) {
        Optional<Investment> investment = investmentService.getInvestmentById(id);
        return investment.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST create new investment
    @PostMapping
    public ResponseEntity<Investment> createInvestment(@RequestBody Investment investment) {
        Investment created = investmentService.createInvestment(investment);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // PUT update investment
    @PutMapping("/{id}")
    public ResponseEntity<Investment> updateInvestment(@PathVariable UUID id, @RequestBody Investment investment) {
        try {
            Investment updated = investmentService.updateInvestment(id, investment);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE investment by id
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvestment(@PathVariable UUID id) {
        investmentService.deleteInvestment(id);
        return ResponseEntity.noContent().build();
    }

    // GET investments by type
    @GetMapping("/type/{type}")
    public ResponseEntity<List<Investment>> getInvestmentsByType(@PathVariable String type) {
        List<Investment> investments = investmentService.getInvestmentsByType(type);
        return ResponseEntity.ok(investments);
    }

    // GET investments by ticker
    @GetMapping("/ticker/{ticker}")
    public ResponseEntity<List<Investment>> getInvestmentsByTicker(@PathVariable String ticker) {
        List<Investment> investments = investmentService.getInvestmentsByTicker(ticker);
        return ResponseEntity.ok(investments);
    }

    // GET investments with current value greater than amount
    @GetMapping("/value-greater-than")
    public ResponseEntity<List<Investment>> getInvestmentsByCurrentValueGreaterThan(@RequestParam Double amount) {
        List<Investment> investments = investmentService.getInvestmentsByCurrentValueGreaterThan(amount);
        return ResponseEntity.ok(investments);
    }

    // GET investments last synced before dateTime
    @GetMapping("/last-synced-before")
    public ResponseEntity<List<Investment>> getInvestmentsLastSyncedBefore(@RequestParam String dateTime) {
        LocalDateTime dt;
        try {
            dt = LocalDateTime.parse(dateTime);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
        List<Investment> investments = investmentService.getInvestmentsLastSyncedBefore(dt);
        return ResponseEntity.ok(investments);
    }
}
