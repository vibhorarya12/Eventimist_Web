"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOrganizerAuth } from "@/store/eventimist/organizer/auth/AuthState";
import {
  organizerOAuthLogin,
  type OrganizerLoginError,
} from "@/services/eventimist/organizer/auth/oauthLogin.service";

// ─── Hook return shape ────────────────────────────────────────────────────────
export interface UseOrganizerOAuthReturn {
  completeOAuthLogin: (email: string, clerkSessionId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
// Called from the OAuth callback page after Clerk confirms the session.
// Hits your backend, stores the response in Zustand, redirects to dashboard.
// ─────────────────────────────────────────────────────────────────────────────
export function useOrganizerOAuth(): UseOrganizerOAuthReturn {
  const setAuth = useOrganizerAuth((s) => s.setAuth);
  const router  = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completeOAuthLogin = async (email: string, clerkSessionId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await organizerOAuthLogin({ email, clerkSessionId });

      // Map backend response → Zustand AuthState
      // Backend returns "token" — stored as "accessToken"
      setAuth({
        name:        data.name,
        email:       data.email,
        bio:         data.bio,
        profilePic:  data.profilePic,
        coverImage:  data.coverImage,
        location:    data.location,
        accessToken: data.token,
      });
      
      router.replace("/organizer/dashboard");
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to complete OAuth login";
      setError(errorMessage);
      console.error("OAuth login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return { completeOAuthLogin, isLoading, error, clearError };
}