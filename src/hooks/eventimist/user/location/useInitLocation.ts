// src/hooks/eventimist/user/location/useInitLocation.ts
// Grabs GPS coords + reverse geocodes to city/country via Nominatim (free, no key)
// Call this once at app mount — e.g. in a layout or QueryProvider

import { useEffect, useRef } from "react";
import { useLocationStore } from "@/store/eventimist/user/location/LocationState";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";

async function reverseGeocode(
  lat: number,
  lng: number
): Promise<{ city: string | null; country: string | null }> {
  try {
    const res = await fetch(
      `${NOMINATIM_URL}?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "Accept-Language": "en" } }
    );
    if (!res.ok) return { city: null, country: null };

    const data = await res.json();
    const addr = data.address ?? {};

    // Nominatim returns different keys depending on location type
    const city =
      addr.city       ??
      addr.town       ??
      addr.village    ??
      addr.suburb     ??
      addr.county     ??
      null;

    const country = addr.country ?? null;

    return { city, country };
  } catch {
    return { city: null, country: null };
  }
}

export function useInitLocation() {
  const setLocation  = useLocationStore(s => s.setLocation);
  const latitude     = useLocationStore(s => s.latitude);
  const initialised  = useRef(false);

  useEffect(() => {
    // Already have coords stored — skip re-fetch
    if (latitude !== null || initialised.current) return;
    initialised.current = true;

    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // Save coords immediately
        setLocation({ latitude: lat, longitude: lng });

        // Reverse geocode in background
        const { city, country } = await reverseGeocode(lat, lng);
        setLocation({ city, country });
      },
      () => {
        // Permission denied or error — leave store empty
      },
      { timeout: 8000, maximumAge: 300000 } // cache for 5 min
    );
  }, []);
}