import eventimistClient from "@/services/eventimist/client";

// ─── Request shape ────────────────────────────────────────────────────────────
export interface OrganizerLoginRequest {
  email:    string;
  password: string;
}

// ─── Success response shape (matches backend exactly) ────────────────────────
export interface OrganizerLoginResponse {
  name:        string;
  email:       string;
  bio:         string;
  profilePic:  string;
  token:       string;
  coverImage:  string;
  location:    string;
}

// ─── Error response shape ─────────────────────────────────────────────────────
export interface OrganizerLoginError {
  statusCode: number;
  message:    string;
  timestamp:  string;
}

// ─── Service ──────────────────────────────────────────────────────────────────
export async function organizerLogin(
  payload: OrganizerLoginRequest
): Promise<OrganizerLoginResponse> {
  const response = await eventimistClient.post<OrganizerLoginResponse>(
    "/auth/organizer/login",
    payload
  );
  return response.data;
}