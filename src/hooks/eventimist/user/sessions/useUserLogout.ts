// src/hooks/eventimist/user/sessions/useUserLogout.ts

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserAuth } from "@/store/eventimist/user/auth/UserAuthState";
import { userLogout } from "@/services/eventimist/user/auth/userLogout.service";

export function useUserLogout() {
  const [loading, setLoading] = useState(false);
  const refreshToken = useUserAuth(s => s.refreshToken);
  const clearAuth    = useUserAuth(s => s.clearAuth);
  const router       = useRouter();

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      if (refreshToken) await userLogout(refreshToken);
    } catch {
      // silently fail — still clear local state
    } finally {
      // Clear Zustand + localStorage
      clearAuth();
      // Clear cookie
      document.cookie = "user-token=; path=/; max-age=0; SameSite=Strict";
      setLoading(false);
      router.replace("/");
    }
  }, [refreshToken, clearAuth, router]);

  return { logout, loading };
}