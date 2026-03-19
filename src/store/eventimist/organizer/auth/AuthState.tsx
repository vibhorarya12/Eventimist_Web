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
//   1. Have your backend set:  Set-Cookie: token=...; HttpOnly; Secure; SameSite=Strict
//   2. Remove accessToken from this store entirely.
//   3. All requests will carry the cookie automatically — no manual header needed.
//
// For now, localStorage is fine as long as you keep a tight Content-Security-Policy
// and sanitise any user-generated content rendered on the page.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Shape returned by the backend ───────────────────────────────────────────
export interface AuthState {
  name:         string | null;
  email:        string | null;
  bio:          string | null;
  profilePic:   string | null;
  coverImage:   string | null;
  location:     string | null;
  accessToken:  string | null;
}

// ─── Actions available on the store ──────────────────────────────────────────
interface AuthActions {
  /** Hydrate the whole profile + token at once — call this after a successful login */
  setAuth:         (data: AuthState) => void;

  /** Granular field updates — useful for settings form partial saves */
  setName:         (name: string | null)        => void;
  setEmail:        (email: string | null)       => void;
  setBio:          (bio: string | null)         => void;
  setProfilePic:   (url: string | null)         => void;
  setCoverImage:   (url: string | null)         => void;
  setLocation:     (location: string | null)    => void;

  /** Update token independently — e.g. after a silent token refresh */
  setAccessToken:  (token: string | null)       => void;

  /** Wipe everything — call on logout */
  clearAuth:       () => void;

  /** Derived: true when a valid token is present */
  isAuthenticated: () => boolean;
}

// ─── Initial / empty state ────────────────────────────────────────────────────
const INITIAL: AuthState = {
  name:        null,
  email:       null,
  bio:         null,
  profilePic:  null,
  coverImage:  null,
  location:    null,
  accessToken: null,
};

// ─── Store ────────────────────────────────────────────────────────────────────
export const useOrganizerAuth = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // ── State ──────────────────────────────────────────────────────────────
      ...INITIAL,

      // ── Bulk setter (post-login) ────────────────────────────────────────────
      setAuth: (data) => set({ ...data }),

      // ── Granular field setters ──────────────────────────────────────────────
      setName:        (name)        => set({ name }),
      setEmail:       (email)       => set({ email }),
      setBio:         (bio)         => set({ bio }),
      setProfilePic:  (profilePic)  => set({ profilePic }),
      setCoverImage:  (coverImage)  => set({ coverImage }),
      setLocation:    (location)    => set({ location }),
      setAccessToken: (accessToken) => set({ accessToken }),

      // ── Logout ─────────────────────────────────────────────────────────────
      clearAuth: () => set({ ...INITIAL }),

      // ── Derived: authenticated when a non-null token exists ────────────────
      isAuthenticated: () => get().accessToken !== null,
    }),

    {
      name:    "organizer-auth",                     // localStorage key
      storage: createJSONStorage(() => localStorage),

      // Persist all state fields — including accessToken.
      // Actions (functions) are intentionally excluded; they are never serialisable.
      partialize: (state): AuthState => ({
        name:        state.name,
        email:       state.email,
        bio:         state.bio,
        profilePic:  state.profilePic,
        coverImage:  state.coverImage,
        location:    state.location,
        accessToken: state.accessToken,
      }),
    }
  )
);

// ─── Typed selectors ──────────────────────────────────────────────────────────
// Prefer these over pulling the whole store — each component only re-renders
// when its specific slice changes.
export const useOrganizerName        = () => useOrganizerAuth((s) => s.name);
export const useOrganizerEmail       = () => useOrganizerAuth((s) => s.email);
export const useOrganizerBio         = () => useOrganizerAuth((s) => s.bio);
export const useOrganizerProfilePic  = () => useOrganizerAuth((s) => s.profilePic);
export const useOrganizerCoverImage  = () => useOrganizerAuth((s) => s.coverImage);
export const useOrganizerLocation    = () => useOrganizerAuth((s) => s.location);
export const useOrganizerAccessToken = () => useOrganizerAuth((s) => s.accessToken);
export const useIsOrganizerAuth      = () => useOrganizerAuth((s) => s.isAuthenticated());