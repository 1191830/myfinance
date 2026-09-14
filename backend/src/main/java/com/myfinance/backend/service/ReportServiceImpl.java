package com.myfinance.backend.service;

import com.myfinance.backend.dto.CashflowBucket;
import com.myfinance.backend.dto.CategoryTotal;
import com.myfinance.backend.dto.Granularity;
import com.myfinance.backend.dto.NetWorthSummary;
import com.myfinance.backend.dto.PeriodSummary;
import com.myfinance.backend.model.Category;
import com.myfinance.backend.model.Transaction;
import com.myfinance.backend.model.TransactionType;
import com.myfinance.backend.repository.InvestmentRepository;
import com.myfinance.backend.repository.SavingGoalRepository;
import com.myfinance.backend.repository.TransactionRepository;
import com.myfinance.backend.security.SecurityUtils;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ReportServiceImpl implements ReportService {

    private static final DateTimeFormatter DAY_LABEL = DateTimeFormatter.ofPattern("dd/MM");
    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);

    private final TransactionRepository transactionRepository;
    private final InvestmentRepository investmentRepository;
    private final SavingGoalRepository savingGoalRepository;

    public ReportServiceImpl(TransactionRepository transactionRepository,
            InvestmentRepository investmentRepository,
            SavingGoalRepository savingGoalRepository) {
        this.transactionRepository = transactionRepository;
        this.investmentRepository = investmentRepository;
        this.savingGoalRepository = savingGoalRepository;
    }

    @Override
    public NetWorthSummary getNetWorth() {
        UUID userId = SecurityUtils.currentUserId();
        BigDecimal investments = investmentRepository.findByUserId(userId).stream()
                .map(i -> nz(i.getCurrentValue()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal savings = savingGoalRepository.findByUserIdOrderByStartDateDesc(userId).stream()
                .map(g -> nz(g.getCurrentAmount()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new NetWorthSummary(scale2(investments), scale2(savings),
                scale2(investments.add(savings)));
    }

    @Override
    public PeriodSummary getMonthSummary(YearMonth month) {
        Totals current = totals(month.atDay(1), month.atEndOfMonth());
        YearMonth prevMonth = month.minusMonths(1);
        Totals prev = totals(prevMonth.atDay(1), prevMonth.atEndOfMonth());

        BigDecimal net = current.income.subtract(current.expense);
        BigDecimal prevNet = prev.income.subtract(prev.expense);
        BigDecimal savingsRate = current.income.signum() == 0
                ? BigDecimal.ZERO
                : net.multiply(HUNDRED).divide(current.income, 1, RoundingMode.HALF_UP);

        return new PeriodSummary(
                month.toString(),
                scale2(current.income),
                scale2(current.expense),
                scale2(net),
                savingsRate,
                pctChange(current.income, prev.income),
                pctChange(current.expense, prev.expense),
                pctChange(net, prevNet));
    }

    @Override
    public List<CashflowBucket> getCashflow(LocalDate from, LocalDate to, Granularity granularity) {
        List<Transaction> txns = transactionRepository.findByUserIdAndDateBetweenOrderByDateDesc(
                SecurityUtils.currentUserId(), from, to);
        List<CashflowBucket> buckets = new ArrayList<>();
        for (LocalDate[] span : spans(from, to, granularity)) {
            LocalDate start = span[0];
            LocalDate end = span[1];
            BigDecimal income = BigDecimal.ZERO;
            BigDecimal expense = BigDecimal.ZERO;
            for (Transaction t : txns) {
                LocalDate d = t.getDate();
                if (d.isBefore(start) || d.isAfter(end)) {
                    continue;
                }
                if (t.getType() == TransactionType.INCOME) {
                    income = income.add(nz(t.getAmount()));
                } else {
                    expense = expense.add(nz(t.getAmount()));
                }
            }
            buckets.add(new CashflowBucket(start, end, label(start, granularity),
                    scale2(income), scale2(expense), scale2(income.subtract(expense))));
        }
        return buckets;
    }

    @Override
    public List<CategoryTotal> getCategoryTotals(LocalDate from, LocalDate to, TransactionType type) {
        Map<UUID, Acc> byCategory = new LinkedHashMap<>();
        for (Transaction t : transactionRepository.findByUserIdAndDateBetweenOrderByDateDesc(
                SecurityUtils.currentUserId(), from, to)) {
            if (t.getType() != type) {
                continue;
            }
            Category c = t.getCategory();
            UUID key = c == null ? null : c.getId();
            Acc acc = byCategory.computeIfAbsent(key,
                    k -> new Acc(c == null ? "Sem categoria" : c.getName()));
            acc.total = acc.total.add(nz(t.getAmount()));
            acc.count++;
        }
        return byCategory.entrySet().stream()
                .map(e -> new CategoryTotal(e.getKey(), e.getValue().name,
                        scale2(e.getValue().total), e.getValue().count))
                .sorted(Comparator.comparing(CategoryTotal::total).reversed())
                .toList();
    }

    // --- helpers ---

    private Totals totals(LocalDate from, LocalDate to) {
        BigDecimal income = BigDecimal.ZERO;
        BigDecimal expense = BigDecimal.ZERO;
        for (Transaction t : transactionRepository.findByUserIdAndDateBetweenOrderByDateDesc(
                SecurityUtils.currentUserId(), from, to)) {
            if (t.getType() == TransactionType.INCOME) {
                income = income.add(nz(t.getAmount()));
            } else {
                expense = expense.add(nz(t.getAmount()));
            }
        }
        return new Totals(income, expense);
    }

    private static BigDecimal nz(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }

    private static BigDecimal scale2(BigDecimal v) {
        return v.setScale(2, RoundingMode.HALF_UP);
    }

    /** Percent change from {@code prev} to {@code current}, scale 1; null when prev is zero. */
    private static BigDecimal pctChange(BigDecimal current, BigDecimal prev) {
        if (prev.signum() == 0) {
            return null;
        }
        return current.subtract(prev).multiply(HUNDRED)
                .divide(prev.abs(), 1, RoundingMode.HALF_UP);
    }

    private static List<LocalDate[]> spans(LocalDate from, LocalDate to, Granularity granularity) {
        List<LocalDate[]> out = new ArrayList<>();
        if (from.isAfter(to)) {
            return out;
        }
        switch (granularity) {
            case DAY -> {
                for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
                    out.add(new LocalDate[] { d, d });
                }
            }
            case WEEK -> {
                for (LocalDate s = from; !s.isAfter(to); s = s.plusWeeks(1)) {
                    LocalDate e = s.plusDays(6);
                    out.add(new LocalDate[] { s, e.isAfter(to) ? to : e });
                }
            }
            case MONTH -> {
                YearMonth ym = YearMonth.from(from);
                YearMonth last = YearMonth.from(to);
                while (!ym.isAfter(last)) {
                    LocalDate s = ym.atDay(1).isBefore(from) ? from : ym.atDay(1);
                    LocalDate e = ym.atEndOfMonth().isAfter(to) ? to : ym.atEndOfMonth();
                    out.add(new LocalDate[] { s, e });
                    ym = ym.plusMonths(1);
                }
            }
            case QUARTER -> {
                YearMonth ym = YearMonth.of(from.getYear(), ((from.getMonthValue() - 1) / 3) * 3 + 1);
                YearMonth last = YearMonth.from(to);
                while (!ym.isAfter(last)) {
                    YearMonth quarterEnd = ym.plusMonths(2);
                    LocalDate s = ym.atDay(1).isBefore(from) ? from : ym.atDay(1);
                    LocalDate e = quarterEnd.atEndOfMonth().isAfter(to) ? to : quarterEnd.atEndOfMonth();
                    out.add(new LocalDate[] { s, e });
                    ym = ym.plusMonths(3);
                }
            }
            case YEAR -> {
                for (int y = from.getYear(); y <= to.getYear(); y++) {
                    LocalDate jan1 = LocalDate.of(y, 1, 1);
                    LocalDate dec31 = LocalDate.of(y, 12, 31);
                    LocalDate s = jan1.isBefore(from) ? from : jan1;
                    LocalDate e = dec31.isAfter(to) ? to : dec31;
                    out.add(new LocalDate[] { s, e });
                }
            }
        }
        return out;
    }

    private static String label(LocalDate start, Granularity granularity) {
        return switch (granularity) {
            case DAY, WEEK -> start.format(DAY_LABEL);
            case MONTH -> YearMonth.from(start).toString();
            case QUARTER -> start.getYear() + "-Q" + ((start.getMonthValue() - 1) / 3 + 1);
            case YEAR -> String.valueOf(start.getYear());
        };
    }

    private record Totals(BigDecimal income, BigDecimal expense) {
    }

    private static final class Acc {
        private final String name;
        private BigDecimal total = BigDecimal.ZERO;
        private long count = 0;

        private Acc(String name) {
            this.name = name;
        }
    }
}
