import type { AxiosError } from 'axios';
import api from '../config/axios';
import type { TransactionModel, TransactionType, Frequency } from '../model/TransactionModel';

const ENDPOINT = '/transactions';

export const getAllTransactions = async (): Promise<TransactionModel[]> => {
  const response = await api.get<TransactionModel[]>(ENDPOINT);
  return response.data;
};

export const generateTransactions = async (): Promise<{ generated: number }> => {
  const response = await api.post<{ generated: number }>(`${ENDPOINT}/generate`);
  return response.data;
};

export const getTransactionById = async (id: string): Promise<TransactionModel | null> => {
  try {
    const response = await api.get<TransactionModel>(`${ENDPOINT}/${id}`);
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError?.response?.status === 404) return null;
    throw error;
  }
};

export const createTransaction = async (transaction: TransactionModel): Promise<TransactionModel> => {
  const response = await api.post<TransactionModel>(ENDPOINT, transaction);
  return response.data;
};

export const updateTransaction = async (id: string, transaction: TransactionModel): Promise<TransactionModel> => {
  const response = await api.put<TransactionModel>(`${ENDPOINT}/${id}`, transaction);
  return response.data;
};

export const deleteTransaction = async (id: string): Promise<void> => {
  await api.delete(`${ENDPOINT}/${id}`);
};

export const getTransactionsByCategoryId = async (categoryId: string): Promise<TransactionModel[]> => {
  const response = await api.get<TransactionModel[]>(`${ENDPOINT}/by-category/${categoryId}`);
  return response.data;
};

export const getTransactionsByType = async (type: TransactionType): Promise<TransactionModel[]> => {
  const response = await api.get<TransactionModel[]>(`${ENDPOINT}/by-type`, { params: { type } });
  return response.data;
};

export const getTransactionsByDateRange = async (startDate: string, endDate: string): Promise<TransactionModel[]> => {
  const response = await api.get<TransactionModel[]>(`${ENDPOINT}/by-date-range`, {
    params: { startDate, endDate },
  });
  return response.data;
};

export const getTransactionsByFrequency = async (frequency: Frequency): Promise<TransactionModel[]> => {
  const response = await api.get<TransactionModel[]>(`${ENDPOINT}/by-frequency`, { params: { frequency } });
  return response.data;
};

export const getTransactionsByDescription = async (description: string): Promise<TransactionModel[]> => {
  const response = await api.get<TransactionModel[]>(`${ENDPOINT}/search-by-description`, { params: { description } });
  return response.data;
};
