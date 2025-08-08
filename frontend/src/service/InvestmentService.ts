import type { AxiosError } from 'axios';
import api from '../config/axios';
import type { Investment } from '../model/InvestmentModel';

const ENDPOINT = '/investments';

export const getAllInvestments = async (): Promise<Investment[]> => {
  const response = await api.get<Investment[]>(ENDPOINT);
  return response.data;
};

export const getInvestmentById = async (id: string): Promise<Investment | null> => {
  try {
    const response = await api.get<Investment>(`${ENDPOINT}/${id}`);
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError?.response?.status === 404) return null;
    throw error;
  }
};

export const createInvestment = async (investment: Investment): Promise<Investment> => {
  const response = await api.post<Investment>(ENDPOINT, investment);
  return response.data;
};

export const updateInvestment = async (id: string, investment: Investment): Promise<Investment> => {
  const response = await api.put<Investment>(`${ENDPOINT}/${id}`, investment);
  return response.data;
};

export const deleteInvestment = async (id: string): Promise<void> => {
  await api.delete(`${ENDPOINT}/${id}`);
};

export const getInvestmentsByType = async (type: string): Promise<Investment[]> => {
  const response = await api.get<Investment[]>(`${ENDPOINT}/type/${type}`);
  return response.data;
};

export const getInvestmentsByTicker = async (ticker: string): Promise<Investment[]> => {
  const response = await api.get<Investment[]>(`${ENDPOINT}/ticker/${ticker}`);
  return response.data;
};

export const getInvestmentsByCurrentValueGreaterThan = async (amount: number): Promise<Investment[]> => {
  const response = await api.get<Investment[]>(`${ENDPOINT}/value-greater-than`, {
    params: { amount },
  });
  return response.data;
};

export const getInvestmentsLastSyncedBefore = async (dateTime: string): Promise<Investment[]> => {
  const response = await api.get<Investment[]>(`${ENDPOINT}/last-synced-before`, {
    params: { dateTime },
  });
  return response.data;
};
