"use client";

// src/hooks/eventimist/user/auth/useUserLogin.ts

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  userLogin,
  type UserLoginRequest,
  type UserLoginError,
} from "@/services/eventimist/user/auth/userLogin.service";
import { useUserAuth } from "@/store/eventimist/user/auth/UserAuthState";

export interface UseUserLoginReturn {
  login:   (body: UserLoginRequest) => Promise<boolean>;
  loading: boolean;
  error:   string | null;
  reset:   () => void;
}

export function useUserLogin(
  redirectTo = "/user/profile"
): UseUserLoginReturn {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const setAuth  = useUserAuth(s => s.setAuth);
  const router   = useRouter();

  const login = async (body: UserLoginRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const data = await userLogin(body);

      // 1. Persist to Zustand + localStorage
      setAuth({
        name:        data.name,
        email:       data.email,
        profilePic:  data.profilePic,
        accessToken: data.token,
        refreshToken :data.refreshToken,
      });

      // 2. Set cookie synchronously so middleware sees it before redirect
      document.cookie = `user-token=${data.token}; path=/; SameSite=Strict`;

      // 3. Redirect
      router.replace(redirectTo);
      return true;

    } catch (err: any) {
      const serverErr = err?.response?.data as UserLoginError | undefined;

      if (serverErr?.message) {
        setError(serverErr.message);
      } else if (err?.response?.status === 401) {
        setError("Invalid email or password.");
      } else if (err?.response?.status === 404) {
        setError("No account found with this email.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      return false;

    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error, reset: () => setError(null) };
}