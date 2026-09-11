import type { TransactionType, Frequency, TransactionModel } from './TransactionModel';

export interface RecurringTransaction {
  id: string;
  type: TransactionType;
  frequency: Frequency; // sempre 'RECURRING'
  categoryId: string;
  amount: number;
  description?: string;
  startDate: string; // ISO string
  endDate?: string; // ISO string ou undefined
  active: boolean;
  transactions?: TransactionModel[]; // transações geradas desta recorrência
}
