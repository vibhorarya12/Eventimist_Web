"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── Carousel Slides (swap these URLs for your own images anytime) ─────────
const carouselSlides = [
  {
    url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
    tag: "Music Festival",
    title: "Rhythms of the City",
    sub: "Mumbai · Mar 22",
  },
  {
    url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&q=80",
    tag: "Community",
    title: "Volunteer Day 2025",
    sub: "Delhi · Apr 5",
  },
  {
    url: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&q=80",
    tag: "Tech",
    title: "Startup Summit",
    sub: "Bangalore · Apr 12",
  },
  {
    url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80",
    tag: "Networking",
    title: "Young Leaders Forum",
    sub: "Hyderabad · Apr 19",
  },
  {
    url: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80",
    tag: "Corporate",
    title: "Business Gala Night",
    sub: "Pune · May 3",
  },
];

// ─── Hero Carousel ─────────────────────────────────────────────────────────
function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [prevIdx, setPrevIdx] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback(
    (index: number) => {
      if (animating || index === current) return;
      setAnimating(true);
      setPrevIdx(current);
      setCurrent(index);
      setTimeout(() => {
        setPrevIdx(null);
        setAnimating(false);
      }, 700);
    },
    [animating, current]
  );

  const next = useCallback(() => {
    goTo((current + 1) % carouselSlides.length);
  }, [current, goTo]);

  useEffect(() => {
    timerRef.current = setTimeout(next, 4500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current, next]);

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl shadow-orange-200/60 group">
      {carouselSlides.map((slide, i) => {
        const isActive = i === current;
        const isPrev = i === prevIdx;
        return (
          <div
            key={i}
            className="absolute inset-0 transition-all duration-700 ease-in-out"
            style={{
              opacity: isActive ? 1 : isPrev ? 0 : 0,
              transform: isActive ? "scale(1)" : isPrev ? "scale(1.05)" : "scale(1)",
              zIndex: isActive ? 2 : isPrev ? 1 : 0,
              pointerEvents: isActive ? "auto" : "none",
            }}
          >
            <img
              src={slide.url}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div
              className="absolute bottom-0 left-0 right-0 p-8 transition-all duration-700"
              style={{
                transform: isActive ? "translateY(0)" : "translateY(20px)",
                opacity: isActive ? 1 : 0,
                transitionDelay: isActive ? "200ms" : "0ms",
              }}
            >
              <span className="inline-block bg-amber-400 text-stone-900 text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full mb-3">
                {slide.tag}
              </span>
              <div
                className="text-white font-black text-2xl leading-tight"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {slide.title}
              </div>
              <div className="text-white/60 text-sm mt-1 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {slide.sub}
              </div>
            </div>
          </div>
        );
      })}

      {/* Prev arrow */}
      <button
        onClick={() => goTo((current - 1 + carouselSlides.length) % carouselSlides.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
      >
        <svg className="w-4 h-4 text-stone-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Next arrow */}
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
      >
        <svg className="w-4 h-4 text-stone-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 right-6 z-10 flex items-center gap-1.5">
        {carouselSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`transition-all duration-300 rounded-full ${
              i === current ? "w-6 h-2 bg-amber-400" : "w-2 h-2 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/20 z-10">
        <div key={current} className="h-full bg-amber-400 carousel-progress" />
      </div>
    </div>
  );
}

// ─── Ticker ────────────────────────────────────────────────────────────────
const tickerItems = [
  "Events Near You", "Connect with Organizers", "Volunteer Opportunities",
  "Organization Hub", "Discover Communities", "Join the Movement",
];

function Ticker() {
  return (
    <div className="overflow-hidden bg-stone-900 text-amber-400 py-2.5 font-mono text-xs font-bold tracking-widest uppercase">
      <div className="flex ticker-scroll whitespace-nowrap">
        {[...tickerItems, ...tickerItems, ...tickerItems].map((item, i) => (
          <span key={i} className="mx-8">
            {item}
            <span className="mx-8 text-stone-600">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Nav ────────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-sm border-b border-stone-200/80 py-3"
          : "py-6 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-300/40">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <span className="text-stone-900 font-black text-xl tracking-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            eventimist
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-stone-500 font-medium">
          {["Discover", "Organize", "Volunteer", "Organizations"].map((item) => (
            <a key={item} href="organize" className="hover:text-stone-900 transition-colors duration-200">
              {item}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button className="hidden sm:block text-sm text-stone-600 hover:text-stone-900 transition-colors px-4 py-2 rounded-lg hover:bg-stone-100">
            Sign In
          </button>
          <button className="text-sm font-bold bg-stone-900 hover:bg-stone-700 text-white px-5 py-2.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]">
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}

// ─── Hero ───────────────────────────────────────────────────────────────────
function Hero() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden bg-white">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-100 rounded-full blur-3xl opacity-60 -translate-y-1/3 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-100 rounded-full blur-3xl opacity-50 translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left: copy */}
          <div>
            <div className={`transition-all duration-700 delay-100 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <span className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 text-xs font-bold text-amber-600 tracking-widest uppercase mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Live Events Platform
              </span>
            </div>

            <div className={`transition-all duration-700 delay-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                <span className="block text-stone-900 text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight">Discover</span>
                <span className="block text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">Events</span>
                <span className="block text-stone-900 text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight">Near You</span>
              </h1>
            </div>

            <p className={`mt-7 text-stone-500 text-lg leading-relaxed max-w-md transition-all duration-700 delay-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              Connect with your local community through events, volunteer with passionate organizers, and grow your organization's reach — all in one place.
            </p>

            <div className={`mt-9 flex flex-wrap gap-4 transition-all duration-700 delay-[400ms] ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <button className="group flex items-center gap-3 bg-stone-900 hover:bg-stone-700 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-stone-900/20 hover:scale-[1.02] active:scale-[0.98] text-base">
                Explore Events
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              <button className="group flex items-center gap-3 border-2 border-stone-200 hover:border-amber-400 text-stone-700 hover:text-amber-600 font-semibold px-8 py-4 rounded-2xl transition-all duration-300 hover:bg-amber-50 text-base">
                I'm an Organizer →
              </button>
            </div>

            <div className={`mt-10 flex items-center gap-5 transition-all duration-700 delay-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <div className="flex -space-x-2.5">
                {["🧑‍💼", "👩‍🎤", "🧑‍🔬", "👩‍🎨"].map((e, i) => (
                  <div key={i} className="w-9 h-9 rounded-full border-2 border-white bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-sm shadow">
                    {e}
                  </div>
                ))}
              </div>
              <div>
                <div className="text-stone-800 font-bold text-sm">12,000+ users joined</div>
                <div className="flex items-center gap-1 mt-0.5">
                  {[1,2,3,4,5].map(i => <span key={i} className="text-amber-400 text-xs">★</span>)}
                  <span className="text-stone-400 text-xs ml-1">4.9 / 5</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: carousel */}
          <div className={`transition-all duration-1000 delay-300 ${visible ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-10 scale-95"}`}>
            <div className="relative">
              <div className="h-[480px] w-full">
                <HeroCarousel />
              </div>

              {/* Floating badge — bottom left */}
              {/* <div className="absolute -bottom-5 -left-6 bg-white rounded-2xl shadow-xl shadow-stone-200 border border-stone-100 px-5 py-4 flex items-center gap-3 float-badge z-10">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-xl">📍</div>
                <div>
                  <div className="text-stone-800 font-black text-sm">47 events nearby</div>
                  <div className="text-stone-400 text-xs">Meerut, UP</div>
                </div>
              </div> */}

              {/* Floating badge — top right */}
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

// ─── Stats ──────────────────────────────────────────────────────────────────
function Stats() {
  const stats = [
    { val: "50K+", label: "Events Listed", icon: "📅" },
    { val: "120K+", label: "Active Users", icon: "👥" },
    { val: "8K+", label: "Volunteers", icon: "🙌" },
    { val: "2K+", label: "Organizations", icon: "🏛️" },
  ];
  return (
    <section className="py-6">
      <Ticker />
      <div className="max-w-7xl mx-auto px-6 mt-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="group bg-white hover:bg-amber-50 border border-stone-100 hover:border-amber-200 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg text-center shadow-sm">
              <div className="text-3xl mb-3">{s.icon}</div>
              <div className="text-4xl font-black text-stone-900 mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{s.val}</div>
              <div className="text-stone-400 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ───────────────────────────────────────────────────────────────
function Features() {
  const features = [
    {
      icon: "🗺️", title: "Discover Nearby Events",
      desc: "Location-aware browsing that surfaces events happening around you — concerts, workshops, meetups, and more.",
      tag: "For Everyone", bg: "bg-amber-50 hover:bg-amber-100/80 border-amber-100 hover:border-amber-300", tagColor: "bg-amber-100 text-amber-700",
    },
    {
      icon: "🎙️", title: "Organizer Dashboard",
      desc: "Create, manage and promote your events with powerful tools. Build your audience and track attendance in real-time.",
      tag: "Organizers", bg: "bg-rose-50 hover:bg-rose-100/80 border-rose-100 hover:border-rose-300", tagColor: "bg-rose-100 text-rose-700",
    },
    {
      icon: "🤝", title: "Volunteer Marketplace",
      desc: "Our standout feature — volunteers connect with organizers seamlessly. Browse opportunities or post needs for your events.",
      tag: "⭐ Highlight", bg: "bg-violet-50 hover:bg-violet-100/80 border-violet-100 hover:border-violet-300", tagColor: "bg-violet-100 text-violet-700",
    },
    {
      icon: "🏛️", title: "Organization Hub",
      desc: "Your org gets its own space. List your domain, manage memberships, and coordinate events at institutional scale.",
      tag: "Organizations", bg: "bg-emerald-50 hover:bg-emerald-100/80 border-emerald-100 hover:border-emerald-300", tagColor: "bg-emerald-100 text-emerald-700",
    },
  ];
  return (
    <section className="py-24 px-6 bg-stone-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-amber-500 text-sm font-bold tracking-widest uppercase">Platform Features</span>
          <h2 className="mt-4 text-stone-900 text-5xl lg:text-6xl font-black leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Everything You Need<br /><span className="text-stone-400">In One Place</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <div key={i} className={`group relative border rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer ${f.bg}`}>
              <div className="flex items-start justify-between mb-6">
                <div className="text-4xl">{f.icon}</div>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${f.tagColor}`}>{f.tag}</span>
              </div>
              <h3 className="text-stone-900 text-2xl font-black mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{f.title}</h3>
              <p className="text-stone-500 leading-relaxed">{f.desc}</p>
              <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-stone-400 group-hover:text-stone-700 transition-colors">
                Learn more
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { num: "01", role: "User", title: "Sign Up & Set Location", desc: "Create your profile, set your city and start discovering events happening around you today.", emoji: "📍" },
    { num: "02", role: "Organizer", title: "Create Your Event", desc: "Use the Organizer dashboard to list events, set capacity, and find volunteers for your big day.", emoji: "✏️" },
    { num: "03", role: "Volunteer", title: "Connect & Contribute", desc: "Browse volunteer opportunities near you, apply with one tap, and make an impact in your community.", emoji: "🙌" },
    { num: "04", role: "Organization", title: "Register Your Org", desc: "List your organization's domain, onboard members, and join or host institutional events with ease.", emoji: "🏛️" },
  ];
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-amber-500 text-sm font-bold tracking-widest uppercase">How It Works</span>
          <h2 className="mt-4 text-stone-900 text-5xl font-black" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            For Every Role,<br /><span className="text-stone-400">A Perfect Path</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={i} className="relative group">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[65%] w-full h-px border-t-2 border-dashed border-stone-200 z-0" />
              )}
              <div className="relative z-10 bg-white border border-stone-100 hover:border-amber-200 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-amber-50/80 h-full shadow-sm">
                <div className="flex items-start justify-between mb-6">
                  <div className="text-4xl">{s.emoji}</div>
                  <span className="text-2xl font-black text-stone-100 font-mono">{s.num}</span>
                </div>
                <div className="mb-2"><span className="text-[10px] font-bold tracking-widest uppercase text-amber-500">{s.role}</span></div>
                <h3 className="text-stone-900 font-bold text-lg leading-snug mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{s.title}</h3>
                <p className="text-stone-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Volunteer Section ───────────────────────────────────────────────────────
function VolunteerSection() {
  return (
    <section className="py-24 px-6 bg-stone-50">
      <div className="max-w-7xl mx-auto">
        <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-[2.5rem] p-12 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-4 py-1.5 text-xs font-bold text-white tracking-wider uppercase mb-6">
                ⭐ Key Highlight
              </span>
              <h2 className="text-white text-5xl font-black leading-tight mb-6" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Volunteers Meet<br /><span className="text-amber-300">Organizers Here</span>
              </h2>
              <p className="text-white/80 text-lg leading-relaxed mb-8">
                Eventimist's volunteer marketplace is unlike anything else. Whether you're an eager volunteer or an organizer needing hands, finding each other has never been this simple.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-white text-violet-700 hover:bg-amber-50 font-bold px-7 py-3.5 rounded-xl transition-all hover:shadow-xl hover:scale-[1.02]">
                  Find Opportunities
                </button>
                <button className="border border-white/30 hover:border-white/60 text-white font-semibold px-7 py-3.5 rounded-xl transition-all hover:bg-white/10">
                  Post a Need
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { emoji: "🎭", title: "Art & Culture", count: "340 open" },
                { emoji: "🌱", title: "Environment", count: "210 open" },
                { emoji: "🏥", title: "Health & Care", count: "180 open" },
                { emoji: "📚", title: "Education", count: "290 open" },
              ].map((cat, i) => (
                <div key={i} className="bg-white/10 hover:bg-white/20 border border-white/15 hover:border-white/30 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
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

// ─── Gallery Strip ───────────────────────────────────────────────────────────
function GalleryStrip() {
  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-10 text-center">
        <span className="text-amber-500 text-sm font-bold tracking-widest uppercase">From Our Community</span>
        <h2 className="mt-3 text-stone-900 text-4xl font-black" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Events Come Alive
        </h2>
      </div>
      <div className="flex gap-4 gallery-scroll" style={{ width: "max-content" }}>
        {[...carouselSlides, ...carouselSlides].map((s, i) => (
          <div key={i} className="w-64 h-44 rounded-2xl overflow-hidden flex-shrink-0 group cursor-pointer relative shadow-sm">
            <img
              src={s.url}
              alt={s.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
              <span className="text-white text-xs font-bold">{s.title}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Mobile Section ──────────────────────────────────────────────────────────
function MobileSection() {
  return (
    <section className="py-24 px-6 bg-stone-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-amber-500 text-sm font-bold tracking-widest uppercase">Mobile App</span>
            <h2 className="mt-4 text-stone-900 text-5xl font-black leading-tight mb-6" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Eventimist in<br /><span className="text-stone-400">Your Pocket</span>
            </h2>
            <p className="text-stone-500 text-lg leading-relaxed mb-8">
              All the power of Eventimist on iOS and Android. Real-time notifications, volunteer matching, and event discovery — always with you.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="flex items-center gap-3 bg-stone-900 hover:bg-stone-800 text-white font-semibold px-6 py-3.5 rounded-xl transition-all hover:shadow-lg">
                <span className="text-2xl">🍎</span>
                <div className="text-left">
                  <div className="text-[10px] text-stone-400">Download on the</div>
                  <div className="text-sm font-bold">App Store</div>
                </div>
              </button>
              <button className="flex items-center gap-3 border-2 border-stone-200 hover:border-stone-300 text-stone-800 font-semibold px-6 py-3.5 rounded-xl transition-all hover:bg-stone-50">
                <span className="text-2xl">🤖</span>
                <div className="text-left">
                  <div className="text-[10px] text-stone-400">Get it on</div>
                  <div className="text-sm font-bold">Google Play</div>
                </div>
              </button>
            </div>
          </div>
          {/* Phone mockup */}
          <div className="flex justify-center">
            <div className="relative w-72 h-[540px]">
              <div className="absolute inset-0 bg-gradient-to-b from-amber-100 to-violet-100 rounded-[3rem] blur-3xl scale-110 opacity-60" />
              <div className="relative w-full h-full bg-white border border-stone-200 rounded-[3rem] overflow-hidden shadow-2xl shadow-stone-200">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-stone-100 rounded-full z-10" />
                <div className="absolute inset-0 p-6 pt-16 bg-gradient-to-b from-stone-50 to-white">
                  <div className="text-stone-800 text-xs font-bold mb-4 tracking-wider">NEARBY EVENTS</div>
                  {[
                    { title: "Tech Meetup", time: "Tonight 7PM", color: "from-amber-400 to-orange-500" },
                    { title: "Food Festival", time: "Sat 12PM", color: "from-rose-400 to-pink-500" },
                    { title: "Yoga in Park", time: "Sun 6AM", color: "from-emerald-400 to-teal-500" },
                  ].map((item, i) => (
                    <div key={i} className="mb-3 bg-stone-50 border border-stone-100 rounded-2xl p-3 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex-shrink-0`} />
                      <div>
                        <div className="text-stone-800 text-xs font-bold">{item.title}</div>
                        <div className="text-stone-400 text-[10px]">{item.time}</div>
                      </div>
                    </div>
                  ))}
                  <div className="absolute bottom-6 left-4 right-4 bg-white border border-stone-100 shadow-lg rounded-2xl flex justify-around py-3">
                    {["🏠", "🗺️", "🔔", "👤"].map((icon, i) => (
                      <span key={i} className={`text-lg ${i === 0 ? "opacity-100" : "opacity-30"}`}>{icon}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ───────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <div className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 border-2 border-amber-100 rounded-[2.5rem] p-16 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-amber-200/50 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <span className="text-5xl mb-6 block">🎉</span>
            <h2 className="text-stone-900 text-5xl lg:text-6xl font-black leading-tight mb-6" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Ready to Join<br />
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">The Community?</span>
            </h2>
            <p className="text-stone-500 text-lg mb-10 max-w-xl mx-auto">
              Sign up free and start discovering what's happening near you. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="group flex items-center justify-center gap-3 bg-stone-900 hover:bg-stone-700 text-white font-bold px-10 py-4 rounded-2xl transition-all hover:shadow-2xl hover:shadow-stone-900/20 hover:scale-[1.02] text-base">
                Sign Up Free
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              <button className="border-2 border-stone-200 hover:border-amber-400 text-stone-700 hover:text-amber-600 font-semibold px-10 py-4 rounded-2xl transition-all hover:bg-amber-50 text-base">
                For Organizers →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-stone-100 py-12 px-6 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <span className="text-stone-900 font-black text-lg" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>eventimist</span>
        </div>
        <div className="flex gap-8 text-sm text-stone-400">
          {["Privacy", "Terms", "Contact", "Blog"].map(link => (
            <a key={link} href="#" className="hover:text-stone-800 transition-colors">{link}</a>
          ))}
        </div>
        <div className="text-stone-300 text-xs">© 2025 Eventimist. All rights reserved.</div>
      </div>
    </footer>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Page() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap');

        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { background: #ffffff; color: #1c1917; }

        /* Ticker */
        @keyframes ticker-move {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .ticker-scroll { animation: ticker-move 28s linear infinite; }

        /* Carousel progress bar */
        @keyframes progress {
          from { width: 0%; }
          to   { width: 100%; }
        }
        .carousel-progress { animation: progress 4.5s linear forwards; }

        /* Floating badges */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes float-delay {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
        .float-badge       { animation: float 3.5s ease-in-out infinite; }
        .float-badge-delay { animation: float-delay 4s ease-in-out infinite 0.8s; }

        /* Gallery strip auto-scroll */
        @keyframes gallery {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .gallery-scroll { animation: gallery 22s linear infinite; }
        .gallery-scroll:hover { animation-play-state: paused; }
      `}</style>

      <div className="min-h-screen bg-white text-stone-900">
        <Nav />
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <VolunteerSection />
        <GalleryStrip />
        <MobileSection />
        <FinalCTA />
        <Footer />
      </div>
    </>
  );
}