import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_URL;

const authHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface CreateAcademicRecordDto {
    date: string;
    term: string;
    grade: string;
    subject: string;
    assessmentType: string;
    assessmentTitle: string;
    maxScore: number;
    achievedScore: number;
    weighting?: number;
    remarks?: string;
    studentId: string;
    teacherId: string;
}

export interface UpdateAcademicRecordDto extends Partial<CreateAcademicRecordDto> {
    changeReason: string;
}

export const createAcademicRecord = (data: CreateAcademicRecordDto) =>
    axios.post(`${baseUrl}/academic-records`, data, {
        headers: { 'Content-Type': 'application/json', ...authHeader() },
    });

export const getAcademicRecords = (filters: any) =>
    axios.get(`${baseUrl}/academic-records`, {
        params: filters,
        headers: authHeader(),
    });

export const getAcademicRecordDetail = (id: string) =>
    axios.get(`${baseUrl}/academic-records/${id}`, {
        headers: authHeader(),
    });

export const updateAcademicRecord = (id: string, data: UpdateAcademicRecordDto) =>
    axios.patch(`${baseUrl}/academic-records/${id}`, data, {
        headers: authHeader(),
    });

export const deleteAcademicRecord = (id: string, reason: string) =>
    axios.delete(`${baseUrl}/academic-records/${id}?reason=${encodeURIComponent(reason)}`, {
        headers: authHeader(),
    });

export const downloadTemplate = (format: 'csv' | 'spreadsheet' = 'csv') =>
    axios.get(`${baseUrl}/academic-records/template/download?format=${format}`, {
        responseType: 'blob',
        headers: authHeader(),
    });

export const bulkValidate = (records: any[]) =>
    axios.post(`${baseUrl}/academic-records/bulk-validate`, { records }, { headers: authHeader() });

export const bulkCreate = (records: any[]) =>
    axios.post(`${baseUrl}/academic-records/bulk-create`, { records }, { headers: authHeader() });
