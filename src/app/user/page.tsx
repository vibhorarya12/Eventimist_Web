"use client";

import { useEffect, useState } from "react";

// ─── Left static image panel ───────────────────────────────────────────────────
function StaticPanel() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Static hero image */}
      <img
        src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1400&q=85"
        alt="Events near you"
        className="w-full h-full object-cover"
      />

      {/* Gradient overlay — heavier at bottom, light at top */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/15" />

      {/* Top: logo */}
      <div className="absolute top-8 left-8 z-10 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <span
          className="text-white font-black text-xl tracking-tight"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          eventimist
        </span>
      </div>

      {/* Middle: testimonial card */}
      {/* <div className="absolute top-1/2 -translate-y-1/2 left-8 right-8 z-10">
        <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 max-w-xs">
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} className="text-amber-400 text-xs">★</span>
            ))}
          </div>
          <p className="text-white/90 text-sm leading-relaxed italic">
            "Found three amazing local events in my first week. The volunteer matching feature is a game-changer!"
          </p>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs font-bold text-white">
              A
            </div>
            <div>
              <div className="text-white text-xs font-bold">Anjali Mehta</div>
              <div className="text-white/50 text-[10px]">Community Member, Meerut</div>
            </div>
          </div>
        </div>
      </div> */}

      {/* Bottom: headline + event stats row */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-10">
        {/* Tag pill */}
        <div className="inline-block bg-amber-400 text-stone-900 text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full mb-4">
          For Everyone
        </div>

        {/* Headline */}
        <h2
          className="text-white font-black text-4xl leading-tight mb-2"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Discover Events<br />That Move You
        </h2>

        <p className="text-white/60 text-sm mb-8">
          Join 120,000+ users exploring events near them every day.
        </p>

        {/* 3 mini stats */}
        <div className="flex items-center gap-6">
          {[
            { val: "50K+", label: "Events" },
            { val: "120K+", label: "Members" },
            { val: "40+", label: "Cities" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div
                className="text-white font-black text-xl"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {s.val}
              </div>
              <div className="text-white/50 text-xs mt-0.5">{s.label}</div>
            </div>
          ))}
          <div className="flex-1 h-px bg-white/10 ml-2" />
          {/* Live indicator */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/80 text-xs font-semibold">47 live near you</span>
          </div>
        </div>

        {/* Thin divider line */}
        <div className="mt-6 h-px bg-white/15" />
      </div>
    </div>
  );
}

// ─── Auth types ────────────────────────────────────────────────────────────────
type Tab = "signin" | "signup";

// ─── Interest chips ────────────────────────────────────────────────────────────
const INTERESTS = [
  { icon: "🎵", label: "Music" },
  { icon: "💻", label: "Tech" },
  { icon: "🌱", label: "Social" },
  { icon: "🏃", label: "Sports" },
  { icon: "🍽️", label: "Food" },
  { icon: "🎨", label: "Arts" },
  { icon: "📚", label: "Education" },
  { icon: "🏛️", label: "Culture" },
];

// ─── Password eye toggle ───────────────────────────────────────────────────────
function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

// ─── Social buttons (shared) ───────────────────────────────────────────────────
function SocialButtons() {
  return (
    <div className="flex gap-3">
      <button
        type="button"
        className="flex-1 flex items-center justify-center gap-2 border border-stone-200 hover:border-stone-300 hover:bg-stone-50 rounded-xl py-2.5 text-sm font-semibold text-stone-600 transition-all"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Google
      </button>
      <button
        type="button"
        className="flex-1 flex items-center justify-center gap-2 border border-stone-200 hover:border-stone-300 hover:bg-stone-50 rounded-xl py-2.5 text-sm font-semibold text-stone-600 transition-all"
      >
        <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        Facebook
      </button>
    </div>
  );
}

// ─── Auth Panel ────────────────────────────────────────────────────────────────
function AuthPanel() {
  const [tab, setTab] = useState<Tab>("signin");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Sign-in state
  const [siEmail, setSiEmail] = useState("");
  const [siPass, setSiPass] = useState("");
  const [siShowPass, setSiShowPass] = useState(false);
  const [remember, setRemember] = useState(false);

  // Sign-up state
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPass, setSuPass] = useState("");
  const [suConfirm, setSuConfirm] = useState("");
  const [suShowPass, setSuShowPass] = useState(false);
  const [suShowConf, setSuShowConf] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [agreed, setAgreed] = useState(false);

  const passStrength =
    suPass.length === 0 ? 0
    : suPass.length < 4 ? 1
    : suPass.length < 7 ? 2
    : suPass.length < 10 ? 3 : 4;

  const strengthMeta = [
    { label: "", color: "" },
    { label: "Weak", color: "bg-rose-400" },
    { label: "Fair", color: "bg-amber-400" },
    { label: "Good", color: "bg-yellow-400" },
    { label: "Strong", color: "bg-green-400" },
  ][passStrength];

  const toggleInterest = (label: string) =>
    setInterests((prev) =>
      prev.includes(label) ? prev.filter((v) => v !== label) : [...prev, label]
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setDone(true); }, 1800);
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8 success-in">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full bg-amber-100 animate-ping opacity-40" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-200">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h3
          className="text-stone-900 text-2xl font-black mb-2"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {tab === "signup" ? "Welcome to Eventimist! 🎉" : "Welcome back! 👋"}
        </h3>
        <p className="text-stone-400 text-sm max-w-xs">
          {tab === "signup"
            ? "Your account is all set. Let's find events happening near you."
            : "You're signed in. Let's see what's happening in your city today."}
        </p>

        {/* Nearby event teaser */}
        <div className="w-full mt-6 bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-3 text-left">
          <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
            <img
              src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&q=80"
              alt="Event"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-stone-800 text-xs font-bold truncate">Jazz Night · Mumbai</div>
            <div className="text-stone-400 text-[10px] mt-0.5">Tonight · 234 attending</div>
          </div>
          <button className="text-xs font-bold text-amber-600 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-xl transition-colors flex-shrink-0">
            Join
          </button>
        </div>

        <button
          onClick={() => setDone(false)}
          className="mt-6 w-full bg-stone-900 hover:bg-stone-700 text-white font-bold py-3.5 rounded-2xl transition-all hover:shadow-lg text-sm flex items-center justify-center gap-2"
        >
          Explore Events Near Me
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    );
  }

  // ── Header ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="pt-10 pb-6 px-10 lg:px-12">
        {/* Back link */}
        <div className="flex items-center gap-2 mb-8">
          <a
            href="/"
            className="text-stone-400 hover:text-stone-700 transition-colors text-sm flex items-center gap-1 group"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to home
          </a>
        </div>

        {/* Tag */}
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-amber-600 text-xs font-bold tracking-widest uppercase">User Portal</span>
        </div>

        <h1
          className="text-stone-900 text-3xl font-black leading-tight"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {tab === "signin" ? "Welcome back,\nlet's explore" : "Join and start\nexploring events"}
        </h1>
        <p className="text-stone-400 text-sm mt-2">
          {tab === "signin"
            ? "Sign in to discover events, join communities and volunteer."
            : "Create your free account in under a minute."}
        </p>
      </div>

      {/* Tab switcher */}
      <div className="px-10 lg:px-12">
        <div className="flex bg-stone-100 rounded-2xl p-1 mb-8">
          {(["signin", "signup"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
                tab === t
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              {t === "signin" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-10 lg:px-12 pb-10 flex-1">

        {tab === "signin" ? (
          /* ── Sign In fields ─────────────────────────────────────────────── */
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-stone-500 mb-1.5 tracking-wider uppercase">Email Address</label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  type="email" value={siEmail} onChange={(e) => setSiEmail(e.target.value)}
                  placeholder="you@example.com" required
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 hover:border-stone-300 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100 rounded-xl text-sm text-stone-800 placeholder:text-stone-300 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-stone-500 tracking-wider uppercase">Password</label>
                <a href="#" className="text-xs text-amber-500 hover:text-amber-600 font-semibold">Forgot password?</a>
              </div>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={siShowPass ? "text" : "password"} value={siPass} onChange={(e) => setSiPass(e.target.value)}
                  placeholder="Your password" required
                  className="w-full pl-10 pr-10 py-3 bg-stone-50 border border-stone-200 hover:border-stone-300 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100 rounded-xl text-sm text-stone-800 placeholder:text-stone-300 outline-none transition-all"
                />
                <button type="button" onClick={() => setSiShowPass((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-600 transition-colors">
                  <EyeIcon open={siShowPass} />
                </button>
              </div>
            </div>

            {/* Remember */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <button
                type="button" onClick={() => setRemember((v) => !v)}
                className={`w-4 h-4 rounded border-2 transition-all flex items-center justify-center flex-shrink-0 ${remember ? "bg-amber-400 border-amber-400" : "border-stone-300 hover:border-amber-400"}`}
              >
                {remember && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <span className="text-stone-400 text-xs">Keep me signed in</span>
            </label>
          </div>
        ) : (
          /* ── Sign Up fields ─────────────────────────────────────────────── */
          <div className="space-y-4">
            {/* Name + City */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1.5 tracking-wider uppercase">Full Name</label>
                <input
                  value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Anjali Singh" required
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 hover:border-stone-300 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100 rounded-xl text-sm text-stone-800 placeholder:text-stone-300 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1.5 tracking-wider uppercase">City</label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  <input
                    value={city} onChange={(e) => setCity(e.target.value)}
                    placeholder="Meerut" required
                    className="w-full pl-9 pr-3 py-3 bg-stone-50 border border-stone-200 hover:border-stone-300 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100 rounded-xl text-sm text-stone-800 placeholder:text-stone-300 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-stone-500 mb-1.5 tracking-wider uppercase">Email Address</label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  type="email" value={suEmail} onChange={(e) => setSuEmail(e.target.value)}
                  placeholder="anjali@example.com" required
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 hover:border-stone-300 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100 rounded-xl text-sm text-stone-800 placeholder:text-stone-300 outline-none transition-all"
                />
              </div>
            </div>

            {/* Interests */}
            <div>
              <label className="block text-xs font-bold text-stone-500 mb-2 tracking-wider uppercase">
                I'm interested in
              </label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map(({ icon, label }) => (
                  <button
                    key={label} type="button" onClick={() => toggleInterest(label)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                      interests.includes(label)
                        ? "bg-amber-400 border-amber-400 text-stone-900 shadow-sm scale-105"
                        : "bg-white border-stone-200 text-stone-500 hover:border-amber-300 hover:text-amber-600"
                    }`}
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-stone-500 mb-1.5 tracking-wider uppercase">Password</label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={suShowPass ? "text" : "password"} value={suPass} onChange={(e) => setSuPass(e.target.value)}
                  placeholder="Min. 8 characters" required
                  className="w-full pl-10 pr-10 py-3 bg-stone-50 border border-stone-200 hover:border-stone-300 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100 rounded-xl text-sm text-stone-800 placeholder:text-stone-300 outline-none transition-all"
                />
                <button type="button" onClick={() => setSuShowPass((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-600 transition-colors">
                  <EyeIcon open={suShowPass} />
                </button>
              </div>
              {suPass.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= passStrength ? strengthMeta.color : "bg-stone-100"}`} />
                  ))}
                  <span className="text-[10px] font-bold ml-1 text-stone-400">{strengthMeta.label}</span>
                </div>
              )}
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-xs font-bold text-stone-500 mb-1.5 tracking-wider uppercase">Confirm Password</label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <input
                  type={suShowConf ? "text" : "password"} value={suConfirm} onChange={(e) => setSuConfirm(e.target.value)}
                  placeholder="Repeat password" required
                  className={`w-full pl-10 pr-10 py-3 bg-stone-50 border hover:border-stone-300 focus:bg-white focus:ring-4 rounded-xl text-sm text-stone-800 placeholder:text-stone-300 outline-none transition-all ${
                    suConfirm.length > 0 && suConfirm !== suPass
                      ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                      : "border-stone-200 focus:border-amber-400 focus:ring-amber-100"
                  }`}
                />
                <button type="button" onClick={() => setSuShowConf((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-600 transition-colors">
                  <EyeIcon open={suShowConf} />
                </button>
              </div>
              {suConfirm.length > 0 && suConfirm !== suPass && (
                <p className="text-rose-500 text-xs mt-1.5">Passwords don't match</p>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <button
                type="button" onClick={() => setAgreed((v) => !v)}
                className={`w-4 h-4 mt-0.5 rounded border-2 transition-all flex items-center justify-center flex-shrink-0 ${agreed ? "bg-amber-400 border-amber-400" : "border-stone-300 hover:border-amber-400"}`}
              >
                {agreed && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <span className="text-stone-400 text-xs leading-relaxed">
                I agree to the{" "}
                <a href="#" className="text-amber-500 hover:underline">Terms of Service</a> and{" "}
                <a href="#" className="text-amber-500 hover:underline">Privacy Policy</a>
              </span>
            </label>
          </div>
        )}

        {/* Social divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-stone-100" />
          <span className="text-stone-300 text-xs font-medium">or continue with</span>
          <div className="flex-1 h-px bg-stone-100" />
        </div>

        <SocialButtons />

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || (tab === "signup" && (!agreed || (suConfirm.length > 0 && suConfirm !== suPass)))}
          className="w-full mt-6 bg-stone-900 hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-stone-900/20 hover:scale-[1.01] active:scale-[0.99] text-sm flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {tab === "signin" ? "Signing in..." : "Creating account..."}
            </>
          ) : (
            <>
              {tab === "signin" ? "Sign In" : "Create My Account"}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </>
          )}
        </button>

        {/* Switch tab */}
        <p className="text-center text-stone-400 text-xs mt-5">
          {tab === "signin" ? "New to Eventimist?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setTab(tab === "signin" ? "signup" : "signin")}
            className="text-amber-500 hover:text-amber-600 font-bold transition-colors"
          >
            {tab === "signin" ? "Create account →" : "Sign in →"}
          </button>
        </p>

        {/* Organizer link */}
        <p className="text-center text-stone-300 text-xs mt-3">
          Organising events?{" "}
          <a href="/organize" className="text-stone-400 hover:text-amber-500 font-semibold transition-colors">
            Organizer portal →
          </a>
        </p>
      </form>
    </div>
  );
}

// ─── Feature pills ─────────────────────────────────────────────────────────────
function FeaturePills() {
  const pills = [
    { icon: "📍", label: "Events Near You" },
    { icon: "🤝", label: "Volunteer Matching" },
    { icon: "🎟️", label: "Easy RSVP" },
    { icon: "🔔", label: "Real-time Alerts" },
    { icon: "💬", label: "Community Chat" },
    { icon: "🗺️", label: "Explore Map" },
  ];
  return (
    <div className="overflow-hidden border-t border-b border-stone-100 bg-stone-50 py-4">
      <div className="flex gap-3 pills-scroll" style={{ width: "max-content" }}>
        {[...pills, ...pills, ...pills].map((p, i) => (
          <div
            key={i}
            className="flex items-center gap-2 bg-white border border-stone-200 rounded-full px-4 py-2 text-xs font-semibold text-stone-600 whitespace-nowrap shadow-sm flex-shrink-0"
          >
            <span>{p.icon}</span>
            {p.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stats strip ───────────────────────────────────────────────────────────────
function StatsStrip() {
  const stats = [
    { val: "50K+", label: "Events listed" },
    { val: "120K+", label: "Active users" },
    { val: "40+", label: "Cities covered" },
    { val: "4.9★", label: "User rating" },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-stone-100 border-t border-stone-100">
      {stats.map((s, i) => (
        <div key={i} className="bg-white px-6 py-5 text-center hover:bg-amber-50 transition-colors">
          <div
            className="text-2xl font-black text-stone-900"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {s.val}
          </div>
          <div className="text-stone-400 text-xs mt-0.5">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Page export ───────────────────────────────────────────────────────────────
export default function UserPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap');

        * { box-sizing: border-box; }
        html, body { height: 100%; margin: 0; background: #fff; }

        /* Pills scroll */
        @keyframes pills {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .pills-scroll { animation: pills 22s linear infinite; }
        .pills-scroll:hover { animation-play-state: paused; }

        /* Success entrance */
        @keyframes success-in {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        .success-in { animation: success-in 0.4s ease-out forwards; }

        /* Autofill */
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #fafaf9 inset !important;
          -webkit-text-fill-color: #1c1917 !important;
        }
      `}</style>

      <div className="min-h-screen flex flex-col lg:flex-row bg-white">

        {/* ── Left: sticky static image panel ── */}
        <div className="hidden lg:block lg:w-[52%] xl:w-[55%] relative flex-shrink-0 h-screen sticky top-0">
          <StaticPanel />
        </div>

        {/* ── Right: auth + footer strips ── */}
        <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">

          {/* Mobile: logo */}
          <div className="lg:hidden flex items-center gap-3 px-6 pt-6 pb-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span className="text-stone-900 font-black text-lg" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              eventimist
            </span>
          </div>

          {/* Mobile: hero image */}
          <div className="lg:hidden h-52 relative mx-6 mt-4 rounded-3xl overflow-hidden shadow-lg flex-shrink-0">
            <img
              src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80"
              alt="Events"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-5">
              <div>
                <div className="text-amber-400 text-xs font-bold tracking-widest uppercase mb-1">User Portal</div>
                <div
                  className="text-white text-lg font-black"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Discover Events Near You
                </div>
              </div>
            </div>
          </div>

          {/* Auth form */}
          <div className="flex-1">
            <AuthPanel />
          </div>

          {/* Feature pills */}
          <FeaturePills />

          {/* Stats */}
          <StatsStrip />
        </div>
      </div>
    </>
  );
}