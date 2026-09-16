// hooks/useTransaction.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { TransactionModel, TransactionType, Frequency, PagedResponse } from '../model/TransactionModel';
import {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsByCategoryId,
  getTransactionsByType,
  getTransactionsByDateRange,
  getTransactionsByFrequency,
  getTransactionsByDescription,
  getTransactionsPage,
  generateTransactions,
  type TransactionsPageParams,
} from '../service/TransactionService';

// Lista todas as transações
export const useTransactions = () => {
  return useQuery<TransactionModel[]>({
    queryKey: ['transactions'],
    queryFn: getAllTransactions,
  });
};

// Lista paginada/filtrada (usada pela página de Transações)
export const useTransactionsPage = (params: TransactionsPageParams) => {
  return useQuery<PagedResponse<TransactionModel>>({
    queryKey: ['transactions', 'paged', params],
    queryFn: () => getTransactionsPage(params),
  });
};

// Busca transação por ID
export const useTransaction = (id: string) => {
  return useQuery<TransactionModel>({
    queryKey: ['transaction', id],
    queryFn: () =>
      getTransactionById(id).then((res) => {
        if (!res) throw new Error('Transaction not found');
        return res;
      }),
    enabled: !!id,
  });
};

// Cria transação
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

// Atualiza transação
export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, transaction }: { id: string; transaction: TransactionModel }) =>
      updateTransaction(id, transaction),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction', variables.id] });
    },
  });
};

// Deleta transação
export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

// Busca por categoria
export const useTransactionsByCategoryId = (categoryId: string) => {
  return useQuery<TransactionModel[]>({
    queryKey: ['transactionsByCategory', categoryId],
    queryFn: () => getTransactionsByCategoryId(categoryId),
    enabled: !!categoryId,
  });
};

// Busca por tipo
export const useTransactionsByType = (type: TransactionType) => {
  return useQuery<TransactionModel[]>({
    queryKey: ['transactionsByType', type],
    queryFn: () => getTransactionsByType(type),
    enabled: !!type,
  });
};

// Busca por intervalo de datas
export const useTransactionsByDateRange = (startDate: string, endDate: string) => {
  return useQuery<TransactionModel[]>({
    queryKey: ['transactionsByDateRange', startDate, endDate],
    queryFn: () => getTransactionsByDateRange(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
};

// Busca por frequência
export const useTransactionsByFrequency = (frequency: Frequency) => {
  return useQuery<TransactionModel[]>({
    queryKey: ['transactionsByFrequency', frequency],
    queryFn: () => getTransactionsByFrequency(frequency),
    enabled: !!frequency,
  });
};

// Busca por descrição
export const useTransactionsByDescription = (description: string) => {
  return useQuery<TransactionModel[]>({
    queryKey: ['transactionsByDescription', description],
    queryFn: () => getTransactionsByDescription(description),
    enabled: !!description,
  });
};

// Materializa manualmente as ocorrências recorrentes em falta
export const useGenerateTransactions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: generateTransactions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};
