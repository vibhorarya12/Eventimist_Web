// src/app/api/places/details/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getPlaceDetails } from "@/services/google/places.service";

export async function GET(req: NextRequest) {
  const place_id = req.nextUrl.searchParams.get("place_id") ?? "";
  if (!place_id) return NextResponse.json({ error: "place_id required" }, { status: 400 });

  const result = await getPlaceDetails(place_id);
  return NextResponse.json({ result });
}