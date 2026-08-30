// src/services/eventimist/public/aiChat.service.ts

import { publicClient } from "@/services/eventimist/client";

export interface AiChatEvent {
  id: number;
  title: string;
  description: string;
  category: string;
  startTime: string;
  timezone: string;
  mode: string;
  venue: string;
  latitude: number;
  longitude: number;
  coverImage: string;
  distance: number;
  slug: string;
  organizerName: string;
  organizerImage: string;
}

export interface AiChatRequest {
  prompt: string;
  latitude: number;
  longitude: number;
}

export interface AiChatResponse {
  events: AiChatEvent[];
  page: number;
  limit: number;
  totalEvents: number;
  hasMore: boolean;
}

export async function discoverEventsAi(
  body: AiChatRequest
): Promise<AiChatResponse> {
  const res = await publicClient.post<AiChatResponse>(
    "/public/discover-events-ai",
    body
  );
  return res.data;
}