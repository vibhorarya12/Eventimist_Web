"use client";

// src/hooks/eventimist/public/useDiscoverEvents.ts

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  discoverEvents,
  type DiscoverEvent,
  type DiscoverEventsParams,
  type DiscoverEventsResponse,
} from "@/services/eventimist/user/events/discoverEvents.service";

// ─── Defaults ─────────────────────────────────────────────────────────────────
const DEFAULT_COORDS = { latitude: 18.5204, longitude: 73.8567 }; // Pune
const DEFAULT_RADIUS = 10;
const DEFAULT_LIMIT  = 20;

// ─── Query key factory ────────────────────────────────────────────────────────
export const discoverEventsKey = (params: DiscoverEventsParams) =>
  ["public", "discover-events", params] as const;

// ─── Hook return shape ────────────────────────────────────────────────────────
export interface UseDiscoverEventsReturn {
  // Events — accumulates across pages when loadMore is called
  events:          DiscoverEvent[];
  loading:         boolean;
  error:           string | null;
  refetch:         () => void;

  // Pagination
  page:            number;
  hasMore:         boolean;
  totalEvents:     number;
  loadMore:        () => void;
  loadingMore:     boolean;

  // Location
  coords:          { latitude: number; longitude: number } | null;
  geoLoading:      boolean;
  geoError:        string | null;
  locationGranted: boolean;

  // Radius
  radius:          number;
  setRadius:       (r: number) => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useDiscoverEvents(
  initialRadius = DEFAULT_RADIUS
): UseDiscoverEventsReturn {
  const [coords,          setCoords]          = useState<{ latitude: number; longitude: number } | null>(null);
  const [geoLoading,      setGeoLoading]      = useState(true);
  const [geoError,        setGeoError]        = useState<string | null>(null);
  const [locationGranted, setLocationGranted] = useState(false);
  const [radius,          setRadiusState]     = useState(initialRadius);

  // ── Pagination state ──────────────────────────────────────────────────────
  const [page,         setPage]         = useState(0);
  const [allEvents,    setAllEvents]    = useState<DiscoverEvent[]>([]);
  const [hasMore,      setHasMore]      = useState(false);
  const [totalEvents,  setTotalEvents]  = useState(0);
  const [loadingMore,  setLoadingMore]  = useState(false);

  // ── Geolocation ───────────────────────────────────────────────────────────
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

  // ── Query params (page 0 — first load) ───────────────────────────────────
  const queryParams: DiscoverEventsParams = {
    latitude:  coords?.latitude  ?? DEFAULT_COORDS.latitude,
    longitude: coords?.longitude ?? DEFAULT_COORDS.longitude,
    radius,
    page:      0,
    limit:     DEFAULT_LIMIT,
  };

  // ── TanStack Query — always fetches page 0 ────────────────────────────────
  const { isFetching, error, refetch: refetchQuery } = useQuery<DiscoverEventsResponse, Error>({
    queryKey:  discoverEventsKey(queryParams),
    queryFn:   () => discoverEvents(queryParams),
    enabled:   !geoLoading,
    staleTime: 5 * 60 * 1000,
    gcTime:    10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
    // Reset accumulated list on new query (coords/radius change)
    select: data => data,
  });

  // Keep allEvents in sync with fresh page-0 result
  const { data: page0Data } = useQuery<DiscoverEventsResponse, Error>({
    queryKey:  discoverEventsKey(queryParams),
    queryFn:   () => discoverEvents(queryParams),
    enabled:   !geoLoading,
    staleTime: 5 * 60 * 1000,
    gcTime:    10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  useEffect(() => {
    if (page0Data) {
      setAllEvents(page0Data.events);
      setHasMore(page0Data.hasMore);
      setTotalEvents(page0Data.totalEvents);
      setPage(0);
    }
  }, [page0Data]);

  // ── Reset on radius change ────────────────────────────────────────────────
  const setRadius = useCallback((r: number) => {
    setRadiusState(r);
    setPage(0);
    setAllEvents([]);
  }, []);

  // ── Load more (next page) ─────────────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const result = await discoverEvents({
        latitude:  coords?.latitude  ?? DEFAULT_COORDS.latitude,
        longitude: coords?.longitude ?? DEFAULT_COORDS.longitude,
        radius,
        page:      nextPage,
        limit:     DEFAULT_LIMIT,
      });
      setAllEvents(prev => [...prev, ...result.events]);
      setHasMore(result.hasMore);
      setTotalEvents(result.totalEvents);
      setPage(nextPage);
    } catch {
      // silently fail — user can try again
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, page, coords, radius]);

  return {
    events:      allEvents,
    loading:     geoLoading || isFetching,
    error:       error?.message ?? null,
    refetch:     refetchQuery,

    page,
    hasMore,
    totalEvents,
    loadMore,
    loadingMore,

    coords,
    geoLoading,
    geoError,
    locationGranted,

    radius,
    setRadius,
  };
}