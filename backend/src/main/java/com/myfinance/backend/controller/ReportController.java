package com.myfinance.backend.controller;

import com.myfinance.backend.dto.CashflowBucket;
import com.myfinance.backend.dto.CategoryTotal;
import com.myfinance.backend.dto.Granularity;
import com.myfinance.backend.dto.NetWorthSummary;
import com.myfinance.backend.dto.PeriodSummary;
import com.myfinance.backend.model.TransactionType;
import com.myfinance.backend.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    // GET aggregate patrimonio (investments current value + saving goals current amount)
    @GetMapping("/net-worth")
    public ResponseEntity<NetWorthSummary> getNetWorth() {
        return ResponseEntity.ok(reportService.getNetWorth());
    }

    // GET income/expense/net for a month (YYYY-MM) with month-over-month deltas
    @GetMapping("/summary")
    public ResponseEntity<PeriodSummary> getSummary(@RequestParam String month) {
        YearMonth ym;
        try {
            ym = YearMonth.parse(month);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(reportService.getMonthSummary(ym));
    }

    // GET cash-flow series between two ISO dates, bucketed by granularity
    @GetMapping("/cashflow")
    public ResponseEntity<List<CashflowBucket>> getCashflow(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam(defaultValue = "MONTH") String granularity) {
        LocalDate fromDate;
        LocalDate toDate;
        Granularity g;
        try {
            fromDate = LocalDate.parse(from);
            toDate = LocalDate.parse(to);
            g = Granularity.valueOf(granularity.toUpperCase());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
        if (fromDate.isAfter(toDate)) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(reportService.getCashflow(fromDate, toDate, g));
    }

    // GET per-category totals between two ISO dates for INCOME or EXPENSE
    @GetMapping("/by-category")
    public ResponseEntity<List<CategoryTotal>> getByCategory(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam(defaultValue = "EXPENSE") String type) {
        LocalDate fromDate;
        LocalDate toDate;
        TransactionType txType;
        try {
            fromDate = LocalDate.parse(from);
            toDate = LocalDate.parse(to);
            txType = TransactionType.valueOf(type.toUpperCase());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(reportService.getCategoryTotals(fromDate, toDate, txType));
    }
}
