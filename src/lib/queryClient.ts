import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,   // Financial data stays fresh for 5 minutes
      gcTime: 10 * 60 * 1000,     // Keep unused data in cache for 10 minutes
      retry: 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000), // Exponential backoff, cap 30s
      refetchOnWindowFocus: false, // Don't refetch on tab switch (mobile)
    },
  },
});
