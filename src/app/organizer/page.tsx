"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── Carousel slides ──────────────────────────────────────────────────────────
const slides = [
  {
    url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
    label: "Music Festivals",
    stat: "2.4K attendees avg",
  },
  {
    url: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&q=80",
    label: "Tech Conferences",
    stat: "890 registrations avg",
  },
  {
    url: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80",
    label: "Corporate Galas",
    stat: "500+ connections made",
  },
  {
    url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&q=80",
    label: "Community Drives",
    stat: "340 volunteers placed",
  },
  {
    url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80",
    label: "Outdoor Events",
    stat: "5K+ crowd managed",
  },
];

// ─── Left panel carousel ──────────────────────────────────────────────────────
function PanelCarousel() {
  const [current, setCurrent] = useState(0);
  const [prevIdx, setPrevIdx] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback(
    (idx: number) => {
      if (animating || idx === current) return;
      setAnimating(true);
      setPrevIdx(current);
      setCurrent(idx);
      setTimeout(() => { setPrevIdx(null); setAnimating(false); }, 800);
    },
    [animating, current]
  );

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo]);

  useEffect(() => {
    timer.current = setTimeout(next, 5000);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [current, next]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Slides */}
      {slides.map((s, i) => {
        const isActive = i === current;
        const isPrev   = i === prevIdx;
        return (
          <div
            key={i}
            className="absolute inset-0 transition-all duration-800 ease-in-out"
            style={{
              opacity   : isActive ? 1 : isPrev ? 0 : 0,
              transform : isActive ? "scale(1)" : isPrev ? "scale(1.06)" : "scale(1)",
              zIndex    : isActive ? 2 : isPrev ? 1 : 0,
            }}
          >
            <img src={s.url} alt={s.label} className="w-full h-full object-cover" />
            {/* Dark gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
          </div>
        );
      })}

      {/* Top logo */}
      <div className="absolute top-8 left-8 z-10 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <span className="text-white font-black text-xl tracking-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          eventimist
        </span>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-10">
        {/* Slide label pill */}
        <div
          key={current + "-label"}
          className="slide-up inline-block bg-amber-400 text-stone-900 text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full mb-4"
        >
          {slides[current].label}
        </div>

        {/* Headline */}
        <h2
          key={current + "-title"}
          className="slide-up text-white font-black text-4xl leading-tight mb-2"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", animationDelay: "60ms" }}
        >
          Organise Events<br />That Inspire People
        </h2>

        {/* Stat */}
        <p
          key={current + "-stat"}
          className="slide-up text-white/60 text-sm mb-8"
          style={{ animationDelay: "120ms" }}
        >
          {slides[current].stat}
        </p>

        {/* Dots + progress */}
        <div className="flex items-center gap-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`transition-all duration-400 rounded-full ${
                i === current ? "w-8 h-2 bg-amber-400" : "w-2 h-2 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
          <div className="ml-auto flex items-center gap-2 text-white/40 text-xs font-mono">
            <span className="text-white/70 font-bold text-sm">{String(current + 1).padStart(2, "0")}</span>
            <span>/</span>
            <span>{String(slides.length).padStart(2, "0")}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-px bg-white/15">
          <div key={current} className="h-full bg-amber-400 carousel-progress" />
        </div>
      </div>

      {/* Testimonial card */}
      {/* <div className="absolute top-1/2 -translate-y-1/2 left-8 right-8 z-10">
        <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 max-w-xs">
          <div className="flex items-center gap-1 mb-2">
            {[1,2,3,4,5].map(i => <span key={i} className="text-amber-400 text-xs">★</span>)}
          </div>
          <p className="text-white/90 text-sm leading-relaxed italic">
            "Eventimist helped us find 20 volunteers in 48 hours. Our charity run was a massive success!"
          </p>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center text-xs font-bold text-stone-900">P</div>
            <div>
              <div className="text-white text-xs font-bold">Priya Sharma</div>
              <div className="text-white/50 text-[10px]">NGO Organizer, Delhi</div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
}

// ─── Auth form (sign in / sign up) ────────────────────────────────────────────
type Tab = "signin" | "signup";

function AuthPanel() {
  const [tab, setTab] = useState<Tab>("signup");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Sign-up fields
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // Sign-in fields
  const [siEmail, setSiEmail] = useState("");
  const [siPass, setSiPass] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setDone(true); }, 1800);
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8 success-in">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl mb-6 shadow-lg shadow-green-100">
          ✅
        </div>
        <h3 className="text-stone-900 text-2xl font-black mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {tab === "signup" ? "Welcome aboard!" : "Welcome back!"}
        </h3>
        <p className="text-stone-500 text-sm max-w-xs">
          {tab === "signup"
            ? "Your organizer account is ready. Let's create your first event."
            : "You're signed in. Redirecting to your dashboard..."}
        </p>
        <button
          onClick={() => setDone(false)}
          className="mt-8 bg-stone-900 hover:bg-stone-700 text-white font-bold px-8 py-3 rounded-xl transition-all hover:shadow-lg text-sm"
        >
          Go to Dashboard →
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="pt-10 pb-6 px-10 lg:px-12">
        <div className="flex items-center gap-2 mb-8">
          <a href="/" className="text-stone-400 hover:text-stone-700 transition-colors text-sm flex items-center gap-1 group">
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to home
          </a>
        </div>

        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-amber-600 text-xs font-bold tracking-widest uppercase">Organizer Portal</span>
        </div>

        <h1 className="text-stone-900 text-3xl font-black leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {tab === "signup" ? "Start organising\nevents today" : "Welcome back,\norganizer"}
        </h1>
        <p className="text-stone-400 text-sm mt-2">
          {tab === "signup"
            ? "Create your free organizer account in 60 seconds."
            : "Sign in to manage your events and volunteers."}
        </p>
      </div>

      {/* Tab switcher */}
      <div className="px-10 lg:px-12">
        <div className="flex bg-stone-100 rounded-2xl p-1 mb-8">
          {(["signup", "signin"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
                tab === t
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              {t === "signup" ? "Create Account" : "Sign In"}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-10 lg:px-12 pb-10 flex-1">
        {tab === "signup" ? (
          <div className="space-y-4">
            {/* Name + Org */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1.5 tracking-wider uppercase">Full Name</label>
                <input
                  value={name} onChange={e => setName(e.target.value)}
                  placeholder="Rahul Verma"
                  required
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 hover:border-stone-300 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100 rounded-xl text-sm text-stone-800 placeholder:text-stone-300 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1.5 tracking-wider uppercase">Organization</label>
                <input
                  value={org} onChange={e => setOrg(e.target.value)}
                  placeholder="My Events Co."
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 hover:border-stone-300 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100 rounded-xl text-sm text-stone-800 placeholder:text-stone-300 outline-none transition-all"
                />
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
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="rahul@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 hover:border-stone-300 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100 rounded-xl text-sm text-stone-800 placeholder:text-stone-300 outline-none transition-all"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-stone-500 mb-1.5 tracking-wider uppercase">Phone Number</label>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-3 text-sm text-stone-500 whitespace-nowrap">
                  🇮🇳 +91
                </div>
                <input
                  type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="98765 43210"
                  className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200 hover:border-stone-300 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100 rounded-xl text-sm text-stone-800 placeholder:text-stone-300 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-stone-500 mb-1.5 tracking-wider uppercase">Password</label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  className="w-full pl-10 pr-10 py-3 bg-stone-50 border border-stone-200 hover:border-stone-300 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100 rounded-xl text-sm text-stone-800 placeholder:text-stone-300 outline-none transition-all"
                />
                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-600 transition-colors">
                  {showPass
                    ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {/* Strength bar */}
              {password.length > 0 && (
                <div className="mt-2 flex gap-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      password.length >= i * 2
                        ? password.length >= 8 ? "bg-green-400" : "bg-amber-400"
                        : "bg-stone-100"
                    }`} />
                  ))}
                  <span className="text-[10px] text-stone-400 ml-1">
                    {password.length < 4 ? "Weak" : password.length < 8 ? "Fair" : "Strong"}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-xs font-bold text-stone-500 mb-1.5 tracking-wider uppercase">Confirm Password</label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <input
                  type={showConfirm ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat password"
                  required
                  className={`w-full pl-10 pr-10 py-3 bg-stone-50 border hover:border-stone-300 focus:bg-white focus:ring-4 rounded-xl text-sm text-stone-800 placeholder:text-stone-300 outline-none transition-all ${
                    confirm.length > 0 && confirm !== password
                      ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                      : "border-stone-200 focus:border-amber-400 focus:ring-amber-100"
                  }`}
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-600 transition-colors">
                  {showConfirm
                    ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {confirm.length > 0 && confirm !== password && (
                <p className="text-rose-500 text-xs mt-1.5">Passwords don't match</p>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="w-4 h-4 mt-0.5 rounded border-2 border-stone-300 group-hover:border-amber-400 flex items-center justify-center flex-shrink-0 transition-colors">
                <svg className="w-2.5 h-2.5 text-amber-500 hidden peer-checked:block" fill="currentColor" viewBox="0 0 12 12">
                  <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-stone-400 text-xs leading-relaxed">
                I agree to the <a href="#" className="text-amber-500 hover:underline">Terms of Service</a> and <a href="#" className="text-amber-500 hover:underline">Privacy Policy</a>
              </span>
            </label>
          </div>
        ) : (
          /* ── Sign In fields ── */
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 mb-1.5 tracking-wider uppercase">Email Address</label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  type="email" value={siEmail} onChange={e => setSiEmail(e.target.value)}
                  placeholder="rahul@example.com" required
                  className="w-full pl-10 pr-4 py-3.5 bg-stone-50 border border-stone-200 hover:border-stone-300 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100 rounded-xl text-sm text-stone-800 placeholder:text-stone-300 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-stone-500 tracking-wider uppercase">Password</label>
                <a href="#" className="text-xs text-amber-500 hover:text-amber-600 font-semibold">Forgot password?</a>
              </div>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showPass ? "text" : "password"} value={siPass} onChange={e => setSiPass(e.target.value)}
                  placeholder="Your password" required
                  className="w-full pl-10 pr-10 py-3.5 bg-stone-50 border border-stone-200 hover:border-stone-300 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100 rounded-xl text-sm text-stone-800 placeholder:text-stone-300 outline-none transition-all"
                />
                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-600 transition-colors">
                  {showPass
                    ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="w-4 h-4 rounded border-2 border-stone-300 hover:border-amber-400 transition-colors flex-shrink-0" />
              <span className="text-stone-400 text-xs">Keep me signed in</span>
            </label>
          </div>
        )}

        {/* Social divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-stone-100" />
          <span className="text-stone-300 text-xs font-medium">or continue with</span>
          <div className="flex-1 h-px bg-stone-100" />
        </div>

        {/* Social buttons */}
        <div className="flex gap-3 mb-6">
          <button type="button" className="flex-1 flex items-center justify-center gap-2 border border-stone-200 hover:border-stone-300 hover:bg-stone-50 rounded-xl py-2.5 text-sm font-semibold text-stone-600 transition-all">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button type="button" className="flex-1 flex items-center justify-center gap-2 border border-stone-200 hover:border-stone-300 hover:bg-stone-50 rounded-xl py-2.5 text-sm font-semibold text-stone-600 transition-all">
            <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-stone-900 hover:bg-stone-700 disabled:opacity-60 text-white font-bold py-4 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-stone-900/20 hover:scale-[1.01] active:scale-[0.99] text-sm flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {tab === "signup" ? "Creating account..." : "Signing in..."}
            </>
          ) : (
            <>
              {tab === "signup" ? "Create Organizer Account" : "Sign In to Dashboard"}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </>
          )}
        </button>

        {/* Switch tab hint */}
        <p className="text-center text-stone-400 text-xs mt-5">
          {tab === "signup" ? "Already have an account?" : "New to Eventimist?"}{" "}
          <button
            type="button"
            onClick={() => setTab(tab === "signup" ? "signin" : "signup")}
            className="text-amber-500 hover:text-amber-600 font-bold transition-colors"
          >
            {tab === "signup" ? "Sign in →" : "Create account →"}
          </button>
        </p>
      </form>
    </div>
  );
}

// ─── Feature pills row ─────────────────────────────────────────────────────────
function FeaturePills() {
  const pills = [
    { icon: "🎯", label: "Smart Volunteer Matching" },
    { icon: "📊", label: "Live Analytics" },
    { icon: "🎟️", label: "Ticketing & RSVPs" },
    { icon: "📍", label: "Location-based Discovery" },
    { icon: "💬", label: "In-app Messaging" },
  ];
  return (
    <div className="overflow-hidden border-t border-b border-stone-100 bg-stone-50 py-4">
      <div className="flex gap-3 pills-scroll" style={{ width: "max-content" }}>
        {[...pills, ...pills, ...pills].map((p, i) => (
          <div key={i} className="flex items-center gap-2 bg-white border border-stone-200 rounded-full px-4 py-2 text-xs font-semibold text-stone-600 whitespace-nowrap shadow-sm flex-shrink-0">
            <span>{p.icon}</span>
            {p.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stats strip ──────────────────────────────────────────────────────────────
function StatsStrip() {
  const stats = [
    { val: "50K+", label: "Events hosted" },
    { val: "8K+", label: "Volunteers placed" },
    { val: "120K+", label: "Attendees reached" },
    { val: "4.9★", label: "Organizer rating" },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-stone-100 border-t border-stone-100">
      {stats.map((s, i) => (
        <div key={i} className="bg-white px-6 py-5 text-center hover:bg-amber-50 transition-colors">
          <div className="text-2xl font-black text-stone-900" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{s.val}</div>
          <div className="text-stone-400 text-xs mt-0.5">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Main page export ─────────────────────────────────────────────────────────
export default function OrganizePage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap');

        * { box-sizing: border-box; }
        html, body { height: 100%; margin: 0; background: #fff; }

        /* Carousel */
        @keyframes progress {
          from { width: 0%; }
          to   { width: 100%; }
        }
        .carousel-progress { animation: progress 5s linear forwards; }

        /* Slide up text */
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .slide-up { animation: slide-up 0.55s ease-out forwards; }

        /* Pills scroll */
        @keyframes pills {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .pills-scroll { animation: pills 20s linear infinite; }
        .pills-scroll:hover { animation-play-state: paused; }

        /* Success entrance */
        @keyframes success-in {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        .success-in { animation: success-in 0.4s ease-out forwards; }

        /* Inputs */
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #fafaf9 inset !important;
          -webkit-text-fill-color: #1c1917 !important;
        }
      `}</style>

      <div className="min-h-screen flex flex-col lg:flex-row bg-white">
        {/* ── Left: full-height image carousel ── */}
        <div className="hidden lg:block lg:w-[52%] xl:w-[55%] relative flex-shrink-0 h-screen sticky top-0">
          <PanelCarousel />
        </div>

        {/* ── Right: auth + info ── */}
        <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 px-6 pt-6 pb-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span className="text-stone-900 font-black text-lg" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>eventimist</span>
          </div>

          {/* Mobile hero image */}
          <div className="lg:hidden h-52 relative mx-6 mt-4 rounded-3xl overflow-hidden shadow-lg flex-shrink-0">
            <img
              src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80"
              alt="Organizer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-5">
              <div>
                <div className="text-amber-400 text-xs font-bold tracking-widest uppercase mb-1">Organizer Portal</div>
                <div className="text-white text-lg font-black" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Organise Events That Inspire
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