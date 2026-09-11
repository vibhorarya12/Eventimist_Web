"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOrganizerAuth } from "@/store/eventimist/organizer/auth/AuthState";
import {
  useClerkEmailOtp,
  type OtpStep,
} from "@/hooks/clerk/useClerkEmailOtp";
import {
  organizerRegister,
  type OrganizerRegisterError,
} from "@/services/eventimist/organizer/auth/register.service";

// ─── Hook return shape ────────────────────────────────────────────────────────
export interface UseOrganizerSignupReturn {
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
export function useOrganizerSignup(): UseOrganizerSignupReturn {
  const clerk   = useClerkEmailOtp();
  const setAuth = useOrganizerAuth((s) => s.setAuth);
  const router  = useRouter();

  // Stash form values so verifyOtp can send them to the backend.
  // Must be useState — plain let variables reset on every render.
  const [pending, setPending] = useState({ name: "", email: "", password: "" });

  // ── Step 1: stash form fields + delegate OTP initiation to Clerk hook ─────
  const submitForm = async (name: string, email: string, password: string) => {
    setPending({ name, email, password });
    await clerk.sendOtp(email, password);
  };

  // ── Step 2: verify OTP → on Clerk success, call organizer backend ──────────
  const verifyOtp = async (code: string) => {
    const result = await clerk.verifyOtp(code);

    // If Clerk verification failed, clerk hook already set verifyError — stop here
    if (!result) return;

    try {
      const data = await organizerRegister({
        name:           pending.name,
        email:          pending.email,
        password:       pending.password,
        clerkSessionId: result.clerkSessionId,
      });

      setAuth({
        name:        data.name,
        email:       data.email,
        bio:         data.bio,
        profilePic:  data.profilePic,
        coverImage:  data.coverImage,
        location:    data.location,
        accessToken: data.token,
        refreshToken : data.refreshToken
      });

      router.replace("/organizer/dashboard");

    } catch (err: any) {
      // Backend error — surface through clerk.verifyError so the
      // OTP screen's existing error banner picks it up without extra state.
      // We reset first so React triggers a re-render with the new message.
      clerk.resetVerifyError();

      const serverErr = err.response?.data as OrganizerRegisterError | undefined;

      if (serverErr?.statusCode === 409) {
        // Clerk succeeded but your backend already has this organizer —
        // nudge them to sign in instead
        clerk.resetVerifyError(); // triggers re-render
        throw new Error("This email is already registered. Please sign in instead.");
      }

      throw new Error("Registration failed. Please try again.");
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