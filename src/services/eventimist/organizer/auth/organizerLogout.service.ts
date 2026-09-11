// src/services/eventimist/organizer/auth/organizerLogout.service.ts

import { publicClient } from "@/services/eventimist/client";

export async function organizerLogout(refreshToken: string): Promise<void> {
  await publicClient.post("/auth/organizer/logout", { refreshToken });
}