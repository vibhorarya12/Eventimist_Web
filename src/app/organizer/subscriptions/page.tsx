"use client";

// src/app/organizer/subscriptions/page.tsx

import { useState, useEffect } from "react";
import { useOrganizerAuth, useOrganizerSubscription } from "@/store/eventimist/organizer/auth/AuthState";
import { useSubscriptionAction } from "@/hooks/eventimist/organizer/subscriptions/useSuscriptionAction";

// ─── Theme helpers (matches dashboard palette) ────────────────────────────────
function d(dark: boolean, darkCls: string, lightCls: string) {
  return dark ? darkCls : lightCls;
}

// ─── Plan data ────────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: "FREE",
    name: "Free",
    price: 0,
    period: "forever",
    tagline: "For individuals getting started",
    color: "#78716c",
    accent: "rgba(120,113,108,0.12)",
    accentBorder: "rgba(120,113,108,0.25)",
    features: [
      { label: "Event publishing",    value: "Limited"  },
      { label: "AI credits / month",  value: "10"       },
      { label: "AI event drafting",   value: "Basic"    },
      { label: "Analytics",           value: "Basic"    },
      { label: "Support",             value: "Community"},
    ],
    limits: [
      { label: "AI Organizer assistant", included: false },
      { label: "Advanced analytics",     included: false },
      { label: "Priority support",       included: false },
      { label: "Future premium features",included: false },
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    price: 499,
    period: "month",
    tagline: "For serious organizers",
    color: "#f59e0b",
    accent: "rgba(245,158,11,0.08)",
    accentBorder: "rgba(245,158,11,0.3)",
    features: [
      { label: "Event publishing",     value: "Higher limits" },
      { label: "AI credits / month",   value: "300"           },
      { label: "AI event drafting",    value: "Full access"   },
      { label: "Analytics",            value: "Advanced"      },
      { label: "Support",              value: "Priority"      },
    ],
    limits: [
      { label: "AI Organizer assistant",  included: true },
      { label: "Advanced analytics",      included: true },
      { label: "Priority support",        included: true },
      { label: "Future premium features", included: true },
    ],
  },
];

// ─── Credit usage ring ────────────────────────────────────────────────────────
function CreditRing({ used, total, color }: { used: number; total: number; color: string }) {
  const pct     = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  const radius  = 54;
  const circ    = 2 * Math.PI * radius;
  const dash    = circ * (pct / 100);

  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      {/* Track */}
      <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"/>
      {/* Progress */}
      <circle
        cx="70" cy="70" r={radius}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        strokeDashoffset={circ * 0.25}
        style={{ transition: "stroke-dasharray 1s cubic-bezier(0.34,1.56,0.64,1)" }}
      />
      {/* Center text */}
      <text x="70" y="62" textAnchor="middle" fontSize="26" fontWeight="800" fill={color} fontFamily="'DM Serif Display',Georgia,serif">
        {used}
      </text>
      <text x="70" y="78" textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.4)" fontFamily="'DM Sans',sans-serif">
        of {total}
      </text>
      <text x="70" y="92" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.25)" fontFamily="'DM Sans',sans-serif" letterSpacing="1">
        CREDITS USED
      </text>
    </svg>
  );
}

// ─── Stat pill ────────────────────────────────────────────────────────────────
function StatPill({ label, value, icon, dark }: { label: string; value: string; icon: React.ReactNode; dark: boolean }) {
  return (
    <div
      className="flex flex-col items-center gap-2 px-6 py-5 rounded-2xl"
      style={{
        background: d(dark, "rgba(255,255,255,0.04)", "#fff"),
        border: `1px solid ${d(dark, "rgba(255,255,255,0.07)", "#e7e5e4")}`,
      }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)" }}>
        <span className="text-amber-400">{icon}</span>
      </div>
      <div className="text-center">
        <p className="text-xl font-black leading-none" style={{
          fontFamily: "'DM Serif Display',Georgia,serif",
          color: d(dark, "#fff", "#1c1917"),
        }}>{value}</p>
        <p className="text-[10px] mt-1 font-semibold tracking-widest uppercase"
          style={{ color: d(dark, "rgba(255,255,255,0.35)", "#a8a29e") }}>{label}</p>
      </div>
    </div>
  );
}

// ─── Current Plan Banner ──────────────────────────────────────────────────────
function CurrentPlanBanner({ dark }: { dark: boolean }) {
  const subscription  = useOrganizerSubscription();
  const name          = useOrganizerAuth(s => s.name);
  const [vis, setVis] = useState(false);

  useEffect(() => { setTimeout(() => setVis(true), 80); }, []);

  const plan       = subscription?.plan ?? "FREE";
  const used       = (subscription?.aiCreditsTotal ?? 10) - (subscription?.aiCreditsRemaining ?? 10);
  const total      = subscription?.aiCreditsTotal ?? 10;
  const remaining  = subscription?.aiCreditsRemaining ?? 10;
  const canAI      = subscription?.canUseAI ?? true;
  const pct        = total > 0 ? Math.round((remaining / total) * 100) : 0;
  const credColor  = remaining === 0 ? "#ef4444" : remaining <= 3 ? "#f59e0b" : "#fbbf24";

  return (
    <div
      className="relative overflow-hidden rounded-3xl mb-8 transition-all duration-700"
      style={{
        background: "linear-gradient(135deg,#1c1917 0%,#292524 60%,#3c3028 100%)",
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(16px)",
      }}
    >
      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "radial-gradient(circle, rgba(251,191,36,0.07) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}/>
      {/* Glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 20% 50%, rgba(251,191,36,0.07) 0%, transparent 60%)" }}/>

      <div className="relative z-10 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">

          {/* Left — credit ring */}
          <div className="flex-shrink-0 flex flex-col items-center gap-3">
            <CreditRing used={used} total={total} color={credColor}/>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full"
                style={{ background: plan === "PRO" ? "rgba(251,191,36,0.12)" : "rgba(255,255,255,0.06)", border: `1px solid ${plan === "PRO" ? "rgba(251,191,36,0.25)" : "rgba(255,255,255,0.1)"}` }}>
                {plan === "PRO" && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="#fbbf24">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                )}
                <span className="text-[10px] font-black tracking-widest uppercase"
                  style={{ color: plan === "PRO" ? "#fbbf24" : "rgba(255,255,255,0.4)" }}>
                  {plan} Plan
                </span>
              </div>
            </div>
          </div>

          {/* Center — stats */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black tracking-widest uppercase mb-1"
              style={{ color: "rgba(255,255,255,0.35)" }}>
              Good day, {name?.split(" ")[0] ?? "Organizer"} 👋
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-5 leading-tight"
              style={{ fontFamily: "'DM Serif Display',Georgia,serif" }}>
              Your current usage
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <StatPill dark={dark} label="Credits Left"
                value={String(remaining)}
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>}
              />
              <StatPill dark={dark} label="Monthly Total"
                value={String(total)}
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
              />
              <StatPill dark={dark} label="Used"
                value={String(used)}
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
              />
              <StatPill dark={dark} label="AI Access"
                value={canAI ? "Active" : "Paused"}
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="7" y="7" width="10" height="10" rx="2"/><line x1="7" y1="9.5" x2="4" y2="9.5"/><line x1="7" y1="12" x2="4" y2="12"/><line x1="17" y1="9.5" x2="20" y2="9.5"/><line x1="17" y1="12" x2="20" y2="12"/></svg>}
              />
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-[10px] font-semibold" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Monthly credits used
                </span>
                <span className="text-[10px] font-black" style={{ color: credColor }}>{pct}% remaining</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${pct}%`,
                    background: remaining === 0
                      ? "#ef4444"
                      : remaining <= 3
                      ? "linear-gradient(90deg,#f59e0b,#fbbf24)"
                      : "linear-gradient(90deg,#f59e0b,#fbbf24,#fde68a)",
                  }}/>
              </div>
              {remaining === 0 && (
                <p className="text-[10px] mt-2 text-red-400 font-semibold">
                  No credits left — upgrade to Pro for 300 credits/month
                </p>
              )}
            </div>
          </div>

          {/* Right — reset info */}
          <div className="flex-shrink-0 hidden xl:block">
            <div className="rounded-2xl px-6 py-5 text-center"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="text-3xl mb-2">🔄</div>
              <p className="text-white font-black text-sm mb-0.5"
                style={{ fontFamily: "'DM Serif Display',serif" }}>Credits reset</p>
              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>1st of every month</p>
              <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-[10px] font-black tracking-wider uppercase" style={{ color: "rgba(255,255,255,0.25)" }}>
                  AI Credits are shared
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.2)" }}>
                  across all AI tools
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Plan Card ────────────────────────────────────────────────────────────────
function PlanCard({ plan, isCurrent, dark, delay }: {
  plan: typeof PLANS[0]; isCurrent: boolean; dark: boolean; delay: number;
}) {
  const [vis, setVis] = useState(false);
  const isPro = plan.id === "PRO";

  useEffect(() => { setTimeout(() => setVis(true), delay); }, [delay]);

  const surface  = d(dark, "#13151f", "#ffffff");
  const surface2 = d(dark, "#1a1d2e", "#faf9f7");
  const border   = d(dark, "rgba(255,255,255,0.07)", "#e7e5e4");
  const text1    = d(dark, "#ffffff", "#1c1917");
  const text2    = d(dark, "rgba(255,255,255,0.6)", "#57534e");
  const text3    = d(dark, "rgba(255,255,255,0.3)", "#a8a29e");

  return (
    <div
      className="relative flex flex-col rounded-3xl overflow-hidden transition-all duration-700"
      style={{
        background: surface,
        border: isCurrent
          ? `2px solid ${plan.color}`
          : isPro
          ? `2px solid rgba(245,158,11,0.3)`
          : `1px solid ${border}`,
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(24px)",
        boxShadow: isCurrent ? `0 0 0 4px ${plan.color}18` : isPro ? "0 20px 60px rgba(245,158,11,0.1)" : "none",
      }}
    >
      {/* PRO popular ribbon */}
      {isPro && (
        <div className="absolute -top-px left-1/2 -translate-x-1/2 z-10">
          <div className="text-[10px] font-black tracking-widest uppercase px-5 py-1.5 rounded-b-xl"
            style={{ background: "linear-gradient(135deg,#f59e0b,#fbbf24)", color: "#1c1917" }}>
            ✦ Most Popular
          </div>
        </div>
      )}

      {/* Current plan badge */}
      {isCurrent && (
        <div className="absolute top-4 right-4 text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full"
          style={{ background: plan.accent, border: `1px solid ${plan.accentBorder}`, color: plan.color }}>
          Current Plan
        </div>
      )}

      {/* Header */}
      <div className="px-7 pt-8 pb-6" style={{ borderBottom: `1px solid ${border}` }}>
        {/* Plan icon */}
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
          style={{ background: plan.accent, border: `1px solid ${plan.accentBorder}` }}>
          {isPro ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={plan.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={plan.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
          )}
        </div>

        <p className="text-[10px] font-black tracking-widest uppercase mb-1"
          style={{ color: plan.color }}>{plan.name}</p>
        <div className="flex items-baseline gap-1.5 mb-1">
          {plan.price === 0 ? (
            <span className="text-5xl font-black" style={{ fontFamily: "'DM Serif Display',serif", color: text1 }}>₹0</span>
          ) : (
            <>
              <span className="text-5xl font-black" style={{ fontFamily: "'DM Serif Display',serif", color: text1 }}>
                ₹{plan.price}
              </span>
              <span className="text-sm" style={{ color: text3 }}>/ month</span>
            </>
          )}
        </div>
        <p className="text-xs" style={{ color: text3 }}>{plan.tagline}</p>
      </div>

      {/* Features */}
      <div className="px-7 py-6 flex-1 space-y-3">
        {/* Feature rows */}
        {plan.features.map(f => (
          <div key={f.label} className="flex items-center justify-between py-2"
            style={{ borderBottom: `1px solid ${border}` }}>
            <span className="text-xs font-medium" style={{ color: text2 }}>{f.label}</span>
            <span className="text-xs font-black" style={{ color: isPro ? "#fbbf24" : text1 }}>{f.value}</span>
          </div>
        ))}

        {/* Included/not-included */}
        <div className="pt-3 space-y-2.5">
          {plan.limits.map(l => (
            <div key={l.label} className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: l.included ? "rgba(251,191,36,0.12)" : d(dark, "rgba(255,255,255,0.04)", "#f5f5f4"),
                  border: `1px solid ${l.included ? "rgba(251,191,36,0.3)" : border}`,
                }}>
                {l.included ? (
                  <svg width="8" height="8" fill="none" stroke="#fbbf24" viewBox="0 0 24 24" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                ) : (
                  <svg width="8" height="8" fill="none" stroke={text3} viewBox="0 0 24 24" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                )}
              </div>
              <span className="text-xs" style={{ color: l.included ? text2 : text3, textDecoration: l.included ? "none" : "line-through" }}>
                {l.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-7 pb-7">
        {isCurrent ? (
          <div className="w-full py-3.5 rounded-2xl text-sm font-black text-center"
            style={{ background: plan.accent, border: `1px solid ${plan.accentBorder}`, color: plan.color }}>
            ✓ Current Plan
          </div>
        ) : isPro ? (
          <button className="w-full py-3.5 rounded-2xl text-sm font-black text-stone-900 transition-all hover:opacity-90 hover:cursor-pointer active:scale-[0.99]"
            style={{ background: "linear-gradient(135deg,#f59e0b,#fbbf24)" }}>
            Upgrade to Pro →
          </button>
        ) : (
          <button className="w-full py-3.5 rounded-2xl text-sm font-bold transition-colors"
            style={{ background: surface2, border: `1px solid ${border}`, color: text3 }}
            disabled>
            Free plan
          </button>
        )}
      </div>
    </div>
  );
}

// ─── AI credits info strip ────────────────────────────────────────────────────
function CreditsInfoStrip({ dark }: { dark: boolean }) {
  const surface = d(dark, "#13151f", "#fff");
  const border  = d(dark, "rgba(255,255,255,0.07)", "#e7e5e4");
  const text2   = d(dark, "rgba(255,255,255,0.5)", "#78716c");

  const notes = [
    { icon: "⚡", text: "AI credits are consumed for all AI-powered organizer actions" },
    { icon: "🔄", text: "Credits reset on the 1st of every month automatically" },
    { icon: "🔮", text: "Future AI tools will also draw from the same credit pool" },
    { icon: "🤝", text: "Credits are shared across all AI features in your account" },
  ];

  return (
    <div className="mt-8 rounded-3xl overflow-hidden"
      style={{ background: surface, border: `1px solid ${border}` }}>
      <div className="px-6 py-4" style={{ borderBottom: `1px solid ${border}`, background: "rgba(251,191,36,0.04)" }}>
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
          <p className="text-[10px] font-black tracking-widest uppercase" style={{ color: "#fbbf24" }}>
            About AI Credits
          </p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x"
        style={{ borderColor: border }}>
        {notes.map((n, i) => (
          <div key={i} className="px-5 py-5 flex items-start gap-3">
            <span className="text-lg flex-shrink-0 mt-0.5">{n.icon}</span>
            <p className="text-xs leading-relaxed" style={{ color: text2 }}>{n.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SubscriptionsPage() {
  const [dark, setDark] = useState(false);
  const subscription = useOrganizerSubscription();
  const { refetch }  = useSubscriptionAction();

  useEffect(() => {
    const saved = localStorage.getItem("org-dashboard-dark");
    if (saved === "1") setDark(true);
  }, []);

  const currentPlan = subscription?.plan ?? "FREE";

  const surface  = d(dark, "#0c0e1a", "#faf9f7");
  const border   = d(dark, "rgba(255,255,255,0.07)", "#e7e5e4");
  const text1    = d(dark, "#ffffff", "#1c1917");
  const text3    = d(dark, "rgba(255,255,255,0.3)", "#a8a29e");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; font-family: 'DM Sans', system-ui, sans-serif; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.15); border-radius: 99px; }
      `}</style>

      <div className="min-h-screen" style={{ background: surface }}>

        {/* ── Top bar ── */}
        <div className="sticky top-0 z-40 border-b backdrop-blur-xl"
          style={{ borderColor: border, background: `${surface}e8` }}>
          <div className="max-w-6xl mx-auto px-5 sm:px-8 h-14 sm:h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a href="/organizer/dashboard"
                className="flex items-center gap-2 text-sm font-semibold transition-colors"
                style={{ color: text3 }}
                onMouseEnter={e => (e.currentTarget.style.color = text1)}
                onMouseLeave={e => (e.currentTarget.style.color = text3)}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6"/>
                </svg>
                <span className="hidden sm:block">Dashboard</span>
              </a>
              <span style={{ color: border }}>·</span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#f59e0b,#fbbf24)" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                </div>
                <span className="text-sm font-black" style={{ color: text1, fontFamily: "'DM Serif Display',serif" }}>
                  Plans & Credits
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Refresh subscription */}
              <button
                onClick={() => refetch()}
                className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-xl transition-colors"
                style={{ color: text3, border: `1px solid ${border}`, background: "transparent" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = text1; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = text3; }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                  <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                </svg>
                Refresh
              </button>
              {/* Dark toggle */}
              <button
                onClick={() => setDark(p => { localStorage.setItem("org-dashboard-dark", !p ? "1" : "0"); return !p; })}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-colors text-base"
                style={{ border: `1px solid ${border}`, background: d(dark, "rgba(255,255,255,0.04)", "#f5f5f4") }}>
                {dark ? "☀️" : "🌙"}
              </button>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-10">

          {/* Page title */}
          <div className="mb-8">
            <p className="text-[10px] font-black tracking-widest uppercase mb-2"
              style={{ color: "#f59e0b" }}>
              Subscription
            </p>
            <h1 className="text-3xl sm:text-4xl font-black mb-2"
              style={{ fontFamily: "'DM Serif Display',Georgia,serif", color: text1 }}>
              Plans & Credits
            </h1>
            <p className="text-sm" style={{ color: text3 }}>
              Manage your plan, track AI credit usage, and upgrade when you're ready.
            </p>
          </div>

          {/* Current plan banner */}
          <CurrentPlanBanner dark={dark}/>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px" style={{ background: border }}/>
            <p className="text-[10px] font-black tracking-widest uppercase" style={{ color: text3 }}>
              Choose a plan
            </p>
            <div className="flex-1 h-px" style={{ background: border }}/>
          </div>

          {/* Plan cards */}
          <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
            {PLANS.map((plan, i) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrent={currentPlan === plan.id}
                dark={dark}
                delay={100 + i * 120}
              />
            ))}
          </div>

          {/* Credits info */}
          <CreditsInfoStrip dark={dark}/>

          {/* Footer note */}
          <p className="text-center text-[11px] mt-8" style={{ color: text3 }}>
            Subscriptions are billed monthly · Cancel anytime · Credits reset on the 1st · Eventimist
          </p>
        </div>
      </div>
    </>
  );
}