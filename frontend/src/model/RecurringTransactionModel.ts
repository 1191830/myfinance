import type { TransactionType, Frequency } from './TransactionModel';

export type RecurrenceInterval = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export interface RecurringTransactionModel {
  id: string;
  type: TransactionType;
  frequency: Frequency; // always 'RECURRING' — never a form control, set as a constant
  recurrenceInterval: RecurrenceInterval;
  category?: {
    id: string;
    name: string;
  } | null;
  amount: number;
  description: string;
  startDate: string; // ISO string
  endDate?: string | null; // ISO string, optional
  active: boolean;
}
