import { useMutation } from '@tanstack/react-query';

interface UploadArgs {
    file: File;
    endpoint?: string;
    requiresAuth?: boolean;
}

async function uploadFile({ file, endpoint = 'files/upload', requiresAuth = true }: UploadArgs): Promise<any> {
    const baseUrl = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');

    const headers: Record<string, string> = {
        'Accept': 'application/json',
    };

    if (requiresAuth && token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${baseUrl}/${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || 'File upload error');
    }

    return result;
}

export const useUploadMutation = () => {
    return useMutation({
        mutationFn: uploadFile,
    });
};
