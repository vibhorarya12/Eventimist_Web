// src/services/google/places.service.ts

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? "";
const BASE = "https://maps.googleapis.com/maps/api/place";

export interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export interface PlaceLocation {
  lat: number;
  lng: number;
}

export interface PlaceDetail {
  name: string;
  formatted_address: string;
  location: PlaceLocation;
}

// ── Autocomplete ──────────────────────────────────────────────────────────────
export async function getPlaceAutocomplete(
  input: string
): Promise<PlacePrediction[]> {
    //  console.warn("key iss<<<<<", KEY)
  if (!KEY || !input) return [];

  const url =
    `${BASE}/autocomplete/json` +
    `?input=${encodeURIComponent(input)}` +
    `&types=establishment` +
    `&key=${KEY}`; 
  const res  = await fetch(url, { cache: "no-store" });
  const data = await res.json();

  return data.predictions ?? [];
}

// ── Place Details ─────────────────────────────────────────────────────────────
export async function getPlaceDetails(
  place_id: string
): Promise<PlaceDetail | null> {
  if (!KEY || !place_id) return null;

  const url =
    `${BASE}/details/json` +
    `?place_id=${encodeURIComponent(place_id)}` +
    `&fields=name,formatted_address,geometry` +
    `&key=${KEY}`;

  const res  = await fetch(url, { cache: "no-store" });
  const data = await res.json();
  const r    = data.result;

  if (!r?.geometry?.location) return null;

  return {
    name:              r.name,
    formatted_address: r.formatted_address,
    location:          r.geometry.location,
  };
}