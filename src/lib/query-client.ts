// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClientOptions = {
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
        },
    },
};

// For Client Components
export const browserQueryClient = new QueryClient(queryClientOptions);