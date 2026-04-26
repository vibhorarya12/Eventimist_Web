"use client";

// src/hooks/eventimist/organizer/event/usePublishEvent.ts

import { useState } from "react";
import {
  publishEvent,
  type PublishEventResponse,
  type PublishEventError,
} from "@/services/eventimist/organizer/event/publishEvent.service";
import { useOrganizerEvents } from "./useOrganizerEvents";

export interface UsePublishEventReturn {
  publish:  (eventId: number | string) => Promise<PublishEventResponse | null>;
  loading:  boolean;
  error:    string | null;
  reset:    () => void;
}

export function usePublishEvent(): UsePublishEventReturn {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const { invalidate } = useOrganizerEvents();

  const publish = async (
    eventId: number | string
  ): Promise<PublishEventResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const data = await publishEvent(eventId);
      invalidate(); // bust cache → dashboard re-fetches updated status
      return data;

    } catch (err: any) {
      const serverErr = err?.response?.data as PublishEventError | undefined;

      if (serverErr?.message) {
        setError(serverErr.message);
      } else if (err?.response?.status === 401) {
        setError("Session expired. Please sign in again.");
      } else if (err?.response?.status === 403) {
        setError("You don't have permission to publish this event.");
      } else if (err?.response?.status === 404) {
        setError("Event not found.");
      } else if (err?.response?.status === 409) {
        setError("This event is already published.");
      } else if (err?.response?.status === 422) {
        setError(serverErr?.message ?? "Event is incomplete. Please fill all required fields before publishing.");
      } else {
        setError("Something went wrong. Please try again.");
      }

      return null;
    } finally {
      setLoading(false);
    }
  };

  return { publish, loading, error, reset: () => setError(null) };
}