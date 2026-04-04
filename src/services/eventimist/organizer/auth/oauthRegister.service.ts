import eventimistClient from "@/services/eventimist/client";
import type {
  OrganizerLoginResponse,
  OrganizerLoginError,
} from "@/services/eventimist/organizer/auth/login.service";

// Re-export same shapes — OAuth register returns identical payloads to login
export type { OrganizerLoginResponse, OrganizerLoginError };

// ─── Request shape ────────────────────────────────────────────────────────────
export interface OrganizerOAuthRegisterRequest {
  name:           string;
  email:          string;
  clerkSessionId: string;
  profilePic?:    string;
}

// ─── Service ──────────────────────────────────────────────────────────────────
export async function organizerOAuthRegister(
  payload: OrganizerOAuthRegisterRequest
): Promise<OrganizerLoginResponse> {
  const response = await eventimistClient.post<OrganizerLoginResponse>(
    "/auth/organizer/oauthRegister",
    payload
  );
  return response.data;
}
