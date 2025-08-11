// hooks/useCategory.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Category } from '../model/CategoryModel';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  existsByName,
} from '../service/CategoryService';

export const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: getAllCategories,
  });
};

export const useCategory = (id: string) => {
  return useQuery<Category>({
    queryKey: ['category', id],
    queryFn: () => getCategoryById(id).then(res => {
      if (!res) throw new Error('Category not found');
      return res;
    }),
    enabled: !!id, // só executa se id existir
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, category }: { id: string; category: Category }) =>
      updateCategory(id, category),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category', variables.id] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useExistsCategoryName = (name: string) => {
  return useQuery<boolean>({
    queryKey: ['categoryExists', name],
    queryFn: () => existsByName(name),
    enabled: !!name,
  });
};
