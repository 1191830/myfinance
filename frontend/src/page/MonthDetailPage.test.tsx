import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MonthlyTransactionsPage } from './MonthDetailPage';
import { useTransactions, useDeleteTransaction, useCreateTransaction, useUpdateTransaction } from '../hook/useTransaction';
import { useMonthSummary } from '../hook/useReports';
import { useCategories } from '../hook/useCategory';
import { useCreateRecurringTransaction } from '../hook/useRecurringTransaction';
import type { TransactionModel } from '../model/TransactionModel';

vi.mock('../hook/useTransaction', () => ({
  useTransactions: vi.fn(),
  useDeleteTransaction: vi.fn(),
  useCreateTransaction: vi.fn(),
  useUpdateTransaction: vi.fn(),
}));
vi.mock('../hook/useReports', () => ({
  useMonthSummary: vi.fn(),
}));
vi.mock('../hook/useCategory', () => ({
  useCategories: vi.fn(),
}));
vi.mock('../hook/useRecurringTransaction', () => ({
  useCreateRecurringTransaction: vi.fn(),
}));

const mockedUseTransactions = vi.mocked(useTransactions);
const mockedUseDeleteTransaction = vi.mocked(useDeleteTransaction);
const mockedUseCreateTransaction = vi.mocked(useCreateTransaction);
const mockedUseUpdateTransaction = vi.mocked(useUpdateTransaction);
const mockedUseMonthSummary = vi.mocked(useMonthSummary);
const mockedUseCategories = vi.mocked(useCategories);
const mockedUseCreateRecurringTransaction = vi.mocked(useCreateRecurringTransaction);

const tx = (overrides: Partial<TransactionModel>): TransactionModel => ({
  id: overrides.id ?? 'tx-id',
  type: 'EXPENSE',
  frequency: 'ONE_TIME',
  category: { id: 'cat-1', name: 'Geral' },
  amount: 10,
  date: '2026-03-01',
  description: 'Transação',
  ...overrides,
});

const fixtures: TransactionModel[] = [
  tx({ id: 't1', date: '2026-03-05', type: 'EXPENSE', amount: 50, description: 'Groceries' }),
  tx({ id: 't2', date: '2026-03-20', type: 'INCOME', amount: 2000, description: 'Salary' }),
  tx({ id: 't3', date: '2026-03-10', type: 'EXPENSE', amount: 200, description: 'Rent partial' }),
  tx({ id: 't4', date: '2026-04-01', type: 'EXPENSE', amount: 999, description: 'April item' }),
];

const renderPage = (initialEntry: string) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/transactions/monthly" element={<MonthlyTransactionsPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('MonthlyTransactionsPage', () => {
  beforeEach(() => {
    mockedUseTransactions.mockReturnValue({ data: fixtures } as ReturnType<typeof useTransactions>);
    mockedUseDeleteTransaction.mockReturnValue({ mutate: vi.fn() } as unknown as ReturnType<typeof useDeleteTransaction>);
    mockedUseCreateTransaction.mockReturnValue({ mutate: vi.fn(), isPending: false } as unknown as ReturnType<typeof useCreateTransaction>);
    mockedUseUpdateTransaction.mockReturnValue({ mutate: vi.fn(), isPending: false } as unknown as ReturnType<typeof useUpdateTransaction>);
    mockedUseMonthSummary.mockReturnValue({
      data: { income: 2000, expense: 250, net: 1750, netDeltaPct: 0 },
    } as unknown as ReturnType<typeof useMonthSummary>);
    mockedUseCategories.mockReturnValue({ data: [] } as unknown as ReturnType<typeof useCategories>);
    mockedUseCreateRecurringTransaction.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useCreateRecurringTransaction>);
  });

  it('filters to the given month, sorts by descending absolute amount, and splits into receitas/despesas', () => {
    renderPage('/transactions/monthly?year=2026&month=3');

    expect(screen.getByText('3 movimentos')).toBeInTheDocument();
    expect(screen.queryByText('April item')).not.toBeInTheDocument();

    // Salary (income) landed in the receitas list.
    expect(screen.getByText('Salary')).toBeInTheDocument();

    // Despesas sorted by |amount| desc: Rent partial (200) before Groceries (50).
    const despesaDescriptions = screen
      .getAllByText(/Rent partial|Groceries/)
      .map((el) => el.textContent);
    expect(despesaDescriptions).toEqual(['Rent partial', 'Groceries']);
  });

  it('falls back to the current month when params are missing', () => {
    const now = new Date();
    const expectedMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    renderPage('/transactions/monthly');

    expect(mockedUseMonthSummary).toHaveBeenCalledWith(expectedMonth);
  });

  it('navigates to the adjacent month when the next-month arrow is clicked', () => {
    renderPage('/transactions/monthly?year=2026&month=3');
    mockedUseMonthSummary.mockClear();

    const unnamedButtons = screen.getAllByRole('button', { name: '' });
    expect(unnamedButtons).toHaveLength(2); // prev, next arrows
    fireEvent.click(unnamedButtons[1]);

    expect(mockedUseMonthSummary).toHaveBeenCalledWith('2026-04');
  });
});
