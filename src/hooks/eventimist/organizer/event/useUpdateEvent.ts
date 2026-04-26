"use client";

// src/hooks/eventimist/organizer/event/useUpdateEvent.ts

import { useState } from "react";
import {
  updateEvent,
  type UpdateEventRequest,
  type UpdateEventResponse,
  type UpdateEventError,
} from "@/services/eventimist/organizer/event/updateEvent.service";
import { useOrganizerEvents } from "./useOrganizerEvents";

export interface UseUpdateEventReturn {
  submit:  (eventId: number | string, payload: UpdateEventRequest) => Promise<UpdateEventResponse | null>;
  loading: boolean;
  error:   string | null;
  reset:   () => void;
}

export function useUpdateEvent(): UseUpdateEventReturn {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  // Invalidate the events list cache after a successful update
  // so the dashboard reflects changes immediately
  const { invalidate } = useOrganizerEvents();

  const submit = async (
    eventId: number | string,
    payload: UpdateEventRequest
  ): Promise<UpdateEventResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const data = await updateEvent(eventId, payload);
      invalidate(); // bust TanStack Query cache → dashboard re-fetches
      return data;

    } catch (err: any) {
      const serverErr = err?.response?.data as UpdateEventError | undefined;

      if (serverErr?.message) {
        setError(serverErr.message);
      } else if (err?.response?.status === 401) {
        setError("Session expired. Please sign in again.");
      } else if (err?.response?.status === 404) {
        setError("Event not found. It may have been deleted.");
      } else if (err?.response?.status === 413) {
        setError("Images are too large. Please reduce file sizes.");
      } else if (err?.response?.status === 422) {
        setError("Invalid data. Please review your inputs.");
      } else {
        setError("Something went wrong. Please try again.");
      }

      return null;

    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error, reset: () => setError(null) };
}