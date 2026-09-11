// src/hooks/eventimist/organizer/auth/useOrganizerRefreshToken.ts

import { useCallback, useState } from "react";
import { useOrganizerAuth } from "@/store/eventimist/organizer/auth/AuthState";
import { organizerRefreshToken } from "@/services/eventimist/organizer/auth/organizerRefreshToken.service";

export function useOrganizerRefreshToken() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const refreshToken = useOrganizerAuth(s => s.refreshToken);
  const setAuth      = useOrganizerAuth(s => s.setAuth);
  const clearAuth    = useOrganizerAuth(s => s.clearAuth);

  const refresh = useCallback(async (): Promise<boolean> => {
    if (!refreshToken) return false;

    setLoading(true);
    setError(null);

    try {
      const data = await organizerRefreshToken(refreshToken);

      setAuth({
        name:         data.name,
        email:        data.email,
        bio:          data.bio,
        profilePic:   data.profilePic,
        coverImage:   data.coverImage,
        location:     data.location,
        accessToken:  data.token,
        refreshToken: data.refreshToken,
      });

      // Update cookie for middleware
      document.cookie = `organizer-token=${data.token}; path=/; SameSite=Strict`;

      return true;
    } catch {
      // Refresh failed — force logout
      clearAuth();
      document.cookie = "organizer-token=; path=/; max-age=0; SameSite=Strict";
      setError("Session expired. Please sign in again.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshToken, setAuth, clearAuth]);

  return { refresh, loading, error };
}