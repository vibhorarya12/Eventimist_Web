// src/services/eventimist/organizer/event/getOrganizerEvents.service.ts
import eventimistClient from "@/services/eventimist/client";

// ─── Response shape (matches API exactly) ────────────────────────────────────
export interface OrganizerEvent {
  id:          number;
  title:       string;
  description: string;
  category:    string;
  startTime:   string;        // ISO 8601
  endTime:     string;
  timezone:    string;
  mode:        "ONLINE" | "OFFLINE" | "HYBRID";
  venue:       string;
  onlineLink:  string;
  latitude:    number;
  longitude:   number;
  coverImage:  string;
  images:      string[];
  tags:        string[];
  slug:        string;
  capacity:    number;
  ticketPrice: number;
  isFree:      boolean;
  status:      "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
  attendance:  number;
  rsvpCount:   number;
}

// ─── Service ──────────────────────────────────────────────────────────────────
// Token attached automatically by the axios client interceptor.
export async function getOrganizerEvents(): Promise<OrganizerEvent[]> {
  const res = await eventimistClient.get<OrganizerEvent[]>("/organizer/events");
  return res.data;
}