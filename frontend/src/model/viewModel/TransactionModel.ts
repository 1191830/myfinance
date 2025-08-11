// viewmodels/TransactionViewModel.ts
import type { Transaction, TransactionType, Frequency } from '../TransactionModel';

export interface TransactionViewModel {
  amount: string;       // formatado, ex: "€150,00"
  description: string;
  date: string;         // formatado, ex: "08/08/2025"
  categoryId: string;   // poderíamos trocar pelo nome da categoria se quisermos resolver no mapper
  type: string;         // "Rendimento" | "Despesa"
  frequency: string;    // "Único" | "Recorrente"
}

const formatCurrency = (value: number): string =>
  value.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });

const formatDate = (isoDate: string): string =>
  new Date(isoDate).toLocaleDateString('pt-PT');

const typeLabelMap: Record<TransactionType, string> = {
  INCOME: 'Rendimento',
  EXPENSE: 'Despesa',
};

const frequencyLabelMap: Record<Frequency, string> = {
  ONE_TIME: 'Único',
  RECURRING: 'Recorrente',
};

export const toTransactionViewModel = (t: Transaction): TransactionViewModel => ({
  amount: formatCurrency(t.amount),
  description: t.description,
  date: formatDate(t.date),
  categoryId: t.categoryId,
  type: typeLabelMap[t.type],
  frequency: frequencyLabelMap[t.frequency],
});

export const toTransactionViewModelList = (transactions: Transaction[]): TransactionViewModel[] =>
  transactions.map(toTransactionViewModel);
