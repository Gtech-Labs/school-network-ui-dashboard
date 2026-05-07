import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { calendarApi, CreateCalendarEventDto } from '@/api/calendar.api';

export const useEvents = (schoolId: string, gradeId?: string, classId?: string) => {
  return useQuery({
    queryKey: ['events', schoolId, gradeId, classId],
    queryFn: () => calendarApi.getEvents(schoolId, gradeId, classId),
    enabled: !!schoolId,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCalendarEventDto) => calendarApi.createEvent(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events', variables.schoolId] });
    },
  });
};

export const useDeleteEvent = (schoolId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => calendarApi.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', schoolId] });
    },
  });
};
