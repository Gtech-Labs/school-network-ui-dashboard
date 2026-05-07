import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_URL;

const authHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface CreateParentProfileDto {
    fullName: string;
    idNumber: string;
    phone: string;
    email?: string;
    relationship?: string;
    address?: string;
    occupation?: string;
    consentGiven?: boolean;
    childrenIds?: string[];
    schoolId?: string;
}

export const createParentProfile = (data: CreateParentProfileDto) =>
    axios.post(`${baseUrl}/parents/create-parent-profile`, data, {
        headers: { 'Content-Type': 'application/json', ...authHeader() },
    });

export const getParentsPerSchool = (schoolId: string) =>
    axios.get(`${baseUrl}/parents/profiles-per-school?schoolId=${schoolId}`, {
        headers: authHeader(),
    });

export const getParentDetail = (id: string) =>
    axios.get(`${baseUrl}/parents/${id}`, {
        headers: authHeader(),
    });

export const updateParentProfile = (id: string, data: any) =>
    axios.patch(`${baseUrl}/parents/${id}`, data, {
        headers: authHeader(),
    });

export const deleteParentProfile = (id: string) =>
    axios.delete(`${baseUrl}/parents/${id}`, {
        headers: authHeader(),
    });
