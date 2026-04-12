// src/app/api/places/autocomplete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getPlaceAutocomplete } from "@/services/google/places.service";

export async function GET(req: NextRequest) {
  const input = req.nextUrl.searchParams.get("input") ?? "";
  const predictions = await getPlaceAutocomplete(input);
  return NextResponse.json({ predictions });
}