package com.myfinance.backend.service;

import com.myfinance.backend.model.Category;
import com.myfinance.backend.model.RecurrenceInterval;
import com.myfinance.backend.model.RecurringTransaction;
import com.myfinance.backend.model.Transaction;
import com.myfinance.backend.model.TransactionFrequency;
import com.myfinance.backend.model.TransactionType;
import com.myfinance.backend.model.User;
import com.myfinance.backend.repository.CategoryRepository;
import com.myfinance.backend.repository.RecurringTransactionRepository;
import com.myfinance.backend.repository.TransactionRepository;
import com.myfinance.backend.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TransactionServiceImplTest {

    private static final UUID TEST_USER_ID = UUID.randomUUID();

    @Mock
    private TransactionRepository transactionRepository;
    @Mock
    private RecurringTransactionRepository recurringTransactionRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private UserRepository userRepository;

    @BeforeEach
    void setUpSecurityContext() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(TEST_USER_ID, null, List.of()));
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    private TransactionServiceImpl service(LocalDate today) {
        Clock clock = Clock.fixed(today.atStartOfDay(ZoneOffset.UTC).toInstant(), ZoneOffset.UTC);
        return new TransactionServiceImpl(transactionRepository, recurringTransactionRepository,
                categoryRepository, userRepository, clock);
    }

    private static RecurringTransaction template(LocalDate startDate, LocalDate endDate,
            RecurrenceInterval interval) {
        RecurringTransaction t = new RecurringTransaction();
        t.setId(UUID.randomUUID());
        t.setType(TransactionType.EXPENSE);
        t.setFrequency(TransactionFrequency.RECURRING);
        t.setRecurrenceInterval(interval);
        t.setAmount(BigDecimal.TEN);
        t.setDescription("Test template");
        t.setStartDate(startDate);
        t.setEndDate(endDate);
        t.setActive(true);
        return t;
    }

    // --- generateMonthlyTransactions ---

    @Test
    void generateMonthlyTransactions_backfillsEveryMonthUpToToday() {
        RecurringTransaction template = template(LocalDate.of(2026, 1, 15), null, RecurrenceInterval.MONTHLY);
        when(recurringTransactionRepository.findByUserIdAndActiveTrue(TEST_USER_ID)).thenReturn(List.of(template));
        when(transactionRepository.existsByRecurringTransactionAndDateBetween(any(), any(), any()))
                .thenReturn(false);

        int created = service(LocalDate.of(2026, 4, 10)).generateMonthlyTransactions();

        assertThat(created).isEqualTo(3); // Jan 15, Feb 15, Mar 15 - Apr 15 is after "today"
        ArgumentCaptor<Transaction> captor = ArgumentCaptor.forClass(Transaction.class);
        verify(transactionRepository, times(3)).save(captor.capture());
        assertThat(captor.getAllValues().stream().map(Transaction::getDate).toList())
                .containsExactly(LocalDate.of(2026, 1, 15), LocalDate.of(2026, 2, 15), LocalDate.of(2026, 3, 15));
    }

    @Test
    void generateMonthlyTransactions_clampsDayOfMonthWhenTargetMonthIsShorter() {
        RecurringTransaction template = template(LocalDate.of(2026, 1, 31), null, RecurrenceInterval.MONTHLY);
        when(recurringTransactionRepository.findByUserIdAndActiveTrue(TEST_USER_ID)).thenReturn(List.of(template));
        when(transactionRepository.existsByRecurringTransactionAndDateBetween(any(), any(), any()))
                .thenReturn(false);

        int created = service(LocalDate.of(2026, 3, 1)).generateMonthlyTransactions();

        assertThat(created).isEqualTo(2);
        ArgumentCaptor<Transaction> captor = ArgumentCaptor.forClass(Transaction.class);
        verify(transactionRepository, times(2)).save(captor.capture());
        // 2026 is not a leap year - Feb has 28 days, so Jan 31's monthly occurrence clamps to Feb 28.
        assertThat(captor.getAllValues().stream().map(Transaction::getDate).toList())
                .containsExactly(LocalDate.of(2026, 1, 31), LocalDate.of(2026, 2, 28));
    }

    @Test
    void generateMonthlyTransactions_quarterlyStepsThreeMonths() {
        RecurringTransaction template = template(LocalDate.of(2026, 1, 10), null, RecurrenceInterval.QUARTERLY);
        when(recurringTransactionRepository.findByUserIdAndActiveTrue(TEST_USER_ID)).thenReturn(List.of(template));
        when(transactionRepository.existsByRecurringTransactionAndDateBetween(any(), any(), any()))
                .thenReturn(false);

        int created = service(LocalDate.of(2026, 8, 1)).generateMonthlyTransactions();

        ArgumentCaptor<Transaction> captor = ArgumentCaptor.forClass(Transaction.class);
        verify(transactionRepository, times(3)).save(captor.capture());
        assertThat(created).isEqualTo(3);
        assertThat(captor.getAllValues().stream().map(Transaction::getDate).toList())
                .containsExactly(LocalDate.of(2026, 1, 10), LocalDate.of(2026, 4, 10), LocalDate.of(2026, 7, 10));
    }

    @Test
    void generateMonthlyTransactions_stopsAtEndDate() {
        RecurringTransaction template = template(LocalDate.of(2026, 1, 10), LocalDate.of(2026, 2, 28),
                RecurrenceInterval.MONTHLY);
        when(recurringTransactionRepository.findByUserIdAndActiveTrue(TEST_USER_ID)).thenReturn(List.of(template));
        when(transactionRepository.existsByRecurringTransactionAndDateBetween(any(), any(), any()))
                .thenReturn(false);

        int created = service(LocalDate.of(2026, 6, 1)).generateMonthlyTransactions();

        assertThat(created).isEqualTo(2); // Jan 10, Feb 10 - Mar 10 is after the endDate
        verify(transactionRepository, times(2)).save(any());
    }

    @Test
    void generateMonthlyTransactions_isIdempotentWhenPeriodAlreadyExists() {
        RecurringTransaction template = template(LocalDate.of(2026, 1, 10), null, RecurrenceInterval.MONTHLY);
        when(recurringTransactionRepository.findByUserIdAndActiveTrue(TEST_USER_ID)).thenReturn(List.of(template));
        when(transactionRepository.existsByRecurringTransactionAndDateBetween(any(), any(), any()))
                .thenReturn(true);

        int created = service(LocalDate.of(2026, 4, 1)).generateMonthlyTransactions();

        assertThat(created).isZero();
        verify(transactionRepository, never()).save(any());
    }

    @Test
    void generateMonthlyTransactions_generatesNothingForAFutureStartDate() {
        RecurringTransaction template = template(LocalDate.of(2027, 1, 1), null, RecurrenceInterval.MONTHLY);
        when(recurringTransactionRepository.findByUserIdAndActiveTrue(TEST_USER_ID)).thenReturn(List.of(template));

        int created = service(LocalDate.of(2026, 6, 1)).generateMonthlyTransactions();

        assertThat(created).isZero();
        verify(transactionRepository, never()).save(any());
    }

    // --- category resolution (regression test for the transient-entity fix) ---

    @Test
    void createTransaction_resolvesBareDeserializedCategoryAgainstTheRealRow() {
        UUID categoryId = UUID.randomUUID();
        Category realCategory = new Category();
        realCategory.setId(categoryId);
        realCategory.setName("Food");
        when(categoryRepository.findByIdAndUserId(categoryId, TEST_USER_ID)).thenReturn(Optional.of(realCategory));
        User testUser = new User();
        testUser.setId(TEST_USER_ID);
        when(userRepository.findById(TEST_USER_ID)).thenReturn(Optional.of(testUser));
        when(transactionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Category bareCategory = new Category();
        bareCategory.setId(categoryId); // no name - exactly what Jackson deserializes from a request body
        Transaction transaction = new Transaction();
        transaction.setType(TransactionType.EXPENSE);
        transaction.setFrequency(TransactionFrequency.ONE_TIME);
        transaction.setAmount(BigDecimal.TEN);
        transaction.setDate(LocalDate.now());
        transaction.setDescription("Groceries");
        transaction.setCategory(bareCategory);

        service(LocalDate.now()).createTransaction(transaction);

        ArgumentCaptor<Transaction> captor = ArgumentCaptor.forClass(Transaction.class);
        verify(transactionRepository).save(captor.capture());
        assertThat(captor.getValue().getCategory()).isSameAs(realCategory);
    }

    @Test
    void createTransaction_clearsCategoryWhenNone() {
        User testUser = new User();
        testUser.setId(TEST_USER_ID);
        when(userRepository.findById(TEST_USER_ID)).thenReturn(Optional.of(testUser));
        when(transactionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        Transaction transaction = new Transaction();
        transaction.setCategory(null);

        service(LocalDate.now()).createTransaction(transaction);

        ArgumentCaptor<Transaction> captor = ArgumentCaptor.forClass(Transaction.class);
        verify(transactionRepository).save(captor.capture());
        assertThat(captor.getValue().getCategory()).isNull();
    }

    @Test
    void createTransaction_throwsWhenCategoryIdIsUnknown() {
        UUID unknownId = UUID.randomUUID();
        when(categoryRepository.findByIdAndUserId(unknownId, TEST_USER_ID)).thenReturn(Optional.empty());
        Category bareCategory = new Category();
        bareCategory.setId(unknownId);
        Transaction transaction = new Transaction();
        transaction.setCategory(bareCategory);

        assertThatThrownBy(() -> service(LocalDate.now()).createTransaction(transaction))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
