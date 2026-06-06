"use client";

// src/app/eventix/page.tsx

import { useEffect, useRef, useState, useCallback } from "react";

// ─── Theme tokens ─────────────────────────────────────────────────────────────
const LIGHT = {
  bg:       "#f5f0e8",
  bgAlt:    "#ede8de",
  surface:  "#ffffff",
  ink:      "#1a1612",
  ink2:     "#5c5346",
  ink3:     "#9c9186",
  border:   "rgba(26,22,18,.1)",
  gold:     "#b8922a",
  goldBg:   "rgba(184,146,42,.08)",
  goldBdr:  "rgba(184,146,42,.25)",
  wall:     "#ede8de",
  pin:      "#8c7355",
  shadow:   "rgba(0,0,0,.18)",
};
const DARK = {
  bg:       "#18160f",
  bgAlt:    "#1f1c14",
  surface:  "#24211a",
  ink:      "#f0ead8",
  ink2:     "#b0a890",
  ink3:     "#6e6658",
  border:   "rgba(240,234,216,.08)",
  gold:     "#d4a843",
  goldBg:   "rgba(212,168,67,.08)",
  goldBdr:  "rgba(212,168,67,.2)",
  wall:     "#1f1c14",
  pin:      "#b0a890",
  shadow:   "rgba(0,0,0,.55)",
};

const GALLERY = [
  { url:"https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&q=80", caption:"All-hands · TechCorp 2024",     tag:"Corporate"  },
  { url:"https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=900&q=80", caption:"Keynote · EdSphere Summit",     tag:"Conference" },
  { url:"https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=900&q=80", caption:"Yamuna Drive · CitizenFirst",     tag:"Volunteer"  },
  { url:"https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=900&q=80", caption:"UX Meetup · DesignDelhi #22",   tag:"Networking" },
  { url:"https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=900&q=80", caption:"Volunteer Day · GreenEarth",    tag:"Community"  },
  { url:"https://images.unsplash.com/photo-1556761175-b413da4baf72?w=900&q=80", caption:"Founders Bootcamp · NexGen",      tag:"Business"   },
];

const TILTS = [-2.5, 1.8, -1.2, 2.8, -0.8, 1.5];

const ORGS = [
  { name:"TechCorp India",    abbr:"TC", h:210 },
  { name:"GreenEarth NGO",   abbr:"GE", h:150 },
  { name:"MedCare Trust",    abbr:"MC", h:350 },
  { name:"EduSphere",        abbr:"ES", h:270 },
  { name:"NexGen Solutions", abbr:"NG", h:38  },
  { name:"CitizenFirst",     abbr:"CF", h:175 },
  { name:"ArtHouse Delhi",   abbr:"AH", h:320 },
  { name:"SportZone",        abbr:"SZ", h:25  },
];

// ─── Wall Carousel — FULL WIDTH, BIGGER ──────────────────────────────────────
function WallCarousel({ tk }: { tk: typeof LIGHT }) {
  const [idx, setIdx] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout>|null>(null);

  const go = useCallback((i: number) => {
    setIdx(i);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setIdx(j => (j+1)%GALLERY.length), 3500);
  }, []);

  useEffect(() => {
    timer.current = setTimeout(() => go((idx+1)%GALLERY.length), 3500);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [idx, go]);

  return (
    <div className="relative py-14 overflow-visible select-none">
      {/* String line */}
      <div className="absolute left-0 right-0 pointer-events-none"
        style={{ top:22, height:2, background:`linear-gradient(90deg,transparent,${tk.pin}55 12%,${tk.pin}99 50%,${tk.pin}55 88%,transparent)` }}/>

      {/* Cards */}
      <div className="flex items-start justify-center gap-6 flex-wrap sm:flex-nowrap overflow-visible px-6">
        {GALLERY.map((g, i) => {
          const active  = i === idx;
          const tilt    = TILTS[i];
          const scale   = active ? 1.08 : 0.92;
          const zIdx    = active ? 10 : 1;
          const bright  = active ? 1 : 0.6;

          return (
            <div key={i} onClick={() => go(i)}
              className="relative flex-shrink-0 cursor-pointer transition-all duration-500"
              style={{
                width: active ? 240 : 175,
                transform: `rotate(${tilt}deg) scale(${scale})`,
                zIndex: zIdx,
                filter: `brightness(${bright})`,
              }}>
              {/* Pin */}
              <div className="absolute left-1/2 -translate-x-1/2 -top-3 z-10 flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full border-2"
                  style={{ background:tk.pin, borderColor:tk.ink3, boxShadow:`0 2px 5px ${tk.shadow}` }}/>
                <div className="w-px h-4" style={{ background:tk.pin+"70" }}/>
              </div>

              {/* Photo print */}
              <div className="overflow-hidden rounded-sm"
                style={{
                  background: tk.surface,
                  boxShadow: active
                    ? `0 24px 60px ${tk.shadow}, 0 6px 16px ${tk.shadow}`
                    : `0 8px 24px ${tk.shadow}`,
                  padding: "10px 10px 36px 10px",
                }}>
                <img src={g.url} alt={g.caption}
                  className="w-full object-cover rounded-sm block"
                  style={{ height: active ? 200 : 150 }}
                  loading="lazy"
                />
                <div className="pt-2.5 px-1">
                  <p className="text-center leading-snug"
                    style={{ fontFamily:"'Caveat',cursive", fontSize:12, color:tk.ink2 }}>
                    {g.caption}
                  </p>
                </div>
              </div>

              {/* Tag */}
              {active && (
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full"
                  style={{ background:tk.goldBg, border:`1px solid ${tk.goldBdr}`, color:tk.gold, fontFamily:"'Libre Baskerville',Georgia,serif" }}>
                  {g.tag}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dot nav */}
      <div className="flex justify-center gap-2 mt-14">
        {GALLERY.map((_,i) => (
          <button key={i} onClick={() => go(i)}
            className="rounded-full transition-all duration-300"
            style={{ width: i===idx ? 24:7, height:7, background: i===idx ? tk.gold : tk.ink3+"45" }}/>
        ))}
      </div>
    </div>
  );
}

// ─── Coming Soon Hero ─────────────────────────────────────────────────────────
function ComingSoonHero({ tk, dark }: { tk: typeof LIGHT; dark: boolean }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [vis, setVis] = useState(false);
  useEffect(() => { setTimeout(() => setVis(true), 80); }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: dark ? tk.bgAlt : tk.wall, borderTop:`1.5px solid ${tk.border}`, borderBottom:`1.5px solid ${tk.border}` }}
    >
      {/* Decorative large EX watermark */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none select-none"
        style={{
          fontFamily:"'Spectral',Georgia,serif",
          fontSize: "clamp(180px,25vw,340px)",
          fontWeight: 700,
          fontStyle: "italic",
          color: tk.gold,
          opacity: 0.04,
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        EX
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(${tk.border} 1px,transparent 1px),linear-gradient(90deg,${tk.border} 1px,transparent 1px)`,
        backgroundSize: "48px 48px",
        opacity: 0.5,
      }}/>

      <div className="max-w-5xl mx-auto px-6 py-24 relative z-10">
        <div
          className="transition-all duration-700"
          style={{ opacity: vis?1:0, transform: vis?"translateY(0)":"translateY(24px)" }}
        >
          {/* Badge */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background:tk.goldBg, border:`1.5px solid ${tk.goldBdr}` }}>
              <span className="w-1.5 h-1.5 rounded-full pulse-green" style={{ background:tk.gold }}/>
              <span className="text-[9px] font-black tracking-[0.25em] uppercase"
                style={{ color:tk.gold, fontFamily:"'Barlow Condensed',sans-serif" }}>
                Coming Soon
              </span>
            </div>
            <div className="h-px flex-1" style={{ background:`linear-gradient(90deg,${tk.goldBdr},transparent)` }}/>
          </div>

          <div className="grid lg:grid-cols-[1fr_380px] gap-16 items-center">
            {/* Left text */}
            <div>
              <h1 style={{ margin:"0 0 20px", fontFamily:"'Spectral',Georgia,serif", fontWeight:700, lineHeight:0.92, color:tk.ink }}>
                <span className="block" style={{ fontSize:"clamp(48px,7vw,88px)" }}>Eventix</span>
                <span className="block" style={{ fontSize:"clamp(48px,7vw,88px)", fontStyle:"italic", color:tk.gold }}>Space</span>
                <span className="block" style={{ fontSize:"clamp(28px,4vw,48px)", color:tk.ink3, fontWeight:400, marginTop:8 }}>is being built.</span>
              </h1>

              <p style={{ fontSize:15, color:tk.ink2, lineHeight:1.8, maxWidth:460, marginBottom:32, fontFamily:"'Libre Baskerville',Georgia,serif" }}>
                A domain-verified private hub where organisations host events and members auto-join — no invite chaos, no outsiders. We're crafting every detail carefully.
              </p>

              {/* What's coming */}
              <div className="space-y-3 mb-10">
                {[
                  "Domain-verified auto member joins",
                  "Private event hosting for your org",
                  "Multi-admin roles & granular permissions",
                  "Volunteer matching within your org",
                  "Org-scoped analytics dashboard",
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background:tk.goldBg, border:`1.5px solid ${tk.goldBdr}` }}>
                      <span style={{ fontSize:9, color:tk.gold }}>◉</span>
                    </div>
                    <span style={{ fontSize:13, color:tk.ink2, fontFamily:"'Libre Baskerville',serif" }}>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Progress strip */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span style={{ fontSize:9, fontWeight:900, letterSpacing:"0.2em", textTransform:"uppercase", color:tk.ink3, fontFamily:"'Barlow Condensed',sans-serif" }}>
                    Build progress
                  </span>
                  <span style={{ fontSize:11, fontWeight:700, color:tk.gold, fontFamily:"'Barlow Condensed',sans-serif" }}>
                    62%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background:tk.border }}>
                  <div className="h-full rounded-full transition-all duration-1000"
                    style={{ width:"62%", background:`linear-gradient(90deg,${tk.gold},${tk.gold}99)` }}/>
                </div>
                <p style={{ fontSize:10, color:tk.ink3, marginTop:6, fontFamily:"'Libre Baskerville',serif" }}>
                  Core infrastructure complete · Auth + event engine in progress
                </p>
              </div>
            </div>

            {/* Right — notify card */}
            <div>
              <div className="rounded-2xl overflow-hidden"
                style={{ border:`1.5px solid ${tk.border}`, background:tk.surface, boxShadow:`0 12px 48px ${tk.shadow}` }}>
                {/* Card header */}
                <div className="px-6 py-5" style={{ borderBottom:`1.5px solid ${tk.border}`, background:tk.bgAlt }}>
                  <div style={{ fontSize:9, fontWeight:900, letterSpacing:"0.25em", textTransform:"uppercase", color:tk.gold, fontFamily:"'Barlow Condensed',sans-serif", marginBottom:4 }}>
                    Get early access
                  </div>
                  <p style={{ fontSize:13, color:tk.ink2, fontFamily:"'Libre Baskerville',serif", margin:0, lineHeight:1.6 }}>
                    Be first when Eventix Space launches. Early organisations get 6 months Pro free.
                  </p>
                </div>

                <div className="p-6">
                  {!submitted ? (
                    <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
                      <div>
                        <label style={{ display:"block", fontSize:9, fontWeight:800, letterSpacing:"0.2em", textTransform:"uppercase", color:tk.ink3, marginBottom:6, fontFamily:"'Barlow Condensed',sans-serif" }}>
                          Work email
                        </label>
                        <input
                          type="email" value={email} onChange={e=>setEmail(e.target.value)}
                          placeholder="admin@yourorg.com" required
                          style={{ width:"100%", padding:"11px 14px", background:tk.bgAlt, border:`1.5px solid ${tk.border}`, borderRadius:10, fontSize:13, color:tk.ink, fontFamily:"'Libre Baskerville',serif", outline:"none", boxSizing:"border-box" }}
                          onFocus={e=>{e.target.style.borderColor=tk.gold;e.target.style.background=tk.surface;}}
                          onBlur={e=>{e.target.style.borderColor=tk.border;e.target.style.background=tk.bgAlt;}}
                        />
                      </div>
                      <div>
                        <label style={{ display:"block", fontSize:9, fontWeight:800, letterSpacing:"0.2em", textTransform:"uppercase", color:tk.ink3, marginBottom:6, fontFamily:"'Barlow Condensed',sans-serif" }}>
                          Organisation name
                        </label>
                        <input
                          type="text" placeholder="TechCorp India"
                          style={{ width:"100%", padding:"11px 14px", background:tk.bgAlt, border:`1.5px solid ${tk.border}`, borderRadius:10, fontSize:13, color:tk.ink, fontFamily:"'Libre Baskerville',serif", outline:"none", boxSizing:"border-box" }}
                          onFocus={e=>{e.target.style.borderColor=tk.gold;e.target.style.background=tk.surface;}}
                          onBlur={e=>{e.target.style.borderColor=tk.border;e.target.style.background=tk.bgAlt;}}
                        />
                      </div>
                      <button type="submit" style={{
                        width:"100%", padding:"13px", background:tk.gold, color:"#fff", border:"none", borderRadius:10, cursor:"pointer",
                        fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:12, letterSpacing:"0.15em", textTransform:"uppercase",
                      }}
                        onMouseOver={e=>(e.currentTarget.style.filter="brightness(1.1)")}
                        onMouseOut={e=>(e.currentTarget.style.filter="")}>
                        Notify Me at Launch →
                      </button>
                      <p style={{ textAlign:"center", fontSize:11, color:tk.ink3, margin:0, fontFamily:"'Libre Baskerville',serif" }}>
                        No spam. Launch notification only.
                      </p>
                    </form>
                  ) : (
                    <div style={{ textAlign:"center", padding:"20px 0" }}>
                      <div style={{ fontSize:40, marginBottom:12 }}>🎉</div>
                      <div style={{ fontFamily:"'Spectral',Georgia,serif", fontSize:20, fontWeight:700, color:tk.ink, marginBottom:8 }}>
                        You're on the list!
                      </div>
                      <p style={{ fontSize:13, color:tk.ink2, fontFamily:"'Libre Baskerville',serif", lineHeight:1.6, margin:0 }}>
                        We'll notify you the moment Eventix Space is ready. Early access + 6 months Pro, on us.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Social proof below card */}
              <div className="flex items-center gap-4 mt-5 px-2">
                <div className="flex -space-x-2">
                  {["TC","GE","ES","CF"].map((abbr,i) => (
                    <div key={i} className="w-7 h-7 rounded-lg flex items-center justify-center border-2"
                      style={{ background:`hsl(${[210,150,270,175][i]},45%,38%)`, borderColor:tk.surface }}>
                      <span style={{ fontSize:7, fontWeight:900, color:"#fff", fontFamily:"'Barlow Condensed',sans-serif" }}>{abbr}</span>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize:11, color:tk.ink3, fontFamily:"'Libre Baskerville',serif", margin:0 }}>
                  <span style={{ color:tk.ink2, fontWeight:700 }}>240+ organisations</span> already waiting
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Features (dimmed / teaser) ───────────────────────────────────────────────
function Features({ tk, dark }: { tk: typeof LIGHT; dark: boolean }) {
  const feats = [
    { icon:"◉", n:"01", title:"Domain Verification",  desc:"Link your email domain. Anyone with @yourcompany.com auto-joins as a verified member instantly." },
    { icon:"◎", n:"02", title:"Auto Member Join",      desc:"New hires sign up with their work email — they're in. No invite links, no approvals, no expired codes." },
    { icon:"◈", n:"03", title:"Private Event Hub",     desc:"Events visible only to verified members. Internal conferences, offsites, and team events stay truly private." },
    { icon:"◇", n:"04", title:"Org-Scoped Analytics",  desc:"Attendance, RSVP trends, volunteer activity — all in one consolidated org dashboard." },
    { icon:"◆", n:"05", title:"Multi-Admin Roles",     desc:"Assign event managers, finance leads, view-only stakeholders. Granular roles, zero confusion." },
    { icon:"◐", n:"06", title:"Volunteer Matching",    desc:"Members opt into volunteer pools. Organisers post needs. Auto-matched on skills and availability." },
  ];
  return (
    <section id="features" style={{ padding:"80px 24px", background: dark ? tk.bgAlt : tk.bg, opacity:0.75 }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        {/* Coming soon overlay label */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12, marginBottom:40 }}>
          <div style={{ height:"1.5px", flex:1, background:tk.border }}/>
          <span style={{ fontSize:9, fontWeight:900, letterSpacing:"0.3em", textTransform:"uppercase", color:tk.ink3, fontFamily:"'Barlow Condensed',sans-serif", whiteSpace:"nowrap" }}>
            Planned features — in development
          </span>
          <div style={{ height:"1.5px", flex:1, background:tk.border }}/>
        </div>
        <div style={{ marginBottom:40, display:"flex", alignItems:"flex-end", justifyContent:"space-between", borderBottom:`1.5px solid ${tk.border}`, paddingBottom:24 }}>
          <div>
            <h2 style={{ margin:0, fontFamily:"'Spectral',Georgia,serif", fontSize:"clamp(32px,4vw,54px)", color:tk.ink, lineHeight:0.95, fontWeight:700 }}>
              Built for<br/><em style={{ fontStyle:"italic", color:tk.gold }}>organisations.</em>
            </h2>
          </div>
          <span style={{ fontFamily:"'Spectral',serif", fontSize:80, lineHeight:1, color:tk.border, fontWeight:700 }}>06</span>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:1, background:tk.border, filter:"saturate(0.6)" }}>
          {feats.map((f,i) => (
            <div key={i} style={{ padding:"28px 24px", background:tk.bg, position:"relative" }}>
              {/* Coming soon chip on each */}
              <div style={{ position:"absolute", top:14, right:14, fontSize:8, fontWeight:900, letterSpacing:"0.15em", textTransform:"uppercase", color:tk.ink3, border:`1px solid ${tk.border}`, padding:"2px 7px", borderRadius:99, fontFamily:"'Barlow Condensed',sans-serif" }}>
                Soon
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
                <span style={{ fontSize:18, color:tk.gold+"99" }}>{f.icon}</span>
                <span style={{ fontFamily:"'Spectral',serif", fontSize:30, color:tk.border, fontWeight:700, lineHeight:1 }}>{f.n}</span>
              </div>
              <h3 style={{ margin:"0 0 8px", fontFamily:"'Spectral',Georgia,serif", fontSize:16, fontWeight:700, color:tk.ink2 }}>{f.title}</h3>
              <p style={{ margin:0, fontSize:12, color:tk.ink3, lineHeight:1.75, fontFamily:"'Libre Baskerville',Georgia,serif" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer({ tk }: { tk: typeof LIGHT }) {
  return (
    <footer style={{ borderTop:`1.5px solid ${tk.border}`, padding:"28px 24px", background:tk.bgAlt }}>
      <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between", gap:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ position:"relative", width:26, height:26 }}>
            <div style={{ position:"absolute", inset:0, background:tk.gold, borderRadius:6, transform:"rotate(6deg)" }}/>
            <div style={{ position:"absolute", inset:0, background:tk.surface, border:`1.5px solid ${tk.border}`, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ color:tk.gold, fontWeight:900, fontSize:9, fontFamily:"'Barlow Condensed',sans-serif" }}>EX</span>
            </div>
          </div>
          <span style={{ fontFamily:"'Spectral',Georgia,serif", fontWeight:700, fontSize:15, color:tk.ink }}>Eventix Space</span>
          <span style={{ fontSize:10, color:tk.ink3 }}>· Coming Soon · by Eventimist</span>
        </div>
        <div style={{ display:"flex", gap:20 }}>
          {["Privacy","Terms","Contact"].map(l => (
            <a key={l} href="#" style={{ fontSize:10, fontWeight:800, letterSpacing:"0.15em", textTransform:"uppercase", color:tk.ink3, textDecoration:"none", fontFamily:"'Barlow Condensed',sans-serif" }}
              onMouseOver={e=>((e.target as HTMLElement).style.color=tk.gold)}
              onMouseOut={e=>((e.target as HTMLElement).style.color=tk.ink3)}>{l}</a>
          ))}
        </div>
        <span style={{ fontSize:10, color:tk.ink3, fontFamily:"'Libre Baskerville',serif" }}>© 2025 Eventimist</span>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function EventixPage() {
  const [dark, setDark] = useState(false);
  const tk = dark ? DARK : LIGHT;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,400;0,600;0,700;1,400;1,700&family=Libre+Baskerville:wght@400;700&family=Barlow+Condensed:wght@400;700;900&family=Caveat:wght@400;600&display=swap');
        *,*::before,*::after{box-sizing:border-box}
        html{scroll-behavior:smooth}
        body{margin:0;-webkit-font-smoothing:antialiased}
        input::placeholder{opacity:.45}
        @keyframes pulse-g{0%,100%{opacity:1}50%{opacity:.4}}
        .pulse-green{animation:pulse-g 2s ease-in-out infinite}
        @keyframes marquee-ltr{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        .marquee-ltr{animation:marquee-ltr 28s linear infinite;width:max-content}
        .marquee-ltr:hover{animation-play-state:paused}
      `}</style>

      <div style={{ minHeight:"100vh", background:tk.bg, color:tk.ink, transition:"background .4s,color .4s" }}>

        {/* ── Nav ── */}
        <nav style={{ position:"sticky", top:0, zIndex:50, borderBottom:`1.5px solid ${tk.border}`, backdropFilter:"blur(16px)", background:tk.bg+"e8" }}>
          <div style={{ maxWidth:1100, margin:"0 auto", padding:"12px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ position:"relative", width:28, height:28, flexShrink:0 }}>
                <div style={{ position:"absolute", inset:0, background:tk.gold, borderRadius:7, transform:"rotate(6deg)" }}/>
                <div style={{ position:"absolute", inset:0, background:tk.surface, border:`1.5px solid ${tk.border}`, borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ color:tk.gold, fontWeight:900, fontSize:10, fontFamily:"'Barlow Condensed',sans-serif" }}>EX</span>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"baseline", gap:5 }}>
                <span style={{ fontFamily:"'Spectral',Georgia,serif", fontWeight:700, fontSize:17, color:tk.ink }}>Eventix</span>
                <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:13, letterSpacing:"0.1em", color:tk.gold }}>SPACE</span>
              </div>
              <span style={{ fontSize:8, fontWeight:900, letterSpacing:"0.15em", textTransform:"uppercase", color:tk.ink3, border:`1px solid ${tk.border}`, padding:"2px 7px", borderRadius:99, fontFamily:"'Barlow Condensed',sans-serif" }}>
                Coming Soon
              </span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <a href="#features" style={{ fontSize:10, fontWeight:800, letterSpacing:"0.12em", textTransform:"uppercase", color:tk.ink3, textDecoration:"none", fontFamily:"'Barlow Condensed',sans-serif" }}
                onMouseOver={e=>((e.target as HTMLElement).style.color=tk.gold)}
                onMouseOut={e=>((e.target as HTMLElement).style.color=tk.ink3)}>Features</a>
              <a href="/discover" style={{ fontSize:10, fontWeight:800, letterSpacing:"0.12em", textTransform:"uppercase", color:tk.ink3, textDecoration:"none", fontFamily:"'Barlow Condensed',sans-serif" }}
                onMouseOver={e=>((e.target as HTMLElement).style.color=tk.gold)}
                onMouseOut={e=>((e.target as HTMLElement).style.color=tk.ink3)}>← Eventimist</a>
              <button onClick={()=>setDark(d=>!d)} style={{ width:34, height:34, borderRadius:10, border:`1.5px solid ${tk.border}`, background:tk.bgAlt, cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", transition:"all .2s", color:tk.ink }} title={dark?"Light":"Dark"}>
                {dark?"☀️":"🌙"}
              </button>
              <a href="#notify" style={{ fontSize:10, fontWeight:900, letterSpacing:"0.12em", textTransform:"uppercase", padding:"8px 18px", borderRadius:10, background:tk.gold, color:"#fff", textDecoration:"none", fontFamily:"'Barlow Condensed',sans-serif" }}
                onMouseOver={e=>((e.target as HTMLElement).style.filter="brightness(1.1)")}
                onMouseOut={e=>((e.target as HTMLElement).style.filter="")}>
                Notify Me
              </a>
            </div>
          </div>
        </nav>

        {/* ── 1. Wall Carousel FIRST, FULL WIDTH ── */}
        <section id="gallery" style={{ background: dark ? tk.bgAlt : tk.wall, padding:"8px 0 0" }}>
          <div style={{ maxWidth:1300, margin:"0 auto", padding:"0 16px" }}>
            {/* Label above carousel */}
            <div style={{ textAlign:"center", paddingTop:24, marginBottom:4 }}>
              <span style={{ fontSize:20, fontWeight:900, letterSpacing:"0.3em", textTransform:"uppercase", color:tk.gold, fontFamily:"'Barlow Condensed',sans-serif" }}>
                Organisations that will call this home
              </span>
            </div>
            <WallCarousel tk={tk}/>
          </div>
        </section>

        {/* ── 2. Coming Soon Hero ── */}
        <div id="notify">
          <ComingSoonHero tk={tk} dark={dark}/>
        </div>

        {/* ── 3. Org marquee ── */}
        <div style={{ background:tk.ink, overflow:"hidden", padding:"11px 0", borderTop:`1.5px solid ${tk.border}` }}>
          <div className="marquee-ltr" style={{ display:"flex", gap:0 }}>
            {[...ORGS,...ORGS,...ORGS].map((o,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"0 24px", flexShrink:0 }}>
                <div style={{ width:18, height:18, borderRadius:5, background:`hsl(${o.h},50%,40%)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontSize:7, fontWeight:900, color:"#fff", fontFamily:"'Barlow Condensed',sans-serif" }}>{o.abbr}</span>
                </div>
                <span style={{ fontSize:9, fontWeight:800, letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(255,255,255,.28)", fontFamily:"'Barlow Condensed',sans-serif", whiteSpace:"nowrap" }}>{o.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. Features (dimmed teaser) ── */}
        <Features tk={tk} dark={dark}/>

        <Footer tk={tk}/>
      </div>
    </>
  );
}