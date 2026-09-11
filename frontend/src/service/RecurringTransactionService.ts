import type { AxiosError } from 'axios';
import api from '../config/axios';
import type { RecurringTransactionModel } from '../model/RecurringTransactionModel';

const ENDPOINT = '/recurring-transactions';

export const getAllRecurringTransactions = async (): Promise<RecurringTransactionModel[]> => {
  const response = await api.get<RecurringTransactionModel[]>(ENDPOINT);
  return response.data;
};

export const getRecurringTransactionById = async (
  id: string,
): Promise<RecurringTransactionModel | null> => {
  try {
    const response = await api.get<RecurringTransactionModel>(`${ENDPOINT}/${id}`);
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError?.response?.status === 404) return null;
    throw error;
  }
};

export const createRecurringTransaction = async (
  transaction: RecurringTransactionModel,
): Promise<RecurringTransactionModel> => {
  const response = await api.post<RecurringTransactionModel>(ENDPOINT, transaction);
  return response.data;
};

export const updateRecurringTransaction = async (
  id: string,
  transaction: RecurringTransactionModel,
): Promise<RecurringTransactionModel> => {
  const response = await api.put<RecurringTransactionModel>(`${ENDPOINT}/${id}`, transaction);
  return response.data;
};

export const deleteRecurringTransaction = async (id: string): Promise<void> => {
  await api.delete(`${ENDPOINT}/${id}`);
};

export const getActiveRecurringTransactions = async (): Promise<RecurringTransactionModel[]> => {
  const response = await api.get<RecurringTransactionModel[]>(`${ENDPOINT}/active`);
  return response.data;
};
