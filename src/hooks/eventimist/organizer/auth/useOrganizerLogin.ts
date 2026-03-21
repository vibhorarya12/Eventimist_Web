"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOrganizerAuth } from "@/store/eventimist/organizer/auth/AuthState";
import {
  organizerLogin,
  type OrganizerLoginRequest,
  type OrganizerLoginError,
} from "@/services/eventimist/organizer/auth/login.service";

// ─── Hook return shape ────────────────────────────────────────────────────────
interface UseOrganizerLoginReturn {
  login:   (payload: OrganizerLoginRequest) => Promise<void>;
  loading: boolean;
  error:   string | null;
  reset:   () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useOrganizerLogin(): UseOrganizerLoginReturn {
  const setAuth = useOrganizerAuth((s) => s.setAuth);
  const router  = useRouter();

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const login = async (payload: OrganizerLoginRequest) => {
    setLoading(true);
    setError(null);

    try {
      const data = await organizerLogin(payload);

      // Map backend response to AuthState
      // Note: backend returns "token" — we store it as "accessToken"
      setAuth({
        name:        data.name,
        email:       data.email,
        bio:         data.bio,
        profilePic:  data.profilePic,
        coverImage:  data.coverImage,
        location:    data.location,
        accessToken: data.token,
      });

      // Redirect to dashboard on success
      router.replace("/organizer/dashboard");

    } catch (err: any) {
      const serverError = err.response?.data as OrganizerLoginError | undefined;

      if (serverError?.statusCode === 404) {
        setError("No account found with this email.");
        return;
      }

      if (serverError?.statusCode === 401) {
        setError("Incorrect password. Please try again.");
        return;
      }

      // Fallback for network errors or unexpected responses
      setError("Something went wrong. Please try again.");

    } finally {
      setLoading(false);
    }
  };

  // Reset error state — call this when user starts typing again
  const reset = () => setError(null);

  return { login, loading, error, reset };
}