"use client";

// src/hooks/eventimist/public/useDiscoverEvents.ts

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  discoverEvents,
  type DiscoverEvent,
  type DiscoverEventsParams,
} from "@/services/eventimist/user/events/discoverEvents.service";

// ─── Default fallback coords (Pune city centre) ───────────────────────────────
const DEFAULT_COORDS: Pick<DiscoverEventsParams, "latitude" | "longitude"> = {
  latitude:  18.5204,
  longitude: 73.8567,
};

const DEFAULT_RADIUS = 10; // km

// ─── Query key factory ────────────────────────────────────────────────────────
export const discoverEventsKey = (params: DiscoverEventsParams) =>
  ["public", "discover-events", params] as const;

// ─── Hook return shape ────────────────────────────────────────────────────────
export interface UseDiscoverEventsReturn {
  events:        DiscoverEvent[];
  loading:       boolean;
  error:         string | null;
  refetch:       () => void;

  // Location state
  coords:        { latitude: number; longitude: number } | null;
  geoLoading:    boolean;
  geoError:      string | null;
  locationGranted: boolean;

  // Radius control
  radius:        number;
  setRadius:     (r: number) => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useDiscoverEvents(
  initialRadius = DEFAULT_RADIUS
): UseDiscoverEventsReturn {
  const [coords,        setCoords]        = useState<{ latitude: number; longitude: number } | null>(null);
  const [geoLoading,    setGeoLoading]    = useState(true);
  const [geoError,      setGeoError]      = useState<string | null>(null);
  const [locationGranted, setLocationGranted] = useState(false);
  const [radius,        setRadius]        = useState(initialRadius);

  // ── Request browser geolocation once on mount ─────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation not supported by your browser.");
      setGeoLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setLocationGranted(true);
        setGeoLoading(false);
      },
      err => {
        // User denied or unavailable — fall back to default coords silently
        setGeoError(
          err.code === 1
            ? "Location access denied. Showing events near Pune."
            : "Could not get your location. Showing events near Pune."
        );
        setGeoLoading(false);
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  // ── Resolved query params (use real coords if available, else fallback) ────
  const queryParams: DiscoverEventsParams = {
    latitude:  coords?.latitude  ?? DEFAULT_COORDS.latitude,
    longitude: coords?.longitude ?? DEFAULT_COORDS.longitude,
    radius,
  };

  // ── TanStack Query ─────────────────────────────────────────────────────────
  const { data, isFetching, error, refetch } = useQuery<DiscoverEvent[], Error>({
    queryKey:  discoverEventsKey(queryParams),
    queryFn:   () => discoverEvents(queryParams),

    // Don't fetch while geo is still loading — wait for coords to settle
    enabled:   !geoLoading,

    staleTime:            5 * 60 * 1000,   // 5 min — nearby events don't change often
    gcTime:               10 * 60 * 1000,  // 10 min cache retention
    refetchOnWindowFocus: false,            // no need to re-hit on tab switch
    retry:                2,
  });

  return {
    events:   data ?? [],
    loading:  geoLoading || isFetching,
    error:    error?.message ?? null,
    refetch,

    coords,
    geoLoading,
    geoError,
    locationGranted,

    radius,
    setRadius,
  };
}