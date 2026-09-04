// src/hooks/eventimist/user/auth/useUserRefreshToken.ts

import { useCallback, useState } from "react";
import { useUserAuth } from "@/store/eventimist/user/auth/UserAuthState";
import { userRefreshToken } from "@/services/eventimist/user/auth/userRefreshToken.service";

export function useUserRefreshToken() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const refreshToken = useUserAuth(s => s.refreshToken);
  const setAuth      = useUserAuth(s => s.setAuth);
  const clearAuth    = useUserAuth(s => s.clearAuth);

  const refresh = useCallback(async (): Promise<boolean> => {
    if (!refreshToken) return false;

    setLoading(true);
    setError(null);

    try {
      const data = await userRefreshToken(refreshToken);

      setAuth({
        name:         data.name,
        email:        data.email,
        profilePic:   data.profilePic,
        accessToken:  data.token,
        refreshToken: data.refreshToken,
      });

      // Update cookie with new access token
      document.cookie = `user-token=${data.token}; path=/; SameSite=Strict`;

      return true;
    } catch {
      // Refresh failed — session expired, force logout
      clearAuth();
      document.cookie = "user-token=; path=/; max-age=0; SameSite=Strict";
      setError("Session expired. Please sign in again.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshToken, setAuth, clearAuth]);

  return { refresh, loading, error };
}