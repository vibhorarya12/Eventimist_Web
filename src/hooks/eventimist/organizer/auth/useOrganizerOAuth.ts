"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOrganizerAuth } from "@/store/eventimist/organizer/auth/AuthState";
import {
  organizerOAuthLogin,
  type OrganizerLoginError,
} from "@/services/eventimist/organizer/auth/oauthLogin.service";
import {
  organizerOAuthRegister,
  type OrganizerLoginResponse,
  type OrganizerLoginError as RegisterError,
} from "@/services/eventimist/organizer/auth/oauthRegister.service";

// ─── Helpers ──────────────────────────────────────────────────────────────────
// Sets the organizer-token cookie immediately so the middleware can read it
// before the next navigation. useSyncOrganizerAuthCookie runs in a useEffect
// (after render) which is too late — the middleware runs at the edge before
// the page even mounts, so a cookie set in useEffect arrives after the bounce.
function syncCookieNow(token: string) {
  document.cookie = `organizer-token=${token}; path=/; SameSite=Strict`;
}

// ─── Hook return shape ────────────────────────────────────────────────────────
export interface UseOrganizerOAuthReturn {
  completeOAuthLogin:  (email: string, clerkSessionId: string) => Promise<void>;
  completeOauthSignup: (name: string, email: string, clerkSessionId: string, profilePic?: string) => Promise<void>;
  isLoading:  boolean;
  error:      any;
  clearError: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useOrganizerOAuth(): UseOrganizerOAuthReturn {
  const setAuth = useOrganizerAuth((s) => s.setAuth);
  const router  = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  // ── OAuth Login ─────────────────────────────────────────────────────────────
  const completeOAuthLogin = async (email: string, clerkSessionId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await organizerOAuthLogin({ email, clerkSessionId });

      setAuth({
        name:        data.name,
        email:       data.email,
        bio:         data.bio,
        profilePic:  data.profilePic,
        coverImage:  data.coverImage,
        location:    data.location,
        accessToken: data.token,
      });

      // Write cookie synchronously before router.replace so the middleware
      // sees the token on the very first request to /organizer/dashboard.
      syncCookieNow(data.token);

      router.replace("/organizer/dashboard");
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to complete OAuth login";
      setError(errorMessage);
      console.error("OAuth login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ── OAuth Signup ────────────────────────────────────────────────────────────
  const completeOauthSignup = async (
    name: string,
    email: string,
    clerkSessionId: string,
    profilePic?: string
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await organizerOAuthRegister({ name, email, clerkSessionId, profilePic });

      setAuth({
        name:        data.name,
        email:       data.email,
        bio:         data.bio,
        profilePic:  data.profilePic,
        coverImage:  data.coverImage,
        location:    data.location,
        accessToken: data.token,
      });

      // Same fix — write cookie before redirect
      syncCookieNow(data.token);

      router.replace("/organizer/dashboard");
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to complete OAuth signup";
      setError(errorMessage);
      // window.alert(errorMessage);
      console.error("OAuth signup error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    completeOAuthLogin,
    completeOauthSignup,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}