"use client";

import { useRouter } from "next/navigation";
import { useOrganizerAuth } from "@/store/eventimist/organizer/auth/AuthState";

export function useOrganizerLogout() {
  const clearAuth = useOrganizerAuth((s) => s.clearAuth);
  const router    = useRouter();

  const logout = () => {
    // 1. Clear Zustand store + localStorage
    clearAuth();

    // 2. Clear the organizer-token cookie so middleware
    //    stops letting this browser through immediately
    document.cookie = "organizer-token=; path=/; max-age=0";

    // 3. Redirect to auth page
    router.replace("/organizer/auth");
  };

  return { logout };
}