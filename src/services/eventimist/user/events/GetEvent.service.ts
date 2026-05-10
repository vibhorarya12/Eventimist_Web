// src/services/eventimist/user/events/GetEvent.service.ts

import axios from "axios";

// ─── Dedicated public axios client — no auth interceptor ─────────────────────
// Never attaches a Bearer token. Safe to call from any page without a session.
const publicClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_EVENTIMIST_API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ─── Response shape ───────────────────────────────────────────────────────────
export interface GetEventResponse {
  id:             number;
  slug:           string;
  title:          string;
  description:    string;
  category:       string;      // e.g. "ART"
  startTime:      string;      // ISO 8601 e.g. "2026-05-30T11:00:00"
  endTime:        string;      // ISO 8601 e.g. "2026-05-30T21:53:00"
  timezone:       string;      // e.g. "Asia/Kolkata"
  mode:           "ONLINE" | "OFFLINE" | "HYBRID";
  venue:          string;
  latitude:       number;
  longitude:      number;
  coverImage:     string;      // Cloudinary URL
  images:         string[];    // Array of Cloudinary URLs
  organizerId:    number;
  organizerName:  string;
  organizerImage: string;      // Cloudinary URL
  attendance:     number;
  rsvpCount:      number;
  isFree:         boolean;
  ticketPrice:    number | null;
  tags:           string[];
}

// ─── Service ──────────────────────────────────────────────────────────────────
export async function getEvent(slug: string): Promise<GetEventResponse> {
  const res = await publicClient.get<GetEventResponse>(
    `/public/event/${slug}`
  );
  return res.data;
}