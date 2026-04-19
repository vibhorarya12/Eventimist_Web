// src/services/eventimist/organizer/event/createEvent.service.ts
import eventimistClient from "@/services/eventimist/client";

// ─── Enums ────────────────────────────────────────────────────────────────────
export type EventCategory =
  | "MUSIC" | "TECH" | "FOOD" | "ART" | "SPORTS"
  | "FESTIVAL" | "VOLUNTEER" | "NETWORKING"
  | "WORKSHOP" | "CONFERENCE" | "EDUCATION"
  | "BUSINESS" | "HEALTH" | "ENTERTAINMENT" | "GAMING";

export type EventMode = "ONLINE" | "OFFLINE" | "HYBRID";

// ─── Request shape ────────────────────────────────────────────────────────────
export interface CreateEventRequest {
  title:        string;
  description:  string;
  category:     EventCategory;
  startTime:    string;           // ISO 8601: "2026-04-20T18:00:00"
  endTime:      string;
  timezone:     string;           // "Asia/Kolkata"
  mode:         EventMode;
  venue?:       string;           // required when OFFLINE | HYBRID
  onlineLink?:  string;           // required when ONLINE  | HYBRID
  latitude?:    number;
  longitude?:   number;
  tags?:        string[];
  capacity:     number;
  ticketPrice?: number | null;    // null when isFree = true
  isFree:       boolean;
  files:        File[];           // 2–5 images
}

// ─── Success response ─────────────────────────────────────────────────────────
export interface CreateEventResponse {
  id:        string;
  title:     string;
  status:    string;
  createdAt: string;
}

// ─── Error response ───────────────────────────────────────────────────────────
export interface CreateEventError {
  statusCode: number;
  message:    string;
  timestamp:  string;
}

// ─── Service ──────────────────────────────────────────────────────────────────
// Sends multipart/form-data — required because files are included.
// Token attached automatically by the axios client interceptor.
// Do NOT manually set Content-Type — axios/browser sets it with the correct
// multipart boundary when it detects a FormData body.
export async function createEvent(
  payload: CreateEventRequest
): Promise<CreateEventResponse> {
  const fd = new FormData();

  // ── Scalar fields ──────────────────────────────────────────────────────────
  fd.append("title",       payload.title);
  fd.append("description", payload.description);
  fd.append("category",    payload.category);
  fd.append("startTime",   payload.startTime);
  fd.append("endTime",     payload.endTime);
  fd.append("timezone",    payload.timezone);
  fd.append("mode",        payload.mode);
  fd.append("capacity",    String(payload.capacity));
  fd.append("isFree",      String(payload.isFree));

  // ── Optional: venue / link (conditional on mode) ──────────────────────────
  if (payload.venue)      fd.append("venue",      payload.venue);
  if (payload.onlineLink) fd.append("onlineLink", payload.onlineLink);

  // ── Optional: coordinates ─────────────────────────────────────────────────
  if (payload.latitude  != null) fd.append("latitude",  String(payload.latitude));
  if (payload.longitude != null) fd.append("longitude", String(payload.longitude));

  // ── Ticket price — omit entirely when free ────────────────────────────────
  if (!payload.isFree && payload.ticketPrice != null) {
    fd.append("ticketPrice", String(payload.ticketPrice));
  }

  // ── Tags — repeated key pattern, Spring reads as List<String> ─────────────
  (payload.tags ?? []).forEach(tag => fd.append("tags", tag));

  // ── Images (max 5) ────────────────────────────────────────────────────────
  payload.files.slice(0, 5).forEach(file => fd.append("files", file));

  const res = await eventimistClient.post<CreateEventResponse>(
    "/organizer/create-event",
    fd,
  );

  return res.data;
}