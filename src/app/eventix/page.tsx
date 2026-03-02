"use client";

import { useEffect, useState } from "react";

// ─── Org logos for marquee ────────────────────────────────────────────────────
const ORG_LOGOS = [
  { name: "TechCorp India",    abbr: "TC", color: "bg-blue-600"    },
  { name: "GreenEarth NGO",   abbr: "GE", color: "bg-emerald-600" },
  { name: "MedCare Trust",    abbr: "MC", color: "bg-rose-600"    },
  { name: "EduSphere",        abbr: "ES", color: "bg-violet-600"  },
  { name: "NexGen Solutions", abbr: "NG", color: "bg-amber-600"   },
  { name: "CitizenFirst",     abbr: "CF", color: "bg-teal-600"    },
  { name: "ArtHouse Delhi",   abbr: "AH", color: "bg-pink-600"    },
  { name: "SportZone",        abbr: "SZ", color: "bg-orange-600"  },
  { name: "FinCore Ltd",      abbr: "FC", color: "bg-indigo-600"  },
  { name: "UrbanRoots",       abbr: "UR", color: "bg-lime-600"    },
];

// ─── Eye toggle icon ──────────────────────────────────────────────────────────
function Eye({ open }: { open: boolean }) {
  return open ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

// ─── Input (dark themed) ──────────────────────────────────────────────────────
function DarkInput({ icon, type = "text", value, onChange, placeholder, required, mono, prefix }: {
  icon?: React.ReactNode; type?: string; value: string;
  onChange: (v: string) => void; placeholder: string;
  required?: boolean; mono?: boolean; prefix?: string;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 text-sm font-mono select-none">{prefix}</span>
      )}
      {icon && !prefix && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none">{icon}</span>
      )}
      <input
        type={isPassword ? (show ? "text" : "password") : type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={`w-full py-3 bg-white/5 border border-white/10 hover:border-white/20 focus:border-teal-500/50 focus:bg-white/8 focus:ring-4 focus:ring-teal-500/10 rounded-xl text-sm text-white/80 placeholder:text-white/20 outline-none transition-all ${prefix ? "pl-8 pr-4" : icon ? "pl-10 pr-4" : "px-4"} ${isPassword ? "pr-10" : ""} ${mono ? "font-mono" : ""}`}
      />
      {isPassword && (
        <button type="button" onClick={() => setShow(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors">
          <Eye open={show} />
        </button>
      )}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-[10px] font-bold text-white/35 mb-1.5 tracking-widest uppercase">{children}</label>;
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#060d1f]/95 backdrop-blur-xl border-b border-white/5 py-3" : "py-5"}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <a href="/eventix" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span className="text-white font-black text-xl tracking-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>eventix</span>
          <span className="text-teal-400 font-black text-xl tracking-tight">space</span>
          <span className="hidden sm:block text-[10px] font-bold tracking-widest uppercase text-white/20 border border-white/8 rounded-full px-2 py-0.5 ml-1">by eventimist</span>
        </a>

        <div className="hidden md:flex items-center gap-8 text-sm text-white/45 font-medium">
          {["Features", "Pricing", "Domains"].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} className="hover:text-white transition-colors">{l}</a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <a href="#auth" className="text-sm text-white/50 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5">Sign In</a>
          <a href="#auth" className="text-sm font-bold bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-300 hover:to-cyan-400 text-[#060d1f] px-5 py-2.5 rounded-xl transition-all hover:shadow-lg hover:shadow-teal-500/25 hover:scale-[1.02]">
            Register Org
          </a>
        </div>

        <button onClick={() => setMobileOpen(v => !v)} className="md:hidden text-white/50 p-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            {mobileOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-[#0b1630] border-t border-white/5 px-6 py-4 flex flex-col gap-3">
          {["Features","Pricing","Domains"].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} className="text-white/50 hover:text-white text-sm py-2">{l}</a>
          ))}
          <div className="flex gap-3 mt-1">
            <a href="#auth" className="flex-1 text-center text-sm border border-white/10 text-white/50 rounded-xl py-2.5">Sign In</a>
            <a href="#auth" className="flex-1 text-center text-sm font-bold bg-gradient-to-r from-teal-400 to-cyan-500 text-[#060d1f] rounded-xl py-2.5">Register Org</a>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  const [vis, setVis] = useState(false);
  useEffect(() => { setTimeout(() => setVis(true), 80); }, []);

  return (
    <section className="relative min-h-screen flex items-center pt-28 pb-20 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-[#060d1f]" />
      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.06]" style={{
        backgroundImage: "linear-gradient(rgba(45,212,191,1) 1px,transparent 1px),linear-gradient(90deg,rgba(45,212,191,1) 1px,transparent 1px)",
        backgroundSize: "72px 72px"
      }} />
      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-teal-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-600/6 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <div className={`transition-all duration-700 delay-100 ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <span className="inline-flex items-center gap-2 border border-teal-500/30 bg-teal-500/8 rounded-full px-4 py-1.5 text-xs font-bold text-teal-400 tracking-widest uppercase mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                Organisation-first Event Space
              </span>
            </div>
            <h1 className={`transition-all duration-700 delay-200 ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              <span className="block text-white text-6xl lg:text-7xl font-black leading-[0.93] tracking-tight">Your Org's</span>
              <span className="block text-6xl lg:text-7xl font-black leading-[0.93] tracking-tight bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-400 bg-clip-text text-transparent">Exclusive</span>
              <span className="block text-white text-6xl lg:text-7xl font-black leading-[0.93] tracking-tight">Event Space</span>
            </h1>
            <p className={`mt-8 text-white/45 text-lg leading-relaxed max-w-lg transition-all duration-700 delay-300 ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              A private, domain-verified hub where organisations host events and members join automatically — no invite chaos, no outsiders.
            </p>
            <div className={`mt-10 flex flex-wrap gap-4 transition-all duration-700 delay-[400ms] ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <a href="#auth" className="group flex items-center gap-3 bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-300 hover:to-cyan-400 text-[#060d1f] font-black px-8 py-4 rounded-2xl transition-all hover:shadow-2xl hover:shadow-teal-500/25 hover:scale-[1.02] text-base">
                Register Your Organisation
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </a>
              <a href="#auth" className="flex items-center gap-3 border border-white/12 hover:border-white/25 text-white/70 hover:text-white font-semibold px-8 py-4 rounded-2xl transition-all hover:bg-white/4 text-base">
                Sign In
              </a>
            </div>
            {/* Domain badge */}
            <div className={`mt-10 inline-flex items-center gap-3 bg-white/4 border border-white/8 rounded-2xl px-5 py-3 transition-all duration-700 delay-500 ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <div className="w-8 h-8 rounded-lg bg-teal-500/15 flex items-center justify-center">
                <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <div>
                <div className="text-white/75 text-xs font-bold">Domain-verified Access</div>
                <div className="text-white/30 text-[10px] mt-0.5">Only <span className="text-teal-400 font-mono">@yourorg.com</span> emails can join</div>
              </div>
            </div>
          </div>

          {/* Right — dashboard mockup */}
          <div className={`transition-all duration-1000 delay-400 ${vis ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}`}>
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardMockup() {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-teal-500/8 rounded-3xl blur-2xl scale-105 pointer-events-none" />
      <div className="relative bg-[#0b1630] border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
        {/* Titlebar */}
        <div className="flex items-center gap-2 px-5 py-4 border-b border-white/6 bg-white/2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          <div className="flex-1 mx-3 bg-white/4 rounded-md px-3 py-1 text-[10px] text-white/25 font-mono">eventimist.com/eventix/techcorp</div>
          <div className="w-5 h-5 rounded bg-teal-500/20 flex items-center justify-center">
            <svg className="w-3 h-3 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
          </div>
        </div>
        <div className="p-6">
          {/* Org header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-xs font-black text-white">TC</div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-sm">TechCorp India</span>
                  <span className="text-[9px] font-bold text-teal-400 bg-teal-400/10 px-1.5 py-0.5 rounded-full">✓ Verified</span>
                </div>
                <div className="text-white/30 text-[10px]">@techcorp.in · Admin Panel</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
                <svg className="w-3 h-3 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <span className="text-white/40 text-[10px]">Admin</span>
            </div>
          </div>
          {/* Events */}
          <div className="space-y-2 mb-5">
            {[
              { title: "Annual Tech Summit", date: "Mar 28", n: 87, tag: "Conference", c: "bg-blue-500/20 text-blue-400" },
              { title: "Q1 All-Hands",       date: "Apr 2",  n: 212, tag: "Internal",    c: "bg-violet-500/20 text-violet-400" },
              { title: "CSR Volunteer Drive", date: "Apr 10", n: 45, tag: "Volunteer",   c: "bg-emerald-500/20 text-emerald-400" },
            ].map((e, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/3 border border-white/5 rounded-xl px-3 py-2.5 hover:bg-white/5 transition-colors cursor-pointer">
                <div className="w-7 h-7 rounded-lg bg-teal-500/15 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white/80 text-xs font-semibold truncate">{e.title}</div>
                  <div className="text-white/25 text-[9px]">{e.date} · {e.n} attending</div>
                </div>
                <span className={`text-[8px] font-black tracking-wide uppercase px-1.5 py-0.5 rounded-full ${e.c}`}>{e.tag}</span>
              </div>
            ))}
          </div>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[{ v: "12", l: "Events" }, { v: "340", l: "Members" }, { v: "94%", l: "Attendance" }].map((s, i) => (
              <div key={i} className="bg-white/3 rounded-xl p-2.5 text-center border border-white/4">
                <div className="text-teal-400 font-black text-lg" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{s.v}</div>
                <div className="text-white/25 text-[9px]">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute -top-4 -right-4 bg-[#0b1630] border border-teal-500/25 rounded-2xl px-4 py-3 shadow-xl flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-teal-400/15 flex items-center justify-center">
          <svg className="w-3 h-3 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
        </div>
        <div>
          <div className="text-white text-xs font-bold">Domain Verified</div>
          <div className="text-teal-400/60 text-[9px] font-mono">@techcorp.in</div>
        </div>
      </div>
      <div className="absolute -bottom-4 -left-4 bg-[#0b1630] border border-white/8 rounded-2xl px-4 py-3 shadow-xl flex items-center gap-2">
        <div className="flex -space-x-1.5">
          {["bg-teal-500","bg-blue-500","bg-violet-500"].map((c,i) => (
            <div key={i} className={`w-5 h-5 rounded-full ${c} border-2 border-[#0b1630] flex items-center justify-center text-[7px] font-bold text-white`}>{["R","S","T"][i]}</div>
          ))}
        </div>
        <div>
          <div className="text-white text-xs font-bold">+18 joined today</div>
          <div className="text-white/30 text-[9px]">via @techcorp.in</div>
        </div>
      </div>
    </div>
  );
}

// ─── Org marquee ──────────────────────────────────────────────────────────────
function OrgMarquee() {
  return (
    <section className="py-10 border-y border-white/5 bg-[#060d1f] overflow-hidden">
      <p className="text-center text-white/20 text-[10px] font-bold tracking-widest uppercase mb-6">Trusted by organisations across India</p>
      <div className="flex gap-5 org-marquee" style={{ width: "max-content" }}>
        {[...ORG_LOGOS, ...ORG_LOGOS, ...ORG_LOGOS].map((o, i) => (
          <div key={i} className="flex items-center gap-3 bg-white/3 border border-white/6 rounded-2xl px-4 py-2.5 flex-shrink-0 hover:bg-white/6 transition-colors">
            <div className={`w-7 h-7 rounded-md ${o.color} flex items-center justify-center text-[10px] font-black text-white`}>{o.abbr}</div>
            <span className="text-white/40 text-xs font-semibold whitespace-nowrap">{o.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── How it works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { num:"01", icon:"🏛️", title:"Register Your Org", desc:"Submit your org name, official domain, and category. Verified within 24 hours.", tag:"Org Admin" },
    { num:"02", icon:"🔐", title:"Domain Verification", desc:"Only @yourorg.com emails can access your private Eventix Space. Zero intruders.", tag:"Auto-secured" },
    { num:"03", icon:"📅", title:"Create Events", desc:"Admin posts internal or public events from the dashboard. Set RSVP limits and visibility.", tag:"Org Admin" },
    { num:"04", icon:"👥", title:"Members Auto-join", desc:"Any member signing in with the org email is instantly verified — no invite links.", tag:"Members" },
  ];
  return (
    <section className="py-24 px-6 bg-[#060d1f]" id="features">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-teal-400 text-sm font-bold tracking-widest uppercase">How It Works</span>
          <h2 className="mt-4 text-white text-5xl font-black" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Up and running<br /><span className="text-white/20">in four steps</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s, i) => (
            <div key={i} className="relative group">
              {i < 3 && <div className="hidden lg:block absolute top-10 left-[65%] w-full h-px border-t border-dashed border-white/8 z-0" />}
              <div className="relative z-10 bg-white/3 border border-white/7 hover:border-teal-500/30 hover:bg-teal-500/4 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-2 h-full">
                <div className="flex items-start justify-between mb-5">
                  <span className="text-4xl">{s.icon}</span>
                  <span className="text-2xl font-black text-white/6 font-mono">{s.num}</span>
                </div>
                <span className="text-[9px] font-bold tracking-widest uppercase text-teal-400/60 mb-2 block">{s.tag}</span>
                <h3 className="text-white font-bold text-base leading-snug mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{s.title}</h3>
                <p className="text-white/35 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────
function Features() {
  const list = [
    { icon:"🔐", title:"Domain-gated Access",         desc:"Your space is exclusively accessible to verified org email holders. Fully automated." },
    { icon:"📋", title:"Private Event Listings",       desc:"Create internal-only events visible only to org members — town halls, offsites, standups." },
    { icon:"🌐", title:"Public Event Discovery",       desc:"Optionally publish events to Eventimist's global feed and attract outside attendees." },
    { icon:"🤝", title:"Volunteer Marketplace",        desc:"Post volunteer roles from your org. Community members can apply; admin approves." },
    { icon:"📊", title:"Admin Analytics Dashboard",    desc:"Track attendance, RSVP rates, member growth, and event performance." },
    { icon:"🔔", title:"Smart Member Notifications",   desc:"Members auto-notified on new events. Priority alerts for RSVPs." },
  ];
  return (
    <section className="py-24 px-6 bg-[#07101f]" id="features-grid">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-teal-400 text-sm font-bold tracking-widest uppercase">Features</span>
          <h2 className="mt-4 text-white text-5xl font-black" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Built for organisations<br /><span className="text-white/20">that mean business</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {list.map((f, i) => (
            <div key={i} className="bg-white/2 border border-white/6 hover:border-teal-500/25 hover:bg-teal-500/3 rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-white font-bold text-base mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{f.title}</h3>
              <p className="text-white/35 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Domain checker ────────────────────────────────────────────────────────────
function DomainStrip() {
  const [domain, setDomain]   = useState("");
  const [status, setStatus]   = useState<null|"ok"|"taken">(null);
  const [checking, setChecking] = useState(false);

  const check = () => {
    if (!domain) return;
    setChecking(true); setStatus(null);
    setTimeout(() => { setChecking(false); setStatus(domain.includes("taken") ? "taken" : "ok"); }, 1100);
  };

  return (
    <section className="py-14 px-6 bg-[#060d1f] border-y border-white/5" id="domains">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-white/25 text-xs font-bold tracking-widest uppercase mb-3">Domain Check</p>
        <h3 className="text-white text-3xl font-black mb-6" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Is your domain available?
        </h3>
        <div className="flex gap-2 bg-white/4 border border-white/8 rounded-2xl p-1.5">
          <span className="flex items-center pl-4 text-white/25 text-sm font-mono select-none">@</span>
          <input
            value={domain} onChange={e => setDomain(e.target.value.toLowerCase().replace(/[^a-z0-9.-]/g,""))}
            onKeyDown={e => e.key === "Enter" && check()}
            placeholder="yourorganisation.com"
            className="flex-1 bg-transparent text-white/75 placeholder:text-white/18 text-sm font-mono outline-none py-2.5 min-w-0"
          />
          <button onClick={check} disabled={!domain || checking}
            className="flex-shrink-0 bg-gradient-to-r from-teal-400 to-cyan-500 text-[#060d1f] font-bold text-sm px-5 py-2.5 rounded-xl disabled:opacity-40 hover:scale-[1.02] hover:shadow-lg hover:shadow-teal-500/20 transition-all">
            {checking ? "Checking…" : "Check"}
          </button>
        </div>
        {status === "ok" && (
          <div className="mt-3 flex items-center justify-center gap-2 text-green-400 text-sm font-semibold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
            <span className="font-mono text-white/50">@{domain}</span> is available —
            <a href="#auth" className="text-teal-400 hover:underline ml-1">Register now →</a>
          </div>
        )}
        {status === "taken" && (
          <div className="mt-3 flex items-center justify-center gap-2 text-rose-400 text-sm font-semibold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            Already registered —
            <a href="#auth" className="text-teal-400 ml-1 hover:underline">Sign in instead →</a>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────
function Pricing() {
  const plans = [
    { name:"Starter", price:"Free", sub:"Forever", highlight:false, features:["1 domain","50 members","5 events/mo","Public listing","Basic analytics"] },
    { name:"Growth",  price:"₹999", sub:"/month",  highlight:true,  features:["1 domain","500 members","Unlimited events","Private + public","Advanced analytics","Volunteer matching","Priority support"] },
    { name:"Enterprise", price:"Custom", sub:"Contact us", highlight:false, features:["Multiple domains","Unlimited members","Unlimited events","Custom URL","API access","Custom branding","Dedicated SLA"] },
  ];
  return (
    <section className="py-24 px-6 bg-[#060d1f]" id="pricing">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-teal-400 text-sm font-bold tracking-widest uppercase">Pricing</span>
          <h2 className="mt-4 text-white text-5xl font-black" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Simple, transparent<br /><span className="text-white/20">for every org</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {plans.map((p, i) => (
            <div key={i} className={`relative rounded-3xl border p-8 transition-all duration-300 hover:-translate-y-1 ${p.highlight ? "bg-gradient-to-b from-teal-500/10 to-transparent border-teal-500/40 shadow-2xl shadow-teal-500/8" : "bg-white/2 border-white/7 hover:bg-white/4"}`}>
              {p.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-teal-400 to-cyan-500 text-[#060d1f] text-xs font-black px-4 py-1 rounded-full">Most Popular</div>
              )}
              <div className="text-white/35 text-xs font-bold tracking-widest uppercase mb-3">{p.name}</div>
              <div className="flex items-end gap-2 mb-7">
                <span className="text-white text-4xl font-black" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{p.price}</span>
                <span className="text-white/25 text-sm mb-1">{p.sub}</span>
              </div>
              <div className="space-y-3 mb-8">
                {p.features.map((f,j) => (
                  <div key={j} className="flex items-center gap-2.5 text-sm">
                    <svg className={`w-4 h-4 flex-shrink-0 ${p.highlight ? "text-teal-400" : "text-white/25"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    <span className="text-white/55">{f}</span>
                  </div>
                ))}
              </div>
              <a href="#auth" className={`block text-center font-bold py-3.5 rounded-2xl text-sm transition-all hover:scale-[1.01] ${p.highlight ? "bg-gradient-to-r from-teal-400 to-cyan-500 text-[#060d1f] hover:shadow-xl hover:shadow-teal-400/25" : "border border-white/10 text-white/60 hover:bg-white/5 hover:text-white"}`}>
                {p.price === "Custom" ? "Contact Sales" : p.price === "Free" ? "Get Started Free" : "Start Growth Plan"}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── AUTH SECTION: 3 tabs ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

type AuthTab = "member" | "admin" | "register";

const AUTH_TABS: { id: AuthTab; label: string; icon: React.ReactNode; desc: string }[] = [
  {
    id: "member",
    label: "Member Login",
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    desc: "Sign in with your organisation email",
  },
  {
    id: "admin",
    label: "Admin Login",
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>,
    desc: "Manage events & your Eventix Space",
  },
  {
    id: "register",
    label: "Register Org",
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    desc: "Create your organisation's space",
  },
];

// ── Member Login ──────────────────────────────────────────────────────────────
function MemberLoginForm({ onDone }: { onDone: () => void }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading]   = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); onDone(); }, 1600);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="bg-teal-500/6 border border-teal-500/15 rounded-2xl px-4 py-3 flex items-start gap-3">
        <svg className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p className="text-teal-300/80 text-xs leading-relaxed">
          Use your <strong>organisation email</strong> (e.g. <span className="font-mono">name@yourorg.com</span>). Personal emails won't work.
        </p>
      </div>

      <div>
        <Label>Organisation Email</Label>
        <DarkInput
          type="email" value={email} onChange={setEmail}
          placeholder="you@yourorg.com" required
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label>Password</Label>
          <a href="#" className="text-[10px] text-teal-400 hover:text-teal-300 font-semibold">Forgot password?</a>
        </div>
        <DarkInput
          type="password" value={password} onChange={setPassword}
          placeholder="Your password" required
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
        />
      </div>

      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <button type="button" onClick={() => setRemember(v => !v)}
          className={`w-4 h-4 rounded border-2 transition-all flex items-center justify-center flex-shrink-0 ${remember ? "bg-teal-400 border-teal-400" : "border-white/20 hover:border-teal-400/50"}`}>
          {remember && <svg className="w-2.5 h-2.5 text-[#060d1f]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
        </button>
        <span className="text-white/30 text-xs">Keep me signed in</span>
      </label>

      <SubmitBtn loading={loading} label="Sign In as Member" />
      <p className="text-center text-white/20 text-xs">
        Not a member yet?{" "}
        <span className="text-white/40">Ask your org admin to invite you, or</span>{" "}
        <a href="/" className="text-teal-400 hover:text-teal-300 font-semibold">use your org email to auto-join →</a>
      </p>
    </form>
  );
}

// ── Admin Login ───────────────────────────────────────────────────────────────
function AdminLoginForm({ onDone }: { onDone: () => void }) {
  const [email, setEmail]     = useState("");
  const [orgId, setOrgId]     = useState("");
  const [password, setPass]   = useState("");
  const [mfa, setMfa]         = useState("");
  const [showMfa, setShowMfa] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showMfa) { setShowMfa(true); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); onDone(); }, 1600);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Admin badge */}
      <div className="bg-amber-500/6 border border-amber-500/15 rounded-2xl px-4 py-3 flex items-start gap-3">
        <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
        </svg>
        <p className="text-amber-300/80 text-xs leading-relaxed">
          Admin access is <strong>separate</strong> from member login. Use your admin credentials set during org registration.
        </p>
      </div>

      {!showMfa ? (
        <>
          <div>
            <Label>Organisation ID / Slug</Label>
            <DarkInput
              value={orgId} onChange={setOrgId} placeholder="techcorp-india" required mono
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}
            />
            <p className="text-white/20 text-[10px] mt-1">Your unique org identifier (set during registration)</p>
          </div>

          <div>
            <Label>Admin Email</Label>
            <DarkInput
              type="email" value={email} onChange={setEmail} placeholder="admin@yourorg.com" required
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label>Admin Password</Label>
              <a href="#" className="text-[10px] text-teal-400 hover:text-teal-300 font-semibold">Forgot?</a>
            </div>
            <DarkInput
              type="password" value={password} onChange={setPass} placeholder="Your admin password" required
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
            />
          </div>
        </>
      ) : (
        /* MFA step */
        <div className="mfa-in">
          <div className="text-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-2xl mx-auto mb-3">🔑</div>
            <div className="text-white font-bold text-sm">Two-factor Authentication</div>
            <div className="text-white/30 text-xs mt-1">Enter the 6-digit code from your authenticator app</div>
          </div>
          <div>
            <Label>Verification Code</Label>
            <input
              value={mfa} onChange={e => setMfa(e.target.value.replace(/\D/g,"").slice(0,6))}
              placeholder="000 000" maxLength={6} required
              className="w-full px-4 py-4 bg-white/5 border border-white/10 hover:border-white/20 focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 rounded-xl text-xl text-white/80 placeholder:text-white/15 outline-none transition-all text-center font-mono tracking-[0.5em]"
            />
          </div>
          <button type="button" onClick={() => setShowMfa(false)} className="text-white/30 hover:text-white/60 text-xs transition-colors mt-2 block mx-auto">
            ← Back to credentials
          </button>
        </div>
      )}

      <SubmitBtn loading={loading} label={showMfa ? "Verify & Sign In" : "Continue →"} accent="amber" />
    </form>
  );
}

// ── Register Org ───────────────────────────────────────────────────────────────
function RegisterOrgForm({ onDone }: { onDone: () => void }) {
  const [orgName, setOrgName]       = useState("");
  const [slug, setSlug]             = useState("");
  const [domain, setDomain]         = useState("");
  const [category, setCategory]     = useState("");
  const [adminName, setAdminName]   = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [password, setPassword]     = useState("");
  const [size, setSize]             = useState("");
  const [agreed, setAgreed]         = useState(false);
  const [loading, setLoading]       = useState(false);

  // Auto-generate slug from org name
  const handleOrgName = (v: string) => {
    setOrgName(v);
    setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  };

  const CATEGORIES = ["NGO / Non-profit","Corporate","Educational Institution","Government Body","Healthcare","Sports & Recreation","Arts & Culture","Other"];
  const SIZES      = ["1–10","11–50","51–200","201–500","500+"];

  const passStrength = password.length === 0 ? 0 : password.length < 4 ? 1 : password.length < 7 ? 2 : password.length < 10 ? 3 : 4;
  const strMeta = [
    {l:"",c:""},
    {l:"Weak",  c:"bg-rose-400"},
    {l:"Fair",  c:"bg-amber-400"},
    {l:"Good",  c:"bg-yellow-400"},
    {l:"Strong",c:"bg-teal-400"},
  ][passStrength];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); onDone(); }, 1900);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Org Name + Slug */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Organisation Name</Label>
          <DarkInput value={orgName} onChange={handleOrgName} placeholder="TechCorp India" required />
        </div>
        <div>
          <Label>Space Slug</Label>
          <DarkInput
            value={slug} onChange={setSlug} placeholder="techcorp-india" required mono
            icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>}
          />
          {slug && <p className="text-white/18 text-[9px] mt-1 font-mono">eventimist.com/eventix/<span className="text-teal-400/70">{slug}</span></p>}
        </div>
      </div>

      {/* Domain */}
      <div>
        <Label>Official Email Domain</Label>
        <DarkInput value={domain} onChange={v => setDomain(v.toLowerCase())} placeholder="yourorg.com" required mono prefix="@" />
        <p className="text-white/18 text-[9px] mt-1">Only <span className="text-teal-400/60 font-mono">@{domain || "yourorg.com"}</span> emails will get auto-access</p>
      </div>

      {/* Category + Size */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Category</Label>
          <select value={category} onChange={e => setCategory(e.target.value)} required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 hover:border-white/20 focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 rounded-xl text-sm text-white/55 outline-none transition-all appearance-none"
            style={{ background: "rgba(255,255,255,0.05)" }}>
            <option value="" className="bg-[#0b1630]">Select…</option>
            {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#0b1630]">{c}</option>)}
          </select>
        </div>
        <div>
          <Label>Org Size</Label>
          <select value={size} onChange={e => setSize(e.target.value)} required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 hover:border-white/20 focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 rounded-xl text-sm text-white/55 outline-none transition-all appearance-none"
            style={{ background: "rgba(255,255,255,0.05)" }}>
            <option value="" className="bg-[#0b1630]">Members…</option>
            {SIZES.map(s => <option key={s} value={s} className="bg-[#0b1630]">{s}</option>)}
          </select>
        </div>
      </div>

      {/* Admin name + email */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Admin Name</Label>
          <DarkInput value={adminName} onChange={setAdminName} placeholder="Rahul Verma" required />
        </div>
        <div>
          <Label>Admin Email</Label>
          <DarkInput type="email" value={adminEmail} onChange={setAdminEmail} placeholder={`admin@${domain||"yourorg.com"}`} required
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <Label>Admin Password</Label>
        <DarkInput type="password" value={password} onChange={setPassword} placeholder="Min. 8 characters" required
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
        />
        {password.length > 0 && (
          <div className="flex items-center gap-1.5 mt-1.5">
            {[1,2,3,4].map(i => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= passStrength ? strMeta.c : "bg-white/8"}`} />
            ))}
            <span className="text-[9px] font-bold ml-1 text-white/30">{strMeta.l}</span>
          </div>
        )}
      </div>

      {/* Terms */}
      <label className="flex items-start gap-2.5 cursor-pointer select-none">
        <button type="button" onClick={() => setAgreed(v => !v)}
          className={`w-4 h-4 mt-0.5 rounded border-2 transition-all flex items-center justify-center flex-shrink-0 ${agreed ? "bg-teal-400 border-teal-400" : "border-white/20 hover:border-teal-400/40"}`}>
          {agreed && <svg className="w-2.5 h-2.5 text-[#060d1f]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
        </button>
        <span className="text-white/25 text-xs leading-relaxed">
          I confirm this domain belongs to our organisation and agree to the{" "}
          <a href="#" className="text-teal-400 hover:underline">Terms of Service</a>
        </span>
      </label>

      <SubmitBtn loading={loading} label="Submit for Verification" disabled={!agreed} />
      <p className="text-center text-white/20 text-xs">Verification takes up to 24 hours. We'll email your admin once approved.</p>
    </form>
  );
}

// ── Shared submit button ──────────────────────────────────────────────────────
function SubmitBtn({ loading, label, accent = "teal", disabled }: {
  loading: boolean; label: string; accent?: "teal" | "amber"; disabled?: boolean;
}) {
  const grad = accent === "amber"
    ? "from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 shadow-amber-400/25"
    : "from-teal-400 to-cyan-500 hover:from-teal-300 hover:to-cyan-400 shadow-teal-400/25";
  return (
    <button type="submit" disabled={loading || disabled}
      className={`w-full bg-gradient-to-r ${grad} disabled:opacity-40 text-[#060d1f] font-black py-4 rounded-2xl transition-all hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] text-sm flex items-center justify-center gap-2`}>
      {loading
        ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Processing…</>
        : <>{label}<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg></>
      }
    </button>
  );
}

// ── Success screens ────────────────────────────────────────────────────────────
const SUCCESS_COPY: Record<AuthTab, { title: string; body: string; cta: string }> = {
  member:   { title:"Welcome to your Space 👋",      body:"You're signed in. Your organisation's events are loading.",                            cta:"Go to My Events" },
  admin:    { title:"Admin Dashboard Ready 🛡️",       body:"You're signed in as admin. Manage your Eventix Space, events, and members.",          cta:"Open Admin Dashboard" },
  register: { title:"Application Submitted! 🎉",     body:"We'll verify your domain within 24 hours and send an activation email to your admin.",  cta:"Back to Home" },
};

function SuccessScreen({ tab, onReset }: { tab: AuthTab; onReset: () => void }) {
  const c = SUCCESS_COPY[tab];
  const accent = tab === "admin" ? "from-amber-400 to-orange-500 shadow-amber-300/30" : "from-teal-400 to-cyan-500 shadow-teal-300/30";
  return (
    <div className="flex flex-col items-center text-center py-6 success-in">
      <div className="relative w-20 h-20 mb-5">
        <div className="absolute inset-0 rounded-full bg-teal-400/15 animate-ping opacity-40" />
        <div className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${accent} flex items-center justify-center shadow-xl`}>
          <svg className="w-9 h-9 text-[#060d1f]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
      </div>
      <h3 className="text-white text-2xl font-black mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{c.title}</h3>
      <p className="text-white/40 text-sm max-w-xs leading-relaxed">{c.body}</p>
      <button onClick={onReset}
        className={`mt-7 bg-gradient-to-r ${accent} text-[#060d1f] font-black px-8 py-3.5 rounded-2xl text-sm hover:shadow-xl hover:scale-[1.02] transition-all`}>
        {c.cta} →
      </button>
    </div>
  );
}

// ── Main auth section ──────────────────────────────────────────────────────────
function AuthSection() {
  const [tab, setTab]   = useState<AuthTab>("member");
  const [done, setDone] = useState(false);

  const handleDone = () => setDone(true);

  return (
    <section id="auth" className="py-24 px-6 bg-[#07101f] scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Left: context copy */}
          <div className="lg:sticky lg:top-28">
            <span className="text-teal-400 text-sm font-bold tracking-widest uppercase">Access Your Space</span>
            <h2 className="mt-4 text-white text-5xl font-black leading-tight mb-6" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Three ways<br />to enter<br />
              <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Eventix Space</span>
            </h2>
            <p className="text-white/40 leading-relaxed mb-8">
              Members, admins, and new organisations each have a distinct path — keeping access clean, secure, and role-appropriate.
            </p>

            {/* Role cards */}
            <div className="space-y-3">
              {AUTH_TABS.map(t => (
                <button key={t.id} onClick={() => { setTab(t.id); setDone(false); }}
                  className={`w-full flex items-center gap-4 rounded-2xl px-5 py-4 border transition-all duration-200 text-left ${
                    tab === t.id
                      ? "bg-teal-500/10 border-teal-500/35 shadow-lg shadow-teal-500/5"
                      : "bg-white/2 border-white/6 hover:bg-white/4 hover:border-white/12"
                  }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                    tab === t.id ? "bg-teal-400/20 text-teal-400" : "bg-white/5 text-white/30"
                  }`}>
                    {t.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold text-sm transition-colors ${tab === t.id ? "text-white" : "text-white/50"}`}>{t.label}</div>
                    <div className="text-white/25 text-xs mt-0.5">{t.desc}</div>
                  </div>
                  {tab === t.id && (
                    <svg className="w-4 h-4 text-teal-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>

            {/* Small note */}
            <div className="mt-6 flex items-start gap-3 bg-white/3 border border-white/6 rounded-2xl px-4 py-3">
              <svg className="w-4 h-4 text-white/25 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p className="text-white/25 text-xs leading-relaxed">
                Admin credentials are set during registration and are <strong className="text-white/40">separate</strong> from member login — even if both use the same email domain.
              </p>
            </div>
          </div>

          {/* Right: form panel */}
          <div>
            {/* Form card */}
            <div className="bg-white/3 border border-white/8 rounded-3xl overflow-hidden">
              {/* Card header */}
              <div className={`px-7 pt-7 pb-5 border-b border-white/6 ${
                tab === "admin" ? "bg-amber-500/4" : tab === "register" ? "bg-teal-500/4" : ""
              }`}>
                <div className="flex items-center gap-3 mb-1">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    tab === "member"   ? "bg-teal-400/15 text-teal-400"  :
                    tab === "admin"    ? "bg-amber-400/15 text-amber-400" :
                                        "bg-teal-400/15 text-teal-400"
                  }`}>
                    {AUTH_TABS.find(t => t.id === tab)?.icon}
                  </div>
                  <div>
                    <div className="text-white font-bold text-base">{AUTH_TABS.find(t => t.id === tab)?.label}</div>
                    <div className="text-white/30 text-xs">{AUTH_TABS.find(t => t.id === tab)?.desc}</div>
                  </div>
                </div>
              </div>

              {/* Form body */}
              <div className="px-7 py-6">
                {done ? (
                  <SuccessScreen tab={tab} onReset={() => setDone(false)} />
                ) : (
                  <>
                    {tab === "member"   && <MemberLoginForm   onDone={handleDone} />}
                    {tab === "admin"    && <AdminLoginForm     onDone={handleDone} />}
                    {tab === "register" && <RegisterOrgForm   onDone={handleDone} />}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="py-24 px-6 bg-[#060d1f]">
      <div className="max-w-4xl mx-auto">
        <div className="relative bg-gradient-to-br from-teal-900/35 via-[#0b1f35] to-[#060d1f] border border-teal-500/18 rounded-[2.5rem] p-14 overflow-hidden text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-teal-400/8 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="text-5xl mb-5">🏛️</div>
            <h2 className="text-white text-5xl font-black leading-tight mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Claim your organisation's<br />
              <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Eventix Space</span>
            </h2>
            <p className="text-white/35 text-lg mb-10 max-w-xl mx-auto">
              Join 2,000+ organisations hosting events, engaging members, and placing volunteers — all in one verified space.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#auth" className="group flex items-center justify-center gap-2 bg-gradient-to-r from-teal-400 to-cyan-500 text-[#060d1f] font-black px-10 py-4 rounded-2xl hover:shadow-2xl hover:shadow-teal-400/25 hover:scale-[1.02] transition-all text-base">
                Register Your Organisation
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </a>
              <a href="/" className="flex items-center justify-center border border-white/10 hover:border-white/22 text-white/50 hover:text-white font-semibold px-10 py-4 rounded-2xl transition-all hover:bg-white/4 text-base">
                ← Back to Eventimist
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 px-6 bg-[#060d1f]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span className="text-white font-black text-base" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>eventix</span>
          <span className="text-teal-400 font-black text-base">space</span>
          <span className="text-white/18 text-xs ml-1">by eventimist</span>
        </div>
        <div className="flex gap-8 text-sm text-white/20">
          {["Privacy","Terms","Docs","Support"].map(l => (
            <a key={l} href="#" className="hover:text-white/50 transition-colors">{l}</a>
          ))}
        </div>
        <div className="text-white/15 text-xs">© 2025 Eventimist · Eventix Space</div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function EventixPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap');
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; background: #060d1f; }

        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .org-marquee { animation: marquee 28s linear infinite; }
        .org-marquee:hover { animation-play-state: paused; }

        @keyframes success-in {
          from { opacity: 0; transform: scale(0.93); }
          to   { opacity: 1; transform: scale(1); }
        }
        .success-in { animation: success-in 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards; }

        @keyframes mfa-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mfa-in { animation: mfa-in 0.35s ease-out forwards; }

        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #0b1630 inset !important;
          -webkit-text-fill-color: rgba(255,255,255,0.8) !important;
        }
        select option { background-color: #0b1630; color: rgba(255,255,255,0.7); }
      `}</style>

      <div className="min-h-screen bg-[#060d1f] text-white">
        <Nav />
        <Hero />
        <OrgMarquee />
        <HowItWorks />
        <Features />
        <DomainStrip />
        <Pricing />
        <AuthSection />
        <FinalCTA />
        <Footer />
      </div>
    </>
  );
}