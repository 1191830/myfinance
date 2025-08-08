export type TransactionType = 'INCOME' | 'EXPENSE';

export type Frequency = 'ONE_TIME' | 'RECURRING';

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string; // ISO string, ex: "2025-08-08"
  categoryId: string;
  type: TransactionType;
  frequency: Frequency;
}
