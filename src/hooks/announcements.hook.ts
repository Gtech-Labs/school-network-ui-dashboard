import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { announcementsApi, CreateAnnouncementDto } from '@/api/announcements.api';

export const useAnnouncements = (schoolId: string, params?: any) => {
  return useQuery({
    queryKey: ['announcements', schoolId, params],
    queryFn: () => announcementsApi.getAnnouncements(schoolId, params),
    enabled: !!schoolId,
  });
};

export const useAnnouncementStats = (schoolId: string) => {
  return useQuery({
    queryKey: ['announcements-stats', schoolId],
    queryFn: () => announcementsApi.getAnnouncementStats(schoolId),
    enabled: !!schoolId,
  });
};

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateAnnouncementDto) => announcementsApi.createAnnouncement(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['announcements', variables.schoolId] });
      queryClient.invalidateQueries({ queryKey: ['announcements-stats', variables.schoolId] });
    },
  });
};
