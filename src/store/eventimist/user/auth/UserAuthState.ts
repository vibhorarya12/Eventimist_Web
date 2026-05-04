// src/store/eventimist/user/auth/UserAuthState.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── State shape ──────────────────────────────────────────────────────────────
interface UserAuthState {
  name:        string;
  email:       string;
  profilePic:  string | null;
  accessToken: string;

  // Actions
  setAuth:    (data: Omit<UserAuthState, "setAuth" | "clearAuth" | "isAuthenticated">) => void;
  clearAuth:  () => void;
  isAuthenticated: () => boolean;
}

const EMPTY = { name: "", email: "", profilePic: null, accessToken: "" };

// ─── Store ────────────────────────────────────────────────────────────────────
export const useUserAuth = create<UserAuthState>()(
  persist(
    (set, get) => ({
      ...EMPTY,

      setAuth: (data) => set({ ...data }),

      clearAuth: () => set({ ...EMPTY }),

      isAuthenticated: () => !!get().accessToken,
    }),
    {
      name: "user-auth",      // localStorage key
      partialize: (s) => ({   // don't persist actions
        name:        s.name,
        email:       s.email,
        profilePic:  s.profilePic,
        accessToken: s.accessToken,
      }),
    }
  )
);

// ─── Selectors ────────────────────────────────────────────────────────────────
export const useUserName       = () => useUserAuth(s => s.name);
export const useUserEmail      = () => useUserAuth(s => s.email);
export const useUserProfilePic = () => useUserAuth(s => s.profilePic);
export const useUserToken      = () => useUserAuth(s => s.accessToken);