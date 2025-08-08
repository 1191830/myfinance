package com.myfinance.backend.controller;

import com.myfinance.backend.model.SavingGoal;
import com.myfinance.backend.service.SavingGoalService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/saving-goals")
public class SavingGoalController {

    private final SavingGoalService savingGoalService;

    public SavingGoalController(SavingGoalService savingGoalService) {
        this.savingGoalService = savingGoalService;
    }

    // GET all saving goals
    @GetMapping
    public ResponseEntity<List<SavingGoal>> getAllSavingGoals() {
        List<SavingGoal> goals = savingGoalService.getAllSavingGoals();
        return ResponseEntity.ok(goals);
    }

    // GET saving goal by id
    @GetMapping("/{id}")
    public ResponseEntity<SavingGoal> getSavingGoalById(@PathVariable UUID id) {
        Optional<SavingGoal> goal = savingGoalService.getSavingGoalById(id);
        return goal.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST create new saving goal
    @PostMapping
    public ResponseEntity<SavingGoal> createSavingGoal(@RequestBody SavingGoal savingGoal) {
        SavingGoal created = savingGoalService.createSavingGoal(savingGoal);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // PUT update saving goal
    @PutMapping("/{id}")
    public ResponseEntity<SavingGoal> updateSavingGoal(@PathVariable UUID id, @RequestBody SavingGoal savingGoal) {
        try {
            SavingGoal updated = savingGoalService.updateSavingGoal(id, savingGoal);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE saving goal
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSavingGoal(@PathVariable UUID id) {
        savingGoalService.deleteSavingGoal(id);
        return ResponseEntity.noContent().build();
    }

    // GET saving goals ordered by start date (desc)
    @GetMapping("/ordered-by-start-date")
    public ResponseEntity<List<SavingGoal>> getSavingGoalsOrderedByStartDate() {
        List<SavingGoal> goals = savingGoalService.getSavingGoalsOrderedByStartDate();
        return ResponseEntity.ok(goals);
    }

    // GET saving goals ending before a date
    @GetMapping("/ending-before")
    public ResponseEntity<List<SavingGoal>> getSavingGoalsEndingBefore(@RequestParam String date) {
        LocalDate parsedDate;
        try {
            parsedDate = LocalDate.parse(date);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
        List<SavingGoal> goals = savingGoalService.getSavingGoalsEndingBefore(parsedDate);
        return ResponseEntity.ok(goals);
    }

    // GET active saving goals (no end date or end date after given date)
    @GetMapping("/active")
    public ResponseEntity<List<SavingGoal>> getActiveSavingGoals(@RequestParam String date) {
        LocalDate parsedDate;
        try {
            parsedDate = LocalDate.parse(date);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
        List<SavingGoal> goals = savingGoalService.getActiveSavingGoals(parsedDate);
        return ResponseEntity.ok(goals);
    }

    // GET saving goals with progress less than a certain amount
    @GetMapping("/progress-less-than")
    public ResponseEntity<List<SavingGoal>> getSavingGoalsWithProgressLessThan(@RequestParam Double amount) {
        List<SavingGoal> goals = savingGoalService.getSavingGoalsWithProgressLessThan(amount);
        return ResponseEntity.ok(goals);
    }

    // GET saving goals by name search (case-insensitive)
    @GetMapping("/search")
    public ResponseEntity<List<SavingGoal>> searchSavingGoalsByName(@RequestParam String name) {
        List<SavingGoal> goals = savingGoalService.searchSavingGoalsByName(name);
        return ResponseEntity.ok(goals);
    }
}
