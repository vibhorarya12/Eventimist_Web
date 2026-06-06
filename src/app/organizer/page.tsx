"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOrganizerAuth } from "@/store/eventimist/organizer/auth/AuthState";

export default function OrganizerGuardPage() {
  const router      = useRouter();
  const isAuthenticated = useOrganizerAuth((s) => s.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/organizer/dashboard");
    } else {
      router.replace("/organizer/auth");
    }
  }, [isAuthenticated, router]);

  // Render nothing — this page exists only to redirect.
  // The tiny delay before useEffect fires is imperceptible.
  return null;
}