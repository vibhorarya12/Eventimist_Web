"use client";

// src/app/organizer/preview-event/[id]/page.tsx

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useOrganizerEvents } from "@/hooks/eventimist/organizer/event/useOrganizerEvents";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function d(dark: boolean, darkCls: string, lightCls: string) { return dark ? darkCls : lightCls; }

const STATUS_CONFIG = {
  DRAFT:     { label: "Draft",     dot: "bg-amber-400",  badge: "bg-amber-400/15 text-amber-400 border-amber-400/25" },
  PUBLISHED: { label: "Published", dot: "bg-emerald-400",badge: "bg-emerald-400/15 text-emerald-400 border-emerald-400/25" },
  CANCELLED: { label: "Cancelled", dot: "bg-rose-400",   badge: "bg-rose-400/15 text-rose-400 border-rose-400/25" },
  COMPLETED: { label: "Completed", dot: "bg-sky-400",    badge: "bg-sky-400/15 text-sky-400 border-sky-400/25" },
};

function fmtDate(dt: string) {
  return new Date(dt).toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
}
function fmtTime(dt: string) {
  return new Date(dt).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", hour12:true });
}
function fmtDuration(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const h  = Math.floor(ms / 3600000);
  const m  = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m > 0 ? m+"m" : ""}`.trim() : `${m}m`;
}

// ─── Image Slider ─────────────────────────────────────────────────────────────
function ImageSlider({ images, title }: { images: string[]; title: string }) {
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx(i => (i - 1 + images.length) % images.length);
  const next = () => setIdx(i => (i + 1) % images.length);

  if (images.length === 0) return null;

  return (
    <div className="relative w-full aspect-[16/7] sm:aspect-[16/6] overflow-hidden bg-stone-900 group">
      {images.map((src, i) => (
        <img key={i} src={src} alt={`${title} ${i+1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out
            ${i === idx ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}/>
      ))}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none"/>
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent pointer-events-none"/>

      {/* Nav arrows */}
      {images.length > 1 && (
        <>
          <button onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-white
              opacity-0 group-hover:opacity-100 hover:bg-black/60 transition-all duration-200 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-white
              opacity-0 group-hover:opacity-100 hover:bg-black/60 transition-all duration-200 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/></svg>
          </button>
        </>
      )}

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`rounded-full transition-all duration-300 ${i === idx ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"}`}/>
          ))}
        </div>
      )}

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-white text-[10px] font-black border border-white/10">
          {idx + 1} / {images.length}
        </div>
      )}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, dark }: {
  label: string; value: string; sub?: string; icon: React.ReactNode; dark: boolean;
}) {
  return (
    <div className={`rounded-2xl p-4 border flex items-start gap-3
      ${d(dark,"bg-white/4 border-white/8","bg-stone-50 border-stone-200")}`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
        ${d(dark,"bg-amber-400/15 text-amber-400","bg-amber-100 text-amber-600")}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className={`text-[10px] font-black uppercase tracking-widest ${d(dark,"text-white/30","text-stone-400")} mb-0.5`}>{label}</p>
        <p className={`text-sm font-black ${d(dark,"text-white","text-stone-900")} leading-tight`}>{value}</p>
        {sub && <p className={`text-[10px] mt-0.5 ${d(dark,"text-white/30","text-stone-400")}`}>{sub}</p>}
      </div>
    </div>
  );
}

// ─── Progress Ring ────────────────────────────────────────────────────────────
function Ring({ pct, size=56, stroke=4, dark }: { pct:number; size?:number; stroke?:number; dark:boolean }) {
  const r   = (size - stroke*2) / 2;
  const circ= 2 * Math.PI * r;
  const off = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={dark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.06)"} strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="rgb(245,158,11)" strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={off}
        strokeLinecap="round" style={{transition:"stroke-dashoffset 1s ease"}}/>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function PreviewEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;

  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(localStorage.getItem("org-dashboard-dark") === "1"); }, []);

  const { events, loading } = useOrganizerEvents();
  const ev = events.find(e => String(e.id) === eventId) ?? null;

  const allImages = ev ? [
    ...(ev.coverImage ? [ev.coverImage] : []),
    ...(ev.images ?? []),
  ].filter((v,i,a) => a.indexOf(v) === i) : [];

  const occupancy   = ev ? Math.round((ev.rsvpCount / ev.capacity) * 100) : 0;
  const statusCfg   = ev ? STATUS_CONFIG[ev.status] ?? STATUS_CONFIG.DRAFT : STATUS_CONFIG.DRAFT;
  const duration    = ev ? fmtDuration(ev.startTime, ev.endTime) : "";
  const modeIcon    = ev?.mode === "ONLINE" ? "🌐" : ev?.mode === "HYBRID" ? "🔀" : "📍";

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading && !ev) return (
    <div className={`min-h-screen flex items-center justify-center ${d(dark,"bg-[#0c0e1a]","bg-stone-50")}`}>
      <svg className="w-8 h-8 animate-spin text-amber-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>
  );

  if (!ev) return (
    <div className={`min-h-screen flex items-center justify-center ${d(dark,"bg-[#0c0e1a]","bg-stone-50")}`}>
      <div className="text-center">
        <p className={`font-black text-base mb-3 ${d(dark,"text-white","text-stone-900")}`}>Event not found</p>
        <button onClick={() => router.replace("/organizer/dashboard")}
          className="px-5 py-2.5 rounded-xl font-black text-sm text-white bg-gradient-to-r from-amber-400 to-orange-500">
          ← Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${d(dark,"bg-[#0c0e1a]","bg-stone-50")} transition-colors duration-300`}>

      {/* ── Sticky top bar ── */}
      <div className={`sticky top-0 z-30 ${d(dark,"bg-[#0c0e1a]/90","bg-stone-50/90")} backdrop-blur-md border-b ${d(dark,"border-white/8","border-stone-200")}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-13 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all
                ${d(dark,"bg-white/6 text-white/50 hover:bg-white/12 hover:text-white","bg-white text-stone-500 hover:bg-stone-100 border border-stone-200")}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6"/></svg>
            </button>
            <span className={`text-[11px] font-black uppercase tracking-widest ${d(dark,"text-white/30","text-stone-400")}`}>Preview</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Status badge */}
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full border ${statusCfg.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} animate-pulse`}/>
              {statusCfg.label.toUpperCase()}
            </span>
            {/* Dark toggle */}
            <button onClick={() => { const n=!dark; setDark(n); localStorage.setItem("org-dashboard-dark",n?"1":"0"); }}
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all
                ${d(dark,"bg-white/6 hover:bg-white/12","bg-white hover:bg-stone-100 border border-stone-200")}`}>
              {dark?"☀️":"🌙"}
            </button>
            {/* Edit */}
            <a href={`/organizer/update-event/${ev.id}`}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:shadow-md hover:shadow-amber-500/25 transition-all">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit
            </a>
          </div>
        </div>
      </div>

      {/* ── Hero image slider ── */}
      <ImageSlider images={allImages} title={ev.title}/>

      {/* ── Content ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* ── Title block ── */}
        <div className="space-y-3">
          {/* Category + tags row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider
              ${d(dark,"bg-amber-400/15 text-amber-400 border border-amber-400/20","bg-amber-100 text-amber-700 border border-amber-200")}`}>
              {ev.category}
            </span>
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border
              ${d(dark,"bg-white/6 text-white/50 border-white/10","bg-stone-100 text-stone-500 border-stone-200")}`}>
              {modeIcon} {ev.mode}
            </span>
            {ev.isFree
              ? <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${d(dark,"bg-emerald-400/12 text-emerald-400 border-emerald-400/20","bg-emerald-50 text-emerald-700 border-emerald-200")}`}>Free</span>
              : <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${d(dark,"bg-white/6 text-white/50 border-white/10","bg-stone-100 text-stone-600 border-stone-200")}`}>₹{ev.ticketPrice}</span>
            }
          </div>

          <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-black leading-tight ${d(dark,"text-white","text-stone-900")}`}
            style={{fontFamily:"'Playfair Display',Georgia,serif"}}>
            {ev.title}
          </h1>

          {/* Tags */}
          {ev.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {ev.tags.map(tag => (
                <span key={tag} className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full
                  ${d(dark,"bg-white/5 text-white/40 border border-white/8","bg-stone-100 text-stone-500 border-stone-200")}`}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Left: main content ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Schedule card */}
            <div className={`rounded-2xl border overflow-hidden ${d(dark,"bg-white/4 border-white/8","bg-white border-stone-200")}`}>
              <div className={`px-5 py-3 border-b text-[10px] font-black uppercase tracking-widest ${d(dark,"border-white/8 text-white/30","border-stone-100 text-stone-400")}`}>
                📅 Schedule
              </div>
              <div className="px-5 py-4 grid sm:grid-cols-2 gap-4">
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${d(dark,"text-white/30","text-stone-400")}`}>Starts</p>
                  <p className={`text-sm font-black ${d(dark,"text-white","text-stone-900")}`}>{fmtDate(ev.startTime)}</p>
                  <p className={`text-base font-black text-amber-500`}>{fmtTime(ev.startTime)}</p>
                </div>
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${d(dark,"text-white/30","text-stone-400")}`}>Ends</p>
                  <p className={`text-sm font-black ${d(dark,"text-white","text-stone-900")}`}>{fmtDate(ev.endTime)}</p>
                  <p className={`text-base font-black text-amber-500`}>{fmtTime(ev.endTime)}</p>
                </div>
                <div className={`sm:col-span-2 pt-3 border-t flex items-center gap-3 ${d(dark,"border-white/8","border-stone-100")}`}>
                  <span className={`text-[10px] ${d(dark,"text-white/30","text-stone-400")}`}>🌏 {ev.timezone}</span>
                  <span className={`w-1 h-1 rounded-full ${d(dark,"bg-white/20","bg-stone-300")}`}/>
                  <span className={`text-[10px] ${d(dark,"text-white/30","text-stone-400")}`}>⏱ {duration} duration</span>
                </div>
              </div>
            </div>

            {/* Location card */}
            {(ev.venue || ev.onlineLink) && (
              <div className={`rounded-2xl border overflow-hidden ${d(dark,"bg-white/4 border-white/8","bg-white border-stone-200")}`}>
                <div className={`px-5 py-3 border-b text-[10px] font-black uppercase tracking-widest ${d(dark,"border-white/8 text-white/30","border-stone-100 text-stone-400")}`}>
                  {ev.mode === "ONLINE" ? "🔗 Online" : "📍 Location"}
                </div>
                <div className="px-5 py-4 space-y-3">
                  {ev.venue && (
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${d(dark,"text-white/30","text-stone-400")}`}>Venue</p>
                      <p className={`text-sm font-bold ${d(dark,"text-white","text-stone-900")}`}>{ev.venue}</p>
                    </div>
                  )}
                  {ev.onlineLink && (
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${d(dark,"text-white/30","text-stone-400")}`}>Link</p>
                      <a href={ev.onlineLink} target="_blank" rel="noopener noreferrer"
                        className="text-sm font-bold text-amber-500 hover:text-amber-400 break-all transition-colors">
                        {ev.onlineLink}
                      </a>
                    </div>
                  )}
                  {/* Google Maps embed */}
                  {ev.latitude && ev.longitude && (
                    <iframe
                      src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${ev.latitude},${ev.longitude}&zoom=15`}
                      width="100%" height="180"
                      className="rounded-xl border-0 mt-2 w-full"
                      loading="lazy" allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      title={ev.venue}
                    />
                  )}
                </div>
              </div>
            )}

            {/* About */}
            <div className={`rounded-2xl border overflow-hidden ${d(dark,"bg-white/4 border-white/8","bg-white border-stone-200")}`}>
              <div className={`px-5 py-3 border-b text-[10px] font-black uppercase tracking-widest ${d(dark,"border-white/8 text-white/30","border-stone-100 text-stone-400")}`}>
                📝 About this event
              </div>
              <div className="px-5 py-4">
                <p className={`text-sm leading-relaxed whitespace-pre-line ${d(dark,"text-white/70","text-stone-700")}`}>
                  {ev.description}
                </p>
              </div>
            </div>
          </div>

          {/* ── Right: stats sidebar ── */}
          <div className="space-y-4">

            {/* Occupancy ring card */}
            <div className={`rounded-2xl border p-5 text-center ${d(dark,"bg-white/4 border-white/8","bg-white border-stone-200")}`}>
              <p className={`text-[10px] font-black uppercase tracking-widest mb-4 ${d(dark,"text-white/30","text-stone-400")}`}>Occupancy</p>
              <div className="relative inline-flex items-center justify-center">
                <Ring pct={occupancy} size={80} stroke={6} dark={dark}/>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-base font-black ${d(dark,"text-white","text-stone-900")}`}>{occupancy}%</span>
                </div>
              </div>
              <div className={`mt-4 grid grid-cols-2 gap-2 text-center pt-3 border-t ${d(dark,"border-white/8","border-stone-100")}`}>
                <div>
                  <p className={`text-lg font-black ${d(dark,"text-white","text-stone-900")}`}>{ev.rsvpCount.toLocaleString()}</p>
                  <p className={`text-[9px] font-black uppercase tracking-wider ${d(dark,"text-white/30","text-stone-400")}`}>RSVPs</p>
                </div>
                <div>
                  <p className={`text-lg font-black ${d(dark,"text-white","text-stone-900")}`}>{ev.capacity.toLocaleString()}</p>
                  <p className={`text-[9px] font-black uppercase tracking-wider ${d(dark,"text-white/30","text-stone-400")}`}>Capacity</p>
                </div>
              </div>
            </div>

            {/* Attendance */}
            <StatCard dark={dark} label="Attendance" value={ev.attendance.toLocaleString()}
              sub={`of ${ev.rsvpCount} who RSVP'd`}
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>}
            />

            {/* Ticket info */}
            <StatCard dark={dark}
              label={ev.isFree ? "Ticket Type" : "Ticket Price"}
              value={ev.isFree ? "Free" : `₹${ev.ticketPrice}`}
              sub={ev.isFree ? "Open to all" : "Per person"}
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M2 9a3 3 0 010 6v2a2 2 0 002 2h16a2 2 0 002-2v-2a3 3 0 010-6V7a2 2 0 00-2-2H4a2 2 0 00-2 2v2z"/></svg>}
            />

            {/* Slug */}
            {ev.slug && (
              <div className={`rounded-2xl border p-4 ${d(dark,"bg-white/4 border-white/8","bg-white border-stone-200")}`}>
                <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${d(dark,"text-white/30","text-stone-400")}`}>🔗 Slug</p>
                <code className={`text-xs font-mono break-all ${d(dark,"text-amber-400","text-amber-600")}`}>/{ev.slug}</code>
              </div>
            )}

            {/* Quick actions */}
            <div className="space-y-2">
              <a href={`/organizer/update-event/${ev.id}`}
                className={`flex items-center gap-2.5 w-full px-4 py-3 rounded-xl text-sm font-black transition-all
                  ${d(dark,"bg-white/6 text-white hover:bg-white/10 border border-white/8","bg-white text-stone-800 hover:bg-stone-50 border border-stone-200")}`}>
                <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit Event
              </a>
              <button onClick={() => router.replace("/organizer/dashboard")}
                className={`flex items-center gap-2.5 w-full px-4 py-3 rounded-xl text-sm font-black transition-all
                  ${d(dark,"bg-white/6 text-white hover:bg-white/10 border border-white/8","bg-white text-stone-800 hover:bg-stone-50 border border-stone-200")}`}>
                <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}