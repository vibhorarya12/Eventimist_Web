"use client";

// src/hooks/eventimist/user/sessions/useUserLogout.ts

import { useRouter } from "next/navigation";
import { useUserAuth } from "@/store/eventimist/user/auth/UserAuthState";

export function useUserLogout() {
  const clearAuth = useUserAuth(s => s.clearAuth);
  const router    = useRouter();

  const logout = () => {
    // 1. Clear Zustand + localStorage
    clearAuth();

    // 2. Clear cookie so middleware stops passing user through
    document.cookie = "user-token=; path=/; max-age=0";

    // 3. Redirect to home or user auth
    router.replace("/");
  };

  return { logout };
}