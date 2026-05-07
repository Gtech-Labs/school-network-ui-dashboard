import { useQuery } from '@tanstack/react-query';
import * as api from '@/api/schools.api';

export const useSubjects = (schoolId: string) => {
    return useQuery({
        queryKey: ['subjects', schoolId],
        queryFn: async () => {
            if (!schoolId) return [];
            const response = await api.getSubjects(schoolId);
            return response.data;
        },
        enabled: !!schoolId,
    });
};
