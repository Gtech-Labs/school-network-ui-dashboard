import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '../../api/parents.api';

export const useParents = (schoolId: string) => {
    return useQuery({
        queryKey: ['parents', schoolId],
        queryFn: async () => {
            const res = await api.getParentsPerSchool(schoolId);
            return res.data;
        },
        enabled: !!schoolId,
    });
};

export const useParentDetail = (id: string) => {
    return useQuery({
        queryKey: ['parent', id],
        queryFn: async () => {
            const res = await api.getParentDetail(id);
            return res.data;
        },
        enabled: !!id,
    });
};

export const useCreateParent = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: api.CreateParentProfileDto) => api.createParentProfile(data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['parents'] });
        },
    });
};

export const useUpdateParent = (id: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => api.updateParentProfile(id, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['parent', id] });
            qc.invalidateQueries({ queryKey: ['parents'] });
        },
    });
};

export const useDeleteParent = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => api.deleteParentProfile(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['parents'] });
        },
    });
};
