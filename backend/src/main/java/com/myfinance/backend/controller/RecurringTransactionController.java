package com.myfinance.backend.controller;

import com.myfinance.backend.model.RecurringTransaction;
import com.myfinance.backend.service.RecurringTransactionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/recurring-transactions")
public class RecurringTransactionController {

    private final RecurringTransactionService recurringTransactionService;

    public RecurringTransactionController(RecurringTransactionService recurringTransactionService) {
        this.recurringTransactionService = recurringTransactionService;
    }

    // GET all recurring transactions
    @GetMapping
    public ResponseEntity<List<RecurringTransaction>> getAllRecurringTransactions() {
        return ResponseEntity.ok(recurringTransactionService.getAllRecurringTransactions());
    }

    // GET recurring transaction by id
    @GetMapping("/{id}")
    public ResponseEntity<RecurringTransaction> getRecurringTransactionById(@PathVariable UUID id) {
        Optional<RecurringTransaction> transaction = recurringTransactionService.getRecurringTransactionById(id);
        return transaction.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    // POST create recurring transaction
    @PostMapping
    public ResponseEntity<RecurringTransaction> createRecurringTransaction(
            @RequestBody RecurringTransaction transaction) {
        RecurringTransaction created = recurringTransactionService.createRecurringTransaction(transaction);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // PUT update recurring transaction
    @PutMapping("/{id}")
    public ResponseEntity<RecurringTransaction> updateRecurringTransaction(@PathVariable UUID id,
            @RequestBody RecurringTransaction transaction) {
        try {
            RecurringTransaction updated = recurringTransactionService.updateRecurringTransaction(id, transaction);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE recurring transaction
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecurringTransaction(@PathVariable UUID id) {
        recurringTransactionService.deleteRecurringTransaction(id);
        return ResponseEntity.noContent().build();
    }

    // GET active recurring transactions
    @GetMapping("/active")
    public ResponseEntity<List<RecurringTransaction>> getActiveRecurringTransactions() {
        return ResponseEntity.ok(recurringTransactionService.getActiveRecurringTransactions());
    }
}
