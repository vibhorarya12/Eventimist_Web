import eventimistClient from "@/services/eventimist/client";
import type {
  UserLoginResponse,
  UserLoginError,
} from "@/services/eventimist/user/auth/userLogin.service";

// Re-export same shapes — OAuth register returns identical payloads to login
export type { UserLoginResponse, UserLoginError };

// ─── Request shape ────────────────────────────────────────────────────────────
export interface UserOAuthRegisterRequest {
  name:           string;
  email:          string;
  clerkSessionId: string;
  profilePic?:    string;
}

// ─── Service ──────────────────────────────────────────────────────────────────
export async function userOAuthRegister(
  payload: UserOAuthRegisterRequest
): Promise<UserLoginResponse> {
  const response = await eventimistClient.post<UserLoginResponse>(
    "/auth/user/oauthRegister",
    payload
  );
  return response.data;
}
