"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { TYPE_META } from "@/components/EventCard";
import type { Event } from "@/components/EventCard";

// ─── Extended event shape ─────────────────────────────────────────────────────
interface EventDetail extends Event {
  images:        string[];
  about:         string;
  schedule:      { time: string; title: string; detail: string; isHeadline?: boolean }[];
  highlights:    string[];
  faqs:          { q: string; a: string }[];
  relatedEvents: Event[];
}

// ─── Dummy data — swap with fetchEvent(params.event_id) ───────────────────────
const EVENT: EventDetail = {
  id: "1",
  title: "Sunburn Arena ft. Martin Garrix",
  type: "Music",
  description: "India's premier electronic music festival returns with a massive lineup.",
  about: `Sunburn Arena returns to Delhi for its most ambitious edition yet. Martin Garrix — the Dutch DJ who became the world's #1 at just 17 — headlines a production unlike anything India has witnessed: a 120-metre LED wall, 40-metre pyro towers, and a sound system that could fill a city block.\n\nThe night opens with a curated lineup of India's finest electronic acts across two stages. As midnight approaches, Garrix takes command for a three-hour set spanning his biggest anthems, unreleased material, and genre-defying collabs.\n\nExpect laser cannons, confetti storms, and 20,000 fellow believers losing themselves in the music. There are no tourists here — only tribe.`,
  date: "2025-08-12T19:00:00",
  venue: "JLN Stadium, New Delhi",
  tags: ["EDM", "Festival", "Live", "Electronic", "DJ"],
  image_url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=85",
  images: [
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=85",
    "https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=1200&q=85",
    "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200&q=85",
    "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1200&q=85",
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=85",
  ],
  attendance: 18400,
  organizerName: "Percept Live",
  organizer: "perceptlive",
  organizerProfilepic: "https://i.pravatar.cc/80?img=11",
  latitude: 28.5867, longitude: 77.2355, organizerId: "org1",
  schedule: [
    { time: "6:30 PM",  title: "VIP & Premium Gates Open", detail: "Early entry for VIP & Premium ticket holders" },
    { time: "7:00 PM",  title: "General Gates Open",       detail: "All gates open. Security check at all entrances" },
    { time: "7:30 PM",  title: "Opening Acts — Stage 2",   detail: "Local Delhi artists warm up the crowd" },
    { time: "8:30 PM",  title: "BLOT! Live",               detail: "Bengaluru's experimental techno duo" },
    { time: "9:30 PM",  title: "Arjun Vagale",             detail: "India's techno ambassador plays a special set" },
    { time: "10:30 PM", title: "Production Showcase",      detail: "Pyrotechnics, CO₂ cannons, full LED takeover" },
    { time: "11:00 PM", title: "Martin Garrix",            detail: "Headline set — 3 hours of pure euphoria", isHeadline: true },
    { time: "2:00 AM",  title: "Afterparty @ Club 1",      detail: "VIP wristbands grant access" },
  ],
  highlights: [
    "120-metre dual-sided LED stage wall",
    "40-metre pyrotechnics towers left & right",
    "d&b Audiotechnik J-Series line array system",
    "Confetti + CO₂ cannon volleys at midnight",
    "Dedicated VIP deck with elevated viewing",
    "6 premium F&B zones across the arena",
    "Official merch pop-up — exclusive Night Run capsule",
    "Accessible viewing platforms & hearing loops",
  ],
  faqs: [
    { q: "What time do gates open?",  a: "General gates open at 7:00 PM. VIP & Premium gates open at 6:30 PM." },
    { q: "Are cameras allowed?",      a: "Personal cameras without detachable lenses are permitted. Professional equipment is not." },
    { q: "Is re-entry allowed?",      a: "No re-entry once you exit the venue." },
    { q: "What's the age limit?",     a: "18+ only. Valid government-issued photo ID required at entry." },
    { q: "Is there parking?",         a: "Limited parking at Gate 7. We strongly recommend metro — JLN Stadium Metro Station is a 5-min walk." },
    { q: "Can I bring my own food?",  a: "Outside food and beverages are not permitted. 6 F&B zones are inside." },
  ],
  relatedEvents: [
    {
      id: "r1", title: "Nucleya Live — The Bass God Returns", type: "Music",
      description: "Delhi's most anticipated bass music event of the year.",
      date: "2025-09-03T20:00:00", venue: "Jawaharlal Nehru Stadium, Delhi",
      tags: ["Bass", "Electronic"],
      image_url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80",
      attendance: 12000, organizerName: "OML Entertainment", organizer: "omlive",
      organizerProfilepic: "https://i.pravatar.cc/40?img=30",
      latitude: 28.5823, longitude: 77.2337, organizerId: "orgR1",
    },
    {
      id: "r2", title: "Delhi Tech Summit 2025", type: "Tech",
      description: "Two days of AI, cloud infra, and developer tooling. 80+ speakers.",
      date: "2025-08-18T09:00:00", venue: "Bharat Mandapam, Pragati Maidan",
      tags: ["AI", "Web3"],
      image_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80",
      attendance: 4200, organizerName: "TechIndia Foundation", organizer: "techindia",
      organizerProfilepic: "https://i.pravatar.cc/40?img=12",
      latitude: 28.6189, longitude: 77.2438, organizerId: "org2",
    },
    {
      id: "r3", title: "Lodhi Art District Open Day", type: "Art",
      description: "Step inside the world's largest open-air art district.",
      date: "2025-08-25T10:00:00", venue: "Lodhi Colony, New Delhi",
      tags: ["Mural", "Contemporary", "Free"],
      image_url: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=600&q=80",
      attendance: 800, organizerName: "St+art India", organizer: "startindia",
      organizerProfilepic: "https://i.pravatar.cc/40?img=16",
      latitude: 28.5906, longitude: 77.2256, organizerId: "org4",
    },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtFull  = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const fmtShort = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const fmtTime  = (iso: string) => new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

// ─── Countdown ────────────────────────────────────────────────────────────────
function Countdown({ target }: { target: string }) {
  const calc = () => Math.max(0, new Date(target).getTime() - Date.now());
  const [ms, setMs] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setMs(calc()), 1000);
    return () => clearInterval(id);
  }, [target]);
  const units = [
    { v: Math.floor(ms / 86400000),                       l: "D" },
    { v: Math.floor((ms % 86400000) / 3600000),           l: "H" },
    { v: Math.floor((ms % 3600000) / 60000),              l: "M" },
    { v: Math.floor((ms % 60000) / 1000),                 l: "S" },
  ];
  return (
    <div className="flex items-center gap-1.5">
      {units.map(({ v, l }, i) => (
        <div key={l} className="flex items-center gap-1.5">
          <div className="flex flex-col items-center">
            <span className="text-amber-400 font-black text-sm tabular-nums leading-none"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {String(v).padStart(2, "0")}
            </span>
            <span className="text-white/25 text-[8px] font-black tracking-widest mt-0.5">{l}</span>
          </div>
          {i < 3 && <span className="text-white/20 text-xs font-black mb-2">:</span>}
        </div>
      ))}
    </div>
  );
}

// ─── Compact Carousel ─────────────────────────────────────────────────────────
function Carousel({ images, title }: { images: string[]; title: string }) {
  const [cur, setCur]         = useState(0);
  const [dragStart, setDragStart] = useState(0);
  const [dragging, setDragging]   = useState(false);
  const [dx, setDx]           = useState(0);
  const autoRef               = useRef<ReturnType<typeof setInterval> | null>(null);
  const n                     = images.length;

  const stopAuto = useCallback(() => { if (autoRef.current) clearInterval(autoRef.current); }, []);
  const go = useCallback((idx: number) => setCur(((idx % n) + n) % n), [n]);

  useEffect(() => {
    autoRef.current = setInterval(() => go(cur + 1), 5000);
    return stopAuto;
  }, [cur, go, stopAuto]);

  const pd = (x: number) => { setDragging(true); setDragStart(x); stopAuto(); };
  const pm = (x: number) => { if (dragging) setDx(x - dragStart); };
  const pu = () => { if (dx < -50) go(cur + 1); else if (dx > 50) go(cur - 1); setDragging(false); setDx(0); };

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl select-none cursor-grab active:cursor-grabbing"
      onMouseDown={e => pd(e.clientX)} onMouseMove={e => pm(e.clientX)} onMouseUp={pu} onMouseLeave={pu}
      onTouchStart={e => pd(e.touches[0].clientX)} onTouchMove={e => pm(e.touches[0].clientX)} onTouchEnd={pu}
    >
      {/* Track */}
      <div className="absolute inset-0 flex"
        style={{
          width: `${n * 100}%`,
          transform: `translateX(calc(${-cur * (100 / n)}% + ${dx / n}px))`,
          transition: dragging ? "none" : "transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)",
        }}>
        {images.map((src, i) => (
          <div key={i} className="relative flex-shrink-0 h-full" style={{ width: `${100 / n}%` }}>
            <img src={src} alt={`${title} ${i + 1}`} className="w-full h-full object-cover" draggable={false} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20" />
          </div>
        ))}
      </div>

      {/* Arrows */}
      {[{ d: -1, s: "left-3", a: "‹" }, { d: 1, s: "right-3", a: "›" }].map(({ d, s, a }) => (
        <button key={d} onClick={e => { e.stopPropagation(); stopAuto(); go(cur + d); }}
          className={`absolute ${s} top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/40 border border-white/15 backdrop-blur-sm text-white/70 hover:text-white hover:bg-black/65 transition-all text-xl font-light flex items-center justify-center hover:scale-110`}>
          {a}
        </button>
      ))}

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
        {images.map((_, i) => (
          <button key={i} onClick={() => { stopAuto(); go(i); }}
            className={`rounded-full transition-all duration-300 ${i === cur ? "w-5 h-1.5 bg-amber-400" : "w-1.5 h-1.5 bg-white/35 hover:bg-white/65"}`} />
        ))}
      </div>

      {/* Counter */}
      <div className="absolute top-3 right-3 z-10 bg-black/40 backdrop-blur-sm border border-white/10 rounded-full px-2.5 py-1 text-white/50 text-[10px] font-bold">
        {cur + 1}/{n}
      </div>
    </div>
  );
}

// ─── FAQ item ─────────────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/7 last:border-0">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 text-left gap-4 group">
        <span className={`text-sm font-medium transition-colors ${open ? "text-white" : "text-white/60 group-hover:text-white/85"}`}>{q}</span>
        <div className={`w-5 h-5 flex-shrink-0 rounded-full border flex items-center justify-center transition-all duration-300 ${open ? "border-amber-400/50 bg-amber-400/10 text-amber-400 rotate-45" : "border-white/12 text-white/25"}`}>
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14"/>
          </svg>
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-40 opacity-100 pb-4" : "max-h-0 opacity-0"}`}>
        <p className="text-white/40 text-sm leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

// ─── Related mini-card ────────────────────────────────────────────────────────
function RelatedCard({ ev }: { ev: Event }) {
  const tc = TYPE_META[ev.type] ?? TYPE_META.default;
  return (
    <a href={`/events/${ev.id}`}
      className="group flex gap-3 bg-white/3 border border-white/7 hover:border-white/16 rounded-xl p-3 transition-all hover:-translate-y-0.5">
      <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
        <img src={ev.image_url} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div className="flex flex-col justify-between min-w-0 py-0.5">
        <div>
          <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full mb-1 ${tc.bg} ${tc.text}`}>
            <span className={`w-1 h-1 rounded-full ${tc.dot}`} />{ev.type}
          </span>
          <div className="text-white/75 text-xs font-semibold leading-snug line-clamp-2 group-hover:text-white transition-colors">{ev.title}</div>
        </div>
        <div className="text-white/25 text-[10px]">{fmtShort(ev.date)}</div>
      </div>
    </a>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav({ solid }: { solid: boolean }) {
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-5 transition-all duration-300 ${solid ? "bg-[#0d0f17]/96 backdrop-blur-xl border-b border-white/6" : "bg-[#0d0f17]/80 backdrop-blur-sm"}`}>
      <div className="max-w-6xl mx-auto w-full flex items-center gap-3">
        <a href="/discover" className="flex items-center gap-1.5 text-white/40 hover:text-white/80 transition-colors text-sm font-semibold">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span className="hidden sm:block">Discover</span>
        </a>
        <div className="w-px h-4 bg-white/10" />
        <a href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <span className="text-white font-black text-base hidden sm:block" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>eventimist</span>
        </a>
        <div className="ml-auto flex items-center gap-2">
          <button className="w-8 h-8 rounded-xl flex items-center justify-center text-white/35 hover:text-white/70 hover:bg-white/6 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </button>
          <a href="/user" className="text-sm font-black bg-gradient-to-r from-amber-400 to-orange-500 text-[#0d0f17] px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-amber-400/25 hover:scale-[1.02] transition-all">
            Sign In
          </a>
        </div>
      </div>
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function EventDetailPage() {
  const e  = EVENT;
  const tc = TYPE_META[e.type] ?? TYPE_META.default;

  const [scrolled,  setScrolled]  = useState(false);
  const [activeTab, setActiveTab] = useState<"about" | "schedule" | "faq">("about");
  const [saved,     setSaved]     = useState(false);
  const [rsvpDone,  setRsvpDone]  = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; background: #0d0f17; color: white; font-family: 'DM Sans', system-ui, sans-serif; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 99px; }

        .page-enter   { animation: pgEnter .65s cubic-bezier(0.16,1,0.3,1) both; }
        .d1 { animation-delay: .08s; } .d2 { animation-delay: .18s; }
        .d3 { animation-delay: .28s; } .d4 { animation-delay: .42s; }
        @keyframes pgEnter { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }

        .fade-up { animation: fadeUp .5s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }

        .tab-line { position:relative; padding-bottom: 12px; }
        .tab-line::after {
          content:''; position:absolute; bottom:0; left:0; right:0;
          height:2px; background:#f59e0b; border-radius:99px;
          transform:scaleX(0); transform-origin:left;
          transition:transform .22s cubic-bezier(0.34,1.56,0.64,1);
        }
        .tab-line.on::after { transform:scaleX(1); }

        .pulse-dot { animation: pd 2.2s ease-in-out infinite; }
        @keyframes pd { 0%,100%{box-shadow:0 0 0 0 rgba(251,191,36,.5)} 50%{box-shadow:0 0 0 7px rgba(251,191,36,0)} }

        .rsvp-glow:not(:disabled):hover { box-shadow: 0 0 32px rgba(251,191,36,.35); }
      `}</style>

      <div className="min-h-screen bg-[#0d0f17]">
        <Nav solid={scrolled} />

        {/* ══════════════════════════════════════════════════════
            HERO — compact carousel + title block side by side
        ══════════════════════════════════════════════════════ */}
        <div className="max-w-6xl mx-auto px-5 pt-24 pb-10">
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* Carousel — compact, fixed height */}
            <div className="page-enter d1 w-full lg:w-[52%] flex-shrink-0">
              <div style={{ height: 420 }} className="rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
                <Carousel images={e.images} title={e.title} />
              </div>

              {/* Thumbnail strip below carousel */}
              <div className="flex gap-2 mt-3">
                {e.images.slice(0, 5).map((src, i) => (
                  <div key={i} className="flex-1 h-12 rounded-lg overflow-hidden opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* Title + meta + actions */}
            <div className="flex-1 min-w-0 pt-1">

              {/* Type badge + countdown inline */}
              <div className="page-enter d1 flex items-center justify-between mb-4">
                <span className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full border border-white/12 ${tc.bg} ${tc.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${tc.dot}`} />{e.type}
                </span>
                <Countdown target={e.date} />
              </div>

              {/* Title */}
              <h1 className="page-enter d2 text-3xl sm:text-4xl font-black text-white leading-[1.07] tracking-tight mb-5"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                {e.title}
              </h1>

              {/* Key info pills */}
              <div className="page-enter d3 flex flex-col gap-2.5 mb-6">
                {[
                  {
                    icon: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
                    val: `${fmtFull(e.date)} · ${fmtTime(e.date)}`,
                  },
                  {
                    icon: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></>,
                    val: e.venue,
                  },
                  {
                    icon: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>,
                    val: `${e.attendance.toLocaleString()} attending`,
                  },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-white/55 text-sm">
                    <svg className="w-4 h-4 text-amber-400/60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">{row.icon}</svg>
                    <span>{row.val}</span>
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div className="page-enter d3 flex flex-wrap gap-2 mb-7">
                {e.tags.map(t => (
                  <span key={t} className="text-xs font-semibold text-white/35 bg-white/4 border border-white/8 rounded-full px-3 py-1 hover:border-white/20 hover:text-white/60 transition-all cursor-pointer">
                    #{t}
                  </span>
                ))}
              </div>

              {/* Action buttons */}
              <div className="page-enter d4 flex flex-wrap gap-3 mb-6">
                {/* RSVP */}
                <button
                  onClick={() => setRsvpDone(r => !r)}
                  className={`rsvp-glow flex items-center gap-2 font-black px-6 py-3 rounded-xl text-sm transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] ${
                    rsvpDone
                      ? "bg-emerald-500/20 border border-emerald-400/40 text-emerald-300"
                      : "bg-gradient-to-r from-amber-400 to-orange-500 text-[#0d0f17]"
                  }`}>
                  {rsvpDone ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      RSVP'd
                    </>
                  ) : (
                    <>
                      RSVP Now
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                      </svg>
                    </>
                  )}
                </button>

                {/* Save */}
                <button onClick={() => setSaved(s => !s)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold border transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] ${
                    saved
                      ? "bg-rose-500/15 border-rose-400/40 text-rose-300"
                      : "bg-white/4 border-white/10 text-white/55 hover:bg-white/8 hover:text-white hover:border-white/22"
                  }`}>
                  <svg className={`w-4 h-4 transition-all ${saved ? "fill-rose-400 stroke-rose-400" : "fill-none stroke-current"}`} viewBox="0 0 24 24" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                  </svg>
                  {saved ? "Saved" : "Save"}
                </button>

                {/* Share */}
                <button className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-white/4 border border-white/10 text-white/55 hover:bg-white/8 hover:text-white hover:border-white/22 transition-all hover:scale-[1.03] active:scale-[0.97]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                  Share
                </button>
              </div>

              {/* Organiser strip */}
              <div className="page-enter d4 flex items-center gap-3 bg-white/3 border border-white/7 rounded-xl px-4 py-3">
                <img src={e.organizerProfilepic} alt={e.organizerName}
                  className="w-9 h-9 rounded-xl object-cover ring-2 ring-white/10 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-white/75 text-xs font-bold">{e.organizerName}</div>
                  <div className="text-white/28 text-[10px]">@{e.organizer} · Organiser</div>
                </div>
                <a href={`/organizers/${e.organizerId}`}
                  className="ml-auto flex-shrink-0 text-[10px] font-bold text-white/35 border border-white/10 px-3 py-1.5 rounded-lg hover:border-white/25 hover:text-white/65 transition-all">
                  Profile
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            DIVIDER
        ══════════════════════════════════════════════════════ */}
        <div className="max-w-6xl mx-auto px-5">
          <div className="border-t border-white/6" />
        </div>

        {/* ══════════════════════════════════════════════════════
            BODY — left content + right sidebar
        ══════════════════════════════════════════════════════ */}
        <div className="max-w-6xl mx-auto px-5 py-10">
          <div className="flex flex-col lg:flex-row gap-10 xl:gap-14">

            {/* ────────────── LEFT: tabs + venue + organiser ────────────── */}
            <div className="flex-1 min-w-0 space-y-12">

              {/* Tab bar */}
              <div>
                <div className="flex items-center gap-7 border-b border-white/8 mb-8">
                  {(["about", "schedule", "faq"] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`tab-line text-sm font-bold capitalize transition-colors ${activeTab === tab ? "on text-white" : "text-white/30 hover:text-white/60"}`}>
                      {tab === "faq" ? "FAQ" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                {/* ABOUT */}
                {activeTab === "about" && (
                  <div className="fade-up space-y-8">
                    <div className="space-y-4">
                      {e.about.split("\n\n").map((p, i) => (
                        <p key={i} className="text-white/55 text-sm leading-[1.9]">{p}</p>
                      ))}
                    </div>

                    <div>
                      <h3 className="text-white font-black text-base mb-4" style={{ fontFamily: "'Playfair Display',Georgia,serif" }}>
                        What to expect
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-2.5">
                        {e.highlights.map((h, i) => (
                          <div key={i} className="flex items-start gap-3 bg-white/3 border border-white/6 rounded-xl px-4 py-3 hover:border-white/12 transition-colors">
                            <div className="w-4 h-4 flex-shrink-0 rounded-full bg-amber-400/12 border border-amber-400/22 flex items-center justify-center mt-0.5">
                              <svg className="w-2.5 h-2.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            </div>
                            <span className="text-white/50 text-xs leading-relaxed">{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SCHEDULE */}
                {activeTab === "schedule" && (
                  <div className="fade-up">
                    {e.schedule.map((item, i) => (
                      <div key={i} className="flex gap-4 group">
                        <div className="flex flex-col items-center flex-shrink-0 w-[60px]">
                          <div className={`w-2.5 h-2.5 rounded-full border-2 flex-shrink-0 mt-1.5 transition-all duration-300 group-hover:scale-125 ${
                            item.isHeadline ? "border-amber-400 bg-amber-400 pulse-dot" : "border-white/18 bg-[#0d0f17] group-hover:border-white/45"
                          }`} />
                          {i < e.schedule.length - 1 && <div className="w-px flex-1 bg-white/6 my-1.5" />}
                        </div>
                        <div className={`flex-1 ${i < e.schedule.length - 1 ? "pb-6" : "pb-0"}`}>
                          <div className="text-white/25 text-[10px] font-black tracking-[0.14em] uppercase mb-1">{item.time}</div>
                          <div className={`font-bold text-sm mb-1 ${item.isHeadline ? "text-amber-400" : "text-white/80"}`}
                            style={item.isHeadline ? { fontFamily: "'Playfair Display',Georgia,serif", fontSize: "1rem" } : undefined}>
                            {item.title}
                            {item.isHeadline && (
                              <span className="ml-2 text-[9px] font-black bg-amber-400/15 border border-amber-400/25 text-amber-400 px-2 py-0.5 rounded-full tracking-wider align-middle">
                                HEADLINE
                              </span>
                            )}
                          </div>
                          <div className="text-white/30 text-xs">{item.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* FAQ */}
                {activeTab === "faq" && (
                  <div className="fade-up">
                    {e.faqs.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
                  </div>
                )}
              </div>

              {/* Venue */}
              <div>
                <h3 className="text-white font-black text-base mb-4" style={{ fontFamily: "'Playfair Display',Georgia,serif" }}>
                  Venue
                </h3>
                <div className="bg-white/3 border border-white/7 rounded-2xl overflow-hidden">
                  <div className="relative h-44 bg-[#0f111a] flex items-center justify-center overflow-hidden">
                    <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id="vg" width="40" height="40" patternUnits="userSpaceOnUse">
                          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#vg)"/>
                    </svg>
                    <div className="relative flex flex-col items-center z-10">
                      <div className="w-11 h-11 rounded-2xl bg-amber-400/12 border border-amber-400/22 flex items-center justify-center mb-3">
                        <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                      </div>
                      <div className="text-white/65 text-sm font-semibold">{e.venue}</div>
                      <div className="text-white/25 text-xs mt-1">{e.latitude.toFixed(4)}°N · {e.longitude.toFixed(4)}°E</div>
                    </div>
                  </div>
                  <div className="px-4 py-3.5 flex items-center justify-between">
                    <div>
                      <div className="text-white/70 text-sm font-semibold">{e.venue}</div>
                      <div className="text-white/28 text-xs mt-0.5">New Delhi, India</div>
                    </div>
                    <a href={`https://maps.google.com/?q=${e.latitude},${e.longitude}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/18 px-3.5 py-2 rounded-xl hover:bg-amber-400/18 transition-all">
                      Open Maps
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                        <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* ────────────── RIGHT SIDEBAR ────────────── */}
            <div className="lg:w-[300px] xl:w-[320px] flex-shrink-0">
              <div className="lg:sticky lg:top-20 space-y-5">

                {/* Quick info card */}
                <div className="bg-[#13151f] border border-white/9 rounded-2xl p-5 space-y-4">
                  <div className="text-white/25 text-[10px] font-black uppercase tracking-[0.16em]">Event Details</div>

                  {[
                    { icon: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>, label: "Date",     val: fmtShort(e.date) },
                    { icon: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,                                                                                                     label: "Time",     val: fmtTime(e.date) },
                    { icon: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></>,                                                                                   label: "Venue",    val: e.venue.split(",")[0] },
                    { icon: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>,               label: "Going",    val: `${e.attendance.toLocaleString()}+` },
                    { icon: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,                                                                                                                  label: "Age",      val: "18+ only" },
                    { icon: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></>,                                                                         label: "Entry",    val: "Paid event" },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 text-white/28">
                        <svg className="w-3.5 h-3.5 text-amber-400/50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">{row.icon}</svg>
                        <span className="text-xs font-semibold">{row.label}</span>
                      </div>
                      <span className="text-white/65 text-xs font-bold text-right max-w-[52%] leading-snug">{row.val}</span>
                    </div>
                  ))}

                  {/* RSVP button inside sidebar too */}
                  <div className="pt-2 border-t border-white/6">
                    <button onClick={() => setRsvpDone(r => !r)}
                      className={`rsvp-glow w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.97] ${
                        rsvpDone
                          ? "bg-emerald-500/20 border border-emerald-400/35 text-emerald-300"
                          : "bg-gradient-to-r from-amber-400 to-orange-500 text-[#0d0f17]"
                      }`}>
                      {rsvpDone ? (
                        <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>You're going!</>
                      ) : (
                        <>RSVP to this event<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg></>
                      )}
                    </button>
                  </div>
                </div>

                {/* Attendee faces */}
                <div className="bg-white/3 border border-white/7 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white/45 text-xs font-bold">Attendees</span>
                    <span className="text-white/25 text-xs">{e.attendance.toLocaleString()} going</span>
                  </div>
                  <div className="flex items-center">
                    <div className="flex -space-x-2">
                      {Array.from({ length: 8 }, (_, i) => (
                        <img key={i} src={`https://i.pravatar.cc/32?img=${i + 5}`} alt=""
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-[#0d0f17]" />
                      ))}
                    </div>
                    <div className="ml-3 flex flex-col">
                      <span className="text-white/55 text-xs font-semibold">+{(e.attendance - 8).toLocaleString()} more</span>
                      <span className="text-white/25 text-[10px]">have RSVP'd</span>
                    </div>
                  </div>
                </div>

                {/* Related events */}
                <div>
                  <div className="text-white/25 text-[10px] font-black uppercase tracking-[0.16em] mb-3.5 px-0.5">
                    More like this
                  </div>
                  <div className="space-y-2">
                    {e.relatedEvents.map(ev => <RelatedCard key={ev.id} ev={ev} />)}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 py-7 px-5 mt-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <span className="text-white/20 text-xs font-semibold">eventimist © 2025</span>
            </div>
            <div className="flex items-center gap-5 text-white/20 text-xs font-semibold">
              {["Privacy", "Terms", "Help"].map(l => (
                <a key={l} href="#" className="hover:text-white/45 transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}