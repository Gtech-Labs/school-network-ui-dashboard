import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi, Country } from '@/api/settings.api';

export const useCountries = () => {
  return useQuery({
    queryKey: ['countries'],
    queryFn: settingsApi.getCountries,
  });
};

export const useCountry = (id: string | undefined) => {
  return useQuery({
    queryKey: ['country', id],
    queryFn: () => settingsApi.getCountry(id!),
    enabled: !!id,
  });
};

export const useCreateCountry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.createCountry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] });
    },
  });
};

export const useUpdateCountry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Country> }) =>
      settingsApi.updateCountry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] });
    },
  });
};

export const useDeleteCountry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.deleteCountry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] });
    },
  });
};

// Province Hooks
export const useCreateProvince = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.createProvince,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] });
    },
  });
};

export const useUpdateProvince = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Country> }) =>
      settingsApi.updateProvince(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] });
    },
  });
};

export const useDeleteProvince = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.deleteProvince,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] });
    },
  });
};

// City Hooks
export const useCreateCity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.createCity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] });
    },
  });
};

export const useUpdateCity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Country> }) =>
      settingsApi.updateCity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] });
    },
  });
};

export const useDeleteCity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.deleteCity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] });
    },
  });
};
