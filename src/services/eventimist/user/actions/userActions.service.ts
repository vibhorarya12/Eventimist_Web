// src/services/eventimist/user/actions/userActions.service.ts
import eventimistClient from "@/services/eventimist/client";

export interface RsvpEventRequest {
  // Add any request body fields if needed, e.g., status: string;
}

export interface RsvpEventResponse {
  statusCode: number;
  message: string;
  timestamp: string;
}

export interface RsvpEventError {
  statusCode: number;
  message: string;
  timestamp: string;
}

export interface UserEventInteractionsResponse {
  rsvpEventIds: number[];
}

export async function getUserEventInteractions(
  token: string
): Promise<UserEventInteractionsResponse> {
  const res = await eventimistClient.get<UserEventInteractionsResponse>(
    "/user/event/interactions",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
}

export async function rsvpEvent(
  eventId: number,
  token: string,
  body?: RsvpEventRequest
): Promise<RsvpEventResponse> {
  const res = await eventimistClient.post<RsvpEventResponse>(
    `/user/event/rsvp/${eventId}`,
    body || {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
}

