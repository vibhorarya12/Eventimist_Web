// src/store/eventimist/user/location/LocationState.ts

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ─── State shape ──────────────────────────────────────────────────────────────
interface LocationState {
  latitude:  number | null;
  longitude: number | null;
  city:      string | null;
  country:   string | null;

  // Actions
  setLocation: (data: Partial<Omit<LocationState, "setLocation" | "clearLocation">>) => void;
  clearLocation: () => void;
}

const EMPTY = {
  latitude:  null,
  longitude: null,
  city:      null,
  country:   null,
};

// ─── Store ────────────────────────────────────────────────────────────────────
export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      ...EMPTY,

      setLocation: (data) => set((s) => ({ ...s, ...data })),

      clearLocation: () => set({ ...EMPTY }),
    }),
    {
      name: "user-location",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        latitude:  s.latitude,
        longitude: s.longitude,
        city:      s.city,
        country:   s.country,
      }),
    }
  )
);

// ─── Selectors ────────────────────────────────────────────────────────────────
export const useUserLatitude  = () => useLocationStore(s => s.latitude);
export const useUserLongitude = () => useLocationStore(s => s.longitude);
export const useUserCity      = () => useLocationStore(s => s.city);
export const useUserCountry   = () => useLocationStore(s => s.country);