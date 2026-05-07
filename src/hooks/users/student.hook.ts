import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '../../api/students.api';
import type { CreateStudentProfileDto } from '../../api/students.api';

// ─── READ ──────────────────────────────────────────────────────────────────

export const useStudents = (schoolId: string) => {
    return useQuery({
        queryKey: ['students', schoolId],
        queryFn: async () => {
            const baseUrl = import.meta.env.VITE_API_URL;
            const token = localStorage.getItem('token');
            const res = await fetch(`${baseUrl}/students/profiles-per-school?schoolId=${schoolId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            if (!res.ok) throw new Error('Failed to fetch students');
            return res.json();
        },
        enabled: !!schoolId,
    });
};

// ─── CREATE SINGLE ────────────────────────────────────────────────────────

export const useCreateStudent = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateStudentProfileDto) => api.createStudentProfile(data),
        onSuccess: (_, variables) => {
            // Invalidate the students list for this school so it refetches
            qc.invalidateQueries({ queryKey: ['students', variables.schoolId] });
        },
    });
};

// ─── BULK CREATE ──────────────────────────────────────────────────────────

export const useBulkCreateStudents = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (students: CreateStudentProfileDto[]) =>
            api.bulkCreateStudentProfiles(students),
        onSuccess: (_, variables) => {
            const schoolId = variables[0]?.schoolId;
            if (schoolId) {
                qc.invalidateQueries({ queryKey: ['students', schoolId] });
            }
        },
    });
};