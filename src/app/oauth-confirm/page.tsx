"use client"

import { useEffect, useState } from 'react';
import { useOrganizerOAuth } from '@/hooks/eventimist/organizer/auth/useOrganizerOAuth';
import { useOrganizerAuth } from '@/store/eventimist/organizer/auth/AuthState';
import { useClerk } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';

export default function OauthConfirm() {
  const router         = useRouter();
  const searchParams   = useSearchParams();
  const queryPurpose   = searchParams?.get('purpose');
  const purpose        = queryPurpose === 'signup' ? 'signup' : 'login';
  const accessToken    = useOrganizerAuth((s) => s.accessToken);
  const [isChecking, setIsChecking] = useState(true);

  const { user, signOut, session } = useClerk();
  const { completeOAuthLogin, completeOauthSignup, isLoading, error, clearError } = useOrganizerOAuth();

  // ─── Check if user is already authenticated ───────────────────────────────────
  // If user/session exist AND organizer auth data exists, redirect to dashboard
  // If neither exist, show error (shouldn't happen via normal flow)
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsChecking(false);
    }, 2000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (accessToken) {
      router.replace('/organizer/dashboard');
      return;
    }

    if (!isChecking && (!user || !session)) {
      router.replace('/organizer/auth');
      return;
    }
  }, [accessToken, user, session, isChecking, router]);

  // Don't render UI while checking authentication state
  if (isChecking || !user || !session || accessToken) {
    return null;
  }

  const email          = user?.emailAddresses[0]?.emailAddress;
  const clerkSessionID = session?.id;
  const name           = user?.fullName || '';
  const profilePic     = user?.imageUrl;
  const avatarFallback = name ? name.charAt(0).toUpperCase() : email?.charAt(0).toUpperCase() ?? 'O';

  const handleConfirm = async () => {
    if (purpose === 'signup') {
      await completeOauthSignup(name, email!, clerkSessionID!, profilePic);
    } else {
      await completeOAuthLogin(email!, clerkSessionID!);
    }
  };

  const heading    = purpose === 'signup' ? 'Create your organizer account' : 'Welcome back';
  const subheading = purpose === 'signup'
    ? 'Confirm your Google account to get started'
    : 'Confirm your Google account to continue';
  const buttonText = purpose === 'signup'
    ? 'Create Organizer Account'
    : 'Continue to Dashboard';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; font-family: 'DM Sans', system-ui, sans-serif; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        .d1 { animation-delay: 0.05s; }
        .d2 { animation-delay: 0.12s; }
        .d3 { animation-delay: 0.2s; }
        .d4 { animation-delay: 0.28s; }
      `}</style>

      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">

        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-amber-100/40 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-orange-100/30 blur-3xl" />
        </div>

        <div className="relative w-full max-w-sm">

          {/* Logo */}
          <div className="fade-up d1 flex items-center justify-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-400/30">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8"  y1="2" x2="8"  y2="6"/>
                <line x1="3"  y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div>
              <div className="text-stone-900 font-black text-base leading-none"
                style={{fontFamily:"'Playfair Display',Georgia,serif"}}>eventimist</div>
              <div className="text-amber-600 text-[9px] font-bold tracking-widest mt-0.5">ORGANIZER</div>
            </div>
          </div>

          {/* Card */}
          <div className="fade-up d2 bg-white border border-stone-200 rounded-3xl shadow-xl shadow-stone-200/50 overflow-hidden">

            {/* Top amber strip */}
            <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-500" />

            <div className="px-8 pt-8 pb-8">

              {/* Avatar */}
              <div className="fade-up d2 flex justify-center mb-6">
                <div className="relative">
                  {profilePic ? (
                    <img
                      src={profilePic}
                      alt={name}
                      className="w-20 h-20 rounded-2xl object-cover ring-4 ring-amber-100 shadow-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-amber-100 ring-4 ring-amber-100 flex items-center justify-center text-amber-600 font-black text-2xl shadow-lg"
                      style={{fontFamily:"'Playfair Display',Georgia,serif"}}>
                      {avatarFallback}
                    </div>
                  )}
                  {/* Verified badge */}
                  <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Heading */}
              <div className="fade-up d3 text-center mb-6">
                <h1 className="text-stone-900 text-xl font-black leading-tight mb-1.5"
                  style={{fontFamily:"'Playfair Display',Georgia,serif"}}>
                  {heading}
                </h1>
                <p className="text-stone-400 text-sm">{subheading}</p>
              </div>

              {/* Account pill */}
              <div className="fade-up d3 bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3.5 mb-6 flex items-center gap-3">
                {/* Google icon */}
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <div className="min-w-0 flex-1">
                  {name && <div className="text-stone-800 text-sm font-semibold truncate">{name}</div>}
                  <div className="text-stone-500 text-xs truncate">{email}</div>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
              </div>

              {/* Error */}
              {error && (
                <div className="fade-up mb-5 flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm px-4 py-3 rounded-xl">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span className="flex-1">{error}</span>
                  <button onClick={clearError} className="text-rose-400 hover:text-rose-600 transition-colors flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              )}

              {/* Actions */}
              <div className="fade-up d4 space-y-3">
                {/* Primary CTA */}
                <button
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className="w-full bg-stone-900 hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-stone-900/20 hover:scale-[1.01] active:scale-[0.99] text-sm flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      {purpose === 'signup' ? 'Creating account...' : 'Signing in...'}
                    </>
                  ) : (
                    <>
                      {buttonText}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                      </svg>
                    </>
                  )}
                </button>

                {/* Secondary — use different account */}
                <button
                  onClick={async () => await signOut({ redirectUrl: '/organizer/auth' })}
                  disabled={isLoading}
                  className="w-full bg-stone-50 hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed text-stone-600 font-medium py-3.5 rounded-2xl transition-all duration-200 border border-stone-200 hover:border-stone-300 text-sm flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                  Use a different account
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="fade-up d4 text-center mt-6">
            <p className="text-stone-400 text-xs leading-relaxed">
              By continuing, you agree to our{' '}
              <a href="#" className="text-amber-500 hover:text-amber-600 font-semibold transition-colors">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-amber-500 hover:text-amber-600 font-semibold transition-colors">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}