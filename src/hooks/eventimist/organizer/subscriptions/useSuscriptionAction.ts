"use client";

// src/hooks/eventimist/organizer/subscriptions/useSubscriptionAction.ts

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  getOrganizerSubscription,
  type OrganizerSubscriptionResponse,
} from "@/services/eventimist/organizer/event/subscriptionActions.service";

import {
  useOrganizerAuth,
  useOrganizerAccessToken,
  useSubscriptionLoaded,
} from "@/store/eventimist/organizer/auth/AuthState";

export interface UseSubscriptionActionReturn {
  subscription: OrganizerSubscriptionResponse | undefined;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSubscriptionAction(): UseSubscriptionActionReturn {
  const token              = useOrganizerAccessToken();
  const subscriptionLoaded = useSubscriptionLoaded();
  const setSubscription    = useOrganizerAuth((s) => s.setSubscription);
  const setSubscriptionLoaded = useOrganizerAuth((s) => s.setSubscriptionLoaded);

  const {
    data: subscription,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["organizer", "subscription", token],
    queryFn:  getOrganizerSubscription,
    enabled:  !!token,                // only fetch when authenticated
    staleTime: 1000 * 60 * 5,         // 5 min
    retry: 1,
  });

  // ── Sync response → auth store ────────────────────────────────────────────
  useEffect(() => {
    if (!subscription) return;

    // Map service response → store shape
    setSubscription({
      plan:subscription.planType as "FREE" | "PRO",
      aiCreditsRemaining: subscription.aiCreditsRemaining,
      aiCreditsTotal:     subscription.monthlyAiCredits,
      eventLimit:         0,          // not in response — keep 0 or extend service later
      canUseAI:           subscription.active && subscription.aiCreditsRemaining > 0,
      expiresAt:          null,       // not in response — extend service when needed
    });

    setSubscriptionLoaded(true);
  }, [subscription, setSubscription, setSubscriptionLoaded]);

  return {
    subscription,
    loading: isLoading,
    error:   error ? (error as Error).message : null,
    refetch,
  };
}