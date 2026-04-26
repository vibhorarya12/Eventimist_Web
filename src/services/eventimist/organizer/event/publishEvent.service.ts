// src/services/eventimist/organizer/event/publishEvent.service.ts
import eventimistClient from "@/services/eventimist/client";

export interface PublishEventResponse {
  id:          number;
  title:       string;
  status:      "PUBLISHED";
  slug:        string;
  publishedAt: string;
}

export interface PublishEventError {
  statusCode: number;
  message:    string;
  timestamp:  string;
}

// No request body — just the event ID in the URL + token in header
export async function publishEvent(
  eventId: number | string
): Promise<PublishEventResponse> {
  const res = await eventimistClient.patch<PublishEventResponse>(
    `/organizer/events/${eventId}/publish`
  );
  return res.data;
}