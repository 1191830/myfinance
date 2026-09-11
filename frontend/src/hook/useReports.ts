import { useQuery } from '@tanstack/react-query';
import type {
  CashflowBucket,
  CategoryTotal,
  Granularity,
  NetWorthSummary,
  PeriodSummary,
} from '../model/ReportModel';
import {
  getCashflow,
  getExpensesByCategory,
  getMonthSummary,
  getNetWorth,
} from '../service/ReportService';

export const useNetWorth = () =>
  useQuery<NetWorthSummary>({
    queryKey: ['reports', 'net-worth'],
    queryFn: getNetWorth,
  });

/** month: "YYYY-MM" */
export const useMonthSummary = (month: string) =>
  useQuery<PeriodSummary>({
    queryKey: ['reports', 'summary', month],
    queryFn: () => getMonthSummary(month),
    enabled: !!month,
  });

export const useCashflow = (from: string, to: string, granularity: Granularity) =>
  useQuery<CashflowBucket[]>({
    queryKey: ['reports', 'cashflow', from, to, granularity],
    queryFn: () => getCashflow(from, to, granularity),
    enabled: !!from && !!to,
  });

export const useExpensesByCategory = (from: string, to: string) =>
  useQuery<CategoryTotal[]>({
    queryKey: ['reports', 'by-category', from, to],
    queryFn: () => getExpensesByCategory(from, to),
    enabled: !!from && !!to,
  });
