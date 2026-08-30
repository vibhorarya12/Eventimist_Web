"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── Carousel slides ──────────────────────────────────────────────────────────
const slides = [
  {
    url: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1600&q=85",
    category: "Community Service",
    headline: "Show Up. Make\nIt Count.",
    sub: "Local NGOs need hands-on helpers for food drives, education camps & clean-up missions.",
    accent: "#f59e0b",
  },
  {
    url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1600&q=85",
    category: "Medical Camps",
    headline: "Your Skills\nSave Lives.",
    sub: "Healthcare volunteers assist doctors in rural camps, first-aid drives and wellness events.",
    accent: "#10b981",
  },
  {
    url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600&q=85",
    category: "Education",
    headline: "Teach One.\nReach Many.",
    sub: "Educators, mentors and tutors connect with schools, NGOs and skill-development orgs.",
    accent: "#6366f1",
  },
  {
    url: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=1600&q=85",
    category: "Disaster Relief",
    headline: "Ready When\nThey Need You.",
    sub: "First responders and logistics volunteers get matched to relief organisations instantly.",
    accent: "#ef4444",
  },
  {
    url: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1600&q=85",
    category: "Environment",
    headline: "Every Tree\nTells Your Story.",
    sub: "Environmental volunteers plant, protect and restore ecosystems with local green groups.",
    accent: "#22c55e",
  },
];

// ─── Full-bleed hero carousel ─────────────────────────────────────────────────
function HeroCarousel({ onSlideChange }: { onSlideChange: (i: number) => void }) {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback(
    (idx: number) => {
      if (animating || idx === current) return;
      setAnimating(true);
      setPrev(current);
      setCurrent(idx);
      onSlideChange(idx);
      setTimeout(() => { setPrev(null); setAnimating(false); }, 900);
    },
    [animating, current, onSlideChange]
  );

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo]);
  const goBack = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, goTo]);

  useEffect(() => {
    timerRef.current = setTimeout(next, 5500);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, next]);

  return (
    <div className="absolute inset-0">
      {slides.map((s, i) => {
        const isActive = i === current;
        const isPrev = i === prev;
        return (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-900 ease-in-out"
            style={{
              opacity: isActive ? 1 : isPrev ? 0 : 0,
              zIndex: isActive ? 2 : isPrev ? 1 : 0,
            }}
          >
            <img
              src={s.url}
              alt={s.category}
              className="w-full h-full object-cover"
              style={{
                transform: isActive ? "scale(1)" : "scale(1.04)",
                transition: "transform 6s ease-out",
              }}
            />
            {/* Multi-layer gradient for deep contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
          </div>
        );
      })}

      {/* Arrow controls */}
      <button
        onClick={goBack}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 group"
      >
        <svg className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={next}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 group"
      >
        <svg className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Slide counter + dots — bottom right */}
      <div className="absolute bottom-8 right-8 z-20 flex items-center gap-4">
        <span className="text-white/30 font-mono text-xs">
          <span className="text-white/80 font-bold text-sm">{String(current + 1).padStart(2, "0")}</span>
          {" / "}
          {String(slides.length).padStart(2, "0")}
        </span>
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-400 ${i === current ? "w-7 h-1.5 bg-amber-400" : "w-1.5 h-1.5 bg-white/30 hover:bg-white/60"
                }`}
            />
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10 z-20">
        <div key={current} className="h-full bg-amber-400 vol-progress" />
      </div>
    </div>
  );
}

// ─── Skill tag chip ───────────────────────────────────────────────────────────
const SKILL_CATEGORIES = [
  { icon: "🏥", label: "Medical", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
  { icon: "👩‍🏫", label: "Teaching", color: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20" },
  { icon: "💻", label: "Tech", color: "bg-sky-500/15 text-sky-400 border-sky-500/20" },
  { icon: "🎨", label: "Creative", color: "bg-pink-500/15 text-pink-400 border-pink-500/20" },
  { icon: "🔧", label: "Engineering", color: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  { icon: "🌱", label: "Environment", color: "bg-green-500/15 text-green-400 border-green-500/20" },
  { icon: "📸", label: "Photography", color: "bg-purple-500/15 text-purple-400 border-purple-500/20" },
  { icon: "🎙️", label: "Event Mgmt", color: "bg-rose-500/15 text-rose-400 border-rose-500/20" },
  { icon: "🚗", label: "Logistics", color: "bg-orange-500/15 text-orange-400 border-orange-500/20" },
  { icon: "🍳", label: "Catering", color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20" },
  { icon: "🧠", label: "Counselling", color: "bg-violet-500/15 text-violet-400 border-violet-500/20" },
  { icon: "🗣️", label: "Translation", color: "bg-teal-500/15 text-teal-400 border-teal-500/20" },
];

// ─── Waitlist form ────────────────────────────────────────────────────────────
function WaitlistForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [skill, setSkill] = useState("");
  const [city, setCity] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(2847);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setCount((c) => c + 1);
    }, 1600);
  };

  if (submitted) {
    return (
      <div className="text-center py-4">
        <div className="relative inline-flex items-center justify-center w-16 h-16 mb-5">
          <div className="absolute inset-0 rounded-full bg-amber-400/20 animate-ping" />
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/30">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h4 className="text-white font-black text-xl mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          You're on the list!
        </h4>
        <p className="text-stone-400 text-sm leading-relaxed max-w-xs mx-auto">
          We'll notify you the moment Volunteer Match launches. You're #{count.toLocaleString()} in line.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-4 py-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-amber-400 text-xs font-bold">{count.toLocaleString()} volunteers waitlisted</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold text-stone-500 mb-1.5 tracking-widest uppercase">Your Name</label>
          <input
            value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Riya Sharma" required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 hover:border-white/20 focus:border-amber-400/60 focus:bg-white/8 focus:ring-2 focus:ring-amber-400/20 rounded-xl text-sm text-white placeholder:text-stone-600 outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-stone-500 mb-1.5 tracking-widest uppercase">City</label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
            <input
              value={city} onChange={(e) => setCity(e.target.value)}
              placeholder="Meerut" required
              className="w-full pl-9 pr-3 py-3 bg-white/5 border border-white/10 hover:border-white/20 focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 rounded-xl text-sm text-white placeholder:text-stone-600 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold text-stone-500 mb-1.5 tracking-widest uppercase">Email Address</label>
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
          </svg>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="riya@example.com" required
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 hover:border-white/20 focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 rounded-xl text-sm text-white placeholder:text-stone-600 outline-none transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold text-stone-500 mb-1.5 tracking-widest uppercase">Primary Skill / Domain</label>
        <select
          value={skill} onChange={(e) => setSkill(e.target.value)} required
          className="w-full px-4 py-3 bg-white/5 border border-white/10 hover:border-white/20 focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 rounded-xl text-sm text-white outline-none transition-all appearance-none cursor-pointer"
          style={{ colorScheme: "dark" }}
        >
          <option value="" className="bg-stone-900">Select your skill...</option>
          {SKILL_CATEGORIES.map((s) => (
            <option key={s.label} value={s.label} className="bg-stone-900">{s.icon} {s.label}</option>
          ))}
        </select>
      </div>

      <button
        type="submit" disabled={loading}
        className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-stone-900 font-black py-4 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-amber-400/30 hover:scale-[1.01] active:scale-[0.99] text-sm flex items-center justify-center gap-2 mt-1"
      >
        {loading ? (
          <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Joining...</>
        ) : (
          <>Join the Waitlist <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg></>
        )}
      </button>

      <p className="text-stone-600 text-[10px] text-center">
        No spam. Early access guaranteed. Unsubscribe anytime.
      </p>
    </form>
  );
}

// ─── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, delay }: { icon: string; title: string; desc: string; delay: string }) {
  return (
    <div
      className="group bg-white/[0.04] hover:bg-white/[0.08] border border-white/8 hover:border-white/16 rounded-2xl p-6 transition-all duration-400 hover:-translate-y-1 cursor-default feat-card"
      style={{ animationDelay: delay }}
    >
      <div className="text-3xl mb-4">{icon}</div>
      <h4 className="text-white font-black text-base mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{title}</h4>
      <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function VolunteerPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  const slide = slides[currentSlide];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,900&family=DM+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; }
        html, body { margin: 0; background: #0c0a09; color: #fff; }

        /* Carousel progress */
        @keyframes vol-progress {
          from { width: 0%; }
          to   { width: 100%; }
        }
        .vol-progress { animation: vol-progress 5.5s linear forwards; }

        /* Page entrance */
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fade-up 0.7s cubic-bezier(0.16,1,0.3,1) forwards; opacity: 0; }

        /* Feature cards entrance */
        @keyframes feat-in {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .feat-card { animation: feat-in 0.6s ease-out both; opacity: 0; }

        /* Ticker */
        @keyframes ticker-left {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
        .ticker { animation: ticker-left 25s linear infinite; }

        /* Floating countdown ring */
        @keyframes spin-slow { to { transform: rotate(360deg); } }
        .spin-slow { animation: spin-slow 20s linear infinite; }

        /* Noise grain */
        .grain::after {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px;
          z-index: 9999;
        }

        /* Autofill */
        input:-webkit-autofill, select:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #0c0a09 inset !important;
          -webkit-text-fill-color: #fff !important;
        }

        /* Transition duration helpers */
        .duration-900 { transition-duration: 900ms; }
        .duration-400 { transition-duration: 400ms; }
      `}</style>

      <div className="grain min-h-screen bg-stone-950 text-white overflow-x-hidden">

        {/* ── Sticky Nav ───────────────────────────────────────────────────── */}
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12 py-5">
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span className="text-white font-black text-lg tracking-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              eventimist
            </span>
          </a>
          <div className="flex items-center gap-4">
            <a href="/" className="text-stone-500 hover:text-white text-sm transition-colors flex items-center gap-1.5 group">
              <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Home
            </a>
            <a href="/organize" className="text-stone-500 hover:text-white text-sm transition-colors">Organizers</a>
            <a href="/user" className="bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold text-xs px-4 py-2 rounded-xl transition-all hover:shadow-lg hover:shadow-amber-400/20">
              Sign In
            </a>
          </div>
        </nav>

        {/* ── HERO — full-bleed carousel ────────────────────────────────────── */}
        <section className="relative h-screen min-h-[640px]">
          <HeroCarousel onSlideChange={setCurrentSlide} />

          {/* Hero text content — left-aligned, over image */}
          <div className="absolute inset-0 z-10 flex flex-col justify-end pb-16 px-8 lg:px-16 xl:px-24 pointer-events-none">

            {/* Coming Soon badge */}
            <div
              className={`fade-up mb-6 pointer-events-auto`}
              style={{ animationDelay: "100ms" }}
            >
              <span className="inline-flex items-center gap-2.5 border border-amber-400/30 bg-amber-400/10 backdrop-blur-sm rounded-full px-4 py-2 text-xs font-bold tracking-widest uppercase text-amber-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                </span>
                Coming Soon — Volunteer Match
              </span>
            </div>

            {/* Category label */}
            <div
              key={currentSlide + "-cat"}
              className="fade-up text-white/40 text-xs font-bold tracking-widest uppercase mb-3 font-mono pointer-events-none"
              style={{ animationDelay: "0ms", fontFamily: "'DM Mono', monospace" }}
            >
              {slide.category}
            </div>

            {/* Main headline */}
            <h1
              key={currentSlide + "-h1"}
              className="fade-up text-white font-black leading-none tracking-tight mb-5 pointer-events-none"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "clamp(3rem, 8vw, 7rem)",
                animationDelay: "80ms",
                whiteSpace: "pre-line",
              }}
            >
              {slide.headline}
            </h1>

            {/* Subtext */}
            <p
              key={currentSlide + "-sub"}
              className="fade-up text-white/50 text-base lg:text-lg leading-relaxed max-w-lg mb-8 pointer-events-none"
              style={{ animationDelay: "160ms" }}
            >
              {slide.sub}
            </p>

            {/* Scroll hint */}
            <div className="fade-up flex items-center gap-3 pointer-events-none" style={{ animationDelay: "240ms" }}>
              <div className="flex flex-col items-center gap-1 opacity-40">
                <div className="w-px h-8 bg-white" />
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <span className="text-white/30 text-xs tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>
                Scroll to explore
              </span>
            </div>
          </div>

          {/* Waitlist float card — right side */}
          <div className="absolute right-8 lg:right-16 top-1/2 -translate-y-1/2 z-20 hidden xl:block w-96">
            <div className="bg-stone-950/80 backdrop-blur-xl border border-white/10 rounded-3xl p-7 shadow-2xl shadow-black/60">
              <div className="mb-5">
                <div className="text-amber-400 text-[10px] font-bold tracking-widest uppercase mb-1.5">Early Access</div>
                <h3 className="text-white font-black text-xl leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Be First to Volunteer
                </h3>
                <p className="text-stone-500 text-xs mt-1.5 leading-relaxed">
                  Register your skills now. When we launch, organizers will find you first.
                </p>
              </div>
              <WaitlistForm />
            </div>
          </div>
        </section>

        {/* ── Ticker strip ─────────────────────────────────────────────────── */}
        <div className="overflow-hidden bg-amber-400 py-3">
          <div className="flex ticker whitespace-nowrap">
            {[...Array(3)].flatMap((_, arrIdx) =>
              ["Volunteer Match", "Skill-based Opportunities", "Connect with Orgs", "Make an Impact", "Coming Soon", "Early Access Open"].map((t, i) => (
                <span key={`${arrIdx}-${i}`} className="mx-8 text-stone-900 text-xs font-black tracking-widest uppercase">
                  {t}
                  <span className="mx-8 text-stone-900/30">◆</span>
                </span>
              ))
            )}
          </div>
        </div>

        {/* ── What is Volunteer Match ───────────────────────────────────────── */}
        <section className="py-24 px-6 lg:px-16 xl:px-24 bg-stone-950">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">

              {/* Left: text */}
              <div>
                <span
                  className="text-amber-400 text-xs font-bold tracking-widest uppercase"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  What We're Building
                </span>
                <h2
                  className="mt-4 text-white text-4xl lg:text-5xl font-black leading-tight"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Your Skills Are<br />
                  <span className="italic text-amber-400">Worth Sharing</span>
                </h2>
                <p className="mt-6 text-stone-400 text-base leading-relaxed">
                  Volunteer Match is Eventimist's most ambitious feature yet — a two-sided marketplace where individuals with real, specific skills can discover volunteer opportunities that actually need them.
                </p>
                <p className="mt-4 text-stone-500 text-sm leading-relaxed">
                  No more generic "we need helpers." Doctors get matched to medical camps. Photographers get matched to charity galas. Developers get matched to NGO tech projects. It's precision volunteering — and it's coming.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  {["Skill-based Matching", "Org Verification", "Impact Tracking", "Certificate of Service"].map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1.5 bg-white/5 border border-white/8 rounded-full px-4 py-2 text-xs font-semibold text-stone-300"
                    >
                      <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right: skill categories grid */}
              <div className="grid grid-cols-3 gap-3">
                {SKILL_CATEGORIES.map(({ icon, label, color }) => (
                  <div
                    key={label}
                    className={`group border rounded-2xl px-4 py-5 text-center transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] cursor-default ${color}`}
                  >
                    <div className="text-2xl mb-2">{icon}</div>
                    <div className="text-xs font-bold">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── How it will work ─────────────────────────────────────────────── */}
        <section className="py-24 px-6 lg:px-16 xl:px-24 bg-stone-900/40 border-y border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span
                className="text-amber-400 text-xs font-bold tracking-widest uppercase"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                How It Works
              </span>
              <h2
                className="mt-4 text-white text-4xl lg:text-5xl font-black leading-tight"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Simple. Purposeful.<br />
                <span className="text-stone-500">Impactful.</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: "01",
                  icon: "🙋",
                  title: "Register Your Skills",
                  desc: "Tell us what you're good at — medical, teaching, tech, creative or logistics. Add your experience level and availability.",
                  color: "from-amber-500/10 to-orange-500/5 border-amber-500/15",
                },
                {
                  step: "02",
                  icon: "🔍",
                  title: "Browse Org Posts",
                  desc: "Organisations post their volunteer needs with specific skill requirements, dates and locations. Browse what matches you.",
                  color: "from-emerald-500/10 to-teal-500/5 border-emerald-500/15",
                },
                {
                  step: "03",
                  icon: "🤝",
                  title: "Connect Directly",
                  desc: "Apply to a post or let orgs discover your profile. Chat in-app, confirm availability and finalise your role.",
                  color: "from-indigo-500/10 to-violet-500/5 border-indigo-500/15",
                },
                {
                  step: "04",
                  icon: "🏅",
                  title: "Earn & Grow",
                  desc: "Complete your volunteer stint, receive a verified certificate, collect skill badges and build your impact profile.",
                  color: "from-rose-500/10 to-pink-500/5 border-rose-500/15",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  className={`relative bg-gradient-to-br ${s.color} border rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl`}
                >
                  {/* Connector line */}
                  {i < 3 && (
                    <div className="hidden lg:block absolute top-10 left-[calc(100%+0px)] w-6 h-px border-t border-dashed border-white/10 z-0" />
                  )}
                  <div className="flex items-start justify-between mb-5">
                    <span className="text-3xl">{s.icon}</span>
                    <span className="text-stone-700 font-black text-2xl" style={{ fontFamily: "'DM Mono', monospace" }}>{s.step}</span>
                  </div>
                  <h4
                    className="text-white font-black text-lg mb-3"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {s.title}
                  </h4>
                  <p className="text-stone-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Feature highlights ───────────────────────────────────────────── */}
        <section className="py-24 px-6 lg:px-16 xl:px-24 bg-stone-950">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <span
                className="text-amber-400 text-xs font-bold tracking-widest uppercase"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Platform Features
              </span>
              <h2
                className="mt-4 text-white text-4xl lg:text-5xl font-black"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Built for Real Impact
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              <FeatureCard delay="0ms" icon="🎯" title="Precision Matching" desc="Our algorithm pairs your exact skill set with organisation requirements — no generic mass applications." />
              <FeatureCard delay="80ms" icon="🔒" title="Verified Organisations" desc="Every organisation on the platform is verified. Volunteers can trust the source before they commit." />
              <FeatureCard delay="160ms" icon="📜" title="Digital Certificates" desc="Earn blockchain-stamped certificates of service after each volunteer stint — shareable on LinkedIn." />
              <FeatureCard delay="240ms" icon="📊" title="Impact Dashboard" desc="Track your hours, skills used, people helped and organisations supported — all in one profile." />
              <FeatureCard delay="320ms" icon="💬" title="In-app Messaging" desc="Coordinate directly with the organiser inside the app. No emails, no phone tags, just clarity." />
              <FeatureCard delay="400ms" icon="📍" title="Hyper-local Discovery" desc="Filter by your city, distance or cause. Find opportunities happening right around the corner." />
            </div>
          </div>
        </section>

        {/* ── For Organisations section ────────────────────────────────────── */}
        <section className="py-24 px-6 lg:px-16 xl:px-24 bg-stone-900/50 border-y border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Image side */}
              <div className="relative rounded-3xl overflow-hidden h-72 lg:h-96 shadow-2xl shadow-black/50 order-2 lg:order-1">
                <img
                  src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=900&q=80"
                  alt="Organizations"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-black/20 to-transparent" />
                {/* Floating stat */}
                <div className="absolute bottom-6 left-6 bg-stone-950/80 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-3.5">
                  <div className="text-white font-black text-2xl" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>8,000+</div>
                  <div className="text-stone-500 text-xs mt-0.5">Volunteer slots needed in India every month</div>
                </div>
              </div>

              {/* Text side */}
              <div className="order-1 lg:order-2">
                <span
                  className="text-amber-400 text-xs font-bold tracking-widest uppercase"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  For Organisations
                </span>
                <h2
                  className="mt-4 text-white text-4xl lg:text-5xl font-black leading-tight"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Post a Need.<br />
                  <span className="italic text-amber-400">Get the Right People.</span>
                </h2>
                <p className="mt-5 text-stone-400 text-base leading-relaxed">
                  Stop putting out generic "volunteers needed" posts that attract everyone but the right person. With Volunteer Match, you describe exactly what skill you need — and we surface the people who have it.
                </p>
                <div className="mt-8 space-y-4">
                  {[
                    { icon: "✅", text: "Post volunteer openings by skill, date and location" },
                    { icon: "✅", text: "Browse registered volunteer profiles with skill tags" },
                    { icon: "✅", text: "Shortlist, message and confirm — all inside Eventimist" },
                    { icon: "✅", text: "Issue verified service certificates to your volunteers" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-amber-400 text-sm mt-0.5">{item.icon}</span>
                      <span className="text-stone-300 text-sm">{item.text}</span>
                    </div>
                  ))}
                </div>
                <a
                  href="/organize"
                  className="inline-flex items-center gap-2 mt-8 border border-amber-400/30 hover:border-amber-400/60 bg-amber-400/5 hover:bg-amber-400/10 text-amber-400 font-bold text-sm px-6 py-3 rounded-xl transition-all"
                >
                  Register your Organisation
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Mobile waitlist form ─────────────────────────────────────────── */}
        <section className="py-24 px-6 lg:px-16 bg-stone-950 xl:hidden">
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-10">
              <span
                className="text-amber-400 text-xs font-bold tracking-widest uppercase"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Early Access
              </span>
              <h2
                className="mt-4 text-white text-3xl font-black"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Join the Waitlist
              </h2>
              <p className="text-stone-500 text-sm mt-2">
                Register your skills and be first in line when we launch.
              </p>
            </div>
            <div className="bg-white/[0.04] border border-white/8 rounded-3xl p-8">
              <WaitlistForm />
            </div>
          </div>
        </section>

        {/* ── Bottom CTA + waitlist (desktop only fullwidth) ───────────────── */}
        <section className="relative py-32 px-6 lg:px-16 xl:px-24 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1600&q=80"
              alt="Community"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/95 to-stone-950/80" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-4 py-1.5 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-400 text-xs font-bold tracking-widest uppercase">Launching 2025</span>
              </div>
              <h2
                className="text-white text-4xl lg:text-6xl font-black leading-tight mb-6"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                The World Needs<br />
                <span className="italic text-amber-400">Your Hands.</span>
              </h2>
              <p className="text-stone-400 text-lg leading-relaxed mb-4">
                Volunteer Match is our biggest upcoming feature. Thousands of organisations across India are already waiting to post their volunteer needs the moment we go live.
              </p>
              <p className="text-stone-500 text-sm mb-10">
                Get on the early access list now — early volunteers get priority matching, profile badges and exclusive first-launch perks.
              </p>
              {/* Stats row */}
              <div className="flex flex-wrap gap-8 mb-10">
                {[
                  { val: "2,847+", label: "On the waitlist" },
                  { val: "340+", label: "Orgs pre-registered" },
                  { val: "Q3 2025", label: "Target launch" },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="text-white font-black text-2xl" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{s.val}</div>
                    <div className="text-stone-500 text-xs mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <footer className="border-t border-white/5 py-10 px-6 lg:px-16 bg-stone-950">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <span className="text-white font-black text-base" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>eventimist</span>
              <span className="text-stone-700 text-xs ml-2 border border-stone-800 rounded-full px-2 py-0.5">Volunteer · Coming Soon</span>
            </div>
            <div className="flex gap-6 text-xs text-stone-600">
              {["Privacy", "Terms", "Contact", "Blog"].map((l) => (
                <a key={l} href="#" className="hover:text-stone-400 transition-colors">{l}</a>
              ))}
            </div>
            <div className="text-stone-700 text-xs">© 2025 Eventimist. All rights reserved.</div>
          </div>
        </footer>

      </div>
    </>
  );
}