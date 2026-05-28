"use client";

// src/components/eventimist/organizer/PricingModal.tsx

import { useState } from "react";

interface Props {
  currentPlan?: "FREE" | "PRO";
  dark: boolean;
  onUpgrade?: () => void;
}

// ─── Theme helpers (identical to create-event page) ───────────────────────────
function d(dark: boolean, darkCls: string, lightCls: string) {
  return dark ? darkCls : lightCls;
}

const T = {
  bg:      (dark: boolean) => d(dark, "#0c0e1a",   "#faf9f7"),
  surface: (dark: boolean) => d(dark, "#13151f",   "#ffffff"),
  surface2:(dark: boolean) => d(dark, "#1a1d2e",   "#f5f5f4"),
  border:  (dark: boolean) => d(dark, "rgba(255,255,255,0.08)", "#e7e5e4"),
  text1:   (dark: boolean) => d(dark, "#ffffff",   "#1c1917"),
  text2:   (dark: boolean) => d(dark, "rgba(255,255,255,0.6)",  "#57534e"),
  text3:   (dark: boolean) => d(dark, "rgba(255,255,255,0.3)",  "#a8a29e"),
};

const SHARED_NOTES = [
  "AI credits are consumed for AI-powered organizer actions",
  "Credits reset monthly",
  "Future AI tools will also use the same credit system",
];

const FREE_FEATURES = [
  { text: "Limited event publishing",    icon: "calendar" },
  { text: "10 AI credits / month",       icon: "bolt" },
  { text: "Basic analytics",             icon: "chart-bar" },
  { text: "Community support",           icon: "users" },
];

const PRO_FEATURES = [
  { text: "Higher event publishing limits",        icon: "calendar-plus" },
  { text: "300 AI credits / month",                icon: "bolt" },
  { text: "AI event drafting",                     icon: "sparkles" },
  { text: "AI organizer assistant",                icon: "robot" },
  { text: "Priority support",                      icon: "headset" },
  { text: "Advanced analytics",                    icon: "chart-dots" },
  { text: "Access to future premium features",     icon: "rocket" },
];

// ─── Feature row ──────────────────────────────────────────────────────────────
function Feature({ text, dark, amber = false }: { text: string; dark: boolean; amber?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: amber ? "rgba(251,191,36,0.15)" : d(dark, "rgba(255,255,255,0.08)", "rgba(28,25,23,0.06)"),
        }}
      >
        <svg
          className="w-3 h-3"
          fill="none"
          stroke={amber ? "#fbbf24" : d(dark, "rgba(255,255,255,0.5)", "#78716c")}
          viewBox="0 0 24 24"
          strokeWidth="2.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <span
        className="text-sm"
        style={{ color: amber ? (dark ? "#fde68a" : "#92400e") : T.text2(dark) }}
      >
        {text}
      </span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function PricingModal({ currentPlan = "FREE", dark, onUpgrade }: Props) {
  const [open, setOpen] = useState(false);
  const [hoveredPlan, setHoveredPlan] = useState<"FREE" | "PRO" | null>(null);

  return (
    <>
      {/* ── FAB — bottom left ── */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-20 sm:bottom-7 sm:right-24 z-50 flex items-center gap-2 sm:gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full font-bold text-xs sm:text-sm transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 active:scale-95"
        style={{
          background: d(dark, "#13151f", "linear-gradient(135deg,#f59e0b,#fbbf24)"),
          color: d(dark, "#f59e0b", "#1c1917"),
          border: `1px solid ${d(dark, "rgba(251,191,36,0.25)", "transparent")}`,
          boxShadow: d(dark,
            "0 4px 20px rgba(0,0,0,0.4), 0 0 0 1px rgba(251,191,36,0.1)",
            "0 4px 20px rgba(245,158,11,0.35)"
          ),
          fontFamily: "'DM Sans',sans-serif",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={d(dark, "#f59e0b", "#1c1917")} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        {currentPlan === "PRO" ? "Pro Plan" : "Upgrade to Pro"}
        {currentPlan === "FREE" && (
          <span
            className="text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded-full"
            style={{
              background: d(dark, "rgba(245,158,11,0.15)", "rgba(28,25,23,0.12)"),
              color: d(dark, "#f59e0b", "#1c1917"),
            }}
          >
            Free
          </span>
        )}
      </button>

      {/* ── Modal ── */}
      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(16px)" }}
        >
          <div
            className="relative w-full flex flex-col overflow-hidden shadow-2xl"
            style={{
              background: T.bg(dark),
              border: `1px solid ${T.border(dark)}`,
              maxWidth: 860,
              borderRadius: 24,
              maxHeight: "95vh",
              overflowY: "auto",
              position: "relative",
            }}
          >
            {/* Close — on modal card, not inside overflow-hidden header */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center transition-colors z-30"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.14)"; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)"; }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

        {/* ── Header ── */}
        <div
          className="relative flex-shrink-0 overflow-hidden px-8 py-8"
          style={{ background: "linear-gradient(135deg,#1c1917 0%,#292524 100%)" }}
        >
          {/* Dot grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(251,191,36,0.07) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
              maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
            }}
          />
          {/* Amber glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 60% 0%, rgba(251,191,36,0.08) 0%, transparent 60%)" }}
          />

          {/* old close button removed */}

          <div className="relative z-10 text-center">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-4 text-[10px] font-black tracking-widest uppercase"
              style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.25)", color: "#fbbf24" }}
            >
              <svg width="9" height="9" viewBox="0 0 24 24" fill="#fbbf24">
                <path d="M12 2L14 9H21L15.5 13.5L17.5 20.5L12 16L6.5 20.5L8.5 13.5L3 9H10Z" />
              </svg>
              Eventimist Plans
            </div>
            <h2
              className="text-3xl font-black text-white mb-2 leading-tight"
              style={{ fontFamily: "'Playfair Display',Georgia,serif" }}
            >
              Choose your plan
            </h2>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 1.6 }}>
              Scale your events with AI-powered tools. Upgrade anytime.
            </p>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-6 sm:px-8 py-8 space-y-6">

          {/* Plan cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* FREE */}
            <div
              onMouseEnter={() => setHoveredPlan("FREE")}
              onMouseLeave={() => setHoveredPlan(null)}
              style={{
                background: T.surface(dark),
                border: currentPlan === "FREE"
                  ? "2px solid rgba(251,191,36,0.5)"
                  : `1px solid ${T.border(dark)}`,
                borderRadius: 20,
                padding: "28px 24px",
                transition: "border-color 0.2s, transform 0.2s",
                transform: hoveredPlan === "FREE" ? "translateY(-2px)" : "none",
                position: "relative",
              }}
            >
              {currentPlan === "FREE" && (
                <div
                  className="absolute top-4 right-4 text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}
                >
                  Current plan
                </div>
              )}

              {/* Plan icon */}
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: d(dark, "rgba(255,255,255,0.06)", "#f5f5f4"), border: `1px solid ${T.border(dark)}` }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.text3(dark)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                </svg>
              </div>

              <p className="text-[11px] font-black tracking-widest uppercase mb-1" style={{ color: T.text3(dark) }}>Free</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-black" style={{ fontFamily: "'Playfair Display',serif", color: T.text1(dark) }}>₹0</span>
                <span className="text-sm" style={{ color: T.text3(dark) }}>/month</span>
              </div>
              <p className="text-xs mb-6" style={{ color: T.text3(dark) }}>Perfect to get started</p>

              <div className="space-y-3 mb-7">
                {FREE_FEATURES.map(f => <Feature key={f.text} text={f.text} dark={dark} />)}
              </div>

              <button
                disabled
                className="w-full py-3 rounded-xl text-sm font-black transition-all"
                style={{
                  background: d(dark, "rgba(255,255,255,0.05)", "#f5f5f4"),
                  border: `1px solid ${T.border(dark)}`,
                  color: T.text3(dark),
                  cursor: "default",
                }}
              >
                {currentPlan === "FREE" ? "Current plan" : "Free plan"}
              </button>
            </div>

            {/* PRO */}
            <div
              onMouseEnter={() => setHoveredPlan("PRO")}
              onMouseLeave={() => setHoveredPlan(null)}
              style={{
                background: dark ? "rgba(251,191,36,0.04)" : "#fffdf5",
                border: currentPlan === "PRO"
                  ? "2px solid #fbbf24"
                  : hoveredPlan === "PRO"
                  ? "2px solid rgba(251,191,36,0.6)"
                  : "2px solid rgba(251,191,36,0.25)",
                borderRadius: 20,
                padding: "28px 24px",
                transition: "border-color 0.2s, transform 0.2s",
                transform: hoveredPlan === "PRO" ? "translateY(-2px)" : "none",
                position: "relative",
              }}
            >
              {/* Popular badge */}
              <div
                className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] font-black tracking-widest uppercase px-4 py-1.5 rounded-full whitespace-nowrap"
                style={{ background: "linear-gradient(135deg,#f59e0b,#fbbf24)", color: "#1c1917" }}
              >
                ✦ Most popular
              </div>

              {currentPlan === "PRO" && (
                <div
                  className="absolute top-4 right-4 text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(251,191,36,0.15)", color: "#f59e0b", border: "1px solid rgba(251,191,36,0.3)" }}
                >
                  Current plan
                </div>
              )}

              {/* Plan icon */}
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.25)" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>

              <p className="text-[11px] font-black tracking-widest uppercase mb-1" style={{ color: "#f59e0b" }}>Pro</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-black" style={{ fontFamily: "'Playfair Display',serif", color: dark ? "#fff" : "#1c1917" }}>₹499</span>
                <span className="text-sm" style={{ color: T.text3(dark) }}>/month</span>
              </div>
              <p className="text-xs mb-6" style={{ color: T.text3(dark) }}>For serious organizers</p>

              <div className="space-y-3 mb-7">
                {PRO_FEATURES.map(f => <Feature key={f.text} text={f.text} dark={dark} amber />)}
              </div>

              {currentPlan === "PRO" ? (
                <button
                  disabled
                  className="w-full py-3 rounded-xl text-sm font-black"
                  style={{
                    background: "rgba(251,191,36,0.1)",
                    border: "1px solid rgba(251,191,36,0.25)",
                    color: "#f59e0b",
                    cursor: "default",
                  }}
                >
                  Current plan
                </button>
              ) : (
                <button
                  onClick={onUpgrade}
                  className="w-full py-3 rounded-xl text-sm font-black transition-all hover:opacity-90 active:scale-[0.99]"
                  style={{
                    background: "linear-gradient(135deg,#f59e0b,#fbbf24)",
                    color: "#1c1917",
                    border: "none",
                  }}
                >
                  Upgrade to Pro →
                </button>
              )}
            </div>
          </div>

          {/* ── Shared notes ── */}
          <div
            className="rounded-2xl px-5 py-4"
            style={{
              background: d(dark, "rgba(251,191,36,0.04)", "#fffbeb"),
              border: `1px solid ${d(dark, "rgba(251,191,36,0.12)", "#fde68a")}`,
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <p className="text-[10px] font-black tracking-widest uppercase" style={{ color: "#f59e0b" }}>
                About AI credits
              </p>
            </div>
            <div className="space-y-2">
              {SHARED_NOTES.map((note, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span
                    className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0"
                    style={{ background: d(dark, "rgba(251,191,36,0.4)", "#f59e0b") }}
                  />
                  <p className="text-xs leading-relaxed" style={{ color: d(dark, "rgba(255,255,255,0.5)", "#92400e") }}>
                    {note}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Footer note ── */}
          <p className="text-center text-[11px]" style={{ color: T.text3(dark) }}>
            Subscriptions are billed monthly. Cancel anytime. · Eventimist
          </p>

        </div>{/* end body */}

      </div>{/* end modal card */}

    </div>
  )}{/* end modal backdrop */}

    </>
  );
}