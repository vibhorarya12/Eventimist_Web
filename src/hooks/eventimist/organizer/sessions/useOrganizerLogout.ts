// src/hooks/eventimist/organizer/sessions/useOrganizerLogout.ts

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useOrganizerAuth } from "@/store/eventimist/organizer/auth/AuthState";
import { organizerLogout } from "@/services/eventimist/organizer/auth/organizerLogout.service";

export function useOrganizerLogout() {
  const [loading, setLoading] = useState(false);
  const refreshToken = useOrganizerAuth(s => s.refreshToken);
  const clearAuth    = useOrganizerAuth(s => s.clearAuth);
  const router       = useRouter();

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      if (refreshToken) await organizerLogout(refreshToken);
    } catch {
      // silently fail — still clear local state
    } finally {
      clearAuth();
      document.cookie = "organizer-token=; path=/; max-age=0; SameSite=Strict";
      setLoading(false);
      router.replace("/organizer/auth");
    }
  }, [refreshToken, clearAuth, router]);

  return { logout, loading };
}