"use client";

import { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useOrganizerAuth } from "@/store/eventimist/organizer/auth/AuthState";
import {
  organizerRegister,
  type OrganizerRegisterError,
} from "@/services/eventimist/organizer/auth/register.service";

// ─── Step the UI is currently on ─────────────────────────────────────────────
export type SignupStep = "form" | "otp" | "done";

// ─── Hook return shape ────────────────────────────────────────────────────────
export interface UseOrganizerSignupReturn {
  step:           SignupStep;
  submitForm:     (name: string, email: string, password: string) => Promise<void>;
  formLoading:    boolean;
  formError:      string | null;
  resetFormError: () => void;
  verifyOtp:      (code: string) => Promise<void>;
  otpLoading:     boolean;
  otpError:       string | null;
  resetOtpError:  () => void;
  resendOtp:      () => Promise<void>;
  resendLoading:  boolean;
}

// ─── Hook — Clerk v6 "future" API ────────────────────────────────────────────
export function useOrganizerSignup(): UseOrganizerSignupReturn {
  // Clerk v6: useSignUp returns { signUp, errors, fetchStatus }
  // No isLoaded, no setActive — those belong to the legacy API
  const { signUp, fetchStatus } = useSignUp();
  const setAuth = useOrganizerAuth((s) => s.setAuth);
  const router  = useRouter();

  const [step, setStep] = useState<SignupStep>("form");

  // Stash form values — needed for the backend call after OTP succeeds
  const [pendingName,     setPendingName]     = useState("");
  const [pendingEmail,    setPendingEmail]     = useState("");
  const [pendingPassword, setPendingPassword] = useState("");

  const [formLoading,   setFormLoading]   = useState(false);
  const [formError,     setFormError]     = useState<string | null>(null);
  const [otpLoading,    setOtpLoading]    = useState(false);
  const [otpError,      setOtpError]      = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);

  // ── Step 1: submit form → Clerk sends OTP email ───────────────────────────
  const submitForm = async (name: string, email: string, password: string) => {
    if (!signUp) return;

    setFormLoading(true);
    setFormError(null);

    try {
      // Clerk v6: use signUp.password() instead of signUp.create()
      const { error } = await signUp.password({ emailAddress: email, password });

      if (error) {
        const msg = error.message?.toLowerCase() ?? "";
        if (msg.includes("email") && msg.includes("taken")) {
          setFormError("An account with this email already exists.");
        } else if (msg.includes("password")) {
          setFormError("Password is too weak. Use at least 8 characters.");
        } else {
          setFormError(error.message ?? "Could not create account. Please try again.");
        }
        return;
      }

      // Clerk v6: send OTP via signUp.verifications.sendEmailCode()
      await signUp.verifications.sendEmailCode();

      // Stash for the backend call after OTP succeeds
      setPendingName(name);
      setPendingEmail(email);
      setPendingPassword(password);

      setStep("otp");

    } catch (err: any) {
      setFormError("Could not send OTP. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  // ── Step 2: verify OTP → get Clerk session → hit your backend ────────────
  const verifyOtp = async (code: string) => {
    if (!signUp) return;

    setOtpLoading(true);
    setOtpError(null);

    try {
      // Clerk v6: verify via signUp.verifications.verifyEmailCode()
      await signUp.verifications.verifyEmailCode({ code });

      // Check status after verification
      if (signUp.status !== "complete") {
        setOtpError("Verification incomplete. Please try again.");
        return;
      }

      // Clerk v6: finalize() creates the user and sets the active session
      // We pass a no-op navigate since we handle routing ourselves after
      // the backend call completes
      const finalizeResult = await signUp.finalize({
        navigate: async () => {},
      });

      // Extract session ID — try finalizeResult first, fall back to signUp
      const clerkSessionId =
        (finalizeResult as any)?.createdSessionId ?? signUp.createdSessionId;

      if (!clerkSessionId) {
        setOtpError("Could not retrieve session. Please try again.");
        return;
      }

      // Hit your backend — it validates clerkSessionId and creates organizer
      const data = await organizerRegister({
        name:     pendingName,
        email:    pendingEmail,
        password: pendingPassword,
        clerkSessionId,
      });

      // Store backend response in Zustand
      setAuth({
        name:        data.name,
        email:       data.email,
        bio:         data.bio,
        profilePic:  data.profilePic,
        coverImage:  data.coverImage,
        location:    data.location,
        accessToken: data.token,
      });

      setStep("done");
      router.replace("/organizer/dashboard");

    } catch (err: any) {
      const clerkMsg: string = err?.message?.toLowerCase() ?? "";

      if (clerkMsg.includes("incorrect") || clerkMsg.includes("invalid")) {
        setOtpError("Incorrect code. Please check your email and try again.");
        return;
      }
      if (clerkMsg.includes("expired")) {
        setOtpError("This code has expired. Click 'Resend code' to get a new one.");
        return;
      }

      // Backend errors
      const serverErr = err.response?.data as OrganizerRegisterError | undefined;
      if (serverErr?.statusCode === 409) {
        setOtpError("This email is already registered. Please sign in instead.");
        return;
      }

      setOtpError("Something went wrong. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  // ── Resend OTP ─────────────────────────────────────────────────────────────
  const resendOtp = async () => {
    if (!signUp) return;
    setResendLoading(true);
    setOtpError(null);
    try {
      await signUp.verifications.sendEmailCode();
    } catch {
      setOtpError("Could not resend code. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return {
    step,
    submitForm,    formLoading,  formError,  resetFormError: () => setFormError(null),
    verifyOtp,     otpLoading,   otpError,   resetOtpError:  () => setOtpError(null),
    resendOtp,     resendLoading,
  };
}