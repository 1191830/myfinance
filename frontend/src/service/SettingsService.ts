import api from '../config/axios';
import type { Settings } from '../model/SettingsModel';

const ENDPOINT = '/settings';

export const getSettings = async (): Promise<Settings> => {
  const response = await api.get<Settings>(ENDPOINT);
  return response.data;
};

export const updateSettings = async (id: string, settings: Settings): Promise<Settings> => {
  const response = await api.put<Settings>(`${ENDPOINT}/${id}`, settings);
  return response.data;
};
