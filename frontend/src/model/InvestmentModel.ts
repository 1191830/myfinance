export interface Investment {
  id?: string;
  type: string;       // e.g., 'ETF', 'Stock', 'Crypto'
  ticker?: string;
  quantity?: number; // units held; optional, needed to roll currentPrice into currentValue
  amountInvested: number;
  currentValue: number;
  startDate: string;  // ISO string, ex: '2025-08-08'
  notes?: string;
  lastSynced?: string; // ISO string ou null
  currentPrice?: number; // per-unit live price from sync, independent of quantity
}