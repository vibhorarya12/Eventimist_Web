// src/services/eventimist/public/discoverEvents.service.ts

import axios from "axios";

// ─── Dedicated public axios client — no auth interceptor ─────────────────────
// Never attaches a Bearer token. Safe to call from any page without a session.
const publicClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_EVENTIMIST_API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ─── Response shape ───────────────────────────────────────────────────────────
export interface DiscoverEvent {
  id:             number;
  title:          string;
  description:    string;
  category:       string;
  slug:           string;
  startTime:      string;      // ISO 8601 e.g. "2026-04-20T18:00:00"
  timezone:       string;      // e.g. "Asia/Kolkata"
  mode:           "ONLINE" | "OFFLINE" | "HYBRID";
  venue:          string;
  latitude:       number;
  longitude:      number;
  coverImage:     string;      // Cloudinary URL
  distance:       number;      // km from query point (0.0 if at exact coords)
  organizerName:  string;
  organizerImage: string;      // Cloudinary URL
}

// ─── Request params ───────────────────────────────────────────────────────────
export interface DiscoverEventsParams {
  latitude:  number;
  longitude: number;
  radius:    number;           // km
}

// ─── Service ──────────────────────────────────────────────────────────────────
export async function discoverEvents(
  params: DiscoverEventsParams
): Promise<DiscoverEvent[]> {
  const res = await publicClient.get<DiscoverEvent[]>(
    "/public/discover-events",
    { params }
  );
  return res.data;
}