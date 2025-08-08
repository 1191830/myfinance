package com.myfinance.backend.controller;

import com.myfinance.backend.model.Transaction;
import com.myfinance.backend.model.TransactionType;
import com.myfinance.backend.service.TransactionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    // GET all transactions
    @GetMapping
    public ResponseEntity<List<Transaction>> getAllTransactions() {
        List<Transaction> transactions = transactionService.getAllTransactions();
        return ResponseEntity.ok(transactions);
    }

    // GET transaction by id
    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getTransactionById(@PathVariable UUID id) {
        Optional<Transaction> transaction = transactionService.getTransactionById(id);
        return transaction.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST create transaction
    @PostMapping
    public ResponseEntity<Transaction> createTransaction(@RequestBody Transaction transaction) {
        Transaction created = transactionService.createTransaction(transaction);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // PUT update transaction
    @PutMapping("/{id}")
    public ResponseEntity<Transaction> updateTransaction(@PathVariable UUID id, @RequestBody Transaction transaction) {
        try {
            Transaction updated = transactionService.updateTransaction(id, transaction);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE transaction
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable UUID id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }

    // GET transactions by category ID
    @GetMapping("/by-category/{categoryId}")
    public ResponseEntity<List<Transaction>> getTransactionsByCategoryId(@PathVariable UUID categoryId) {
        List<Transaction> transactions = transactionService.getTransactionsByCategoryId(categoryId);
        return ResponseEntity.ok(transactions);
    }

    // GET transactions by type (INCOME or EXPENSE)
    @GetMapping("/by-type")
    public ResponseEntity<List<Transaction>> getTransactionsByType(@RequestParam TransactionType type) {
        List<Transaction> transactions = transactionService.getTransactionsByType(type);
        return ResponseEntity.ok(transactions);
    }

    // GET transactions by date range
    @GetMapping("/by-date-range")
    public ResponseEntity<List<Transaction>> getTransactionsByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        LocalDate start;
        LocalDate end;
        try {
            start = LocalDate.parse(startDate);
            end = LocalDate.parse(endDate);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
        List<Transaction> transactions = transactionService.getTransactionsByDateRange(start, end);
        return ResponseEntity.ok(transactions);
    }

    // GET transactions by frequency (ONE_TIME, RECURRING)
    @GetMapping("/by-frequency")
    public ResponseEntity<List<Transaction>> getTransactionsByFrequency(@RequestParam String frequency) {
        List<Transaction> transactions = transactionService.getTransactionsByFrequency(frequency);
        return ResponseEntity.ok(transactions);
    }

    // GET transactions by description (partial match, case-insensitive)
    @GetMapping("/search-by-description")
    public ResponseEntity<List<Transaction>> getTransactionsByDescription(@RequestParam String description) {
        List<Transaction> transactions = transactionService.getTransactionsByDescription(description);
        return ResponseEntity.ok(transactions);
    }
}
