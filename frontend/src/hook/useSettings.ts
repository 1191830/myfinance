import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Settings } from '../model/SettingsModel';
import { getSettings, updateSettings } from '../service/SettingsService';

export const useSettings = () => {
  return useQuery<Settings>({
    queryKey: ['settings'],
    queryFn: getSettings,
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, settings }: { id: string; settings: Settings }) =>
      updateSettings(id, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
};
