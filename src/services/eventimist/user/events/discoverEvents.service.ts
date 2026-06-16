// src/services/eventimist/public/discoverEvents.service.ts

import axios from "axios";

// ─── Dedicated public axios client ────────────────────────────────────────────
const publicClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_EVENTIMIST_API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ─── Response shapes ──────────────────────────────────────────────────────────
export interface DiscoverEvent {
  id:             number;
  title:          string;
  description:    string;
  category:       string;
  slug:           string;
  startTime:      string;
  timezone:       string;
  mode:           "ONLINE" | "OFFLINE" | "HYBRID";
  venue:          string;
  latitude:       number;
  longitude:      number;
  coverImage:     string;
  distance:       number;
  organizerName:  string;
  organizerImage: string;
}

export interface DiscoverEventsResponse {
  events:      DiscoverEvent[];
  page:        number;
  limit:       number;
  totalEvents: number;
  hasMore:     boolean;
}

// ─── Request params ───────────────────────────────────────────────────────────
export interface DiscoverEventsParams {
  latitude:  number;
  longitude: number;
  radius?:   number;   // km, default 10
  page?:     number;   // default 0
  limit?:    number;   // default 20
}

// ─── Service ──────────────────────────────────────────────────────────────────
export async function discoverEvents(
  params: DiscoverEventsParams
): Promise<DiscoverEventsResponse> {
  const res = await publicClient.get<DiscoverEventsResponse>(
    "/public/discover-events",
    { params }
  );
  return res.data;
}