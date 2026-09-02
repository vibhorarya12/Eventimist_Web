// src/store/eventimist/user/auth/UserAuthState.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── State shape ──────────────────────────────────────────────────────────────
interface UserAuthState {
  name:                 string;
  email:                string;
  profilePic:           string | null;
  accessToken:          string;
  refreshToken: string;
  rsvpEventIds:         number[];
  bookmarkedEventIds:   number[];
  interactionsLoaded:   boolean;

  // Actions
setAuth: (data: Partial<Omit<UserAuthState, "setAuth" | "clearAuth" | "isAuthenticated" | "setRsvpEventIds" | "setBookmarkedEventIds" | "setInteractionsLoaded">>) => void;
  clearAuth:            () => void;
  isAuthenticated:      () => boolean;
  setRsvpEventIds:      (ids: number[]) => void;
  setBookmarkedEventIds:(ids: number[]) => void;
  setInteractionsLoaded:(loaded: boolean) => void;
}

const EMPTY = {
  name: "",
  email: "",
  profilePic: null,
  accessToken: "",
  rsvpEventIds: [],
  refreshToken : "" ,
  bookmarkedEventIds: [],
  interactionsLoaded: false,
};

// ─── Store ────────────────────────────────────────────────────────────────────
export const useUserAuth = create<UserAuthState>()(
  persist(
    (set, get) => ({
      ...EMPTY,

      setAuth: (data) => set({ ...data }),

      clearAuth: () => set({ ...EMPTY }),

      isAuthenticated: () => !!get().accessToken,

      setRsvpEventIds: (ids) => set({ rsvpEventIds: ids }),
      setBookmarkedEventIds: (ids) => set({ bookmarkedEventIds: ids }),
      setInteractionsLoaded: (loaded) => set({ interactionsLoaded: loaded }),
    }),
    {
      name: "user-auth",      // localStorage key
      partialize: (s) => ({   // don't persist actions
        name:               s.name,
        email:              s.email,
        profilePic:         s.profilePic,
        accessToken:        s.accessToken,
        refreshToken:       s.refreshToken,
        rsvpEventIds:       s.rsvpEventIds,
        bookmarkedEventIds: s.bookmarkedEventIds,
        interactionsLoaded: s.interactionsLoaded,
      }),
    }
  )
);

// ─── Selectors ────────────────────────────────────────────────────────────────
export const useUserName       = () => useUserAuth(s => s.name);
export const useUserEmail      = () => useUserAuth(s => s.email);
export const useUserProfilePic = () => useUserAuth(s => s.profilePic);
export const useUserToken               = () => useUserAuth(s => s.accessToken);
export const useUserRsvpEventIds        = () => useUserAuth(s => s.rsvpEventIds);
export const useUserBookmarkedEventIds  = () => useUserAuth(s => s.bookmarkedEventIds);
export const useUserInteractionsLoaded  = () => useUserAuth(s => s.interactionsLoaded);
export const useUserRefreshToken = () => useUserAuth(s => s.refreshToken);