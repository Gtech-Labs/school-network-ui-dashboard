// hooks/use-api-query.ts
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

// A generic function that handles the actual fetch
async function fetcher<T>(endpoint: string): Promise<T> {
    const baseUrl = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');

    const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // Automatically attach the token if it exists
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Network response was not ok');
    }
    return response.json();
}

// The reusable hook
export function useApiQuery<T>(
    key: string[],
    endpoint: string,
    options?: Omit<UseQueryOptions<T, Error, T>, 'queryKey' | 'queryFn'>
) {
    return useQuery<T, Error>({
        queryKey: key,
        queryFn: () => fetcher<T>(endpoint),
        ...options,
    });
}