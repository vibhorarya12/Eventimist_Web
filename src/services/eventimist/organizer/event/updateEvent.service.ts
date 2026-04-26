// src/services/eventimist/organizer/event/updateEvent.service.ts
import eventimistClient from "@/services/eventimist/client";

// ─── Request shape ────────────────────────────────────────────────────────────
export interface UpdateEventRequest {
  title?:          string;
  description?:    string;
  category?:       string;
  startTime?:      string;        // ISO 8601
  endTime?:        string;
  timezone?:       string;
  mode?:           "ONLINE" | "OFFLINE" | "HYBRID";
  venue?:          string;
  onlineLink?:     string;
  latitude?:       number;
  longitude?:      number;
  tags?:           string[];
  capacity?:       number;
  ticketPrice?:    number | null;
  isFree?:         boolean;

  // ── Image sync ────────────────────────────────────────────────────────────
  // existingImages: URLs to KEEP — omit entirely if user didn't touch images
  // newImages:      new File[] to upload — omit if no new images
  // Backend rule:   existingImages + newImages <= 5
  existingImages?: string[];
  newImages?:      File[];
}

// ─── Response ─────────────────────────────────────────────────────────────────
export interface UpdateEventResponse {
  id:        number;
  title:     string;
  status:    string;
  updatedAt: string;
}

// ─── Error ────────────────────────────────────────────────────────────────────
export interface UpdateEventError {
  statusCode: number;
  message:    string;
  timestamp:  string;
}

// ─── Service ──────────────────────────────────────────────────────────────────
// Image logic:
//   - User kept some + added new  → send existingImages[] + newImages[]
//   - User only removed images    → send existingImages[] (subset), no newImages
//   - User only added new images  → send existingImages[] (all current) + newImages[]
//   - User never touched images   → omit BOTH fields entirely
export async function updateEvent(
  eventId: number | string,
  payload: UpdateEventRequest
): Promise<UpdateEventResponse> {
  const fd = new FormData();

  // ── Scalar fields — only append if provided ───────────────────────────────
  if (payload.title       != null) fd.append("title",       payload.title);
  if (payload.description != null) fd.append("description", payload.description);
  if (payload.category    != null) fd.append("category",    payload.category);
  if (payload.startTime   != null) fd.append("startTime",   payload.startTime);
  if (payload.endTime     != null) fd.append("endTime",     payload.endTime);
  if (payload.timezone    != null) fd.append("timezone",    payload.timezone);
  if (payload.mode        != null) fd.append("mode",        payload.mode);
  if (payload.venue       != null) fd.append("venue",       payload.venue);
  if (payload.onlineLink  != null) fd.append("onlineLink",  payload.onlineLink);
  if (payload.latitude    != null) fd.append("latitude",    String(payload.latitude));
  if (payload.longitude   != null) fd.append("longitude",   String(payload.longitude));
  if (payload.capacity    != null) fd.append("capacity",    String(payload.capacity));
  if (payload.isFree      != null) fd.append("isFree",      String(payload.isFree));

  // Ticket price — omit entirely when free
  if (payload.isFree === false && payload.ticketPrice != null) {
    fd.append("ticketPrice", String(payload.ticketPrice));
  }

  // Tags — repeated key, Spring reads as List<String>
  (payload.tags ?? []).forEach(tag => fd.append("tags", tag));

  // ── Image sync — only append if user touched images ───────────────────────
  // If existingImages is provided (even empty []), user made a change → send it
  if (payload.existingImages != null) {
    payload.existingImages.forEach(url => fd.append("existingImages", url));
    // If array is empty, append a sentinel so the key is present
    // (Spring needs at least one value or @RequestParam won't bind an empty list)
    // Instead we append a dedicated flag field:
    if (payload.existingImages.length === 0) {
      fd.append("clearExistingImages", "true");
    }
  }

  // New image files (max: 5 - existingImages.length, enforced by frontend)
  if (payload.newImages && payload.newImages.length > 0) {
    payload.newImages.slice(0, 5).forEach(file => fd.append("newImages", file));
  }

  const res = await eventimistClient.put<UpdateEventResponse>(
    `/organizer/events/${eventId}`,
    fd,
  );

  return res.data;
}