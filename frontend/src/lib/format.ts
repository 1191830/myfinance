// pt-PT / EUR formatting helpers, shared across screens.

const eur = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' });
const eur0 = new Intl.NumberFormat('pt-PT', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

/** e.g. 1840.2 -> "1840,20 €" */
export const formatCurrency = (value: number): string => eur.format(value);

/** e.g. 6500 -> "6500 €" (no cents) */
export const formatCurrencyShort = (value: number): string => eur0.format(value);

/** Signed currency, e.g. -68.4 -> "−68,40 €", 4250 -> "+4250,00 €" */
export const formatSignedCurrency = (value: number): string =>
  (value > 0 ? '+' : value < 0 ? '−' : '') + eur.format(Math.abs(value));

/** e.g. 43.2 -> "43,2%"; pass already-computed percent, not a ratio */
export const formatPercent = (value: number, digits = 1): string =>
  `${value.toLocaleString('pt-PT', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  })}%`;

/** ISO date -> "08/09" */
export const formatDayMonth = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
};

/** ISO date -> "08/09/2025" */
export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('pt-PT');

/** ISO date -> "set. 2025" */
export const formatMonthYear = (iso: string): string =>
  new Date(iso).toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' });

export const TYPE_LABEL: Record<'INCOME' | 'EXPENSE', string> = {
  INCOME: 'Rendimento',
  EXPENSE: 'Despesa',
};

export const FREQUENCY_LABEL: Record<'ONE_TIME' | 'RECURRING', string> = {
  ONE_TIME: 'Único',
  RECURRING: 'Recorrente',
};
