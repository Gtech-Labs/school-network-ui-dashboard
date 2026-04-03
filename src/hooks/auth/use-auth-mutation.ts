// hooks/use-auth-mutation.ts
import { useMutation } from '@tanstack/react-query';
import { SignInRequest, AuthResponse } from '@/types/auth';

// hooks/use-auth-mutation.ts
async function signInFn(credentials: SignInRequest): Promise<AuthResponse> {
    const baseUrl = import.meta.env.VITE_API_URL;
    const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Authentication failed');
    }
    return response.json();
}

export const useSignInMutation = () => {
    return useMutation<AuthResponse, Error, SignInRequest>({
        mutationFn: signInFn,
        onSuccess: (data) => {
            // Handle token storage (e.g., Cookies/LocalStorage)
            console.log("success")
            console.log('Login successful', data.accessToken);
        },
    });
};