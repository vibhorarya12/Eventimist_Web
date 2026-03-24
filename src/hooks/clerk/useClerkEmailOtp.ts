"use client";

import { useState } from "react";
import { useSignUp, useClerk } from "@clerk/nextjs";

// ─── Steps ───────────────────────────────────────────────────────────────────
export type OtpStep = "idle" | "otp" | "verified";

// ─── What verifyOtp resolves to on success ───────────────────────────────────
export interface ClerkOtpResult {
  clerkSessionId: string;
}

// ─── Hook return shape ────────────────────────────────────────────────────────
export interface UseClerkEmailOtpReturn {
  step:             OtpStep;

  // Step 1 — initiate signup + send OTP to email
  sendOtp:          (email: string, password: string) => Promise<void>;
  sendLoading:      boolean;
  sendError:        string | null;
  resetSendError:   () => void;

  // Step 2 — verify the 6-digit code
  // Returns { clerkSessionId } on success, null on failure (error set on state)
  verifyOtp:        (code: string) => Promise<ClerkOtpResult | null>;
  verifyLoading:    boolean;
  verifyError:      string | null;
  resetVerifyError: () => void;

  // Resend the OTP code
  resendOtp:        () => Promise<void>;
  resendLoading:    boolean;

  // Reset back to idle (useful if user wants to change email)
  reset:            () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
// Platform-agnostic. Handles only the Clerk side of email OTP signup.
// Caller receives clerkSessionId and decides what to do with it
// (which backend to call, which store to update, where to redirect).
// ─────────────────────────────────────────────────────────────────────────────
export function useClerkEmailOtp(): UseClerkEmailOtpReturn {
  const { signUp }  = useSignUp();
  const { signOut } = useClerk(); // needed to clear any existing session first

  const [step,          setStep]          = useState<OtpStep>("idle");
  const [sendLoading,   setSendLoading]   = useState(false);
  const [sendError,     setSendError]     = useState<string | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError,   setVerifyError]   = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);

  // ── Step 1: create Clerk account + send OTP ───────────────────────────────
  const sendOtp = async (email: string, password: string) => {
    if (!signUp) return;

    setSendLoading(true);
    setSendError(null);

    try {
      // If a Clerk session already exists (e.g. from a previous login or
      // incomplete signup), sign it out first — otherwise Clerk throws
      // "already signed in" even for a brand new email address.
      // redirectUrl: window.location.href tells Clerk to stay on the current
      // page instead of redirecting to "/" after sign out.
      await signOut({ redirectUrl: window.location.href });

      const { error } = await signUp.password({ emailAddress: email, password });

      if (error) {
        const msg = error.message?.toLowerCase() ?? "";
        if (msg.includes("email") && msg.includes("taken")) {
          setSendError("An account with this email already exists.");
        } else if (msg.includes("password")) {
          setSendError("Password is too weak. Use at least 8 characters.");
        } else {
          setSendError(error.message ?? "Could not create account. Please try again.");
        }
        return;
      }

      await signUp.verifications.sendEmailCode();
      setStep("otp");

    } catch {
      setSendError("Could not send OTP. Please check your connection and try again.");
    } finally {
      setSendLoading(false);
    }
  };

  // ── Step 2: verify OTP → return clerkSessionId ────────────────────────────
  const verifyOtp = async (code: string): Promise<ClerkOtpResult | null> => {
    if (!signUp) return null;

    setVerifyLoading(true);
    setVerifyError(null);

    try {
      await signUp.verifications.verifyEmailCode({ code });

      if (signUp.status !== "complete") {
        setVerifyError("Verification incomplete. Please try again.");
        return null;
      }

      // Finalize the Clerk session — no-op navigate since caller handles routing
      const finalizeResult = await signUp.finalize({
        navigate: async () => {},
      });

      const clerkSessionId =
        (finalizeResult as any)?.createdSessionId ?? signUp.createdSessionId;

      if (!clerkSessionId) {
        setVerifyError("Could not retrieve session. Please try again.");
        return null;
      }

      setStep("verified");
      return { clerkSessionId };

    } catch (err: any) {
      const msg: string = err?.message?.toLowerCase() ?? "";

      if (msg.includes("incorrect") || msg.includes("invalid")) {
        setVerifyError("Incorrect code. Please check your email and try again.");
      } else if (msg.includes("expired")) {
        setVerifyError("This code has expired. Click 'Resend code' to get a new one.");
      } else {
        setVerifyError("Verification failed. Please try again.");
      }

      return null;
    } finally {
      setVerifyLoading(false);
    }
  };

  // ── Resend OTP ─────────────────────────────────────────────────────────────
  const resendOtp = async () => {
    if (!signUp) return;
    setResendLoading(true);
    setVerifyError(null);
    try {
      await signUp.verifications.sendEmailCode();
    } catch {
      setVerifyError("Could not resend code. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  // ── Reset to idle ──────────────────────────────────────────────────────────
  const reset = () => {
    setStep("idle");
    setSendError(null);
    setVerifyError(null);
  };

  return {
    step,
    sendOtp,      sendLoading,   sendError,   resetSendError:   () => setSendError(null),
    verifyOtp,    verifyLoading, verifyError, resetVerifyError: () => setVerifyError(null),
    resendOtp,    resendLoading,
    reset,
  };
}