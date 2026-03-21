import eventimistClient from "@/services/eventimist/client";

// ─── Request shape — matches your backend exactly ─────────────────────────────
export interface OrganizerRegisterRequest {
  name:           string;
  email:          string;
  password:       string;
  clerkSessionId: string;
}

// ─── Success response — same shape as login ───────────────────────────────────
export interface OrganizerRegisterResponse {
  name:        string;
  email:       string;
  bio:         string;
  profilePic:  string;
  token:       string;
  coverImage:  string;
  location:    string;
}

// ─── Error response ───────────────────────────────────────────────────────────
export interface OrganizerRegisterError {
  statusCode: number;
  message:    string;
  timestamp:  string;
}

// ─── Service ──────────────────────────────────────────────────────────────────
export async function organizerRegister(
  payload: OrganizerRegisterRequest
): Promise<OrganizerRegisterResponse> {
  const response = await eventimistClient.post<OrganizerRegisterResponse>(
    "/auth/organizer/register",
    payload
  );
  return response.data;
}