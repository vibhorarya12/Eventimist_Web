// src/services/eventimist/organizer/AiService/organizerAiActions.service.ts

import eventimistClient from "@/services/eventimist/client";

// ─── Generate Event Draft ─────────────────────────────────────────────────────
export interface GenerateEventDraftResponse {
  draft: {
    title: string | null;
    description: string | null;
    category: string | null;
    tags: string[] | null;
    startTime: string | null;
    endTime: string | null;
    mode: string | null;
    onlineLink: string | null;
  };
  subscription: {
    planType: string;
    aiCreditsRemaining: number;
    monthlyAiCredits: number;
    promptCharacterLimit: number;
    active: boolean;
  };
}

export async function generateEventDraft(
  prompt: string
): Promise<GenerateEventDraftResponse> {
  const res = await eventimistClient.post<GenerateEventDraftResponse>(
    "/organizer/generate-event-draft",
    { prompt }
  );
  return res.data;
}

// ─── AI Chat ──────────────────────────────────────────────────────────────────
export type AiChatType =
  | "DRAFT_EVENTS"
  | "PUBLISHED_EVENTS"
  | "SUBSCRIPTION_INFO"
  | "GENERAL_CHAT"
  | "UNKNOWN"
  | "ERROR";

export interface AiChatEventItem {
  id: number;
  title: string;
  slug: string;
  coverImage: string | null;
  status: string;
}

export interface AiChatSubscriptionData {
  planType: string;
  aiCreditsRemaining: number;
  monthlyAiCredits: number;
  promptCharacterLimit: number;
  active: boolean;
}

export interface AiChatResponse {
  message: string;
  type: AiChatType;
  data: AiChatEventItem[] | AiChatSubscriptionData | null;
}

export interface AIServiceError {
  statusCode: number;
  message: string;
  timestamp: string;
}

export async function sendAiChat(
  prompt: string
): Promise<AiChatResponse> {
  const res = await eventimistClient.post<AiChatResponse>(
    "/organizer/ai-chat",
    { prompt }
  );
  return res.data;
}