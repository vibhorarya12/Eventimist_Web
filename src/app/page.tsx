"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useUserAuth } from "@/store/eventimist/user/auth/UserAuthState";
import { useUserLogout } from "@/hooks/eventimist/user/sessions/useUserLogout";

// ─── Carousel Slides ──────────────────────────────────────────────────────────
const carouselSlides = [
  { url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80", tag: "Music Festival", title: "Rhythms of the City", sub: "Mumbai · Mar 22" },
  { url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&q=80", tag: "Community", title: "Volunteer Day 2025", sub: "Delhi · Apr 5" },
  { url: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&q=80", tag: "Tech", title: "Startup Summit", sub: "Bangalore · Apr 12" },
  { url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80", tag: "Networking", title: "Young Leaders Forum", sub: "Hyderabad · Apr 19" },
  { url: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80", tag: "Corporate", title: "Business Gala Night", sub: "Pune · May 3" },
];

// ─── Dark mode context ────────────────────────────────────────────────────────
function useDark() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("landing-dark");
    if (stored === "true") setDark(true);
  }, []);
  const toggle = useCallback(() => {
    setDark(d => {
      localStorage.setItem("landing-dark", String(!d));
      return !d;
    });
  }, []);
  return { dark, toggle };
}

// ─── User menu dropdown ───────────────────────────────────────────────────────
function UserMenu({ dark }: { dark: boolean }) {
  const [open, setOpen]               = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const name       = useUserAuth(s => s.name);
  const profilePic = useUserAuth(s => s.profilePic);
  const { logout, loading: loggingOut } = useUserLogout();

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const initials = name.trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "U";

  const menuItems = [
    { label: "Liked Events",  href: "/user/profile?tab=liked",  emoji: "❤️" },
    { label: "RSVPed Events", href: "/user/profile?tab=rsvped", emoji: "🎟️" },
  ];

  const bg     = dark ? "#13151f" : "#ffffff";
  const bdr    = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const t1     = dark ? "rgba(255,255,255,0.9)"  : "#1c1917";
  const t2     = dark ? "rgba(255,255,255,0.45)" : "#78716c";
  const hoverBg= dark ? "rgba(255,255,255,0.06)" : "#f5f5f4";

  return (
    <div ref={ref} className="relative">
      {/* Avatar trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full transition-all duration-200 hover:scale-[1.02]"
        style={{
          background: dark ? "rgba(245,158,11,0.1)" : "rgba(245,158,11,0.08)",
          border: "1.5px solid rgba(245,158,11,0.3)",
        }}
      >
        {/* Avatar */}
        <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center font-black text-[11px] text-white"
          style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)" }}>
          {profilePic
            ? <img src={profilePic} alt={name} className="w-full h-full object-cover"/>
            : initials}
        </div>
        <span className="text-xs font-bold max-w-[72px] truncate" style={{ color: dark ? "rgba(255,255,255,0.85)" : "#1c1917" }}>
          {name.split(" ")[0] || "You"}
        </span>
        <svg className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" stroke={dark ? "rgba(255,255,255,0.4)" : "#a8a29e"} viewBox="0 0 24 24" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2.5 w-56 rounded-2xl overflow-hidden z-50"
          style={{
            background: bg,
            border: `1px solid ${bdr}`,
            boxShadow: dark
              ? "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)"
              : "0 20px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)",
            animation: "dropIn 0.2s cubic-bezier(.22,1,.36,1) both",
          }}
        >
          {/* Profile header */}
          <div className="px-4 py-3.5 border-b" style={{ borderColor: bdr }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center font-black text-xs text-white"
                style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)" }}>
                {profilePic
                  ? <img src={profilePic} alt={name} className="w-full h-full object-cover"/>
                  : initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black truncate" style={{ color: t1, fontFamily: "'Playfair Display',Georgia,serif" }}>{name}</p>
                <p className="text-[10px] font-semibold" style={{ color: "#f59e0b" }}>✦ Member</p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="p-1.5 space-y-0.5">
            {menuItems.map(item => (
              <a key={item.label} href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-xs font-semibold"
                style={{ color: t2 }}
                onMouseEnter={e => (e.currentTarget.style.background = hoverBg, e.currentTarget.style.color = t1)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent", e.currentTarget.style.color = t2)}
              >
                <span className="text-sm">{item.emoji}</span>
                {item.label}
              </a>
            ))}
          </div>

          {/* Divider + Logout */}
          <div className="px-1.5 pb-1.5">
            <div className="h-px mb-1.5" style={{ background: bdr }}/>
            <button
              onClick={() => { setOpen(false); setShowLogoutModal(true); }}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-150 text-xs font-semibold text-left"
              style={{ color: "#ef4444" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* ── Logout confirm modal ─────────────────────────────────────────── */}
      {showLogoutModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[998]"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)", animation: "backdropIn 0.2s ease both" }}
            onClick={() => { if (!loggingOut) setShowLogoutModal(false); }}
          />
          {/* Modal */}
          <div className="fixed inset-0 z-[999] flex items-center justify-center pointer-events-none">
            <div
              className="pointer-events-auto flex flex-col items-center gap-5 rounded-3xl p-8 mx-4"
              style={{
                width: "min(340px, calc(100vw - 32px))",
                background: dark ? "#13151f" : "#ffffff",
                border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}`,
                boxShadow: "0 32px 80px rgba(0,0,0,0.3)",
                animation: "dropIn 0.25s cubic-bezier(.22,1,.36,1) both",
              }}
            >
              {/* Avatar */}
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center font-black text-xl text-white flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)" }}>
                  {profilePic
                    ? <img src={profilePic} alt={name} className="w-full h-full object-cover"/>
                    : initials}
                </div>
                {/* Small logout icon badge */}
                <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center border-2"
                  style={{ borderColor: dark ? "#13151f" : "#ffffff" }}>
                  <svg width="10" height="10" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7"/>
                  </svg>
                </div>
              </div>

              {/* Text */}
              <div className="text-center">
                <p className="font-black text-base mb-1"
                  style={{ color: dark ? "rgba(255,255,255,0.92)" : "#1c1917", fontFamily: "'Playfair Display',Georgia,serif" }}>
                  Sign out, {name.split(" ")[0]}?
                </p>
                <p className="text-xs leading-relaxed"
                  style={{ color: dark ? "rgba(255,255,255,0.4)" : "#78716c" }}>
                  You'll need to sign back in to RSVP events and access your profile.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  disabled={loggingOut}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
                  style={{ background: dark ? "rgba(255,255,255,0.07)" : "#f5f5f4", color: dark ? "rgba(255,255,255,0.6)" : "#78716c" }}
                >
                  Cancel
                </button>
                <button
                  onClick={logout}
                  disabled={loggingOut}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-80"
                  style={{ background: loggingOut ? "#b91c1c" : "#ef4444", boxShadow: "0 4px 14px rgba(239,68,68,0.3)" }}
                >
                  {loggingOut ? (
                    <>
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Signing out…
                    </>
                  ) : "Yes, sign out"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Hero Carousel ────────────────────────────────────────────────────────────
function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [prevIdx, setPrevIdx] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback((index: number) => {
    if (animating || index === current) return;
    setAnimating(true);
    setPrevIdx(current);
    setCurrent(index);
    setTimeout(() => { setPrevIdx(null); setAnimating(false); }, 700);
  }, [animating, current]);

  const next = useCallback(() => goTo((current + 1) % carouselSlides.length), [current, goTo]);

  useEffect(() => {
    timerRef.current = setTimeout(next, 4500);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, next]);

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl shadow-orange-200/60 group">
      {carouselSlides.map((slide, i) => {
        const isActive = i === current;
        const isPrev = i === prevIdx;
        return (
          <div key={i} className="absolute inset-0 transition-all duration-700 ease-in-out"
            style={{ opacity: isActive ? 1 : 0, transform: isActive ? "scale(1)" : isPrev ? "scale(1.05)" : "scale(1)", zIndex: isActive ? 2 : isPrev ? 1 : 0, pointerEvents: isActive ? "auto" : "none" }}>
            <img src={slide.url} alt={slide.title} className="w-full h-full object-cover"/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"/>
            <div className="absolute bottom-0 left-0 right-0 p-8 transition-all duration-700"
              style={{ transform: isActive ? "translateY(0)" : "translateY(20px)", opacity: isActive ? 1 : 0, transitionDelay: isActive ? "200ms" : "0ms" }}>
              <span className="inline-block bg-amber-400 text-stone-900 text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full mb-3">{slide.tag}</span>
              <div className="text-white font-black text-2xl leading-tight" style={{ fontFamily: "'Playfair Display',Georgia,serif" }}>{slide.title}</div>
              <div className="text-white/60 text-sm mt-1 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {slide.sub}
              </div>
            </div>
          </div>
        );
      })}
      <button onClick={() => goTo((current - 1 + carouselSlides.length) % carouselSlides.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110">
        <svg className="w-4 h-4 text-stone-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
      </button>
      <button onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110">
        <svg className="w-4 h-4 text-stone-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
      </button>
      <div className="absolute bottom-4 right-6 z-10 flex items-center gap-1.5">
        {carouselSlides.map((_, i) => (
          <button key={i} onClick={() => goTo(i)}
            className={`transition-all duration-300 rounded-full ${i === current ? "w-6 h-2 bg-amber-400" : "w-2 h-2 bg-white/50 hover:bg-white/80"}`}/>
        ))}
      </div>
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/20 z-10">
        <div key={current} className="h-full bg-amber-400 carousel-progress"/>
      </div>
    </div>
  );
}

// ─── Ticker ───────────────────────────────────────────────────────────────────
const tickerItems = ["Events Near You","Connect with Organizers","Volunteer Opportunities","Organization Hub","Discover Communities","Join the Movement"];
function Ticker({ dark }: { dark: boolean }) {
  return (
    <div className={`overflow-hidden py-2.5 font-mono text-xs font-bold tracking-widest uppercase transition-colors duration-300 ${dark ? "bg-white/5 text-amber-400" : "bg-stone-900 text-amber-400"}`}>
      <div className="flex ticker-scroll whitespace-nowrap">
        {[...tickerItems,...tickerItems,...tickerItems].map((item, i) => (
          <span key={i} className="mx-8">{item}<span className="mx-8 text-stone-600">◆</span></span>
        ))}
      </div>
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isLoggedIn = useUserAuth(s => s.isAuthenticated());

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const navBg = scrolled
    ? dark
      ? "bg-[#0d0f17]/95 backdrop-blur-xl shadow-sm border-b border-white/6"
      : "bg-white/92 backdrop-blur-xl shadow-sm border-b border-stone-200/80"
    : "bg-transparent";

  const logo  = dark ? "text-white"   : "text-stone-900";
  const link  = dark ? "text-white/50 hover:text-white/90" : "text-stone-500 hover:text-stone-900";
  const signIn= dark ? "text-white/60 hover:text-white hover:bg-white/8" : "text-stone-600 hover:text-stone-900 hover:bg-stone-100";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navBg} ${scrolled ? "py-3" : "py-6"}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-300/40">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <span className={`font-black text-xl tracking-tight ${logo}`} style={{ fontFamily:"'Playfair Display',Georgia,serif" }}>eventimist</span>
        </div>

        {/* Links */}
        <div className="hidden md:flex items-center gap-7 text-sm font-medium">
          {[{label:"Discover",href:"/discover"},{label:"Organize",href:"/organizer"},{label:"Volunteer",href:"/volunteer"},{label:"Eventix Space",href:"/eventix"}].map(n => (
            <a key={n.label} href={n.href} className={`transition-colors duration-200 ${link}`}>{n.label}</a>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2.5">
          {/* Dark toggle */}
          <button onClick={onToggle}
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all ${dark ? "bg-white/8 hover:bg-white/14" : "bg-stone-100 hover:bg-stone-200"}`}
            title={dark ? "Light mode" : "Dark mode"}>
            {dark ? "☀️" : "🌙"}
          </button>

          {/* Auth */}
          {mounted && isLoggedIn ? (
            <UserMenu dark={dark}/>
          ) : (
            <>
              <a href="/user" className={`hidden sm:block text-sm font-medium px-3.5 py-2 rounded-xl transition-all ${signIn}`}>
                Sign In
              </a>
              <a href="/user"
                className="text-sm font-bold text-white px-5 py-2.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)", boxShadow: "0 4px 14px rgba(245,158,11,0.3)" }}>
                Get Started
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ dark }: { dark: boolean }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  const bg   = dark ? "#0d0f17" : "#ffffff";
  const t1   = dark ? "text-white" : "text-stone-900";
  const t2   = dark ? "text-white/50" : "text-stone-500";
  const t3   = dark ? "text-white/30" : "text-stone-400";

  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden transition-colors duration-300" style={{ background: bg }}>
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl opacity-60 -translate-y-1/3 translate-x-1/4 pointer-events-none"
        style={{ background: dark ? "rgba(245,158,11,0.08)" : "#fef3c7" }}/>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl opacity-50 translate-y-1/3 -translate-x-1/4 pointer-events-none"
        style={{ background: dark ? "rgba(249,115,22,0.06)" : "#ffedd5" }}/>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className={`transition-all duration-700 delay-100 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold text-amber-600 tracking-widest uppercase mb-8 border border-amber-200 bg-amber-50">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"/>Live Events Platform
              </span>
            </div>
            <div className={`transition-all duration-700 delay-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <h1 style={{ fontFamily:"'Playfair Display',Georgia,serif" }}>
                <span className={`block text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight ${t1}`}>Discover</span>
                <span className="block text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">Events</span>
                <span className={`block text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight ${t1}`}>Near You</span>
              </h1>
            </div>
            <p className={`mt-7 text-lg leading-relaxed max-w-md transition-all duration-700 delay-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"} ${t2}`}>
              Connect with your local community through events, volunteer with passionate organizers, and grow your organization's reach — all in one place.
            </p>
            <div className={`mt-9 flex flex-wrap gap-4 transition-all duration-700 delay-[400ms] ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <a href="/discover" className="group flex items-center gap-3 font-bold px-8 py-4 rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] text-base text-white"
                style={{ background: dark ? "linear-gradient(135deg,#f59e0b,#f97316)" : "#1c1917" }}>
                Explore Events
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </a>
              <a href="/organizer" className={`group flex items-center gap-3 border-2 font-semibold px-8 py-4 rounded-2xl transition-all duration-300 text-base ${dark ? "border-white/15 text-white/70 hover:border-amber-400/50 hover:text-amber-400 hover:bg-amber-400/5" : "border-stone-200 text-stone-700 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50"}`}>
                I'm an Organizer →
              </a>
            </div>
            <div className={`mt-10 flex items-center gap-5 transition-all duration-700 delay-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <div className="flex -space-x-2.5">
                {["🧑‍💼","👩‍🎤","🧑‍🔬","👩‍🎨"].map((e,i) => (
                  <div key={i} className="w-9 h-9 rounded-full border-2 border-white bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-sm shadow">{e}</div>
                ))}
              </div>
              <div>
                <div className={`font-bold text-sm ${t1}`}>12,000+ users joined</div>
                <div className="flex items-center gap-1 mt-0.5">
                  {[1,2,3,4,5].map(i => <span key={i} className="text-amber-400 text-xs">★</span>)}
                  <span className={`text-xs ml-1 ${t3}`}>4.9 / 5</span>
                </div>
              </div>
            </div>
          </div>

          <div className={`transition-all duration-1000 delay-300 ${visible ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-10 scale-95"}`}>
            <div className="relative">
              <div className="h-[480px] w-full"><HeroCarousel/></div>
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl shadow-stone-200 border border-stone-100 px-4 py-3 flex items-center gap-2 z-10 float-badge-delay">
                <span className="text-lg">🙌</span>
                <div>
                  <div className="text-stone-800 font-black text-xs">340 volunteers</div>
                  <div className="text-green-500 text-[10px] font-semibold">● Active now</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────
function Features({ dark }: { dark: boolean }) {
  const bg  = dark ? "#13151f" : "#f5f5f4";
  const t1  = dark ? "text-white"     : "text-stone-900";
  const t2  = dark ? "text-white/50"  : "text-stone-500";

  const features = [
    { icon:"🗺️", title:"Discover Nearby Events", desc:"Location-aware browsing that surfaces events happening around you — concerts, workshops, meetups, and more.", tag:"For Everyone",    tagCl: dark ? "bg-amber-400/10 text-amber-400"   : "bg-amber-100 text-amber-700",   cardCl: dark ? "border-white/6 hover:border-amber-400/20 bg-white/4"   : "border-amber-100 hover:border-amber-300 bg-amber-50" },
    { icon:"🎙️", title:"Organizer Dashboard",     desc:"Create, manage and promote your events with powerful tools. Build your audience and track attendance in real-time.",     tag:"Organizers",     tagCl: dark ? "bg-rose-400/10 text-rose-400"     : "bg-rose-100 text-rose-700",     cardCl: dark ? "border-white/6 hover:border-rose-400/20 bg-white/4"     : "border-rose-100 hover:border-rose-300 bg-rose-50" },
    { icon:"🤝", title:"Volunteer Marketplace",   desc:"Our standout feature — volunteers connect with organizers seamlessly. Browse opportunities or post needs for your events.", tag:"⭐ Highlight",   tagCl: dark ? "bg-violet-400/10 text-violet-400" : "bg-violet-100 text-violet-700", cardCl: dark ? "border-white/6 hover:border-violet-400/20 bg-white/4" : "border-violet-100 hover:border-violet-300 bg-violet-50" },
    { icon:"🏛️", title:"Organization Hub",        desc:"Your org gets its own space. List your domain, manage memberships, and coordinate events at institutional scale.",        tag:"Organizations",  tagCl: dark ? "bg-emerald-400/10 text-emerald-400": "bg-emerald-100 text-emerald-700",cardCl: dark ? "border-white/6 hover:border-emerald-400/20 bg-white/4": "border-emerald-100 hover:border-emerald-300 bg-emerald-50" },
  ];

  return (
    <section className="py-24 px-6 transition-colors duration-300" style={{ background: bg }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-amber-500 text-sm font-bold tracking-widest uppercase">Platform Features</span>
          <h2 className={`mt-4 text-5xl lg:text-6xl font-black leading-tight ${t1}`} style={{ fontFamily:"'Playfair Display',Georgia,serif" }}>
            Everything You Need<br/><span className={t2}>In One Place</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {features.map((f,i) => (
            <div key={i} className={`group relative border rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer ${f.cardCl}`}>
              <div className="flex items-start justify-between mb-6">
                <div className="text-4xl">{f.icon}</div>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${f.tagCl}`}>{f.tag}</span>
              </div>
              <h3 className={`text-2xl font-black mb-3 ${t1}`} style={{ fontFamily:"'Playfair Display',Georgia,serif" }}>{f.title}</h3>
              <p className={`leading-relaxed ${t2}`}>{f.desc}</p>
              <div className={`mt-6 flex items-center gap-2 text-sm font-semibold transition-colors ${dark ? "text-white/25 group-hover:text-white/70" : "text-stone-400 group-hover:text-stone-700"}`}>
                Learn more
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
function HowItWorks({ dark }: { dark: boolean }) {
  const bg = dark ? "#0d0f17" : "#ffffff";
  const t1 = dark ? "text-white"    : "text-stone-900";
  const t2 = dark ? "text-white/45" : "text-stone-400";
  const cardCl = dark ? "bg-white/4 border-white/6 hover:border-amber-400/20" : "bg-white border-stone-100 hover:border-amber-200";

  const steps = [
    { num:"01", role:"User",         title:"Sign Up & Set Location", desc:"Create your profile, set your city and start discovering events happening around you today.", emoji:"📍" },
    { num:"02", role:"Organizer",    title:"Create Your Event",      desc:"Use the Organizer dashboard to list events, set capacity, and find volunteers for your big day.", emoji:"✏️" },
    { num:"03", role:"Volunteer",    title:"Connect & Contribute",   desc:"Browse volunteer opportunities near you, apply with one tap, and make an impact in your community.", emoji:"🙌" },
    { num:"04", role:"Organization", title:"Register Your Org",      desc:"List your organization's domain, onboard members, and join or host institutional events with ease.", emoji:"🏛️" },
  ];

  return (
    <section className="py-24 px-6 transition-colors duration-300" style={{ background: bg }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-amber-500 text-sm font-bold tracking-widest uppercase">How It Works</span>
          <h2 className={`mt-4 text-5xl font-black ${t1}`} style={{ fontFamily:"'Playfair Display',Georgia,serif" }}>
            For Every Role,<br/><span className={t2}>A Perfect Path</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s,i) => (
            <div key={i} className="relative group">
              {i < steps.length - 1 && <div className="hidden lg:block absolute top-8 left-[65%] w-full h-px border-t-2 border-dashed border-stone-200/30 z-0"/>}
              <div className={`relative z-10 border rounded-3xl p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl h-full shadow-sm ${cardCl}`}>
                <div className="flex items-start justify-between mb-6">
                  <div className="text-4xl">{s.emoji}</div>
                  <span className={`text-2xl font-black font-mono ${dark ? "text-white/8" : "text-stone-100"}`}>{s.num}</span>
                </div>
                <div className="mb-2"><span className="text-[10px] font-bold tracking-widest uppercase text-amber-500">{s.role}</span></div>
                <h3 className={`font-bold text-lg leading-snug mb-3 ${t1}`} style={{ fontFamily:"'Playfair Display',Georgia,serif" }}>{s.title}</h3>
                <p className={`text-sm leading-relaxed ${t2}`}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Video Section ────────────────────────────────────────────────────────────
function VideoSection() {
  const [playing, setPlaying] = useState(false);
  return (
    <section className="relative py-28 px-6 overflow-hidden bg-stone-900">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-32 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full" style={{ background:"radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%)" }}/>
        <div className="absolute -right-32 top-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full" style={{ background:"radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)" }}/>
      </div>
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2.5 bg-amber-400/10 border border-amber-400/20 rounded-full px-5 py-2 mb-7">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#fbbf24"><path d="M8 5v14l11-7z"/></svg>
            <span className="text-amber-400 text-[11px] font-black tracking-widest uppercase">See it in action</span>
          </div>
          <h2 className="text-white text-5xl lg:text-6xl font-black leading-tight mb-5" style={{ fontFamily:"'Playfair Display',Georgia,serif" }}>
            Watch Eventimist<br/><span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">Come to Life</span>
          </h2>
        </div>
        <div className="relative max-w-4xl mx-auto">
          <div className="absolute -top-3 -left-3 w-12 h-12 border-t-2 border-l-2 border-amber-400/40 rounded-tl-2xl pointer-events-none z-20"/>
          <div className="absolute -top-3 -right-3 w-12 h-12 border-t-2 border-r-2 border-amber-400/40 rounded-tr-2xl pointer-events-none z-20"/>
          <div className="absolute -bottom-3 -left-3 w-12 h-12 border-b-2 border-l-2 border-amber-400/40 rounded-bl-2xl pointer-events-none z-20"/>
          <div className="absolute -bottom-3 -right-3 w-12 h-12 border-b-2 border-r-2 border-amber-400/40 rounded-br-2xl pointer-events-none z-20"/>
          <div className="relative rounded-3xl overflow-hidden" style={{ aspectRatio:"16/9", border:"1px solid rgba(255,255,255,0.08)", background:"#0a0a0a" }}>
            {!playing ? (
              <>
                <img src="https://img.youtube.com/vi/XRzcnvwyrCg/maxresdefault.jpg" alt="demo" className="w-full h-full object-cover" style={{ filter:"brightness(0.65)" }}/>
                <div className="absolute inset-0" style={{ background:"linear-gradient(to top,rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.2) 50%,rgba(0,0,0,0.3) 100%)" }}/>
                <div className="absolute inset-0 flex items-center justify-center">
                  <button onClick={() => setPlaying(true)} className="group relative flex items-center justify-center transition-transform duration-300 hover:scale-110 active:scale-95">
                    <span className="absolute w-28 h-28 rounded-full border border-amber-400/20" style={{ animation:"videoPulse 2.4s ease-out infinite" }}/>
                    <span className="absolute w-20 h-20 rounded-full border border-amber-400/30" style={{ animation:"videoPulse 2.4s ease-out 0.6s infinite" }}/>
                    <div className="relative w-16 h-16 rounded-full flex items-center justify-center" style={{ background:"linear-gradient(135deg,#f59e0b,#fbbf24)", boxShadow:"0 8px 32px rgba(251,191,36,0.5)" }}>
                      <svg className="w-7 h-7 ml-1" viewBox="0 0 24 24" fill="#1c1917"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 px-7 py-5">
                  <p className="text-white font-black text-lg" style={{ fontFamily:"'Playfair Display',Georgia,serif" }}>Eventimist Platform Overview</p>
                  <p className="text-white/50 text-sm mt-0.5">Discover · Organize · Volunteer</p>
                </div>
              </>
            ) : (
              <iframe className="w-full h-full" src="https://www.youtube.com/embed/XRzcnvwyrCg?autoplay=1&rel=0&modestbranding=1" title="Eventimist" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ border:"none" }}/>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes videoPulse { 0% { transform:scale(0.8);opacity:0.6; } 100% { transform:scale(1.6);opacity:0; } }`}</style>
    </section>
  );
}

// ─── Volunteer Section ────────────────────────────────────────────────────────
function VolunteerSection({ dark }: { dark: boolean }) {
  const bg = dark ? "#13151f" : "#f5f5f4";
  return (
    <section className="py-24 px-6 transition-colors duration-300" style={{ background: bg }}>
      <div className="max-w-7xl mx-auto">
        <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-[2.5rem] p-12 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"/>
          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-4 py-1.5 text-xs font-bold text-white tracking-wider uppercase mb-6">⭐ Key Highlight</span>
              <h2 className="text-white text-5xl font-black leading-tight mb-6" style={{ fontFamily:"'Playfair Display',Georgia,serif" }}>
                Volunteers Meet<br/><span className="text-amber-300">Organizers Here</span>
              </h2>
              <p className="text-white/80 text-lg leading-relaxed mb-8">Our volunteer marketplace is unlike anything else. Whether you're an eager volunteer or an organizer needing hands, finding each other has never been this simple.</p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-white text-violet-700 hover:bg-amber-50 font-bold px-7 py-3.5 rounded-xl transition-all hover:shadow-xl hover:scale-[1.02]">Find Opportunities</button>
                <button className="border border-white/30 hover:border-white/60 text-white font-semibold px-7 py-3.5 rounded-xl transition-all hover:bg-white/10">Post a Need</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[{emoji:"🎭",title:"Art & Culture",count:"340 open"},{emoji:"🌱",title:"Environment",count:"210 open"},{emoji:"🏥",title:"Health & Care",count:"180 open"},{emoji:"📚",title:"Education",count:"290 open"}].map((cat,i) => (
                <div key={i} className="bg-white/10 hover:bg-white/20 border border-white/15 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <div className="text-2xl mb-3">{cat.emoji}</div>
                  <div className="text-white font-bold text-sm mb-1">{cat.title}</div>
                  <div className="text-amber-300 text-xs font-semibold">{cat.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Gallery Strip ────────────────────────────────────────────────────────────
function GalleryStrip({ dark }: { dark: boolean }) {
  const bg = dark ? "#0d0f17" : "#ffffff";
  return (
    <section className="py-16 overflow-hidden transition-colors duration-300" style={{ background: bg }}>
      <div className="max-w-7xl mx-auto px-6 mb-10 text-center">
        <span className="text-amber-500 text-sm font-bold tracking-widest uppercase">From Our Community</span>
        <h2 className={`mt-3 text-4xl font-black ${dark ? "text-white" : "text-stone-900"}`} style={{ fontFamily:"'Playfair Display',Georgia,serif" }}>Events Come Alive</h2>
      </div>
      <div className="flex gap-4 gallery-scroll" style={{ width:"max-content" }}>
        {[...carouselSlides,...carouselSlides].map((s,i) => (
          <div key={i} className="w-64 h-44 rounded-2xl overflow-hidden flex-shrink-0 group cursor-pointer relative shadow-sm">
            <img src={s.url} alt={s.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
              <span className="text-white text-xs font-bold">{s.title}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Mobile Section ───────────────────────────────────────────────────────────
function MobileSection({ dark }: { dark: boolean }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const bg = dark ? "#13151f" : "#f5f5f4";
  const t1 = dark ? "text-white"    : "text-stone-900";
  const t2 = dark ? "text-white/50" : "text-stone-500";

  return (
    <section className="py-24 px-6 transition-colors duration-300" style={{ background: bg }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-amber-500 text-sm font-bold tracking-widest uppercase">Mobile App</span>
            <h2 className={`mt-4 text-5xl font-black leading-tight mb-6 ${t1}`} style={{ fontFamily:"'Playfair Display',Georgia,serif" }}>
              Eventimist in<br/><span className={t2}>Your Pocket</span>
            </h2>
            <p className={`text-lg leading-relaxed mb-8 ${t2}`}>All the power of Eventimist on iOS and Android. Real-time notifications, volunteer matching, and event discovery — always with you.</p>
            {!submitted ? (
              <div className="flex gap-3 max-w-sm">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                  className={`flex-1 px-4 py-3 rounded-xl border text-sm outline-none transition-colors ${dark ? "bg-white/6 border-white/10 text-white placeholder:text-white/25 focus:border-amber-400/50" : "bg-white border-stone-200 text-stone-900 focus:border-amber-400"}`}/>
                <button onClick={() => { if (email) setSubmitted(true); }}
                  className="text-white font-bold px-5 py-3 rounded-xl text-sm transition-all hover:scale-[1.02]"
                  style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)" }}>
                  Notify Me
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-emerald-500 font-semibold text-sm">
                <div className="w-7 h-7 rounded-full bg-emerald-500/15 flex items-center justify-center">✓</div>
                You're on the list! We'll let you know when it's ready.
              </div>
            )}
            <p className={`text-xs mt-3 ${dark ? "text-white/25" : "text-stone-400"}`}>No spam. Just a launch notification.</p>
          </div>

          {/* Phone mockup */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="relative w-[220px] h-[440px] rounded-[40px] flex items-center justify-center overflow-hidden shadow-2xl shadow-stone-900/30"
                style={{ background:"linear-gradient(145deg,#1c1917,#0c0a09)", border:"2px solid rgba(255,255,255,0.08)" }}>
                <div className="absolute inset-0 rounded-[38px] overflow-hidden">
                  <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full" style={{ background:"radial-gradient(circle,rgba(245,158,11,0.15) 0%,transparent 70%)" }}/>
                </div>
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-4 rounded-full bg-black z-20"/>
                <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </div>
                  <div>
                    <p className="text-white font-black text-base" style={{ fontFamily:"'Playfair Display',Georgia,serif" }}>eventimist</p>
                    <p className="text-stone-500 text-[10px] mt-0.5 font-medium tracking-wider uppercase">Mobile App</p>
                  </div>
                  <div className="px-4 py-2 rounded-full border border-amber-400/30 bg-amber-400/10">
                    <span className="text-amber-400 text-[11px] font-black tracking-widest uppercase">Coming Soon</span>
                  </div>
                  <div className="w-full space-y-2.5 opacity-40">
                    {[{e:"🍎",a:"Download on the",b:"App Store"},{e:"🤖",a:"Get it on",b:"Google Play"}].map((s,i) => (
                      <div key={i} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5" style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)" }}>
                        <span className="text-base">{s.e}</span>
                        <div className="text-left">
                          <div className="text-[8px] text-stone-400 leading-none">{s.a}</div>
                          <div className="text-white text-[11px] font-bold leading-none mt-0.5">{s.b}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <span className="absolute -right-[3px] top-20 h-12 w-[3px] rounded-r-full bg-stone-700"/>
                <span className="absolute -left-[3px] top-16 h-7 w-[3px] rounded-l-full bg-stone-700"/>
                <span className="absolute -left-[3px] top-24 h-12 w-[3px] rounded-l-full bg-stone-700"/>
                <span className="absolute -left-[3px] top-36 h-12 w-[3px] rounded-l-full bg-stone-700"/>
              </div>
              <div className="absolute -top-4 -right-6 bg-amber-400 text-stone-900 text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full shadow-lg shadow-amber-400/30 rotate-6">Q4 2026</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────
function FinalCTA({ dark }: { dark: boolean }) {
  const bg = dark ? "#0d0f17" : "#ffffff";
  return (
    <section className="py-24 px-6 transition-colors duration-300" style={{ background: bg }}>
      <div className="max-w-4xl mx-auto text-center">
        <div className="relative rounded-[2.5rem] p-16 overflow-hidden border-2"
          style={{ background: dark ? "linear-gradient(135deg,rgba(245,158,11,0.06),rgba(249,115,22,0.04))" : "linear-gradient(135deg,#fffbeb,#fff7ed,#fff1f2)", borderColor: dark ? "rgba(245,158,11,0.12)" : "#fde68a" }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 blur-3xl pointer-events-none"
            style={{ background: dark ? "rgba(245,158,11,0.08)" : "rgba(251,191,36,0.3)" }}/>
          <div className="relative z-10">
            <span className="text-5xl mb-6 block">🎉</span>
            <h2 className={`text-5xl lg:text-6xl font-black leading-tight mb-6 ${dark ? "text-white" : "text-stone-900"}`} style={{ fontFamily:"'Playfair Display',Georgia,serif" }}>
              Ready to Join<br/><span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">The Community?</span>
            </h2>
            <p className={`text-lg mb-10 max-w-xl mx-auto ${dark ? "text-white/45" : "text-stone-500"}`}>Sign up free and start discovering what's happening near you. No credit card required.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/user" className="group flex items-center justify-center gap-3 text-white font-bold px-10 py-4 rounded-2xl transition-all hover:shadow-2xl hover:scale-[1.02] text-base"
                style={{ background: dark ? "linear-gradient(135deg,#f59e0b,#f97316)" : "#1c1917" }}>
                Sign Up Free
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </a>
              <a href="/organizer" className={`border-2 font-semibold px-10 py-4 rounded-2xl transition-all text-base ${dark ? "border-white/15 text-white/60 hover:border-amber-400/40 hover:text-amber-400" : "border-stone-200 text-stone-700 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50"}`}>
                For Organizers →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer({ dark }: { dark: boolean }) {
  const bg = dark ? "#13151f" : "#ffffff";
  return (
    <footer className="border-t py-12 px-6 transition-colors duration-300" style={{ background: bg, borderColor: dark ? "rgba(255,255,255,0.06)" : "#f5f5f4" }}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <span className={`font-black text-lg ${dark ? "text-white" : "text-stone-900"}`} style={{ fontFamily:"'Playfair Display',Georgia,serif" }}>eventimist</span>
        </div>
        <div className="flex gap-8 text-sm" style={{ color: dark ? "rgba(255,255,255,0.3)" : "#a8a29e" }}>
          {["Privacy","Terms","Contact","Blog"].map(link => (
            <a key={link} href="#" className="hover:text-amber-500 transition-colors">{link}</a>
          ))}
        </div>
        <div className="text-xs" style={{ color: dark ? "rgba(255,255,255,0.2)" : "#d6d3d1" }}>© 2025 Eventimist. All rights reserved.</div>
      </div>
    </footer>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Page() {
  const { dark, toggle } = useDark();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap');
        *,*::before,*::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; }
        @keyframes ticker-move { 0% { transform: translateX(0); } 100% { transform: translateX(-33.333%); } }
        .ticker-scroll { animation: ticker-move 28s linear infinite; }
        @keyframes progress { from { width: 0%; } to { width: 100%; } }
        .carousel-progress { animation: progress 4.5s linear forwards; }
        @keyframes float-delay { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        .float-badge-delay { animation: float-delay 4s ease-in-out infinite 0.8s; }
        @keyframes gallery { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .gallery-scroll { animation: gallery 22s linear infinite; }
        .gallery-scroll:hover { animation-play-state: paused; }
        @keyframes dropIn { from { opacity:0; transform:translateY(-8px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes backdropIn { from { opacity:0; } to { opacity:1; } }
      `}</style>

      <div className="min-h-screen transition-colors duration-300" style={{ background: dark ? "#0d0f17" : "#ffffff", color: dark ? "#fff" : "#1c1917" }}>
        <Nav dark={dark} onToggle={toggle}/>
        <Hero dark={dark}/>
        <Ticker dark={dark}/>
        <VideoSection/>
        <Features dark={dark}/>
        <HowItWorks dark={dark}/>
        <VolunteerSection dark={dark}/>
        <GalleryStrip dark={dark}/>
        <MobileSection dark={dark}/>
        <FinalCTA dark={dark}/>
        <Footer dark={dark}/>
      </div>
    </>
  );
}