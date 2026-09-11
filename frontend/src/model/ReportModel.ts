// Mirrors com.myfinance.backend.dto.* — responses from /api/reports/*.

export type Granularity = 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';

export interface NetWorthSummary {
  investmentsValue: number;
  savingsValue: number;
  total: number;
}

export interface PeriodSummary {
  month: string; // "YYYY-MM"
  income: number;
  expense: number;
  net: number;
  savingsRate: number; // percent, e.g. 43.2
  incomeDeltaPct: number | null; // percent vs previous month; null when prev was 0
  expenseDeltaPct: number | null;
  netDeltaPct: number | null;
}

export interface CashflowBucket {
  start: string; // ISO date
  end: string; // ISO date
  label: string;
  income: number;
  expense: number;
  net: number;
}

export interface CategoryTotal {
  categoryId: string | null;
  categoryName: string;
  total: number;
  count: number;
}
