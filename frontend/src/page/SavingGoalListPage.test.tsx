import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SavingGoalsListPage } from './SavingGoalListPage';
import {
  useSavingGoals,
  useDeleteSavingGoal,
  useCreateSavingGoal,
  useUpdateSavingGoal,
} from '../hook/useSavingGoal';
import { formatCurrency, formatPercent } from '../lib/format';
import type { SavingGoal } from '../model/SavingGoalModel';

vi.mock('../hook/useSavingGoal', () => ({
  useSavingGoals: vi.fn(),
  useDeleteSavingGoal: vi.fn(),
  useCreateSavingGoal: vi.fn(),
  useUpdateSavingGoal: vi.fn(),
}));

const mockedUseSavingGoals = vi.mocked(useSavingGoals);
const mockedUseDeleteSavingGoal = vi.mocked(useDeleteSavingGoal);
const mockedUseCreateSavingGoal = vi.mocked(useCreateSavingGoal);
const mockedUseUpdateSavingGoal = vi.mocked(useUpdateSavingGoal);

// getByText normalizes the DOM's own text (collapsing an NBSP to a regular space) but does
// NOT normalize the query string itself - so a query built from formatCurrency's real NBSP
// output would never match. Match with a regular space instead.
const NBSP = String.fromCharCode(160);
const norm = (s: string) => s.split(NBSP).join(String.fromCharCode(32));

const inMonths = (months: number) => {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
};

const goals: SavingGoal[] = [
  { id: 'g1', name: 'Casa', targetAmount: 10000, currentAmount: 4000, startDate: '2025-01-01', endDate: inMonths(6) },
  { id: 'g2', name: 'Carro', targetAmount: 5000, currentAmount: 5000, startDate: '2025-01-01', endDate: inMonths(3) },
  { id: 'g3', name: 'Férias', targetAmount: 2000, currentAmount: 500, startDate: '2024-01-01', endDate: '2024-06-01' }, // in the past
];

describe('SavingGoalsListPage', () => {
  beforeEach(() => {
    mockedUseSavingGoals.mockReturnValue({
      data: goals,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useSavingGoals>);
    mockedUseDeleteSavingGoal.mockReturnValue({ mutate: vi.fn() } as unknown as ReturnType<typeof useDeleteSavingGoal>);
    mockedUseCreateSavingGoal.mockReturnValue({ mutate: vi.fn(), isPending: false } as unknown as ReturnType<typeof useCreateSavingGoal>);
    mockedUseUpdateSavingGoal.mockReturnValue({ mutate: vi.fn(), isPending: false } as unknown as ReturnType<typeof useUpdateSavingGoal>);
  });

  it('filters the list by the search box, client-side', async () => {
    const user = userEvent.setup();
    render(<SavingGoalsListPage />);

    expect(screen.getByText('Casa')).toBeInTheDocument();
    expect(screen.getByText('Carro')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('Procurar objetivo…'), 'casa');

    expect(screen.getByText('Casa')).toBeInTheDocument();
    expect(screen.queryByText('Carro')).not.toBeInTheDocument();
    expect(screen.queryByText('Férias')).not.toBeInTheDocument();
  });

  it('computes total saved/target and the average-of-percentages progress', () => {
    render(<SavingGoalsListPage />);

    // saved: 4000+5000+500=9500, target: 10000+5000+2000=17000
    expect(screen.getByText(norm(formatCurrency(9500)))).toBeInTheDocument();
    expect(screen.getByText(norm(formatCurrency(17000)))).toBeInTheDocument();
    // pct per goal: 40, 100, 25 -> average 55
    expect(screen.getByText(norm(formatPercent(55, 0)))).toBeInTheDocument();
  });

  it("shows a monthly-required figure only for a goal with a future end date", () => {
    render(<SavingGoalsListPage />);

    const casaCard = screen.getByText('Casa').closest('.rounded-card') as HTMLElement;
    expect(within(casaCard).getByText(/\/mês/)).toBeInTheDocument();

    const feriasCard = screen.getByText('Férias').closest('.rounded-card') as HTMLElement;
    expect(within(feriasCard).queryByText(/\/mês/)).not.toBeInTheDocument();
  });
});
