// hooks/useSavingGoal.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SavingGoal } from '../model/SavingGoalModel';
import {
  getAllSavingGoals,
  getSavingGoalById,
  createSavingGoal,
  updateSavingGoal,
  deleteSavingGoal,
  getSavingGoalsOrderedByStartDate,
  getSavingGoalsEndingBefore,
  getActiveSavingGoals,
  getSavingGoalsWithProgressLessThan,
  searchSavingGoalsByName,
} from '../service/SavingGoalService';

export const useSavingGoals = () => {
  return useQuery<SavingGoal[]>({
    queryKey: ['savingGoals'],
    queryFn: getAllSavingGoals,
  });
};

export const useSavingGoal = (id: string) => {
  return useQuery<SavingGoal>({
    queryKey: ['savingGoal', id],
    queryFn: () =>
      getSavingGoalById(id).then((res) => {
        if (!res) throw new Error('Saving Goal not found');
        return res;
      }),
    enabled: !!id,
  });
};

export const useCreateSavingGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSavingGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savingGoals'] });
    },
  });
};

export const useUpdateSavingGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, savingGoal }: { id: string; savingGoal: SavingGoal }) =>
      updateSavingGoal(id, savingGoal),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['savingGoals'] });
      queryClient.invalidateQueries({ queryKey: ['savingGoal', variables.id] });
    },
  });
};

export const useDeleteSavingGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSavingGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savingGoals'] });
    },
  });
};

export const useSavingGoalsOrderedByStartDate = () => {
  return useQuery<SavingGoal[]>({
    queryKey: ['savingGoalsOrderedByStartDate'],
    queryFn: getSavingGoalsOrderedByStartDate,
  });
};

export const useSavingGoalsEndingBefore = (date: string) => {
  return useQuery<SavingGoal[]>({
    queryKey: ['savingGoalsEndingBefore', date],
    queryFn: () => getSavingGoalsEndingBefore(date),
    enabled: !!date,
  });
};

export const useActiveSavingGoals = (date: string) => {
  return useQuery<SavingGoal[]>({
    queryKey: ['activeSavingGoals', date],
    queryFn: () => getActiveSavingGoals(date),
    enabled: !!date,
  });
};

export const useSavingGoalsWithProgressLessThan = (amount: number) => {
  return useQuery<SavingGoal[]>({
    queryKey: ['savingGoalsProgressLessThan', amount],
    queryFn: () => getSavingGoalsWithProgressLessThan(amount),
    enabled: amount !== undefined && amount !== null,
  });
};

export const useSearchSavingGoalsByName = (name: string) => {
  return useQuery<SavingGoal[]>({
    queryKey: ['savingGoalsByName', name],
    queryFn: () => searchSavingGoalsByName(name),
    enabled: !!name,
  });
};
