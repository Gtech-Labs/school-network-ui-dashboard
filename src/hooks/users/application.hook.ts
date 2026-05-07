import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '../../api/applications.api';

export const useApplications = (filters?: api.ApplicationFilters, options?: any) => {
    return useQuery({
        queryKey: ['applications', filters],
        queryFn: async () => {
            const res = await api.getApplications(filters);
            return res.data;
        },
        ...options,
    });
};

export const useApplicationDetail = (id: string, options?: any) => {
    return useQuery({
        queryKey: ['application', id],
        queryFn: async () => {
            const res = await api.getApplicationById(id);
            return res.data;
        },
        enabled: !!id,
        ...options,
    });
};

export const useUpdateApplication = (id: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => api.updateApplication(id, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['application', id] });
            qc.invalidateQueries({ queryKey: ['applications'] });
        },
    });
};
