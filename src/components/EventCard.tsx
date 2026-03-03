"use client";

import { useState } from "react";

// ─── Event type (matches backend schema) ──────────────────────────────────────
export interface Event {
  id: string;
  title: string;
  type: string;
  description: string;
  date: string; // ISO string
  venue: string;
  tags: string[];
  image_url: string;
  attendance: number;
  organizerName: string;
  organizer: string;
  organizerProfilepic: string;
  latitude: number;
  longitude: number;
  organizerId: string;
}

// ─── Per-type colour tokens ────────────────────────────────────────────────────
export const TYPE_META: Record<string, { bg: string; text: string; dot: string; hex: string }> = {
  Music:      { bg: "bg-violet-500/15", text: "text-violet-300", dot: "bg-violet-400",  hex: "#8b5cf6" },
  Tech:       { bg: "bg-blue-500/15",   text: "text-blue-300",   dot: "bg-blue-400",    hex: "#3b82f6" },
  Food:       { bg: "bg-orange-500/15", text: "text-orange-300", dot: "bg-orange-400",  hex: "#f97316" },
  Sports:     { bg: "bg-green-500/15",  text: "text-green-300",  dot: "bg-green-400",   hex: "#22c55e" },
  Art:        { bg: "bg-pink-500/15",   text: "text-pink-300",   dot: "bg-pink-400",    hex: "#ec4899" },
  Festival:   { bg: "bg-amber-500/15",  text: "text-amber-300",  dot: "bg-amber-400",   hex: "#f59e0b" },
  Volunteer:  { bg: "bg-teal-500/15",   text: "text-teal-300",   dot: "bg-teal-400",    hex: "#14b8a6" },
  Conference: { bg: "bg-indigo-500/15", text: "text-indigo-300", dot: "bg-indigo-400",  hex: "#6366f1" },
  Networking: { bg: "bg-cyan-500/15",   text: "text-cyan-300",   dot: "bg-cyan-400",    hex: "#06b6d4" },
  Workshop:   { bg: "bg-rose-500/15",   text: "text-rose-300",   dot: "bg-rose-400",    hex: "#f43f5e" },
  default:    { bg: "bg-stone-500/15",  text: "text-stone-300",  dot: "bg-stone-400",   hex: "#f59e0b" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}
export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

// ─── Compact popup shown above map marker ─────────────────────────────────────
export function MapPopupCard({
  event,
  onClose,
}: {
  event: Event;
  onClose?: () => void;
}) {
  const tc = TYPE_META[event.type] ?? TYPE_META.default;

  return (
    <div className="w-64 bg-[#13151f] border border-white/12 rounded-2xl overflow-hidden shadow-2xl shadow-black/70 pointer-events-auto">
      {/* Image */}
      <div className="relative h-32 overflow-hidden">
        <img
          src={event.image_url}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#13151f] via-transparent to-transparent" />
        {/* Type badge */}
        <span
          className={`absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full border border-white/10 backdrop-blur-sm ${tc.bg} ${tc.text}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${tc.dot}`} />
          {event.type}
        </span>
        {/* Close */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-black/55 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white transition-all hover:bg-black/80"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Body */}
      <div className="p-3.5">
        <h3
          className="text-white font-bold text-sm leading-snug line-clamp-1 mb-2.5"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {event.title}
        </h3>

        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-1.5 text-white/40 text-[10px]">
            <svg className="w-3 h-3 flex-shrink-0 text-amber-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{formatDate(event.date)} · {formatTime(event.date)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/40 text-[10px]">
            <svg className="w-3 h-3 flex-shrink-0 text-amber-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
            <span className="truncate">{event.venue}</span>
          </div>
        </div>

        {/* Organiser + Attendance + CTA */}
        <div className="flex items-center justify-between pt-2.5 border-t border-white/6">
          <div className="flex items-center gap-1.5">
            <img
              src={event.organizerProfilepic}
              alt={event.organizerName}
              className="w-5 h-5 rounded-full object-cover ring-1 ring-white/15"
            />
            <span className="text-white/45 text-[10px] font-semibold truncate max-w-[80px]">
              {event.organizerName}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1 text-[10px] text-white/35">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
              <span>{event.attendance.toLocaleString()}</span>
            </div>
            <button className="text-[10px] font-black text-amber-400 bg-amber-400/12 border border-amber-400/25 hover:bg-amber-400/22 px-2.5 py-1 rounded-lg transition-all">
              RSVP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Full Event Card (sidebar list) ──────────────────────────────────────────
export function EventCard({
  event,
  onClick,
  active,
}: {
  event: Event;
  onClick?: () => void;
  active?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const tc = TYPE_META[event.type] ?? TYPE_META.default;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group relative bg-[#13151f] border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
        active
          ? "border-amber-400/50 shadow-lg shadow-amber-400/8 -translate-y-0.5"
          : hovered
          ? "border-white/20 shadow-xl shadow-black/40 -translate-y-1"
          : "border-white/7 hover:border-white/15"
      }`}
    >
      {/* Active left stripe */}
      {active && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-400 to-orange-500 z-10 rounded-r" />
      )}

      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={event.image_url}
          alt={event.title}
          className={`w-full h-full object-cover transition-transform duration-500 ${hovered ? "scale-105" : "scale-100"}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#13151f] via-[#13151f]/25 to-transparent" />

        {/* Type badge */}
        <span
          className={`absolute top-3 left-3 inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-sm ${tc.bg} ${tc.text}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${tc.dot}`} />
          {event.type}
        </span>

        {/* Attendance badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/55 backdrop-blur-sm border border-white/10 rounded-full px-2.5 py-1">
          <svg className="w-3 h-3 text-white/55" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
          </svg>
          <span className="text-white/70 text-[10px] font-bold">
            {event.attendance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3
          className="text-white font-bold text-sm leading-snug mb-1 line-clamp-2"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {event.title}
        </h3>
        <p className="text-white/35 text-xs leading-relaxed line-clamp-2 mb-3">
          {event.description}
        </p>

        {/* Meta */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-2 text-white/45 text-xs">
            <svg className="w-3.5 h-3.5 flex-shrink-0 text-amber-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{formatDate(event.date)} · {formatTime(event.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-white/45 text-xs">
            <svg className="w-3.5 h-3.5 flex-shrink-0 text-amber-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
            <span className="truncate">{event.venue}</span>
          </div>
        </div>

        {/* Tags */}
        {event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {event.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-semibold text-white/35 bg-white/5 border border-white/8 rounded-full px-2 py-0.5"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Organiser row */}
        <div className="flex items-center justify-between pt-3 border-t border-white/6">
          <div className="flex items-center gap-2">
            <img
              src={event.organizerProfilepic}
              alt={event.organizerName}
              className="w-6 h-6 rounded-full object-cover ring-2 ring-white/10"
            />
            <div>
              <div className="text-white/60 text-[10px] font-semibold leading-none">
                {event.organizerName}
              </div>
              <div className="text-white/25 text-[9px] mt-0.5">@{event.organizer}</div>
            </div>
          </div>
          <button className="text-[10px] font-black text-amber-400 bg-amber-400/10 border border-amber-400/22 px-3 py-1.5 rounded-lg hover:bg-amber-400/20 transition-all hover:scale-[1.03]">
            RSVP →
          </button>
        </div>
      </div>
    </div>
  );
}

export default EventCard;