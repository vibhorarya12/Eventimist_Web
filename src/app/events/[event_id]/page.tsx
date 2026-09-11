"use client";

// src/app/events/[id]/page.tsx

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGetEvent } from "@/hooks/eventimist/user/events/useGetEvent";
import { useUserActions } from "@/hooks/eventimist/user/actions/useUserActions";
import { useUserAuth, useUserToken, useUserInteractionsLoaded, useUserRsvpEventIds } from "@/store/eventimist/user/auth/UserAuthState";
import { QueryProvider } from "@/components/QueryProvider";
import type { GetEventResponse } from "@/services/eventimist/user/events/GetEvent.service";


// ─── Helpers ──────────────────────────────────────────────────────────────────
const CATEGORY_META: Record<string, { emoji: string; color: string }> = {
  MUSIC: "{🎵,#7c3aed}".split(",").reduce((a, v, i) => ({ ...a, [i === 0 ? "emoji" : "color"]: v.replace(/[{}]/g, "") }), {}) as any,
  TECH: { emoji: "💻", color: "#1d4ed8" },
  FOOD: { emoji: "🍜", color: "#c2410c" },
  ART: { emoji: "🎨", color: "#be185d" },
  SPORTS: { emoji: "⚽", color: "#15803d" },
  FESTIVAL: { emoji: "🎪", color: "#b45309" },
  VOLUNTEER: { emoji: "🤝", color: "#0f766e" },
  NETWORKING: { emoji: "🔗", color: "#0e7490" },
  WORKSHOP: { emoji: "🛠", color: "#be123c" },
  CONFERENCE: { emoji: "🎤", color: "#4338ca" },
  EDUCATION: { emoji: "📚", color: "#0369a1" },
  BUSINESS: { emoji: "💼", color: "#4d7c0f" },
  HEALTH: { emoji: "🏥", color: "#047857" },
  ENTERTAINMENT: { emoji: "🎬", color: "#a21caf" },
  GAMING: { emoji: "🎮", color: "#c2410c" },
};

function fmtDay(dt: string) {
  return new Date(dt).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
function fmtTime(dt: string) {
  return new Date(dt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }).toUpperCase();
}
function fmtDuration(s: string, e: string) {
  const ms = new Date(e).getTime() - new Date(s).getTime();
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ""}` : `${m}m`;
}

// ─── Compact image carousel ───────────────────────────────────────────────────
function Carousel({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx(i => (i - 1 + images.length) % images.length);
  const next = () => setIdx(i => (i + 1) % images.length);

  if (!images.length) return null;

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-stone-900" style={{ height: 320 }}>
      {images.map((src, i) => (
        <img key={i} src={src} alt={`Event photo ${i + 1}`}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          style={{ opacity: i === idx ? 1 : 0 }}
        />
      ))}
      {/* Subtle vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center,transparent 50%,rgba(0,0,0,.35) 100%)" }} />

      {/* Arrows */}
      {images.length > 1 && (
        <>
          <button onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            style={{ background: "rgba(255,255,255,.9)", backdropFilter: "blur(8px)" }}>
            <svg className="w-4 h-4 text-stone-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            style={{ background: "rgba(255,255,255,.9)", backdropFilter: "blur(8px)" }}>
            <svg className="w-4 h-4 text-stone-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" /></svg>
          </button>
        </>
      )}

      {/* Thumbnails strip */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 px-4">
          {images.map((src, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className="transition-all duration-200 rounded-md overflow-hidden flex-shrink-0"
              style={{ width: i === idx ? 40 : 28, height: 28, opacity: i === idx ? 1 : 0.55, outline: i === idx ? "2px solid white" : "none", outlineOffset: 1 }}>
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Counter */}
      <div className="absolute top-3 right-3 text-[10px] font-black text-white px-2 py-0.5 rounded-full"
        style={{ background: "rgba(0,0,0,.45)", backdropFilter: "blur(6px)" }}>
        {idx + 1}/{images.length}
      </div>
    </div>
  );
}

// ─── RSVP Button ──────────────────────────────────────────────────────────────
function RSVPButton({ eventId, count }: { eventId: number; count: number }) {
  const token = useUserToken();
  const interactionsLoaded = useUserInteractionsLoaded();
  const [showSignInModal, setShowSignInModal] = useState(false);
  const { rsvpEvent, getUserInteractions } = useUserActions(token);

  const rsvpEventIds = useUserRsvpEventIds();
  const safeIds = Array.isArray(rsvpEventIds) ? rsvpEventIds : [];

  const alreadyRsvped =
    interactionsLoaded && !!token && safeIds.includes(eventId);

  const [state, setState] = useState<"idle" | "loading" | "done">(
    alreadyRsvped ? "done" : "idle"
  );
  const [cnt, setCnt] = useState(count);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (interactionsLoaded) {
      setState(alreadyRsvped ? "done" : "idle");
    }
  }, [alreadyRsvped, interactionsLoaded]);

  useEffect(() => {
    if (token && !interactionsLoaded && !getUserInteractions.loading) {
      getUserInteractions.refetch();
    }
  }, [token, interactionsLoaded, getUserInteractions]);

  const isDisabled = state === "loading" || rsvpEvent.loading || getUserInteractions.loading;

  const handle = async () => {
    console.log("token <<<<<<<<<<<<<,",token);
    if (!token) {
      setShowSignInModal(true);
      return;
    }

    setState("loading");

    if (alreadyRsvped) {
      // ── Un-RSVP ──
      const res = await rsvpEvent.remove(eventId, token);
      if (res) {
        setState("idle");
        setCnt((c) => Math.max(0, c - 1));
      } else {
        setState("done");
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
      }
    } else {
      // ── RSVP ──
      const res = await rsvpEvent.submit(eventId, token);
      if (res) {
        setState("done");
        setCnt((c) => c + 1);
      } else {
        setState("idle");
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
      }
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handle}
        disabled={isDisabled}
        className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 hover:cursor-pointer"
        style={{
          background:
            state === "done"
              ? "linear-gradient(135deg,#14532d,#166534)"
              : state === "loading"
                ? "linear-gradient(135deg,#44403c,#57534e)"
                : "linear-gradient(135deg,#1c1917,#292524)",
          color: "white",
          boxShadow:
            state === "done"
              ? "0 4px 16px rgba(20,83,45,.35)"
              : "0 4px 16px rgba(0,0,0,.25)",
        }}
      >
        {state === "loading" ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {alreadyRsvped ? "Cancelling…" : "Reserving…"}
          </>
        ) : state === "done" ? (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            You're going! · {cnt} attending · Cancel
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path d="M2 9a3 3 0 010 6v2a2 2 0 002 2h16a2 2 0 002-2v-2a3 3 0 010-6V7a2 2 0 00-2-2H4a2 2 0 00-2 2v2z" />
            </svg>
            Reserve Free Spot
          </>
        )}
      </button>
       {showSignInModal && (
  <>
    {/* Backdrop */}
    <div className="fixed inset-0 z-[998] bg-black/40 backdrop-blur-sm"
      onClick={() => setShowSignInModal(false)}/>
    {/* Modal */}
    <div className="fixed inset-0 z-[999] flex items-center justify-center pointer-events-none">
      <div className="pointer-events-auto bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-4 mx-4"
        style={{ width: "min(360px, calc(100vw - 32px))" }}>
        <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-2xl">🎟️</div>
        <div className="text-center">
          <p className="font-black text-stone-900 text-base"
            style={{ fontFamily: "'DM Serif Display',Georgia,serif" }}>
            Sign in to RSVP
          </p>
          <p className="text-stone-400 text-xs mt-1.5 leading-relaxed">
            Create a free account to reserve your spot and manage your events.
          </p>
        </div>
        <a href="/user"
          className="w-full text-center bg-stone-900 hover:bg-stone-700 text-white font-bold py-3 rounded-xl text-sm transition-all">
          Sign In / Sign Up
        </a>
        <button onClick={() => setShowSignInModal(false)}
          className="text-xs text-stone-400 hover:text-stone-600 transition-colors">
          Maybe later
        </button>
      </div>
    </div>
  </>
)}

{/* {showError && (
  <p className="text-xs text-red-600 text-center">
    {rsvpEvent.error || "Failed. Please try again."}
  </p>
)} */}
    </div>
  );
}
// ─── Add to Calendar ──────────────────────────────────────────────────────────
function addToCalendar(event: GetEventResponse) {
  const start = event.startTime.replace(/[-:]/g, "").slice(0, 15) + "Z";
  const end = event.endTime
    ? event.endTime.replace(/[-:]/g, "").slice(0, 15) + "Z"
    : start;
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE`
    + `&text=${encodeURIComponent(event.title)}`
    + `&dates=${start}/${end}`
    + `&details=${encodeURIComponent(event.description.slice(0, 300))}`
    + `&location=${encodeURIComponent(event.venue)}`
    + `&sf=true&output=xml`;
  window.open(url, "_blank");
}

// ─── Share ────────────────────────────────────────────────────────────────────
function ShareMenu({ link, title }: { link: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const copy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    { label: "Copy link", fn: copy, icon: <><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></> },
    { label: "WhatsApp", fn: () => window.open(`https://wa.me/?text=${encodeURIComponent(title + " " + link)}`, "_blank"), icon: <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" /> },
    { label: "Twitter / X", fn: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(link)}`, "_blank"), icon: <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" /> },
  ];

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-all"
        style={{ borderColor: "#e7e5e4", background: "white", color: "#57534e" }}>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        Share
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-stone-100 bg-white shadow-xl z-50 overflow-hidden py-1">
          {shareOptions.map(opt => (
            <button key={opt.label} onClick={() => { opt.fn(); if (opt.label !== "Copy link") setOpen(false); }}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors text-left">
              <svg className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">{opt.icon}</svg>
              {opt.label === "Copy link" && copied ? "Copied! ✓" : opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Occupancy bar ────────────────────────────────────────────────────────────
function OccupancyBar({ rsvp, attendance }: { rsvp: number; attendance: number }) {
  const pct = Math.min(100, Math.round((rsvp / Math.max(rsvp, 500)) * 100));
  return (
    <div>
      <div className="flex justify-between text-[10px] font-bold text-stone-400 mb-1.5">
        <span>RSVP · {rsvp.toLocaleString()}</span>
        <span>{attendance.toLocaleString()} attended</span>
      </div>
      <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
        <div className="h-full rounded-full bg-stone-900 transition-all duration-1000"
          style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function EventViewPage() {
  return (
    <QueryProvider>
      <EventViewPageInner />
    </QueryProvider>
  );
}

function EventViewPageInner() {
  const router = useRouter();
  const params = useParams();

  const slug = params?.event_id as string;

  console.log("slug is <<<<<<<<<<<<", params);

  const { event: ev, loading, error } = useGetEvent(slug);
  const [vis, setVis] = useState(false);
  const [bkm, setBkm] = useState(false);

  useEffect(() => { const t = setTimeout(() => setVis(true), 60); return () => clearTimeout(t); }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#faf9f7" }}>
      <div className="flex flex-col items-center gap-4">
        <svg className="w-8 h-8 animate-spin text-stone-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-stone-400 text-sm font-medium">Loading event…</p>
      </div>
    </div>
  );

  if (error || !ev) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#faf9f7" }}>
      <div className="text-center px-6">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-stone-900 font-black text-xl mb-2"
          style={{ fontFamily: "'DM Serif Display',Georgia,serif" }}>Event not found</h2>
        <p className="text-stone-400 text-sm mb-5">{error ?? "This event couldn't be loaded."}</p>
        <button onClick={() => router.replace("/discover")}
          className="bg-stone-900 text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-stone-700 transition-colors">
          ← Back to Discover
        </button>
      </div>
    </div>
  );

  const cat = CATEGORY_META[ev.category.toUpperCase()] ?? { emoji: "📅", color: "#44403c" };
  const allImgs = [ev.coverImage, ...(ev.images ?? [])].filter((v, i, a) => v && a.indexOf(v) === i);
  const dur = fmtDuration(ev.startTime, ev.endTime);
  const modeLabel = { ONLINE: "Online", OFFLINE: "In-Person", HYBRID: "Hybrid" }[ev.mode] ?? ev.mode;
  const shareLink = typeof window !== "undefined" ? window.location.href : `https://eventimist.com/events/${ev.slug ?? slug}`;
  const mapLink = `https://maps.google.com/?q=${ev.latitude},${ev.longitude}`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Instrument+Sans:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box}
        body{font-family:'Instrument Sans',system-ui,sans-serif;background:#faf9f7;color:#1c1917;margin:0}
        .stagger{opacity:0;transform:translateY(20px);transition:opacity .55s ease,transform .55s ease}
        .stagger.in{opacity:1;transform:none}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:rgba(0,0,0,.1);border-radius:99px}
      `}</style>

      <div className="min-h-screen" style={{ background: "#faf9f7" }}>

        {/* ── Top bar ── */}
        <div className="sticky top-0 z-40 border-b border-stone-200/70"
          style={{ background: "rgba(250,249,247,.93)", backdropFilter: "blur(14px)" }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <button onClick={() => router.back()}
              className="flex items-center gap-2 text-sm font-semibold text-stone-500 hover:text-stone-900 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" /></svg>
              <span className="hidden sm:block">Discover</span>
            </button>
            <div className="flex items-center gap-2">
              {/* Bookmark */}
              <button onClick={() => setBkm(b => !b)}
                className="w-8 h-8 rounded-xl border flex items-center justify-center transition-all"
                style={{ borderColor: bkm ? "#d97706" : "#e7e5e4", background: bkm ? "#fffbeb" : "white", color: bkm ? "#d97706" : "#78716c" }}>
                <svg className="w-4 h-4" fill={bkm ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
              <ShareMenu link={shareLink} title={ev.title} />
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-7 sm:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">

            {/* ══ LEFT COLUMN ══════════════════════════════════════════════════ */}
            <div className="space-y-6 min-w-0">

              {/* Title block */}
              <div className={`stagger ${vis ? "in" : ""}`} style={{ transitionDelay: "0ms" }}>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full border"
                    style={{ color: cat.color, borderColor: `${cat.color}30`, background: `${cat.color}0d` }}>
                    {cat.emoji} {ev.category.charAt(0) + ev.category.slice(1).toLowerCase()}
                  </span>
                  <span className="text-[11px] font-semibold text-stone-400 px-2 py-1 bg-stone-100 rounded-full">
                    {modeLabel}
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black leading-tight text-stone-900 mb-3"
                  style={{ fontFamily: "'DM Serif Display',Georgia,serif" }}>
                  {ev.title}
                </h1>
                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {ev.tags.map(tag => (
                    <span key={tag} className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Image carousel — compact */}
              <div className={`stagger ${vis ? "in" : ""}`} style={{ transitionDelay: "80ms" }}>
                <Carousel images={allImgs} />
              </div>

              {/* Organizer */}
              <div className={`stagger ${vis ? "in" : ""} flex items-center gap-4 bg-white border border-stone-100 rounded-2xl p-4 shadow-sm`}
                style={{ transitionDelay: "140ms" }}>
                <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-stone-100">
                  {ev.organizerImage
                    ? <img src={ev.organizerImage} alt={ev.organizerName} className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-stone-900 flex items-center justify-center text-white text-sm font-black">{ev.organizerName[0]}</div>
                  }
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black tracking-widest uppercase text-stone-400">Organised by</p>
                  <p className="text-stone-900 font-bold text-sm mt-0.5 truncate">{ev.organizerName}</p>
                </div>
                <button className="ml-auto flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl border border-stone-200 text-stone-600 hover:border-stone-900 hover:text-stone-900 transition-all bg-white">
                  Follow
                </button>
              </div>

              {/* About */}
              <div className={`stagger ${vis ? "in" : ""} bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm`}
                style={{ transitionDelay: "180ms" }}>
                <div className="px-5 py-3.5 border-b border-stone-50">
                  <h2 className="text-xs font-black tracking-widest uppercase text-stone-400">About this event</h2>
                </div>
                <div className="px-5 py-5">
                  <p className="text-stone-600 text-sm leading-7 whitespace-pre-line">{ev.description}</p>
                </div>
              </div>

              {/* Schedule */}
              <div className={`stagger ${vis ? "in" : ""} bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm`}
                style={{ transitionDelay: "220ms" }}>
                <div className="px-5 py-3.5 border-b border-stone-50">
                  <h2 className="text-xs font-black tracking-widest uppercase text-stone-400">Date & Time</h2>
                </div>
                <div className="px-5 py-5 space-y-4">
                  <div>
                    <p className="text-stone-900 font-bold text-base">{fmtDay(ev.startTime)}</p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="text-stone-900 font-black text-2xl" style={{ fontFamily: "'DM Serif Display',serif" }}>{fmtTime(ev.startTime)}</span>
                      <svg className="w-4 h-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                      <span className="text-stone-500 font-semibold">{fmtTime(ev.endTime)}</span>
                      {dur && <span className="text-xs font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">{dur}</span>}
                    </div>
                    <p className="text-stone-400 text-xs mt-2 flex items-center gap-1.5">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                      {ev.timezone}
                    </p>
                  </div>
                  {/* Add to calendar */}
                  <button onClick={() => addToCalendar(ev)}
                    className="flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-stone-900 border border-stone-200 hover:border-stone-400 px-3 py-2 rounded-xl transition-all bg-white w-fit">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                      <line x1="12" y1="15" x2="12" y2="18" /><line x1="10.5" y1="16.5" x2="13.5" y2="16.5" />
                    </svg>
                    Add to Google Calendar
                  </button>
                </div>
              </div>

              {/* Location */}
              <div className={`stagger ${vis ? "in" : ""} bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm`}
                style={{ transitionDelay: "260ms" }}>
                <div className="px-5 py-3.5 border-b border-stone-50">
                  <h2 className="text-xs font-black tracking-widest uppercase text-stone-400">Location</h2>
                </div>
                <div className="px-5 py-4 space-y-3">
                  <p className="text-stone-900 font-semibold text-sm">{ev.venue}</p>
                  {/* Map embed */}
                  <iframe
                    src={`https://maps.google.com/maps?q=${ev.latitude},${ev.longitude}&z=15&output=embed`}
                    width="100%" height="200" className="w-full border-0 rounded-xl mt-1"
                    loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" title={ev.venue} />
                  <a href={mapLink} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></svg>
                    Open in Google Maps
                  </a>
                </div>
              </div>
            </div>

            {/* ══ RIGHT COLUMN ═════════════════════════════════════════════════ */}
            <div>
              <div className={`stagger ${vis ? "in" : ""} sticky top-20 space-y-4`}
                style={{ transitionDelay: "60ms" }}>

                {/* RSVP card */}
                <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-5 pt-5 pb-4 border-b border-stone-50 space-y-1">
                    <div className="flex items-baseline justify-between">
                      <span
                        className="text-2xl font-black text-stone-900"
                        style={{ fontFamily: "'DM Serif Display', serif" }}
                      >
                        {ev.isFree || ev.ticketPrice == null ? "Free" : `₹${ev.ticketPrice}`}
                      </span>
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        Open to all
                      </span>
                    </div>
                    <OccupancyBar rsvp={ev.rsvpCount} attendance={ev.attendance} />
                  </div>
                  <div className="p-5 space-y-3">
                    <RSVPButton eventId={ev.id} count={ev.rsvpCount} />
                    <p className="text-center text-[10px] text-stone-400 font-medium">
                      No registration fee · Instant confirmation
                    </p>
                  </div>
                </div>

                {/* Quick info */}
                <div className="bg-white border border-stone-100 rounded-2xl shadow-sm divide-y divide-stone-50">
                  {[
                    { label: "Date", value: new Date(ev.startTime).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }), icon: <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></> },
                    { label: "Time", value: `${fmtTime(ev.startTime)} · ${dur}`, icon: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></> },
                    { label: "Location", value: ev.venue.split(",")[0], icon: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></> },
                    { label: "Mode", value: modeLabel, icon: <><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></> },
                  ].map(row => (
                    <div key={row.label} className="flex items-center gap-3 px-4 py-3">
                      <svg className="w-4 h-4 text-stone-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">{row.icon}</svg>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black tracking-wider uppercase text-stone-400">{row.label}</p>
                        <p className="text-xs font-semibold text-stone-800 truncate mt-0.5">{row.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shareable link */}
                <div className="bg-white border border-stone-100 rounded-2xl shadow-sm p-4">
                  <p className="text-[10px] font-black tracking-widest uppercase text-stone-400 mb-2.5">Share this event</p>
                  <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5">
                    <svg className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>
                    <span className="text-[10px] text-stone-500 truncate flex-1">{shareLink.replace("https://", "")}</span>
                    <button onClick={async () => { await navigator.clipboard.writeText(shareLink); }}
                      className="text-[10px] font-black text-stone-600 hover:text-stone-900 flex-shrink-0 border border-stone-200 bg-white px-2 py-0.5 rounded-lg transition-all">
                      Copy
                    </button>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {[
                      { label: "WhatsApp", fn: () => window.open(`https://wa.me/?text=${encodeURIComponent(ev.title + " " + shareLink)}`, "_blank"), bg: "#25D366" },
                      { label: "Twitter", fn: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(ev.title)}&url=${encodeURIComponent(shareLink)}`, "_blank"), bg: "#000" },
                    ].map(s => (
                      <button key={s.label} onClick={s.fn}
                        className="flex-1 text-[11px] font-bold text-white py-2 rounded-lg transition-all hover:opacity-85"
                        style={{ background: s.bg }}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-12" />
      </div>
    </>
  );
}