"use client";

// src/hooks/eventimist/organizer/Ai/useOrganizerAiAction.ts

import { useMutation } from "@tanstack/react-query";

import {
  generateEventDraft,
  sendAiChat,
  type GenerateEventDraftResponse,
  type AiChatResponse,
} from "@/services/eventimist/organizer/AiService/organizerAiActions.service";

import { useOrganizerAuth } from "@/store/eventimist/organizer/auth/AuthState";

// ─── Flat draft shape consumed by the UI ─────────────────────────────────────
export interface EventDraft {
  title: string | null;
  description: string | null;
  category: string | null;
  tags: string[] | null;
  startTime: string | null;
  endTime: string | null;
  mode: string | null;
  onlineLink: string | null;
}

// ─── Return Type ──────────────────────────────────────────────────────────────
export interface UseOrganizerAiActionReturn {
  generateEventDraft: {
    submit: (prompt: string) => Promise<EventDraft | null>;
    loading: boolean;
    error: string | null;
    reset: () => void;
  };
  aiChat: {
    submit: (prompt: string) => Promise<AiChatResponse | null>;
    loading: boolean;
    error: string | null;
    reset: () => void;
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useOrganizerAiAction(): UseOrganizerAiActionReturn {
  const setSubscription       = useOrganizerAuth((s) => s.setSubscription);
  const setSubscriptionLoaded = useOrganizerAuth((s) => s.setSubscriptionLoaded);

  // ─── Generate Event Draft mutation ────────────────────────────────────────
  const {
    mutateAsync: mutateGenerateDraft,
    isPending:   generateLoading,
    error:       generateError,
    reset:       resetGenerateDraft,
  } = useMutation({
    mutationFn: ({ prompt }: { prompt: string }): Promise<GenerateEventDraftResponse> =>
      generateEventDraft(prompt),
  });

  const generateSubmit = async (prompt: string): Promise<EventDraft | null> => {
    try {
      const data = await mutateGenerateDraft({ prompt });

      // Persist latest subscription to store
      if (data.subscription) {
        setSubscription({
          plan:               data.subscription.planType as "FREE" | "PRO",
          aiCreditsRemaining: data.subscription.aiCreditsRemaining,
          aiCreditsTotal:     data.subscription.monthlyAiCredits,
          eventLimit:         0,
          canUseAI:           data.subscription.active && data.subscription.aiCreditsRemaining > 0,
          expiresAt:          null,
        });
        setSubscriptionLoaded(true);
      }

      return data.draft;
    } catch {
      return null;
    }
  };

  // ─── AI Chat mutation ─────────────────────────────────────────────────────
  const {
    mutateAsync: mutateChatDraft,
    isPending:   chatLoading,
    error:       chatError,
    reset:       resetChat,
  } = useMutation({
    mutationFn: ({ prompt }: { prompt: string }): Promise<AiChatResponse> =>
      sendAiChat(prompt),
  });

  const chatSubmit = async (prompt: string): Promise<AiChatResponse | null> => {
    try {
      return await mutateChatDraft({ prompt });
    } catch {
      return null;
    }
  };

  return {
    generateEventDraft: {
      submit:  generateSubmit,
      loading: generateLoading,
      error:   generateError
        ? (generateError as any)?.response?.data?.message || (generateError as Error).message
        : null,
      reset: resetGenerateDraft,
    },
    aiChat: {
      submit:  chatSubmit,
      loading: chatLoading,
      error:   chatError
        ? (chatError as any)?.response?.data?.message || (chatError as Error).message
        : null,
      reset: resetChat,
    },
  };
}