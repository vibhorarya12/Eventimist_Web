import { NextRequest, NextResponse } from "next/server";

// ─── Organizer routes ─────────────────────────────────────────────────────────
const ORGANIZER_PROTECTED = [
  "/organizer/dashboard",
  "/organizer/create-event",
  "/organizer/update-event",
  "/organizer/preview-event",
];
const ORGANIZER_AUTH_ROUTES = ["/organizer/auth"];
const ORGANIZER_PASSTHROUGH = ["/organizer/auth/oauth-callback", "/oauth-confirm"];

// ─── User routes ──────────────────────────────────────────────────────────────
// Routes that require a logged-in user
const USER_PROTECTED = [
  "/user/profile",
  "/user/volunteer",
];
// Routes a logged-in user should not revisit (auth page)
const USER_AUTH_ROUTES = ["/user/auth"];

// ─── Token extractors ─────────────────────────────────────────────────────────
function getOrganizerToken(req: NextRequest): string | null {
  return req.cookies.get("organizer-token")?.value ?? null;
}
function getUserToken(req: NextRequest): string | null {
  return req.cookies.get("user-token")?.value ?? null;
}

// ─── Middleware ───────────────────────────────────────────────────────────────
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Always pass through OAuth callbacks ────────────────────────────────────
  if (ORGANIZER_PASSTHROUGH.some(r => pathname.startsWith(r)))
    return NextResponse.next();

  const organizerToken = getOrganizerToken(req);
  const userToken      = getUserToken(req);

  // ══ ORGANIZER GUARDS ══════════════════════════════════════════════════════

  // Protected → no token → redirect to auth
  if (ORGANIZER_PROTECTED.some(r => pathname.startsWith(r)) && !organizerToken) {
    const url = req.nextUrl.clone();
    url.pathname = "/organizer/auth";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Auth route → already logged in → redirect to dashboard
  if (ORGANIZER_AUTH_ROUTES.some(r => pathname.startsWith(r)) && organizerToken) {
    const url = req.nextUrl.clone();
    url.pathname = "/organizer/dashboard";
    url.search   = "";
    return NextResponse.redirect(url);
  }

  // ══ USER GUARDS ═══════════════════════════════════════════════════════════

  const isUserRoot = pathname === "/user" || pathname === "/user/";

  // Protected → no token → redirect to /user/auth (auth page)
  if (USER_PROTECTED.some(r => pathname.startsWith(r)) && !userToken) {
    const url = req.nextUrl.clone();
    url.pathname = "/user/auth";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // /user root → no token → redirect to /user/auth
  if (isUserRoot && !userToken) {
    const url = req.nextUrl.clone();
    url.pathname = "/user/auth";
    return NextResponse.redirect(url);
  }

  // Any /user route → already logged in → redirect to /user/profile
  if (pathname.startsWith("/user") && userToken && pathname !== "/user/profile") {
    const url = req.nextUrl.clone();
    url.pathname = "/user/profile";
    url.search   = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();

}

// ─── Matcher ──────────────────────────────────────────────────────────────────
export const config = {
  matcher: [
    "/organizer/:path*",
    "/user",          // exact — auth page
    "/user/",         // trailing slash variant
    "/user/:path+",   // sub-pages: /user/profile, /user/volunteer etc
  ],
};