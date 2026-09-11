import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { RecurringTransactionModel } from '../model/RecurringTransactionModel';
import {
  getAllRecurringTransactions,
  getRecurringTransactionById,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  getActiveRecurringTransactions,
} from '../service/RecurringTransactionService';

export const useRecurringTransactions = () => {
  return useQuery<RecurringTransactionModel[]>({
    queryKey: ['recurringTransactions'],
    queryFn: getAllRecurringTransactions,
  });
};

export const useRecurringTransaction = (id: string) => {
  return useQuery<RecurringTransactionModel>({
    queryKey: ['recurringTransaction', id],
    queryFn: () =>
      getRecurringTransactionById(id).then((res) => {
        if (!res) throw new Error('Recurring transaction not found');
        return res;
      }),
    enabled: !!id,
  });
};

export const useCreateRecurringTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRecurringTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringTransactions'] });
    },
  });
};

export const useUpdateRecurringTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, transaction }: { id: string; transaction: RecurringTransactionModel }) =>
      updateRecurringTransaction(id, transaction),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recurringTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['recurringTransaction', variables.id] });
    },
  });
};

export const useDeleteRecurringTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRecurringTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringTransactions'] });
    },
  });
};

export const useActiveRecurringTransactions = () => {
  return useQuery<RecurringTransactionModel[]>({
    queryKey: ['recurringTransactions', 'active'],
    queryFn: getActiveRecurringTransactions,
  });
};
