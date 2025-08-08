export interface SavingGoal {
  id?: string;
  name: string;
  targetAmount: number;
  currentAmount?: number;
  startDate: string; // ISO string, ex: '2025-08-08'
  endDate?: string | null; // ISO string ou null
}