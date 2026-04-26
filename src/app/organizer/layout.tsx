"use client";

// src/app/organizer/layout.tsx

import { useSyncOrganizerAuthCookie } from "@/hooks/eventimist/organizer/sessions/useSyncOrganizerAuthCookie";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRef } from "react";

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // useRef ensures one QueryClient instance per component lifetime,
  // not recreated on every render (React 18 strict-mode safe).
  const queryClient = useRef(
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000, // 1 min default — hooks can override per-query
          retry:     1,
        },
      },
    })
  ).current;

  // Keeps the organizer-token cookie in sync with Zustand/localStorage.
  useSyncOrganizerAuthCookie();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}