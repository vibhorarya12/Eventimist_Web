"use client";

// src/hooks/eventimist/user/events/useGetEvent.ts

import { useQuery } from "@tanstack/react-query";
import {
  getEvent,
  type GetEventResponse,
} from "@/services/eventimist/user/events/GetEvent.service";

// ─── Query key factory ────────────────────────────────────────────────────────
export const getEventKey = (slug: string) =>
  ["public", "event", slug] as const;

// ─── Hook return shape ────────────────────────────────────────────────────────
export interface UseGetEventReturn {
  event:   GetEventResponse | undefined;
  loading: boolean;
  error:   string | null;
  refetch: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useGetEvent(slug: string): UseGetEventReturn {
  const {
    data: event,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: getEventKey(slug),
    queryFn: () => getEvent(slug),
    enabled: !!slug, // Only run if slug is provided
  });

  return {
    event,
    loading,
    error: error ? (error as Error).message : null,
    refetch,
  };
}