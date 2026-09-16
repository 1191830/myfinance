// hooks/useInvestment.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Investment } from '../model/InvestmentModel';
import {
  getAllInvestments,
  getInvestmentById,
  createInvestment,
  updateInvestment,
  deleteInvestment,
  getInvestmentsByType,
  getInvestmentsByTicker,
  getInvestmentsByCurrentValueGreaterThan,
  getInvestmentsLastSyncedBefore,
  syncInvestmentPrices,
  buyMoreInvestment,
} from '../service/InvestmentService';

export const useInvestments = () => {
  return useQuery<Investment[]>({
    queryKey: ['investments'],
    queryFn: getAllInvestments,
  });
};

export const useInvestment = (id: string) => {
  return useQuery<Investment>({
    queryKey: ['investment', id],
    queryFn: () => getInvestmentById(id).then(res => {
      if (!res) throw new Error('Investment not found');
      return res;
    }),
    enabled: !!id,
  });
};

export const useCreateInvestment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInvestment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
    },
  });
};

export const useUpdateInvestment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, investment }: { id: string; investment: Investment }) =>
      updateInvestment(id, investment),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['investment', variables.id] });
    },
  });
};

export const useDeleteInvestment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteInvestment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
    },
  });
};

export const useSyncInvestmentPrices = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: syncInvestmentPrices,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
    },
  });
};

export const useBuyMoreInvestment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quantity, unitPrice }: { id: string; quantity: number; unitPrice: number }) =>
      buyMoreInvestment(id, quantity, unitPrice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
    },
  });
};

export const useInvestmentsByType = (type: string) => {
  return useQuery<Investment[]>({
    queryKey: ['investmentsByType', type],
    queryFn: () => getInvestmentsByType(type),
    enabled: !!type,
  });
};

export const useInvestmentsByTicker = (ticker: string) => {
  return useQuery<Investment[]>({
    queryKey: ['investmentsByTicker', ticker],
    queryFn: () => getInvestmentsByTicker(ticker),
    enabled: !!ticker,
  });
};

export const useInvestmentsByCurrentValueGreaterThan = (amount: number) => {
  return useQuery<Investment[]>({
    queryKey: ['investmentsByValue', amount],
    queryFn: () => getInvestmentsByCurrentValueGreaterThan(amount),
    enabled: amount !== undefined && amount !== null,
  });
};

export const useInvestmentsLastSyncedBefore = (dateTime: string) => {
  return useQuery<Investment[]>({
    queryKey: ['investmentsLastSyncedBefore', dateTime],
    queryFn: () => getInvestmentsLastSyncedBefore(dateTime),
    enabled: !!dateTime,
  });
};
