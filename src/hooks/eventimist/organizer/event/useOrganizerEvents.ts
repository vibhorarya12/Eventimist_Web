"use client";

// src/hooks/eventimist/organizer/event/useOrganizerEvents.ts

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getOrganizerEvents,
  type OrganizerEvent,
} from "@/services/eventimist/organizer/event/getOrganizerEvents.service";

// ─── Query key — centralised so other hooks can invalidate it ─────────────────
// e.g. after createEvent succeeds: queryClient.invalidateQueries({ queryKey: ORGANIZER_EVENTS_KEY })
export const ORGANIZER_EVENTS_KEY = ["organizer", "events"] as const;

// ─── Hook ─────────────────────────────────────────────────────────────────────
export interface UseOrganizerEventsReturn {
  events:     OrganizerEvent[];
  loading:    boolean;
  error:      string | null;
  refetch:    () => void;
  invalidate: () => void;   // call after create/update/delete to force fresh fetch
}

export function useOrganizerEvents(): UseOrganizerEventsReturn {
  const queryClient = useQueryClient();

  const { data, isFetching, error, refetch } = useQuery<OrganizerEvent[], Error>({
    queryKey:  ORGANIZER_EVENTS_KEY,
    queryFn:   getOrganizerEvents,

    // ── Caching strategy ──────────────────────────────────────────────────────
    staleTime:       5 * 60 * 1000,   // treat data as fresh for 5 min
    gcTime:          10 * 60 * 1000,  // keep in cache for 10 min after unmount
    refetchOnWindowFocus: true,        // re-fetch when organizer tabs back in
    retry:           2,               // retry twice on network failure
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ORGANIZER_EVENTS_KEY });

  return {
    events:  data ?? [],
    loading: isFetching,
    error:   error?.message ?? null,
    refetch,
    invalidate,
  };
}