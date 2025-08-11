// viewmodels/SavingGoalViewModel.ts
import type { SavingGoal } from '../SavingGoalModel';

export interface SavingGoalViewModel {
  name: string;
  targetAmount: string;    // formatado, ex: €10.000,00
  currentAmount: string;   // formatado
  startDate: string;       // formatado
  endDate?: string;        // formatado ou "Sem data"
  progress: string;        // percentagem, ex: "45%"
}

const formatCurrency = (value: number): string =>
  value.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });

const formatDate = (date?: string | null): string =>
  date ? new Date(date).toLocaleDateString('pt-PT') : 'Sem data';

export const toSavingGoalViewModel = (goal: SavingGoal): SavingGoalViewModel => {
  const currentAmountValue = goal.currentAmount ?? 0;
  const progressValue =
    goal.targetAmount > 0
      ? (currentAmountValue / goal.targetAmount) * 100
      : 0;

  return {
    name: goal.name,
    targetAmount: formatCurrency(goal.targetAmount),
    currentAmount: formatCurrency(currentAmountValue),
    startDate: formatDate(goal.startDate),
    endDate: formatDate(goal.endDate),
    progress: `${progressValue.toFixed(0)}%`,
  };
};

export const toSavingGoalViewModelList = (goals: SavingGoal[]): SavingGoalViewModel[] =>
  goals.map(toSavingGoalViewModel);
