export interface Investment {
  id?: string;
  type: string;       // e.g., 'ETF', 'Stock', 'Crypto'
  ticker?: string;
  amountInvested: number;
  currentValue: number;
  startDate: string;  // ISO string, ex: '2025-08-08'
  notes?: string;
  lastSynced?: string; // ISO string ou null
}