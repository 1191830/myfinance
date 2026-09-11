import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type Period = 'CURRENT' | 'PREVIOUS';

interface PeriodContextValue {
  period: Period;
  setPeriod: (period: Period) => void;
}

const PeriodContext = createContext<PeriodContextValue | null>(null);

/** Shared across AppShell's Topbar and OverviewPage — they're siblings, not parent/child. */
export const PeriodProvider = ({ children }: { children: ReactNode }) => {
  const [period, setPeriod] = useState<Period>('CURRENT');
  return <PeriodContext.Provider value={{ period, setPeriod }}>{children}</PeriodContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const usePeriod = () => {
  const ctx = useContext(PeriodContext);
  if (!ctx) throw new Error('usePeriod must be used within a PeriodProvider');
  return ctx;
};
