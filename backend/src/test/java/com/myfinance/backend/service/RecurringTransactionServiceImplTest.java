package com.myfinance.backend.service;

import com.myfinance.backend.model.Category;
import com.myfinance.backend.model.RecurrenceInterval;
import com.myfinance.backend.model.RecurringTransaction;
import com.myfinance.backend.model.TransactionFrequency;
import com.myfinance.backend.model.TransactionType;
import com.myfinance.backend.model.User;
import com.myfinance.backend.repository.CategoryRepository;
import com.myfinance.backend.repository.RecurringTransactionRepository;
import com.myfinance.backend.repository.UserRepository;
import com.myfinance.backend.security.CurrentHousehold;
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
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RecurringTransactionServiceImplTest {

    private static final UUID TEST_USER_ID = UUID.randomUUID();
    private static final UUID TEST_HOUSEHOLD_ID = UUID.randomUUID();

    @Mock
    private RecurringTransactionRepository recurringTransactionRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private CurrentHousehold currentHousehold;
    @Mock
    private TransactionService transactionService;

    @BeforeEach
    void setUpSecurityContext() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(TEST_USER_ID, null, List.of()));
        User testUser = new User();
        testUser.setId(TEST_USER_ID);
        lenient().when(userRepository.findById(TEST_USER_ID)).thenReturn(Optional.of(testUser));
        lenient().when(currentHousehold.resolve()).thenReturn(TEST_HOUSEHOLD_ID);
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    private RecurringTransactionServiceImpl service() {
        return new RecurringTransactionServiceImpl(recurringTransactionRepository, categoryRepository,
                userRepository, currentHousehold, transactionService);
    }

    private static RecurringTransaction template() {
        RecurringTransaction t = new RecurringTransaction();
        t.setType(TransactionType.EXPENSE);
        t.setFrequency(TransactionFrequency.RECURRING);
        t.setRecurrenceInterval(RecurrenceInterval.MONTHLY);
        t.setAmount(BigDecimal.TEN);
        t.setStartDate(LocalDate.of(2026, 1, 1));
        t.setActive(true);
        return t;
    }

    @Test
    void createRecurringTransaction_resolvesBareDeserializedCategoryAgainstTheRealRow() {
        UUID categoryId = UUID.randomUUID();
        Category realCategory = new Category();
        realCategory.setId(categoryId);
        realCategory.setName("Food");
        when(categoryRepository.findByIdAndHouseholdId(categoryId, TEST_HOUSEHOLD_ID))
                .thenReturn(Optional.of(realCategory));
        when(recurringTransactionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Category bareCategory = new Category();
        bareCategory.setId(categoryId);
        RecurringTransaction transaction = template();
        transaction.setCategory(bareCategory);

        service().createRecurringTransaction(transaction);

        ArgumentCaptor<RecurringTransaction> captor = ArgumentCaptor.forClass(RecurringTransaction.class);
        verify(recurringTransactionRepository).save(captor.capture());
        assertThat(captor.getValue().getCategory()).isSameAs(realCategory);
    }

    @Test
    void createRecurringTransaction_throwsWhenCategoryIdIsUnknown() {
        UUID unknownId = UUID.randomUUID();
        when(categoryRepository.findByIdAndHouseholdId(unknownId, TEST_HOUSEHOLD_ID)).thenReturn(Optional.empty());
        Category bareCategory = new Category();
        bareCategory.setId(unknownId);
        RecurringTransaction transaction = template();
        transaction.setCategory(bareCategory);

        assertThatThrownBy(() -> service().createRecurringTransaction(transaction))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void createRecurringTransaction_triggersBackfillExactlyOnce() {
        when(recurringTransactionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service().createRecurringTransaction(template());

        verify(transactionService, times(1)).generateMonthlyTransactions();
    }
}
