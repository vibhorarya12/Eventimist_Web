import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ─── Shape returned by the backend ───────────────────────────────────────────
export interface AuthState {
  name:        string | null;
  email:       string | null;
  bio:         string | null;
  profilePic:  string | null;
  coverImage:  string | null;
  location:    string | null;
}

// ─── Actions available on the store ──────────────────────────────────────────
interface AuthActions {
  /** Hydrate the whole profile at once (call this after a successful login / fetch) */
  setAuth:        (data: AuthState) => void;

  /** Granular field updates — useful for settings form partial saves */
  setName:        (name: string | null)       => void;
  setEmail:       (email: string | null)      => void;
  setBio:         (bio: string | null)        => void;
  setProfilePic:  (url: string | null)        => void;
  setCoverImage:  (url: string | null)        => void;
  setLocation:    (location: string | null)   => void;

  /** Wipe everything — call on logout */
  clearAuth:      () => void;

  /** Convenience selector: is the organiser considered logged-in? */
  isAuthenticated: () => boolean;
}

// ─── Initial / empty state ────────────────────────────────────────────────────
const INITIAL: AuthState = {
  name:       null,
  email:      null,
  bio:        null,
  profilePic: null,
  coverImage: null,
  location:   null,
};

// ─── Store ────────────────────────────────────────────────────────────────────
export const useOrganizerAuth = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // ── State ──────────────────────────────────────────────────────────────
      ...INITIAL,

      // ── Bulk setter (post-login / post-fetch) ──────────────────────────────
      setAuth: (data) => set({ ...data }),

      // ── Granular field setters ─────────────────────────────────────────────
      setName:       (name)       => set({ name }),
      setEmail:      (email)      => set({ email }),
      setBio:        (bio)        => set({ bio }),
      setProfilePic: (profilePic) => set({ profilePic }),
      setCoverImage: (coverImage) => set({ coverImage }),
      setLocation:   (location)   => set({ location }),

      // ── Logout ────────────────────────────────────────────────────────────
      clearAuth: () => set({ ...INITIAL }),

      // ── Derived getter ────────────────────────────────────────────────────
      isAuthenticated: () => {
        const { email } = get();
        return email !== null;
      },
    }),

    {
      name:    "organizer-auth",          // localStorage key
      storage: createJSONStorage(() => localStorage),

      // Only persist the plain data fields — actions are never serialised
      partialize: (state): AuthState => ({
        name:       state.name,
        email:      state.email,
        bio:        state.bio,
        profilePic: state.profilePic,
        coverImage: state.coverImage,
        location:   state.location,
      }),
    }
  )
);

// ─── Typed selectors (use these in components to avoid re-renders) ─────────────
export const useOrganizerName        = () => useOrganizerAuth((s) => s.name);
export const useOrganizerEmail       = () => useOrganizerAuth((s) => s.email);
export const useOrganizerBio         = () => useOrganizerAuth((s) => s.bio);
export const useOrganizerProfilePic  = () => useOrganizerAuth((s) => s.profilePic);
export const useOrganizerCoverImage  = () => useOrganizerAuth((s) => s.coverImage);
export const useOrganizerLocation    = () => useOrganizerAuth((s) => s.location);
export const useIsOrganizerAuth      = () => useOrganizerAuth((s) => s.isAuthenticated());