"use client";

// src/components/QueryProvider.tsx
// Wrap any public page that needs TanStack Query.
// Usage: wrap page root in <QueryProvider>{children}</QueryProvider>

import { useRef } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const client = useRef(
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          retry: 1,
        },
      },
    })
  ).current;

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}