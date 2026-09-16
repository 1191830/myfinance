export type TransactionType = 'INCOME' | 'EXPENSE';
export type Frequency = 'ONE_TIME' | 'RECURRING';

// Matches Spring Data's PagedModel JSON shape ({content, page: {...}}).
export interface PagedResponse<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

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
