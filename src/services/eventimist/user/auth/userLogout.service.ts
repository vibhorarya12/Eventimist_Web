// src/services/eventimist/user/auth/userLogout.service.ts

import { publicClient } from "@/services/eventimist/client";

export async function userLogout(refreshToken: string): Promise<void> {
  await publicClient.post("/auth/user/logout", { refreshToken });
}