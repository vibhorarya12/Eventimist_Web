"use client";

// src/app/about/page.tsx

import { useEffect, useRef, useState } from "react";

// ─── Stagger reveal hook ──────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

// ─── Reveal wrapper ───────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}>
      {children}
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? "py-3 border-b" : "py-6"}`}
      style={{ background: scrolled ? "rgba(13,11,9,0.95)" : "transparent", backdropFilter: scrolled ? "blur(16px)" : "none", borderColor: "rgba(255,255,255,0.06)" }}>
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <span className="font-black text-lg text-white tracking-tight" style={{ fontFamily: "'Playfair Display',Georgia,serif" }}>eventimist</span>
        </a>
        <div className="flex items-center gap-6 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
          {[["Discover","/discover"],["Organize","/organizer"],["About","/about"]].map(([l,h]) => (
            <a key={l} href={h} className="hover:text-white transition-colors duration-200 font-medium"
              style={{ color: h === "/about" ? "#f59e0b" : undefined }}>{l}</a>
          ))}
          <a href="/user" className="px-4 py-2 rounded-xl font-bold text-white transition-all hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)", boxShadow: "0 4px 14px rgba(245,158,11,0.3)" }}>
            Join
          </a>
        </div>
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  const [vis, setVis] = useState(false);
  useEffect(() => { setTimeout(() => setVis(true), 80); }, []);

  return (
    <section className="relative min-h-[60vh] flex items-end pb-20 px-6 overflow-hidden" style={{ paddingTop: 120 }}>
      {/* Background layers */}
      <div className="absolute inset-0">
        <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, #0d0b09 0%, #141008 50%, #0a0d14 100%)" }}/>
        {/* Grain */}
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "256px" }}/>
        {/* Amber glow */}
        <div className="absolute top-0 right-0 w-[700px] h-[500px] opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 70% 20%, rgba(245,158,11,0.35) 0%, transparent 65%)" }}/>
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "80px 80px" }}/>
      </div>

      <div className="max-w-6xl mx-auto w-full relative z-10">
        <div className="grid lg:grid-cols-[1fr_auto] gap-12 items-end">
          <div>
            {/* Overline */}
            <div style={{ opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(16px)", transition: "all 0.6s ease 100ms" }}>
              <div className="flex items-center gap-3 mb-8">
                <div className="h-px w-10" style={{ background: "#f59e0b" }}/>
                <span className="text-[11px] font-black tracking-[0.25em] uppercase" style={{ color: "#f59e0b" }}>Our Story</span>
              </div>
            </div>

            {/* Headline */}
            <div style={{ opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(24px)", transition: "all 0.7s ease 200ms" }}>
              <h1 className="text-white leading-none mb-6"
                style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "clamp(3rem,7vw,5.5rem)", fontWeight: 900, letterSpacing: "-0.02em" }}>
                Built for the
                <br/>
                <span style={{ WebkitTextStroke: "1px rgba(245,158,11,0.6)", color: "transparent" }}>
                  curious
                </span>
                {" "}& the
                <br/>
                <span style={{ background: "linear-gradient(90deg,#f59e0b,#f97316,#fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  committed.
                </span>
              </h1>
            </div>

            <div style={{ opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(16px)", transition: "all 0.7s ease 350ms" }}>
              <p className="text-lg leading-relaxed max-w-xl" style={{ color: "rgba(255,255,255,0.45)" }}>
                Eventimist began as a question: why is it so hard to find what's happening in your own city? We built the answer.
              </p>
            </div>
          </div>

          {/* Decorative year stamp */}
          <div style={{ opacity: vis ? 1 : 0, transition: "all 1s ease 500ms" }}>
            <div className="text-right hidden lg:block">
              <div className="text-[120px] font-black leading-none select-none"
                style={{ fontFamily: "'Playfair Display',Georgia,serif", color: "rgba(245,158,11,0.06)", letterSpacing: "-0.05em" }}>
                '25
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Stats bar ────────────────────────────────────────────────────────────────
function StatsBar() {
  const stats = [
    { val: "50K+", label: "Events Listed" },
    { val: "120K+", label: "Active Users" },
    { val: "8K+", label: "Volunteers" },
    { val: "15+", label: "Cities" },
  ];
  return (
    <section style={{ background: "#f59e0b" }}>
      <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-amber-600/40">
        {stats.map((s, i) => (
          <div key={i} className="px-6 py-2 text-center">
            <div className="font-black text-stone-900 text-2xl leading-none" style={{ fontFamily: "'Playfair Display',Georgia,serif" }}>{s.val}</div>
            <div className="text-stone-900/60 text-xs font-semibold mt-1 tracking-wide uppercase">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Founder's desk ───────────────────────────────────────────────────────────
function FounderDesk() {
  return (
    <section className="px-6 pb-28" style={{ background: "#faf8f4", paddingTop: 140 }}>
      <div className="max-w-6xl mx-auto">

        {/* Section label */}
        <Reveal>
          <div className="flex items-center gap-3 mb-16">
            <div className="h-px w-10 bg-stone-900"/>
            <span className="text-[11px] font-black tracking-[0.25em] uppercase text-stone-400">From the Founder's Desk</span>
          </div>
        </Reveal>

        <div className="grid lg:grid-cols-[360px_1fr] gap-16 items-start">

          {/* Left — founder card */}
          <Reveal delay={100}>
            <div className="sticky top-28">
              {/* Photo */}
              <div className="relative mb-8">
                <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden"
                  style={{ boxShadow: "20px 20px 0 rgba(245,158,11,0.12), 1px 1px 0 rgba(0,0,0,0.06)" }}>
                  <img
                    src="https://avatars.githubusercontent.com/u/135149764?v=4"
                    alt="Founder"
                    className="w-full h-full object-cover object-top"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(13,11,9,0.5) 0%, transparent 50%)" }}/>
                  {/* Name tag on photo */}
                  <div className="absolute bottom-5 left-5 right-5">
                    <p className="text-white font-black text-lg leading-tight" style={{ fontFamily: "'Playfair Display',Georgia,serif" }}>
                      Founder & CEO
                    </p>
                    <p className="text-amber-400 text-xs font-bold tracking-widest uppercase mt-0.5">Eventimist</p>
                  </div>
                </div>

                {/* Amber corner accent */}
                <div className="absolute -bottom-3 -right-3 w-16 h-16 rounded-xl -z-10" style={{ background: "#f59e0b" }}/>
              </div>

              {/* Links */}
              <div className="flex gap-3">
                {[
                  { label: "GitHub", href: "https://github.com/vibhorarya12", icon: <><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></> },
                  { label: "LinkedIn", href: "#", icon: <><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></> },
                ].map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all hover:scale-[1.03]"
                    style={{ borderColor: "#e7e5e0", color: "#57534e", background: "white" }}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">{s.icon}</svg>
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Right — letter */}
          <div className="space-y-8">
            <Reveal delay={150}>
              <h2 className="text-stone-900 leading-tight"
                style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 900, letterSpacing: "-0.02em" }}>
                Why I built<br/>
                <em style={{ color: "#f59e0b", fontStyle: "italic" }}>Eventimist.</em>
              </h2>
            </Reveal>

            {/* Pull quote */}
            <Reveal delay={200}>
              <blockquote className="relative pl-8 py-2"
                style={{ borderLeft: "3px solid #f59e0b" }}>
                <p className="text-stone-700 text-xl leading-relaxed font-medium italic"
                  style={{ fontFamily: "'Playfair Display',Georgia,serif" }}>
                  "I kept missing events I would have loved — not because they didn't exist, but because I never heard about them."
                </p>
              </blockquote>
            </Reveal>

            {[
              `I grew up in a city full of culture — music nights, art exhibitions, tech meetups, community drives — but somehow, week after week, I'd find out about them the day after. A friend's Instagram story. A poster on a wall I passed once. That gap frustrated me.`,
              `In early 2025, I started sketching what an ideal event discovery platform would look like. Not just a listing site, but a living, breathing community layer on top of every city. A place where organizers could find volunteers, organizations could build private hubs, and users could discover things that actually matched who they are.`,
              `Eventimist is that platform. We built it with a small, obsessive team that believes local community is the most underrated resource on earth. Every feature we ship is guided by one question: does this bring people together?`,
              `We're just getting started. The cities, the events, the connections — there's so much more to build. Thank you for being here at the beginning.`,
            ].map((para, i) => (
              <Reveal key={i} delay={250 + i * 60}>
                <p className="text-stone-600 leading-8 text-base">{para}</p>
              </Reveal>
            ))}

            {/* Signature */}
            <Reveal delay={500}>
              <div className="pt-4 flex items-center gap-5 border-t" style={{ borderColor: "#e7e5e0" }}>
                <div>
                  <div className="font-black text-stone-900 text-lg" style={{ fontFamily: "'Playfair Display',Georgia,serif" }}>
                    Vibhor Arya
                  </div>
                  <div className="text-xs font-semibold tracking-widest uppercase text-stone-400 mt-0.5">Founder, Eventimist · 2025</div>
                </div>
                {/* Amber dot accent */}
                <div className="w-2 h-2 rounded-full ml-auto" style={{ background: "#f59e0b" }}/>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Mission section ──────────────────────────────────────────────────────────
function Mission() {
  return (
    <section className="py-28 px-6 overflow-hidden" style={{ background: "#0d0b09" }}>
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <div className="flex items-center gap-3 mb-20">
            <div className="h-px w-10" style={{ background: "#f59e0b" }}/>
            <span className="text-[11px] font-black tracking-[0.25em] uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>What We Stand For</span>
          </div>
        </Reveal>

        {/* Big pull quote */}
        <Reveal delay={100}>
          <div className="relative mb-24">
            <div className="absolute -top-8 -left-4 text-[200px] font-black leading-none select-none pointer-events-none"
              style={{ fontFamily: "'Playfair Display',Georgia,serif", color: "rgba(245,158,11,0.05)", lineHeight: 1 }}>
              "
            </div>
            <p className="text-white relative z-10 leading-tight"
              style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "clamp(1.8rem,4vw,3.2rem)", fontWeight: 700, maxWidth: "820px" }}>
              We believe every city has more life in it than most people ever discover. Our job is to close that gap.
            </p>
          </div>
        </Reveal>

        {/* Three pillars */}
        <div className="grid md:grid-cols-3 gap-px" style={{ background: "rgba(255,255,255,0.06)" }}>
          {[
            { num: "01", title: "Radical Transparency", body: "Every event, every organizer, every opportunity — surfaced clearly. No paywalls, no algorithmic games. Just relevant, honest discovery." },
            { num: "02", title: "Community First", body: "We measure success by connections made, not sessions logged. If people meet and something real happens, we've done our job." },
            { num: "03", title: "Built to Last", body: "We're not chasing growth metrics. We're building infrastructure for local communities that will outlast any trend cycle." },
          ].map((p, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="p-10 h-full" style={{ background: "#0d0b09" }}>
                <div className="font-black text-4xl mb-6" style={{ fontFamily: "'Playfair Display',Georgia,serif", color: "rgba(245,158,11,0.15)" }}>{p.num}</div>
                <h3 className="text-white font-black text-xl mb-4" style={{ fontFamily: "'Playfair Display',Georgia,serif" }}>{p.title}</h3>
                <p className="text-sm leading-7" style={{ color: "rgba(255,255,255,0.4)" }}>{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Timeline ─────────────────────────────────────────────────────────────────
function Timeline() {
  const milestones = [
    { year: "Jan 2025", title: "The Idea", body: "Missed one too many events. Started sketching the platform on paper." },
    { year: "Mar 2025", title: "First Lines of Code", body: "Spring Boot backend scaffolded. Next.js frontend started. First API call made." },
    { year: "May 2025", title: "Private Beta", body: "Organizer dashboard live. First 10 events created. First real RSVPs." },
    { year: "Sep 2025", title: "Public Launch", body: "Discover page live. AI-powered search launched. Volunteer marketplace opened." },
    { year: "2026 →", title: "What's Next", body: "Mobile apps, more cities, Eventix Space for organizations. The best is ahead." },
  ];

  return (
    <section className="py-28 px-6" style={{ background: "#faf8f4" }}>
      <div className="max-w-4xl mx-auto">
        <Reveal>
          <div className="flex items-center gap-3 mb-16">
            <div className="h-px w-10 bg-stone-900"/>
            <span className="text-[11px] font-black tracking-[0.25em] uppercase text-stone-400">The Journey</span>
          </div>
        </Reveal>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[88px] top-0 bottom-0 w-px" style={{ background: "linear-gradient(to bottom, transparent, #f59e0b 10%, #f59e0b 90%, transparent)" }}/>

          <div className="space-y-12">
            {milestones.map((m, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="grid grid-cols-[88px_auto_1fr] gap-6 items-start">
                  {/* Year */}
                  <div className="text-right">
                    <span className="text-[11px] font-black tracking-wide" style={{ color: "#f59e0b" }}>{m.year}</span>
                  </div>
                  {/* Dot */}
                  <div className="flex flex-col items-center pt-1">
                    <div className="w-3 h-3 rounded-full border-2 flex-shrink-0" style={{ background: "#faf8f4", borderColor: "#f59e0b", boxShadow: "0 0 0 4px rgba(245,158,11,0.12)" }}/>
                  </div>
                  {/* Content */}
                  <div className="pb-2">
                    <h3 className="font-black text-stone-900 text-lg mb-2" style={{ fontFamily: "'Playfair Display',Georgia,serif" }}>{m.title}</h3>
                    <p className="text-stone-500 text-sm leading-relaxed">{m.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function CTA() {
  return (
    <section className="py-28 px-6 relative overflow-hidden" style={{ background: "#0d0b09" }}>
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, #f59e0b 0%, transparent 60%)" }}/>
      <div className="max-w-3xl mx-auto text-center relative z-10">
        <Reveal>
          <p className="text-xs font-black tracking-[0.25em] uppercase mb-6" style={{ color: "#f59e0b" }}>Join Us</p>
          <h2 className="text-white font-black leading-tight mb-8"
            style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "clamp(2.5rem,6vw,4.5rem)", letterSpacing: "-0.02em" }}>
            Be part of<br/>
            <span style={{ background: "linear-gradient(90deg,#f59e0b,#f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              something real.
            </span>
          </h2>
          <p className="text-lg mb-10" style={{ color: "rgba(255,255,255,0.4)" }}>
            Discover events. Volunteer. Organize. Connect.<br/>It starts with one click.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/discover"
              className="font-bold text-stone-900 px-8 py-4 rounded-2xl text-base transition-all hover:scale-[1.02] hover:shadow-2xl"
              style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)", boxShadow: "0 8px 32px rgba(245,158,11,0.3)" }}>
              Explore Events →
            </a>
            <a href="/organizer"
              className="font-semibold px-8 py-4 rounded-2xl text-base transition-all hover:scale-[1.02] border"
              style={{ color: "rgba(255,255,255,0.6)", borderColor: "rgba(255,255,255,0.1)" }}>
              Start Organizing
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t py-10 px-6" style={{ background: "#0d0b09", borderColor: "rgba(255,255,255,0.06)" }}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <span className="font-black text-white" style={{ fontFamily: "'Playfair Display',Georgia,serif" }}>eventimist</span>
        </div>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>© 2025 Eventimist. Built with obsession in India 🇮🇳</p>
        <div className="flex gap-6 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
          {["Privacy","Terms","Contact"].map(l => <a key={l} href="#" className="hover:text-amber-400 transition-colors">{l}</a>)}
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AboutPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&display=swap');
        *,*::before,*::after{box-sizing:border-box}
        html{scroll-behavior:smooth}
        body{margin:0;font-family:Georgia,serif;background:#0d0b09}
        ::selection{background:rgba(245,158,11,0.25)}
      `}</style>
      <Nav/>
      <FounderDesk/>
      <StatsBar/>
      <Mission/>
      <Timeline/>
      <CTA/>
      <Footer/>
    </>
  );
}