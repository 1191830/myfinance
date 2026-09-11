export type TransactionType = 'INCOME' | 'EXPENSE';
export type Frequency = 'ONE_TIME' | 'RECURRING';

export interface TransactionModel {
  id: string;
  type: TransactionType;
  frequency: Frequency;
  category?: {
    id: string;
    name: string;
  } | null;
  amount: number
  date: string; // ISO string
  description: string;
  recurringTransaction?: {
    id: string;
    frequency: Frequency;
  } | null;
}
