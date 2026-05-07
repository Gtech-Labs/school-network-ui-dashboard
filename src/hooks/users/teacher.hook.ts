import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiMutation } from '../use-api-mutation';
import { useApiQuery } from '../use-api-query';

export const useTeachers = (schoolId: string) => {
    return useApiQuery(['teachers', schoolId], `/teachers/profiles-per-school?schoolId=${schoolId}`, {
        enabled: !!schoolId,
    });
};

export const useTeacherDetail = (id: string) => {
    return useApiQuery(['teacher', id], `/teachers/${id}`, {
        enabled: !!id,
    });
};

export const useCreateTeacher = () => {
    const qc = useQueryClient();
    const { mutateAsync } = useApiMutation();

    return useMutation({
        mutationFn: (data: any) => mutateAsync({
            method: 'POST',
            endpoint: 'teachers/create-teacher-profile',
            data
        }),
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: ['teachers', variables.schoolId] });
        },
    });
};

export const useUpdateTeacher = (id: string) => {
    const qc = useQueryClient();
    const { mutateAsync } = useApiMutation();

    return useMutation({
        mutationFn: (data: any) => mutateAsync({
            method: 'PATCH',
            endpoint: `teachers/${id}`,
            data
        }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['teacher', id] });
            qc.invalidateQueries({ queryKey: ['teachers'] });
        },
    });
};

export const useDeleteTeacher = () => {
    const qc = useQueryClient();
    const { mutateAsync } = useApiMutation();

    return useMutation({
        mutationFn: (id: string) => mutateAsync({
            method: 'DELETE',
            endpoint: `teachers/${id}`,
            data: undefined
        }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['teachers'] });
        },
    });
};
