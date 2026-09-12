"use client";

// src/hooks/eventimist/user/auth/useUserSignup.ts

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserAuth } from "@/store/eventimist/user/auth/UserAuthState";
import { useClerkEmailOtp, type OtpStep } from "@/hooks/clerk/useClerkEmailOtp";
import {
  userRegister,
  type UserRegisterError,
} from "@/services/eventimist/user/auth/userRegister.service";

// ─── Return shape ─────────────────────────────────────────────────────────────
export interface UseUserSignupReturn {
  step:             OtpStep;
  sendLoading:      boolean;
  sendError:        string | null;
  resetSendError:   () => void;
  verifyLoading:    boolean;
  verifyError:      string | null;
  resetVerifyError: () => void;
  resendOtp:        () => Promise<void>;
  resendLoading:    boolean;
  submitForm:       (name: string, email: string, password: string) => Promise<void>;
  verifyOtp:        (code: string) => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useUserSignup(
  redirectTo = "/discover"
): UseUserSignupReturn {
  const clerk   = useClerkEmailOtp();
  const setAuth = useUserAuth(s => s.setAuth);
  const router  = useRouter();

  const [pending, setPending] = useState({ name: "", email: "", password: "" });

  // ── Step 1: stash form + send OTP via Clerk ───────────────────────────────
  const submitForm = async (name: string, email: string, password: string) => {
    setPending({ name, email, password });
    await clerk.sendOtp(email, password);
  };

  // ── Step 2: verify OTP → call backend register → setAuth → redirect ───────
  const verifyOtp = async (code: string) => {
    const result = await clerk.verifyOtp(code);
    if (!result) return; // Clerk error already set in hook

    try {
      const data = await userRegister({
        name:           pending.name,
        email:          pending.email,
        password:       pending.password,
        clerkSessionId: result.clerkSessionId,
      });

      // Persist to Zustand + localStorage
      setAuth({
        name:        data.name,
        email:       data.email,
        profilePic:  data.profilePic,
        refreshToken:data.refreshToken,
        accessToken: data.token,
      });

      // Set cookie synchronously before redirect
      document.cookie = `user-token=${data.token}; path=/; SameSite=Strict`;

      router.replace(redirectTo);

    } catch (err: any) {
      clerk.resetVerifyError();
      const serverErr = err?.response?.data as UserRegisterError | undefined;

      if (serverErr?.statusCode === 409) {
        throw new Error("This email is already registered. Please sign in instead.");
      }
      throw new Error(serverErr?.message ?? "Registration failed. Please try again.");
    }
  };

  return {
    step:             clerk.step,
    sendLoading:      clerk.sendLoading,
    sendError:        clerk.sendError,
    resetSendError:   clerk.resetSendError,
    verifyLoading:    clerk.verifyLoading,
    verifyError:      clerk.verifyError,
    resetVerifyError: clerk.resetVerifyError,
    resendOtp:        clerk.resendOtp,
    resendLoading:    clerk.resendLoading,
    submitForm,
    verifyOtp,
  };
}