"use client";

// src/hooks/eventimist/organizer/event/useCreateEvent.ts

import { useState } from "react";
import {
  createEvent,
  type CreateEventRequest,
  type CreateEventResponse,
  type CreateEventError,
} from  "@/services/eventimist/organizer/event/Createevent.service";

// ─── Hook return shape ────────────────────────────────────────────────────────
export interface UseCreateEventReturn {
  submit:  (payload: CreateEventRequest) => Promise<CreateEventResponse | null>;
  loading: boolean;
  error:   string | null;
  reset:   () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useCreateEvent(): UseCreateEventReturn {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const submit = async (
    payload: CreateEventRequest
  ): Promise<CreateEventResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const data = await createEvent(payload);
      return data;

    } catch (err: any) {
      const serverErr = err?.response?.data as CreateEventError | undefined;
      console.log("<<<<<<<<<<<< error <<<<<<<",err)
      if (serverErr?.message) {
        setError(serverErr.message);
      } else if (err?.response?.status === 401) {
        setError("Session expired. Please sign in again.");
      } else if (err?.response?.status === 413) {
        setError("Images are too large. Please reduce file sizes and retry.");
      } else if (err?.response?.status === 422) {
        setError("Invalid event data. Please review your inputs.");
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