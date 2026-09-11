// src/services/eventimist/organizer/auth/organizerRefreshToken.service.ts

import { publicClient } from "@/services/eventimist/client";

export interface OrganizerRefreshTokenResponse {
  name:         string;
  email:        string;
  bio:          string;
  profilePic:   string | null;
  coverImage:   string | null;
  location:     string | null;
  token:        string;
  refreshToken: string;
}

export async function organizerRefreshToken(
  refreshToken: string
): Promise<OrganizerRefreshTokenResponse> {
  const res = await publicClient.post<OrganizerRefreshTokenResponse>(
    "/auth/organizer/refresh-token",
    { refreshToken }
  );
  return res.data;
}