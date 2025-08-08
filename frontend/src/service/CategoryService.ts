import api from '../config/axios';
import type { Category } from '../model/CategoryModel';

const ENDPOINT = '/categories';

export const getAllCategories = async (): Promise<Category[]> => {
  const response = await api.get<Category[]>(ENDPOINT);
  return response.data;
};

export const getCategoryById = async (id: string): Promise<Category | null> => {
    const response = await api.get<Category>(`${ENDPOINT}/${id}`);
    return response.data;
};

export const createCategory = async (category: Category): Promise<Category> => {
  const response = await api.post<Category>(ENDPOINT, category);
  return response.data;
};

export const updateCategory = async (id: string, category: Category): Promise<Category> => {
  const response = await api.put<Category>(`${ENDPOINT}/${id}`, category);
  return response.data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  await api.delete(`${ENDPOINT}/${id}`);
};

export const existsByName = async (name: string): Promise<boolean> => {
  const response = await api.get<boolean>(`${ENDPOINT}/exists`, {
    params: { name }
  });
  return response.data;
};
