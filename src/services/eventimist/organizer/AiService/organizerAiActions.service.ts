// src/services/eventimist/organizer/AiService/organizerAiActions.service.ts

import eventimistClient from "@/services/eventimist/client";

// ─── Request Types ────────────────────────────────────────────────────────────
export interface GenerateEventDraftRequest {
  prompt: string;
}

// ─── Response Types ───────────────────────────────────────────────────────────
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

// ─── Error Types ──────────────────────────────────────────────────────────────
export interface AIServiceError {
  statusCode: number;
  message: string;
  timestamp: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────
export async function generateEventDraft(
  prompt: string
): Promise<GenerateEventDraftResponse> {
  const res = await eventimistClient.post<GenerateEventDraftResponse>(
    "/organizer/generate-event-draft",
    { prompt }
  );
  return res.data;
}