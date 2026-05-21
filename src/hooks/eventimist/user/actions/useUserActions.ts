"use client";

// src/hooks/eventimist/user/actions/useUserActions.ts

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  rsvpEvent,
  getUserEventInteractions,
  type RsvpEventRequest,
  type RsvpEventResponse,
  type RsvpEventError,
} from "@/services/eventimist/user/actions/userActions.service";

import { useUserAuth } from "@/store/eventimist/user/auth/UserAuthState";

// ─── Query Key ────────────────────────────────────────────────────────────────
export const getUserInteractionsKey = (token: string) =>
  ["user", "event-interactions", token] as const;

// ─── Return Type ──────────────────────────────────────────────────────────────
export interface UseUserActionsReturn {
  rsvpEvent: {
    submit: (
      eventId: number,
      token: string,
      body?: RsvpEventRequest
    ) => Promise<RsvpEventResponse | null>;
    loading: boolean;
    error: string | null;
    reset: () => void;
  };

  getUserInteractions: {
    loading: boolean;
    error: string | null;
    refetch: () => void;
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useUserActions(
  token?: string
): UseUserActionsReturn {
  // ─── RSVP State ────────────────────────────────────────────────────────────
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpError, setRsvpError] = useState<string | null>(null);

  // ─── Zustand Store Actions ────────────────────────────────────────────────
  const setRsvpEventIds = useUserAuth(
    (s) => s.setRsvpEventIds
  );

  const setBookmarkedEventIds = useUserAuth(
    (s) => s.setBookmarkedEventIds
  );

  const setInteractionsLoaded = useUserAuth(
    (s) => s.setInteractionsLoaded
  );

  // ─── TanStack Query ────────────────────────────────────────────────────────
  const {
    data: interactions,
    isLoading: interactionsLoading,
    error: interactionsError,
    refetch,
  } = useQuery({
    queryKey: getUserInteractionsKey(token || ""),

    queryFn: () => getUserEventInteractions(token!),

    enabled: !!token,

    retry: 1,

    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // ─── Sync Query Data → Zustand ────────────────────────────────────────────
  useEffect(() => {
    if (interactions) {
      setRsvpEventIds(interactions.rsvpEventIds || []);

      setInteractionsLoaded(true);
    }
  }, [
    interactions,
    setRsvpEventIds,
    setBookmarkedEventIds,
    setInteractionsLoaded,
  ]);

  // ─── RSVP Submit ───────────────────────────────────────────────────────────
  const rsvpSubmit = async (
    eventId: number,
    token: string,
    body?: RsvpEventRequest
  ): Promise<RsvpEventResponse | null> => {
    setRsvpLoading(true);
    setRsvpError(null);

    try {
      const data = await rsvpEvent(
        eventId,
        token,
        body
      );

      return data;
    } catch (err: any) {
      const serverErr = err?.response?.data as
        | RsvpEventError
        | undefined;

      if (serverErr?.message) {
        setRsvpError(serverErr.message);
      } else if (err?.response?.status === 401) {
        setRsvpError(
          "Unauthorized. Please sign in again."
        );
      } else {
        setRsvpError(
          "Something went wrong. Please try again."
        );
      }

      return null;
    } finally {
      setRsvpLoading(false);
    }
  };

  // ─── Reset RSVP State ─────────────────────────────────────────────────────
  const rsvpReset = () => {
    setRsvpLoading(false);
    setRsvpError(null);
  };

  // ─── Return ────────────────────────────────────────────────────────────────
  return {
    rsvpEvent: {
      submit: rsvpSubmit,
      loading: rsvpLoading,
      error: rsvpError,
      reset: rsvpReset,
    },

    getUserInteractions: {
      loading: interactionsLoading,
      error: interactionsError
        ? (interactionsError as Error).message
        : null,
      refetch,
    },
  };
}