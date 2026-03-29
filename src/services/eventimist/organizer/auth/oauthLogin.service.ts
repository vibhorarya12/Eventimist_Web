import eventimistClient from "@/services/eventimist/client";
import type {
  OrganizerLoginResponse,
  OrganizerLoginError,
} from "@/services/eventimist/organizer/auth/login.service";

// Re-export same shapes — OAuth and regular login return identical payloads
export type { OrganizerLoginResponse, OrganizerLoginError };

// ─── Request shape ────────────────────────────────────────────────────────────
export interface OrganizerOAuthLoginRequest {
  email:          string;
  clerkSessionId: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────
export async function organizerOAuthLogin(
  payload: OrganizerOAuthLoginRequest
): Promise<OrganizerLoginResponse> {
  const response = await eventimistClient.post<OrganizerLoginResponse>(
    "/auth/organizer/oauthLogin",
    payload
  );
  return response.data;
}