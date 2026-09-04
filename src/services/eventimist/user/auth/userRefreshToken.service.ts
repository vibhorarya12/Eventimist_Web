// src/services/eventimist/user/auth/userRefreshToken.service.ts

import { publicClient } from "@/services/eventimist/client";

export interface UserRefreshTokenResponse {
  name:         string;
  email:        string;
  token:        string;
  refreshToken: string;
  profilePic:   string | null;
}

export async function userRefreshToken(
  refreshToken: string
): Promise<UserRefreshTokenResponse> {
  const res = await publicClient.post<UserRefreshTokenResponse>(
    "/auth/user/refresh-token",
    { refreshToken }
  );
  return res.data;
}