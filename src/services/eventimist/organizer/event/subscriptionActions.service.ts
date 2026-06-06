// src/services/eventimist/organizer/event/subscriptionActions.service.ts

import eventimistClient from "@/services/eventimist/client";

export interface OrganizerSubscriptionResponse {
  planType: string;
  aiCreditsRemaining: number;
  monthlyAiCredits: number;
  promptCharacterLimit: number;
  active: boolean;
}

export async function getOrganizerSubscription(): Promise<OrganizerSubscriptionResponse> {
  const res = await eventimistClient.get<OrganizerSubscriptionResponse>(
    "/organizer/subscriptions"
  );
  return res.data;
}
