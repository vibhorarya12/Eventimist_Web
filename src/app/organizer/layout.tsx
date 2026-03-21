"use client";
import { useSyncOrganizerAuthCookie } from "@/hooks/eventimist/organizer/sessions/useSyncOrganizerAuthCookie";

export default function OrganizerLayout({ children }:any) {
  useSyncOrganizerAuthCookie();
  return <>{children}</>;
}