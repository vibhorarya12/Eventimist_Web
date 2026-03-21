"use client";
import { useEffect } from "react";
import { useOrganizerAuth } from "@/store/eventimist/organizer/auth/AuthState";

export function useSyncOrganizerAuthCookie() {
  const accessToken = useOrganizerAuth((s) => s.accessToken);

  useEffect(() => {
    if (accessToken) {
      try {
        // Decode JWT payload to extract expiry
        // JWT structure: header.payload.signature — payload is base64 encoded
        const payload = JSON.parse(atob(accessToken.split(".")[1]));
        const maxAge  = payload.exp - Math.floor(Date.now() / 1000);

        if (maxAge > 0) {
          // Cookie expires exactly when the JWT expires
          document.cookie = [
            `organizer-token=${accessToken}`,
            `path=/`,
            `SameSite=Strict`,
            `max-age=${maxAge}`,
          ].join("; ");
        } else {
          // Token is already expired — clear everything
          clearCookie();
          useOrganizerAuth.getState().clearAuth();
        }
      } catch {
        // Malformed JWT — clear to be safe
        clearCookie();
        useOrganizerAuth.getState().clearAuth();
      }
    } else {
      // Token was cleared (logout) — remove cookie too
      clearCookie();
    }
  }, [accessToken]);
}

function clearCookie() {
  document.cookie = "organizer-token=; path=/; max-age=0";
}