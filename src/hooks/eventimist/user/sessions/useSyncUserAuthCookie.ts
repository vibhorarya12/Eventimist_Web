"use client";


import { useEffect } from "react";
import { useUserAuth } from "@/store/eventimist/user/auth/UserAuthState";

export function useSyncUserAuthCookie() {
  const accessToken = useUserAuth(s => s.accessToken);

  useEffect(() => {
    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split(".")[1]));
        const maxAge  = payload.exp - Math.floor(Date.now() / 1000);

        if (maxAge > 0) {
          document.cookie = [
            `user-token=${accessToken}`,
            `path=/`,
            `SameSite=Strict`,
            `max-age=${maxAge}`,
          ].join("; ");
        } else {
          clearCookie();
          useUserAuth.getState().clearAuth();
        }
      } catch {
        clearCookie();
        useUserAuth.getState().clearAuth();
      }
    } else {
      clearCookie();
    }
  }, [accessToken]);
}

function clearCookie() {
  document.cookie = "user-token=; path=/; max-age=0";
}