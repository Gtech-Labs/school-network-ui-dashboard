import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/academic.api';

export const useAcademicRecords = (filters: any) => {
    return useQuery({
        queryKey: ['academic-records', filters],
        queryFn: async () => {
            const res = await api.getAcademicRecords(filters);
            return res.data;
        },
    });
};

export const useAcademicRecordDetail = (id: string) => {
    return useQuery({
        queryKey: ['academic-record', id],
        queryFn: async () => {
            const res = await api.getAcademicRecordDetail(id);
            return res.data;
        },
        enabled: !!id,
    });
};

export const useCreateAcademicRecord = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => api.createAcademicRecord(data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['academic-records'] });
        },
    });
};

export const useUpdateAcademicRecord = (id: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => api.updateAcademicRecord(id, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['academic-record', id] });
            qc.invalidateQueries({ queryKey: ['academic-records'] });
        },
    });
};

export const useDeleteAcademicRecord = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) => api.deleteAcademicRecord(id, reason),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['academic-records'] });
        },
    });
};

export const useBulkValidate = () => {
    return useMutation({
        mutationFn: async (records: any[]) => {
            const res = await api.bulkValidate(records);
            return res.data;
        },
    });
};

export const useBulkCreate = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (records: any[]) => {
            const res = await api.bulkCreate(records);
            return res.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['academic-records'] });
        },
    });
};
