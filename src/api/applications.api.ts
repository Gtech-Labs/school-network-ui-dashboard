import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_URL;

const authHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface ApplicationFilters {
    status?: string;
    parentId?: string;
    schoolId?: string;
    grade?: string;
    search?: string;
    dateFilter?: string;
}

export const getApplications = (filters?: ApplicationFilters) => {
    const params = new URLSearchParams();
    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== 'all') {
                params.append(key, value);
            }
        });
    }
    return axios.get(`${baseUrl}/applications?${params.toString()}`, {
        headers: authHeader(),
    });
};

export const getApplicationById = (id: string) =>
    axios.get(`${baseUrl}/applications/${id}`, {
        headers: authHeader(),
    });

export const updateApplication = (id: string, data: any) =>
    axios.patch(`${baseUrl}/applications/${id}`, data, {
        headers: { 'Content-Type': 'application/json', ...authHeader() },
    });
