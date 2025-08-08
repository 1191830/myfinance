import type { AxiosError } from 'axios';
import api from '../config/axios';
import type { Transaction, TransactionType, Frequency } from '../model/TransactionModel';

const ENDPOINT = '/transactions';

export const getAllTransactions = async (): Promise<Transaction[]> => {
  const response = await api.get<Transaction[]>(ENDPOINT);
  return response.data;
};

export const getTransactionById = async (id: string): Promise<Transaction | null> => {
  try {
    const response = await api.get<Transaction>(`${ENDPOINT}/${id}`);
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError?.response?.status === 404) return null;
    throw error;
  }
};

export const createTransaction = async (transaction: Transaction): Promise<Transaction> => {
  const response = await api.post<Transaction>(ENDPOINT, transaction);
  return response.data;
};

export const updateTransaction = async (id: string, transaction: Transaction): Promise<Transaction> => {
  const response = await api.put<Transaction>(`${ENDPOINT}/${id}`, transaction);
  return response.data;
};

export const deleteTransaction = async (id: string): Promise<void> => {
  await api.delete(`${ENDPOINT}/${id}`);
};

export const getTransactionsByCategoryId = async (categoryId: string): Promise<Transaction[]> => {
  const response = await api.get<Transaction[]>(`${ENDPOINT}/by-category/${categoryId}`);
  return response.data;
};

export const getTransactionsByType = async (type: TransactionType): Promise<Transaction[]> => {
  const response = await api.get<Transaction[]>(`${ENDPOINT}/by-type`, { params: { type } });
  return response.data;
};

export const getTransactionsByDateRange = async (startDate: string, endDate: string): Promise<Transaction[]> => {
  const response = await api.get<Transaction[]>(`${ENDPOINT}/by-date-range`, {
    params: { startDate, endDate },
  });
  return response.data;
};

export const getTransactionsByFrequency = async (frequency: Frequency): Promise<Transaction[]> => {
  const response = await api.get<Transaction[]>(`${ENDPOINT}/by-frequency`, { params: { frequency } });
  return response.data;
};

export const getTransactionsByDescription = async (description: string): Promise<Transaction[]> => {
  const response = await api.get<Transaction[]>(`${ENDPOINT}/search-by-description`, { params: { description } });
  return response.data;
};
