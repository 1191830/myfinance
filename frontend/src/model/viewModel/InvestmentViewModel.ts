// viewmodels/InvestmentViewModel.ts
import type { Investment } from '../InvestmentModel';

export interface InvestmentViewModel {
  type: string;
  ticker?: string;
  amountInvested: string;  // já formatado, ex: €1.200,50
  currentValue: string;    // já formatado
  startDate: string;       // formatado, ex: 08/08/2025
  notes?: string;
  lastSynced?: string;     // formatado ou "Nunca"
  profitLoss: string;      // diferença formatada
}

const formatCurrency = (value: number): string =>
  value.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });

const formatDate = (date?: string): string =>
  date ? new Date(date).toLocaleDateString('pt-PT') : '';

export const toInvestmentViewModel = (investment: Investment): InvestmentViewModel => {
  const profitLossValue = investment.currentValue - investment.amountInvested;

  return {
    type: investment.type,
    ticker: investment.ticker,
    amountInvested: formatCurrency(investment.amountInvested),
    currentValue: formatCurrency(investment.currentValue),
    startDate: formatDate(investment.startDate),
    notes: investment.notes,
    lastSynced: investment.lastSynced ? formatDate(investment.lastSynced) : 'Nunca',
    profitLoss: formatCurrency(profitLossValue),
  };
};

export const toInvestmentViewModelList = (investments: Investment[]): InvestmentViewModel[] =>
  investments.map(toInvestmentViewModel);
