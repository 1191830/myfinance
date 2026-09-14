import api from '../config/axios';
import type { StoredAuth } from '../lib/authStorage';

const ENDPOINT = '/auth';

export const login = async (username: string, password: string): Promise<StoredAuth> => {
  const response = await api.post<StoredAuth>(`${ENDPOINT}/login`, { username, password });
  return response.data;
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  await api.put(`${ENDPOINT}/password`, { currentPassword, newPassword });
};
