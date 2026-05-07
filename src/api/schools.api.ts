import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_URL;

const authHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getSubjects = (schoolId: string) =>
    axios.get(`${baseUrl}/schools/get-subjects`, {
        params: { schoolId },
        headers: authHeader(),
    });
