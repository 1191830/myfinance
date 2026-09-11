// Shared "which month is the app looking at" helpers — used by OverviewPage (KPIs, chart)
// and CategoryListPage (budget progress), so "this month" means the same thing everywhere.

/** Anchor on the month of the most recent transaction; falls back to today when there are none. */
export const latestTransactionMonth = (transactions: { date: string }[] | undefined): string => {
  if (transactions && transactions.length) {
    return transactions
      .reduce((max, t) => (t.date > max ? t.date : max), transactions[0].date)
      .slice(0, 7);
  }
  return new Date().toISOString().slice(0, 7);
};

export const monthBounds = (ym: string) => {
  const [y, m] = ym.split('-').map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  const prevYm = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`;
  return {
    first: `${ym}-01`,
    last: `${ym}-${String(lastDay).padStart(2, '0')}`,
    prevFirst: `${prevYm}-01`,
    prevYm,
  };
};

export const oneMonthBefore = (ym: string) => {
  const [y, m] = ym.split('-').map(Number);
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`;
};
