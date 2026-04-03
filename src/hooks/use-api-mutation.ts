// hooks/use-auth-mutation.ts
import { useMutation } from '@tanstack/react-query';

interface MutationArgs {
    data: any;
    endpoint: string;
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    requiresAuth?: boolean; // Optional flag to toggle auth
}

async function mutateData<T>({ data, endpoint, method, requiresAuth = true }: MutationArgs): Promise<T> {
    const baseUrl = import.meta.env.VITE_API_URL;

    // 1. Retrieve the token (Example using localStorage)
    const token = localStorage.getItem('auth_token');

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };

    // 2. Conditionally add the Authorization header
    if (requiresAuth && token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${baseUrl}/${endpoint}`, {
        method,
        headers,
        body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
        // Swagger-compliant APIs usually return a structured error DTO
        throw new Error(result.message || 'API Mutation Error');
    }

    return result;
}

export const useApiMutation = <T>() => {
    return useMutation<T, Error, MutationArgs>({
        mutationFn: mutateData,
        onSuccess: (data) => {
            // If this was a login mutation, you've likely received a DTO
            // containing a new token here.
            console.log('Success');
        },
    });
};