import type { AxiosError } from 'axios';
import api from '../config/axios';
import type { SavingGoal } from '../model/SavingGoalModel';

const ENDPOINT = '/saving-goals';

export const getAllSavingGoals = async (): Promise<SavingGoal[]> => {
  const response = await api.get<SavingGoal[]>(ENDPOINT);
  return response.data;
};

export const getSavingGoalById = async (id: string): Promise<SavingGoal | null> => {
  try {
    const response = await api.get<SavingGoal>(`${ENDPOINT}/${id}`);
    return response.data;
  } catch (error: unknown) {
      const axiosError = error as AxiosError;
      if (axiosError?.response?.status === 404) return null;
      throw error;
    }
};

export const createSavingGoal = async (savingGoal: SavingGoal): Promise<SavingGoal> => {
  const response = await api.post<SavingGoal>(ENDPOINT, savingGoal);
  return response.data;
};

export const updateSavingGoal = async (id: string, savingGoal: SavingGoal): Promise<SavingGoal> => {
  const response = await api.put<SavingGoal>(`${ENDPOINT}/${id}`, savingGoal);
  return response.data;
};

export const deleteSavingGoal = async (id: string): Promise<void> => {
  await api.delete(`${ENDPOINT}/${id}`);
};

export const getSavingGoalsOrderedByStartDate = async (): Promise<SavingGoal[]> => {
  const response = await api.get<SavingGoal[]>(`${ENDPOINT}/ordered-by-start-date`);
  return response.data;
};

export const getSavingGoalsEndingBefore = async (date: string): Promise<SavingGoal[]> => {
  const response = await api.get<SavingGoal[]>(`${ENDPOINT}/ending-before`, {
    params: { date },
  });
  return response.data;
};

export const getActiveSavingGoals = async (date: string): Promise<SavingGoal[]> => {
  const response = await api.get<SavingGoal[]>(`${ENDPOINT}/active`, {
    params: { date },
  });
  return response.data;
};

export const getSavingGoalsWithProgressLessThan = async (amount: number): Promise<SavingGoal[]> => {
  const response = await api.get<SavingGoal[]>(`${ENDPOINT}/progress-less-than`, {
    params: { amount },
  });
  return response.data;
};

export const searchSavingGoalsByName = async (name: string): Promise<SavingGoal[]> => {
  const response = await api.get<SavingGoal[]>(`${ENDPOINT}/search`, {
    params: { name },
  });
  return response.data;
};
