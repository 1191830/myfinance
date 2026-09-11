import api from '../config/axios';
import type {
  CashflowBucket,
  CategoryTotal,
  Granularity,
  NetWorthSummary,
  PeriodSummary,
} from '../model/ReportModel';

const ENDPOINT = '/reports';

export const getNetWorth = async (): Promise<NetWorthSummary> => {
  const response = await api.get<NetWorthSummary>(`${ENDPOINT}/net-worth`);
  return response.data;
};

/** month: "YYYY-MM" */
export const getMonthSummary = async (month: string): Promise<PeriodSummary> => {
  const response = await api.get<PeriodSummary>(`${ENDPOINT}/summary`, {
    params: { month },
  });
  return response.data;
};

export const getCashflow = async (
  from: string,
  to: string,
  granularity: Granularity,
): Promise<CashflowBucket[]> => {
  const response = await api.get<CashflowBucket[]>(`${ENDPOINT}/cashflow`, {
    params: { from, to, granularity },
  });
  return response.data;
};

export const getExpensesByCategory = async (
  from: string,
  to: string,
): Promise<CategoryTotal[]> => {
  const response = await api.get<CategoryTotal[]>(`${ENDPOINT}/by-category`, {
    params: { from, to, type: 'EXPENSE' },
  });
  return response.data;
};
