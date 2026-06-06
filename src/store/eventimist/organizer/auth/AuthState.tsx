import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ─────────────────────────────────────────────────────────────────────────────
// SECURITY NOTE — localStorage vs httpOnly cookie
//
// accessToken is persisted in localStorage via Zustand's persist middleware.
// This is acceptable for most SPAs and is the approach used here.
//
// Tradeoff to be aware of:
//   - localStorage tokens ARE readable by JavaScript, so an XSS vulnerability
//     on any page could expose the token.
//   - httpOnly cookies are NOT readable by JS (immune to XSS), but require
//     your backend to set the Set-Cookie header and you to handle CSRF.
//
// Upgrade path when ready:
//   1. Have your backend set: Set-Cookie: token=...; HttpOnly; Secure; SameSite=Strict
//   2. Remove accessToken from this store entirely.
//   3. All requests will carry the cookie automatically.
//
// For now, localStorage is fine as long as you keep a tight Content-Security-Policy
// and sanitise any user-generated content rendered on the page.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Subscription Shape ──────────────────────────────────────────────────────
export interface OrganizerSubscription {
  plan: "FREE" | "PRO" ;

  aiCreditsRemaining: number;

  aiCreditsTotal: number;

  eventLimit: number;

  canUseAI: boolean;

  expiresAt: string | null;
}

// ─── Store State ────────────────────────────────────────────────────────────
export interface AuthState {
  name: string | null;

  email: string | null;

  bio: string | null;

  profilePic: string | null;

  coverImage: string | null;

  location: string | null;

  accessToken: string | null;

  subscription: OrganizerSubscription | null;

  subscriptionLoaded: boolean;

  isAuthenticated: boolean;

  isHydrated: boolean;
}

// ─── Store Actions ──────────────────────────────────────────────────────────
interface AuthActions {
  // Bulk setter after login/register
  setAuth: (data: Partial<AuthState>) => void;

  // Profile setters
  setName: (name: string | null) => void;

  setEmail: (email: string | null) => void;

  setBio: (bio: string | null) => void;

  setProfilePic: (url: string | null) => void;

  setCoverImage: (url: string | null) => void;

  setLocation: (location: string | null) => void;

  // Auth token
  setAccessToken: (token: string | null) => void;

  // Subscription
  setSubscription: (
    subscription: OrganizerSubscription | null
  ) => void;

  setSubscriptionLoaded: (loaded: boolean) => void;

  // Hydration
  setHydrated: (hydrated: boolean) => void;

  // Logout
  clearAuth: () => void;
}

// ─── Initial State ──────────────────────────────────────────────────────────
const INITIAL: AuthState = {
  name: null,

  email: null,

  bio: null,

  profilePic: null,

  coverImage: null,

  location: null,

  accessToken: null,

  subscription: null,

  subscriptionLoaded: false,

  isAuthenticated: false,

  isHydrated: false,
};

// ─── Zustand Store ──────────────────────────────────────────────────────────
export const useOrganizerAuth =
  create<AuthState & AuthActions>()(
    persist(
      (set) => ({
        // ─── State ──────────────────────────────────────────────────────────
        ...INITIAL,

        // ─── Bulk Auth Setter ───────────────────────────────────────────────
        setAuth: (data) =>
          set({
            ...data,

            isAuthenticated: !!data.accessToken,
          }),

        // ─── Profile Setters ────────────────────────────────────────────────
        setName: (name) =>
          set({
            name,
          }),

        setEmail: (email) =>
          set({
            email,
          }),

        setBio: (bio) =>
          set({
            bio,
          }),

        setProfilePic: (profilePic) =>
          set({
            profilePic,
          }),

        setCoverImage: (coverImage) =>
          set({
            coverImage,
          }),

        setLocation: (location) =>
          set({
            location,
          }),

        // ─── Token Setter ───────────────────────────────────────────────────
        setAccessToken: (accessToken) =>
          set({
            accessToken,

            isAuthenticated: !!accessToken,
          }),

        // ─── Subscription ───────────────────────────────────────────────────
        setSubscription: (subscription) =>
          set({
            subscription,
          }),

        setSubscriptionLoaded: (subscriptionLoaded) =>
          set({
            subscriptionLoaded,
          }),

        // ─── Hydration ──────────────────────────────────────────────────────
        setHydrated: (isHydrated) =>
          set({
            isHydrated,
          }),

        // ─── Logout ─────────────────────────────────────────────────────────
        clearAuth: () =>
          set({
            ...INITIAL,
          }),
      }),

      {
        name: "organizer-auth",

        storage: createJSONStorage(
          () => localStorage
        ),

        // Persist only serializable state
        partialize: (state): AuthState => ({
          name: state.name,

          email: state.email,

          bio: state.bio,

          profilePic: state.profilePic,

          coverImage: state.coverImage,

          location: state.location,

          accessToken: state.accessToken,

          subscription: state.subscription,

          subscriptionLoaded:
            state.subscriptionLoaded,

          isAuthenticated:
            state.isAuthenticated,

          isHydrated: state.isHydrated,
        }),

        // Hydration lifecycle
        onRehydrateStorage: () => (state) => {
          state?.setHydrated(true);
        },
      }
    )
  );

// ─── Typed Selectors ────────────────────────────────────────────────────────

export const useOrganizerName = () =>
  useOrganizerAuth((s) => s.name);

export const useOrganizerEmail = () =>
  useOrganizerAuth((s) => s.email);

export const useOrganizerBio = () =>
  useOrganizerAuth((s) => s.bio);

export const useOrganizerProfilePic = () =>
  useOrganizerAuth((s) => s.profilePic);

export const useOrganizerCoverImage = () =>
  useOrganizerAuth((s) => s.coverImage);

export const useOrganizerLocation = () =>
  useOrganizerAuth((s) => s.location);

export const useOrganizerAccessToken = () =>
  useOrganizerAuth((s) => s.accessToken);

export const useOrganizerSubscription = () =>
  useOrganizerAuth((s) => s.subscription);

export const useSubscriptionLoaded = () =>
  useOrganizerAuth(
    (s) => s.subscriptionLoaded
  );

export const useIsOrganizerAuthenticated = () =>
  useOrganizerAuth(
    (s) => s.isAuthenticated
  );

export const useIsOrganizerHydrated = () =>
  useOrganizerAuth(
    (s) => s.isHydrated
  );