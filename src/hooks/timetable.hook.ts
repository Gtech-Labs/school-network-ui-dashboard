import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timetableApi, CreateTimetableDto, TimetableEntry } from '@/api/timetable.api';

export const useTimetables = (schoolId: string, groupLabel?: string) => {
  return useQuery({
    queryKey: ['timetables', schoolId, groupLabel],
    queryFn: () => timetableApi.getTimetables(schoolId, groupLabel),
    enabled: !!schoolId,
  });
};

export const useCreateTimetable = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ schoolId, data }: { schoolId: string, data: CreateTimetableDto }) => 
      timetableApi.createTimetable(schoolId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['timetables', variables.schoolId] });
    },
  });
};

export const useDeleteTimetable = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => timetableApi.deleteTimetable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetables'] });
    },
  });
};
