"use client";

// src/hooks/eventimist/user/auth/useUserOAuth.ts

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  userOauthLogin,
  type UserOauthLoginRequest,
  type UserLoginError,
} from "@/services/eventimist/user/auth/oauthLogin.service";
import {
  userOAuthRegister,
  type UserOAuthRegisterRequest,
} from "@/services/eventimist/user/auth/oauthRegister.service";
import { useUserAuth } from "@/store/eventimist/user/auth/UserAuthState";

export interface UseUserOAuthReturn {
  oauthLogin: (body: UserOauthLoginRequest) => Promise<boolean>;
  oauthRegister: (body: UserOAuthRegisterRequest) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

export function useUserOAuth(
  redirectTo = "/user/profile"
): UseUserOAuthReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setAuth = useUserAuth(s => s.setAuth);
  const router = useRouter();

  const oauthLogin = async (body: UserOauthLoginRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const data = await userOauthLogin(body);

      // 1. Persist to Zustand + localStorage
      setAuth({
        name: data.name,
        email: data.email,
        profilePic: data.profilePic,
        accessToken: data.token,
      });

      // 2. Set cookie synchronously so middleware sees it before redirect
      document.cookie = `user-token=${data.token}; path=/; SameSite=Strict`;

      // 3. Redirect
      router.replace(redirectTo);
      return true;
    } catch (err: any) {
      // Handle axios errors
      if (err.response?.status === 404) {
        setError("user not found, please register");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message || "OAuth login failed");
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const oauthRegister = async (
    body: UserOAuthRegisterRequest
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const data = await userOAuthRegister(body);

      setAuth({
        name: data.name,
        email: data.email,
        profilePic: data.profilePic,
        refreshToken:data.refreshToken,
        accessToken: data.token,
      });

      document.cookie = `user-token=${data.token}; path=/; SameSite=Strict`;
      router.replace(redirectTo);
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "OAuth registration failed";
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setLoading(false);
  };

  return {
    oauthLogin,
    oauthRegister,
    loading,
    error,
    reset,
  };
}