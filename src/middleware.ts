import { NextRequest, NextResponse } from "next/server";

// ─── Route definitions ────────────────────────────────────────────────────────

// Routes that require an organizer to be logged in
const ORGANIZER_PROTECTED = [
  "/organizer/dashboard",
  "/organizer/create-event",
];

// Routes that a logged-in organizer should NOT be able to visit
// (e.g. going back to /organizer/auth after already logged in)
const ORGANIZER_AUTH_ROUTES = [
  "/organizer/auth",
];

// ─── Token extractor ──────────────────────────────────────────────────────────
// Zustand persist stores data as:
// localStorage["organizer-auth"] = { state: { accessToken: "..." }, version: 0 }
//
// In middleware we are on the Next.js edge — no access to localStorage.
// The cleanest solution: read a lightweight cookie that you set on the client
// side whenever the accessToken changes (see note below).
//
// Cookie name must match what you set from the client.
const ORGANIZER_TOKEN_COOKIE = "organizer-token";

function getOrganizerToken(req: NextRequest): string | null {
  return req.cookies.get(ORGANIZER_TOKEN_COOKIE)?.value ?? null;
}

// ─── Middleware ───────────────────────────────────────────────────────────────
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const organizerToken = getOrganizerToken(req);

  // ── Organizer protected routes ─────────────────────────────────────────────
  const isOrganizerProtected = ORGANIZER_PROTECTED.some((route) =>
    pathname.startsWith(route)
  );

  if (isOrganizerProtected && !organizerToken) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/organizer/auth";
    // Preserve the intended destination so you can redirect back after login
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Organizer auth routes (block if already logged in) ─────────────────────
  const isOrganizerAuthRoute = ORGANIZER_AUTH_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isOrganizerAuthRoute && organizerToken) {
    const dashboardUrl = req.nextUrl.clone();
    dashboardUrl.pathname = "/organizer/dashboard";
    dashboardUrl.search = "";
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

// ─── Matcher ──────────────────────────────────────────────────────────────────
// Only run middleware on these paths — keeps edge function fast.
// Static files, _next internals, and public assets are automatically excluded.
export const config = {
  matcher: [
    "/organizer/:path*",
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANT — How to bridge localStorage → cookie for middleware
//
// Next.js middleware runs on the edge and cannot read localStorage.
// You need to mirror the accessToken into a plain (non-httpOnly) cookie
// whenever it changes. Do this in a single place — a custom hook:
//
//   // src/hooks/useSyncAuthCookie.ts
//   import { useEffect } from "react";
//   import { useOrganizerAuth } from "@/store/eventimist/organizer/auth/AuthState";
//
//   export function useSyncAuthCookie() {
//     const accessToken = useOrganizerAuth((s) => s.accessToken);
//
//     useEffect(() => {
//       if (accessToken) {
//         document.cookie = `organizer-token=${accessToken}; path=/; SameSite=Strict`;
//       } else {
//         // Clear cookie on logout
//         document.cookie = "organizer-token=; path=/; max-age=0";
//       }
//     }, [accessToken]);
//   }
//
// Call this hook once in your root layout or organizer layout:
//
//   // src/app/organizer/layout.tsx
//   "use client";
//   import { useSyncAuthCookie } from "@/hooks/useSyncAuthCookie";
//   export default function OrganizerLayout({ children }) {
//     useSyncAuthCookie();
//     return <>{children}</>;
//   }
//
// This cookie is NOT httpOnly — it is readable by JS and by the middleware.
// It exists purely as a signal for the edge redirect. The real token lives
// in Zustand and is read via useOrganizerAuth() or getState() for API calls.
// ─────────────────────────────────────────────────────────────────────────────