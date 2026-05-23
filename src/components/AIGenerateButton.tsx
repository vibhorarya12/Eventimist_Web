"use client";

// src/components/eventimist/organizer/AIGenerateButton.tsx

import { useState, useEffect, useRef } from "react";

export interface AIGeneratedEvent {
  title?: string;
  description?: string;
  category?: string;
  mode?: string;
  tags?: string[];
  capacity?: number;
  startTime?: string;
  endTime?: string;
}

interface Props {
  dark: boolean;
  onApply: (data: AIGeneratedEvent) => void;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const DUMMY_RESULTS: Record<string, AIGeneratedEvent> = {
  music: {
    title: "Coastal Currents — Indie & Electronic Music Festival",
    description: "Two days of pure sound and soul by the shores of Goa. Coastal Currents brings together the finest indie and electronic acts from across India and beyond, set against a stunning outdoor backdrop.\n\nExpect curated stages, local food stalls, art installations, and a community that lives for music.",
    category: "FESTIVAL", mode: "OFFLINE",
    tags: ["music", "festival", "goa", "indie", "electronic", "outdoor", "live-music"],
    capacity: 1000, startTime: "2025-12-20T16:00", endTime: "2025-12-21T23:59",
  },
  tech: {
    title: "Build with AI — Developer Workshop on LLMs & Agents",
    description: "A hands-on 3-hour workshop designed for developers ready to move beyond the hype and start building real AI-powered products.\n\nWe'll cover LLM fundamentals, prompt engineering, tool use, and agentic workflows. Come with a laptop, leave with working code.",
    category: "WORKSHOP", mode: "ONLINE",
    tags: ["ai", "llm", "developers", "workshop", "agents", "tech"],
    capacity: 80, startTime: "2025-09-10T10:00", endTime: "2025-09-10T13:00",
  },
  networking: {
    title: "Founders in the Sky — Rooftop Networking Dinner",
    description: "An intimate evening for startup founders who'd rather build connections over good food than swap business cards at a conference.\n\nJoin 50 ambitious builders on a rooftop in Mumbai for candid conversations and the kind of introductions that actually change things.",
    category: "NETWORKING", mode: "OFFLINE",
    tags: ["startup", "founders", "networking", "mumbai", "rooftop", "dinner"],
    capacity: 50, startTime: "2025-08-01T19:00", endTime: "2025-08-01T22:00",
  },
  food: {
    title: "Street Eats Pune — A Celebration of Street Food Culture",
    description: "From vada pav to shawarma, chaat to craft desserts — Street Eats Pune is a weekend celebration of the food that makes our cities taste like home.\n\nDiscover 50+ vendors, attend live cooking demos, and eat your way through Pune's most vibrant culinary scene.",
    category: "FOOD", mode: "OFFLINE",
    tags: ["food", "street-food", "pune", "festival", "culture", "community"],
    capacity: 500, startTime: "2025-10-04T11:00", endTime: "2025-10-05T21:00",
  },
  default: {
    title: "Tech & Culture Summit — Pune 2025",
    description: "A vibrant gathering at the crossroads of technology, creativity, and human connection.\n\nJoin practitioners, makers, and thinkers for two days of talks, workshops, and hallway conversations that spark genuine ideas. This is the event you'll be talking about for years.",
    category: "CONFERENCE", mode: "HYBRID",
    tags: ["tech", "conference", "pune", "community", "innovation"],
    capacity: 300, startTime: "2025-08-15T09:00", endTime: "2025-08-16T18:00",
  },
};

const LOADING_MESSAGES = [
  "Reading your prompt…",
  "Identifying event type…",
  "Crafting the perfect title…",
  "Writing description…",
  "Picking category & tags…",
  "Almost there…",
];

const EXAMPLE_PROMPTS = [
  { emoji: "🎵", label: "Music festival",    text: "A free music festival in Goa this December, outdoor, 1000 attendees, indie and electronic acts" },
  { emoji: "💻", label: "AI workshop",        text: "A 3-hour AI workshop for developers in Bangalore on 10 September, free, max 80 attendees, online" },
  { emoji: "🔗", label: "Startup networking",text: "Networking dinner for startup founders in Mumbai next Friday evening, 50 people, rooftop venue, free" },
  { emoji: "🍜", label: "Food fair",          text: "A weekend food fair in Pune celebrating street food culture, free entry, 500 attendees, offline" },
];

const FIELD_OPTIONS = [
  { key: "title",       emoji: "📝", label: "Title" },
  { key: "description", emoji: "📖", label: "Description" },
  { key: "tags",        emoji: "🏷",  label: "Tags" },
  { key: "startTime",   emoji: "📅", label: "Dates" },
  { key: "category",    emoji: "📂", label: "Category" },
  { key: "mode",        emoji: "🖥",  label: "Mode" },
  { key: "capacity",    emoji: "👥", label: "Capacity" },
] as const;

type FieldKey = typeof FIELD_OPTIONS[number]["key"];

function fmtDate(dt: string) {
  try {
    return new Date(dt).toLocaleString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return dt; }
}

function pickResult(prompt: string): AIGeneratedEvent {
  const lower = prompt.toLowerCase();
  if (lower.includes("music") || lower.includes("festival") || lower.includes("concert")) return DUMMY_RESULTS.music;
  if (lower.includes("workshop") || lower.includes("developer") || lower.includes("ai") || lower.includes("tech")) return DUMMY_RESULTS.tech;
  if (lower.includes("network") || lower.includes("founder") || lower.includes("startup")) return DUMMY_RESULTS.networking;
  if (lower.includes("food") || lower.includes("eat") || lower.includes("culinary")) return DUMMY_RESULTS.food;
  return DUMMY_RESULTS.default;
}

// ─── Static AI SVG illustration ───────────────────────────────────────────────
function AIIllustration() {
  return (
    <svg width="260" height="160" viewBox="0 0 260 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer hex ring */}
      <polygon points="130,8 162,26 162,62 130,80 98,62 98,26" stroke="rgba(251,191,36,0.18)" strokeWidth="1.2" fill="none"/>
      <polygon points="130,18 155,32 155,58 130,72 105,58 105,32" stroke="rgba(251,191,36,0.12)" strokeWidth="1" fill="none"/>

      {/* Center brain / CPU icon */}
      <rect x="108" y="48" width="44" height="44" rx="8" fill="rgba(251,191,36,0.08)" stroke="rgba(251,191,36,0.35)" strokeWidth="1.5"/>
      {/* CPU pins left */}
      <line x1="108" y1="58" x2="100" y2="58" stroke="rgba(251,191,36,0.5)" strokeWidth="1.5"/>
      <line x1="108" y1="66" x2="100" y2="66" stroke="rgba(251,191,36,0.5)" strokeWidth="1.5"/>
      <line x1="108" y1="74" x2="100" y2="74" stroke="rgba(251,191,36,0.5)" strokeWidth="1.5"/>
      <line x1="108" y1="82" x2="100" y2="82" stroke="rgba(251,191,36,0.5)" strokeWidth="1.5"/>
      {/* CPU pins right */}
      <line x1="152" y1="58" x2="160" y2="58" stroke="rgba(251,191,36,0.5)" strokeWidth="1.5"/>
      <line x1="152" y1="66" x2="160" y2="66" stroke="rgba(251,191,36,0.5)" strokeWidth="1.5"/>
      <line x1="152" y1="74" x2="160" y2="74" stroke="rgba(251,191,36,0.5)" strokeWidth="1.5"/>
      <line x1="152" y1="82" x2="160" y2="82" stroke="rgba(251,191,36,0.5)" strokeWidth="1.5"/>
      {/* CPU pins top */}
      <line x1="118" y1="48" x2="118" y2="40" stroke="rgba(251,191,36,0.5)" strokeWidth="1.5"/>
      <line x1="126" y1="48" x2="126" y2="40" stroke="rgba(251,191,36,0.5)" strokeWidth="1.5"/>
      <line x1="134" y1="48" x2="134" y2="40" stroke="rgba(251,191,36,0.5)" strokeWidth="1.5"/>
      <line x1="142" y1="48" x2="142" y2="40" stroke="rgba(251,191,36,0.5)" strokeWidth="1.5"/>
      {/* CPU pins bottom */}
      <line x1="118" y1="92" x2="118" y2="100" stroke="rgba(251,191,36,0.5)" strokeWidth="1.5"/>
      <line x1="126" y1="92" x2="126" y2="100" stroke="rgba(251,191,36,0.5)" strokeWidth="1.5"/>
      <line x1="134" y1="92" x2="134" y2="100" stroke="rgba(251,191,36,0.5)" strokeWidth="1.5"/>
      <line x1="142" y1="92" x2="142" y2="100" stroke="rgba(251,191,36,0.5)" strokeWidth="1.5"/>
      {/* CPU inner grid */}
      <rect x="116" y="56" width="28" height="28" rx="3" fill="rgba(251,191,36,0.12)" stroke="rgba(251,191,36,0.3)" strokeWidth="1"/>
      <line x1="130" y1="56" x2="130" y2="84" stroke="rgba(251,191,36,0.2)" strokeWidth="0.8"/>
      <line x1="116" y1="70" x2="144" y2="70" stroke="rgba(251,191,36,0.2)" strokeWidth="0.8"/>
      {/* CPU center dot */}
      <circle cx="130" cy="70" r="5" fill="rgba(251,191,36,0.3)" stroke="#fbbf24" strokeWidth="1.2"/>
      <circle cx="130" cy="70" r="2" fill="#fbbf24"/>

      {/* Left node cluster */}
      <circle cx="52" cy="50" r="8" fill="rgba(251,191,36,0.08)" stroke="rgba(251,191,36,0.3)" strokeWidth="1.2"/>
      <circle cx="52" cy="50" r="3" fill="rgba(251,191,36,0.5)"/>
      <circle cx="30" cy="70" r="6" fill="rgba(251,191,36,0.06)" stroke="rgba(251,191,36,0.2)" strokeWidth="1"/>
      <circle cx="30" cy="70" r="2.5" fill="rgba(251,191,36,0.4)"/>
      <circle cx="55" cy="100" r="7" fill="rgba(251,191,36,0.07)" stroke="rgba(251,191,36,0.25)" strokeWidth="1"/>
      <circle cx="55" cy="100" r="2.5" fill="rgba(251,191,36,0.4)"/>

      {/* Right node cluster */}
      <circle cx="208" cy="50" r="8" fill="rgba(251,191,36,0.08)" stroke="rgba(251,191,36,0.3)" strokeWidth="1.2"/>
      <circle cx="208" cy="50" r="3" fill="rgba(251,191,36,0.5)"/>
      <circle cx="230" cy="72" r="6" fill="rgba(251,191,36,0.06)" stroke="rgba(251,191,36,0.2)" strokeWidth="1"/>
      <circle cx="230" cy="72" r="2.5" fill="rgba(251,191,36,0.4)"/>
      <circle cx="205" cy="100" r="7" fill="rgba(251,191,36,0.07)" stroke="rgba(251,191,36,0.25)" strokeWidth="1"/>
      <circle cx="205" cy="100" r="2.5" fill="rgba(251,191,36,0.4)"/>

      {/* Top nodes */}
      <circle cx="90" cy="20" r="5" fill="rgba(251,191,36,0.08)" stroke="rgba(251,191,36,0.25)" strokeWidth="1"/>
      <circle cx="170" cy="20" r="5" fill="rgba(251,191,36,0.08)" stroke="rgba(251,191,36,0.25)" strokeWidth="1"/>
      <circle cx="130" cy="10" r="4" fill="rgba(251,191,36,0.06)" stroke="rgba(251,191,36,0.2)" strokeWidth="1"/>

      {/* Bottom nodes */}
      <circle cx="90" cy="140" r="5" fill="rgba(251,191,36,0.08)" stroke="rgba(251,191,36,0.25)" strokeWidth="1"/>
      <circle cx="170" cy="140" r="5" fill="rgba(251,191,36,0.08)" stroke="rgba(251,191,36,0.25)" strokeWidth="1"/>
      <circle cx="130" cy="150" r="4" fill="rgba(251,191,36,0.06)" stroke="rgba(251,191,36,0.2)" strokeWidth="1"/>

      {/* Connection lines — left cluster to CPU */}
      <line x1="60" y1="52" x2="100" y2="62" stroke="rgba(251,191,36,0.2)" strokeWidth="1"/>
      <line x1="36" y1="70" x2="100" y2="70" stroke="rgba(251,191,36,0.2)" strokeWidth="1"/>
      <line x1="62" y1="97" x2="100" y2="80" stroke="rgba(251,191,36,0.2)" strokeWidth="1"/>

      {/* Connection lines — right cluster to CPU */}
      <line x1="200" y1="52" x2="160" y2="62" stroke="rgba(251,191,36,0.2)" strokeWidth="1"/>
      <line x1="224" y1="72" x2="160" y2="70" stroke="rgba(251,191,36,0.2)" strokeWidth="1"/>
      <line x1="198" y1="97" x2="160" y2="80" stroke="rgba(251,191,36,0.2)" strokeWidth="1"/>

      {/* Top connections */}
      <line x1="90" y1="25" x2="110" y2="48" stroke="rgba(251,191,36,0.15)" strokeWidth="1"/>
      <line x1="170" y1="25" x2="150" y2="48" stroke="rgba(251,191,36,0.15)" strokeWidth="1"/>
      <line x1="130" y1="14" x2="130" y2="40" stroke="rgba(251,191,36,0.15)" strokeWidth="1"/>

      {/* Bottom connections */}
      <line x1="90" y1="135" x2="110" y2="100" stroke="rgba(251,191,36,0.15)" strokeWidth="1"/>
      <line x1="170" y1="135" x2="150" y2="100" stroke="rgba(251,191,36,0.15)" strokeWidth="1"/>
      <line x1="130" y1="146" x2="130" y2="100" stroke="rgba(251,191,36,0.15)" strokeWidth="1"/>

      {/* Left inner connections */}
      <line x1="36" y1="65" x2="52" y2="57" stroke="rgba(251,191,36,0.12)" strokeWidth="0.8"/>
      <line x1="36" y1="75" x2="52" y2="94" stroke="rgba(251,191,36,0.12)" strokeWidth="0.8"/>

      {/* Right inner connections */}
      <line x1="224" y1="67" x2="208" y2="57" stroke="rgba(251,191,36,0.12)" strokeWidth="0.8"/>
      <line x1="224" y1="77" x2="208" y2="94" stroke="rgba(251,191,36,0.12)" strokeWidth="0.8"/>

      {/* Sparkle stars */}
      <path d="M20 30 L22 26 L24 30 L22 34 Z" fill="rgba(251,191,36,0.35)"/>
      <path d="M238 110 L240 106 L242 110 L240 114 Z" fill="rgba(251,191,36,0.35)"/>
      <path d="M14 100 L15.5 97 L17 100 L15.5 103 Z" fill="rgba(251,191,36,0.25)"/>
      <path d="M245 40 L246.5 37 L248 40 L246.5 43 Z" fill="rgba(251,191,36,0.25)"/>
      <circle cx="68" cy="130" r="1.5" fill="rgba(251,191,36,0.3)"/>
      <circle cx="192" cy="130" r="1.5" fill="rgba(251,191,36,0.3)"/>
      <circle cx="20" cy="120" r="1" fill="rgba(251,191,36,0.25)"/>
      <circle cx="240" cy="30" r="1" fill="rgba(251,191,36,0.25)"/>

      {/* Data flow path decorations */}
      <path d="M 52 50 Q 76 30 90 20" stroke="rgba(251,191,36,0.1)" strokeWidth="0.8" fill="none"/>
      <path d="M 208 50 Q 184 30 170 20" stroke="rgba(251,191,36,0.1)" strokeWidth="0.8" fill="none"/>
      <path d="M 55 100 Q 72 120 90 140" stroke="rgba(251,191,36,0.1)" strokeWidth="0.8" fill="none"/>
      <path d="M 205 100 Q 188 120 170 140" stroke="rgba(251,191,36,0.1)" strokeWidth="0.8" fill="none"/>
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function AIGenerateButton({ dark, onApply }: Props) {
  const [open,       setOpen]       = useState(false);
  const [prompt,     setPrompt]     = useState("");
  const [loading,    setLoading]    = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  const [result,     setResult]     = useState<AIGeneratedEvent | null>(null);
  const [applied,    setApplied]    = useState(false);
  const [fields,     setFields]     = useState<Record<FieldKey, boolean>>({
    title: true, description: true, tags: true,
    startTime: true, category: true, mode: true, capacity: true,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const closeModal = () => setOpen(false);

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setResult(null);
    setApplied(false);

    let idx = 0;
    setLoadingMsg(LOADING_MESSAGES[0]);
    intervalRef.current = setInterval(() => {
      idx = (idx + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[idx]);
    }, 550);

    // ── Replace with real API call when backend ready ──
    await new Promise(r => setTimeout(r, 2800));
    const raw = pickResult(prompt);

    if (intervalRef.current) clearInterval(intervalRef.current);
    setLoading(false);

    const filtered: AIGeneratedEvent = {};
    if (fields.title       && raw.title)       filtered.title       = raw.title;
    if (fields.description && raw.description) filtered.description = raw.description;
    if (fields.tags        && raw.tags)        filtered.tags        = raw.tags;
    if (fields.startTime   && raw.startTime)   { filtered.startTime = raw.startTime; filtered.endTime = raw.endTime; }
    if (fields.category    && raw.category)    filtered.category    = raw.category;
    if (fields.mode        && raw.mode)        filtered.mode        = raw.mode;
    if (fields.capacity    && raw.capacity)    filtered.capacity    = raw.capacity;

    setResult(filtered);
  };

  const handleApply = () => {
    if (!result) return;
    onApply(result);
    setApplied(true);
    setTimeout(() => { closeModal(); setApplied(false); setResult(null); setPrompt(""); }, 900);
  };

  const toggleField = (key: FieldKey) =>
    setFields(f => ({ ...f, [key]: !f[key] }));

  const surfaceBg   = dark ? "#13151f" : "#faf9f7";
  const borderCol   = dark ? "rgba(255,255,255,0.06)" : "#e7e5e4";
  const inputBg     = dark ? "#1a1d2e" : "#fff";
  const inputBorder = dark ? "rgba(255,255,255,0.1)" : "#e7e5e4";
  const textPri     = dark ? "#fff" : "#1c1917";
  const textSec     = dark ? "rgba(255,255,255,0.4)" : "#a8a29e";
  const textMuted   = dark ? "rgba(255,255,255,0.5)" : "#78716c";
  const dividerCol  = dark ? "rgba(255,255,255,0.06)" : "#f5f5f4";

  return (
    <>
      {/* ── FAB ── */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-7 right-7 z-50 flex items-center gap-3 px-5 py-3.5 rounded-full font-bold text-sm transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 active:scale-95"
        style={{
          background: "linear-gradient(135deg,#1c1917,#292524)",
          color: "#fbbf24",
          boxShadow: "0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(251,191,36,0.15)",
          fontFamily: "'DM Sans',sans-serif",
        }}
      >
        {/* Pulse dot */}
        <span className="relative flex h-2 w-2 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
        </span>
        {/* Static AI chip icon */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="7" y="7" width="10" height="10" rx="2"/>
          <line x1="7" y1="9.5" x2="4" y2="9.5"/><line x1="7" y1="12" x2="4" y2="12"/><line x1="7" y1="14.5" x2="4" y2="14.5"/>
          <line x1="17" y1="9.5" x2="20" y2="9.5"/><line x1="17" y1="12" x2="20" y2="12"/><line x1="17" y1="14.5" x2="20" y2="14.5"/>
          <line x1="9.5" y1="7" x2="9.5" y2="4"/><line x1="12" y1="7" x2="12" y2="4"/><line x1="14.5" y1="7" x2="14.5" y2="4"/>
          <line x1="9.5" y1="17" x2="9.5" y2="20"/><line x1="12" y1="17" x2="12" y2="20"/><line x1="14.5" y1="17" x2="14.5" y2="20"/>
        </svg>
        Generate with AI
      </button>

      {/* ── Modal ── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(14px)" }}
        >
          <div
            className="relative w-full rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            style={{
              background: surfaceBg,
              border: `1px solid ${borderCol}`,
              maxWidth: "1080px",
              height: "90vh",
            }}
          >

            {/* ── Header ── */}
            <div
              className="relative flex-shrink-0 overflow-hidden"
              style={{ background: "linear-gradient(135deg,#0f0e0c 0%,#1c1917 55%,#292524 100%)" }}
            >
              {/* Dot grid */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(circle, rgba(251,191,36,0.1) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                  maskImage: "linear-gradient(to right, transparent 0%, black 30%, black 70%, transparent 100%)",
                }}
              />
              {/* Glow */}
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 70% 50%, rgba(251,191,36,0.05) 0%, transparent 60%)" }} />

              <div className="relative z-10 flex items-center justify-between px-10 py-7">
                {/* Text */}
                <div>
                  <div
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-3 text-[10px] font-black tracking-widest uppercase"
                    style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.25)", color: "#fbbf24" }}
                  >
                    {/* Static AI spark icon */}
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="#fbbf24">
                      <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5Z"/>
                    </svg>
                    AI Content Generator
                  </div>
                  <h2 className="text-3xl font-black text-white mb-2" style={{ fontFamily: "'Playfair Display',Georgia,serif" }}>
                    Describe your event
                  </h2>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)", maxWidth: 420 }}>
                    Tell me what you're planning in plain English — I'll fill in the title, description, tags, dates, category, mode and capacity for you.
                  </p>
                </div>
                {/* AI Illustration */}
                <div className="flex-shrink-0 hidden lg:block" style={{ opacity: 0.85 }}>
                  <AIIllustration />
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={closeModal}
                className="absolute top-5 right-5 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.16)"; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.6)"; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* ── Body — scrollable ── */}
            <div className="flex-1 overflow-y-auto px-10 py-8 space-y-7" style={{ minHeight: 0 }}>

              {/* Two-col: prompt left, fields right */}
              <div className="grid grid-cols-[1fr_240px] gap-8 items-start">

                {/* Left — prompt */}
                <div>
                  <p className="text-[10px] font-black tracking-widest uppercase mb-2.5" style={{ color: textSec }}>
                    Your prompt
                  </p>
                  <div
                    className="relative rounded-2xl overflow-hidden"
                    style={{ border: `1.5px solid ${inputBorder}`, background: inputBg }}
                  >
                    <textarea
                      value={prompt}
                      onChange={e => setPrompt(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate(); }}
                      placeholder="e.g. A 2-day tech conference on AI & design in Pune on 15–16 August, free entry, 300 attendees max, hybrid format…"
                      maxLength={500}
                      rows={9}
                      className="w-full px-5 pt-5 pb-16 text-sm outline-none resize-none"
                      style={{ background: "transparent", color: textPri, fontFamily: "'DM Sans',sans-serif", lineHeight: 1.7 }}
                    />
                    <div
                      className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-5 py-3"
                      style={{ borderTop: `1px solid ${dividerCol}`, background: surfaceBg }}
                    >
                      <span className="text-[10px] font-semibold" style={{ color: textSec }}>
                        {prompt.length} / 500 · ⌘↵ to generate
                      </span>
                      <button
                        onClick={handleGenerate}
                        disabled={!prompt.trim() || loading}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: "linear-gradient(135deg,#1c1917,#292524)", color: "#fbbf24", fontFamily: "'DM Sans',sans-serif" }}
                      >
                        {loading ? (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                        ) : (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="#fbbf24">
                            <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5Z"/>
                          </svg>
                        )}
                        {loading ? "Generating…" : "Generate"}
                      </button>
                    </div>
                  </div>

                  {/* Example chips */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {EXAMPLE_PROMPTS.map(ex => (
                      <button
                        key={ex.label}
                        onClick={() => setPrompt(ex.text)}
                        className="text-[11px] font-semibold px-3.5 py-1.5 rounded-full border transition-colors"
                        style={{ fontFamily: "'DM Sans',sans-serif", background: dark ? "transparent" : "#fff", borderColor: inputBorder, color: textMuted }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#fbbf24"; (e.currentTarget as HTMLButtonElement).style.color = dark ? "#fbbf24" : "#92400e"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = inputBorder; (e.currentTarget as HTMLButtonElement).style.color = textMuted; }}
                      >
                        {ex.emoji} {ex.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right — field toggles */}
                <div>
                  <p className="text-[10px] font-black tracking-widest uppercase mb-3" style={{ color: textSec }}>
                    Fields to generate
                  </p>
                  <div className="flex flex-col gap-2.5">
                    {FIELD_OPTIONS.map(f => {
                      const active = fields[f.key];
                      return (
                        <button
                          key={f.key}
                          onClick={() => toggleField(f.key)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors"
                          style={{
                            background: active ? (dark ? "rgba(251,191,36,0.08)" : "#fffbeb") : (dark ? "rgba(255,255,255,0.02)" : "#fff"),
                            borderColor: active ? "rgba(251,191,36,0.4)" : inputBorder,
                          }}
                        >
                          <span className="text-base leading-none">{f.emoji}</span>
                          <span className="text-xs font-semibold flex-1" style={{ color: active ? (dark ? "#fbbf24" : "#92400e") : textMuted }}>
                            {f.label}
                          </span>
                          <span
                            className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                            style={{
                              background: active ? "#f59e0b" : "transparent",
                              border: `1.5px solid ${active ? "#f59e0b" : (dark ? "rgba(255,255,255,0.2)" : "#d6d3d1")}`,
                            }}
                          >
                            {active && (
                              <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>{/* end two-col */}

              {/* Loading */}
              {loading && (
                <div
                  className="flex items-center gap-5 rounded-2xl px-6 py-5"
                  style={{ border: `1px solid ${inputBorder}`, background: dark ? "rgba(255,255,255,0.02)" : "#fff" }}
                >
                  {/* Static loading icon */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round">
                      <rect x="7" y="7" width="10" height="10" rx="2"/>
                      <line x1="7" y1="9.5" x2="4" y2="9.5"/><line x1="7" y1="12" x2="4" y2="12"/><line x1="7" y1="14.5" x2="4" y2="14.5"/>
                      <line x1="17" y1="9.5" x2="20" y2="9.5"/><line x1="17" y1="12" x2="20" y2="12"/><line x1="17" y1="14.5" x2="20" y2="14.5"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: textPri }}>{loadingMsg}</p>
                    <p className="text-xs mt-0.5" style={{ color: textSec }}>Powered by AI — just a moment</p>
                  </div>
                  {/* Spinner */}
                  <div className="ml-auto">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" style={{ color: "#fbbf24" }}>
                      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        style={{ transformOrigin: "center", animation: "spin 0.8s linear infinite" }}/>
                    </svg>
                  </div>
                </div>
              )}

              {/* Result */}
              {result && !loading && (
                <div className="rounded-2xl overflow-hidden" style={{ border: "1.5px solid #bbf7d0" }}>
                  {/* Result header */}
                  <div className="flex items-center gap-3 px-6 py-4" style={{ background: "linear-gradient(135deg,#064e3b,#065f46)" }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(110,231,183,0.15)", border: "1px solid rgba(110,231,183,0.25)" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5Z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-[11px] font-black tracking-widest uppercase text-emerald-300">Generated — ready to apply</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "rgba(110,231,183,0.5)" }}>Review the content below then click Apply to fill your form</p>
                    </div>
                  </div>

                  {/* Result content */}
                  <div className="px-6 py-6 space-y-5" style={{ background: dark ? "rgba(5,150,105,0.04)" : "#fff" }}>
                    {result.title && (
                      <div>
                        <p className="text-[9px] font-black tracking-widest uppercase mb-1.5" style={{ color: textSec }}>Title</p>
                        <p className="text-xl font-bold leading-tight" style={{ fontFamily: "'Playfair Display',serif", color: textPri }}>
                          {result.title}
                        </p>
                      </div>
                    )}
                    {result.description && (
                      <div>
                        <p className="text-[9px] font-black tracking-widest uppercase mb-1.5" style={{ color: textSec }}>Description</p>
                        <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: textMuted }}>
                          {result.description}
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-4 gap-4">
                      {result.category && (
                        <div className="rounded-xl p-3" style={{ background: dark ? "rgba(255,255,255,0.04)" : "#faf9f7", border: `1px solid ${dividerCol}` }}>
                          <p className="text-[9px] font-black tracking-widest uppercase mb-1" style={{ color: textSec }}>Category</p>
                          <p className="text-xs font-bold" style={{ color: dark ? "#fbbf24" : "#92400e" }}>{result.category}</p>
                        </div>
                      )}
                      {result.mode && (
                        <div className="rounded-xl p-3" style={{ background: dark ? "rgba(255,255,255,0.04)" : "#faf9f7", border: `1px solid ${dividerCol}` }}>
                          <p className="text-[9px] font-black tracking-widest uppercase mb-1" style={{ color: textSec }}>Mode</p>
                          <p className="text-xs font-bold" style={{ color: dark ? "#fbbf24" : "#92400e" }}>{result.mode}</p>
                        </div>
                      )}
                      {result.capacity && (
                        <div className="rounded-xl p-3" style={{ background: dark ? "rgba(255,255,255,0.04)" : "#faf9f7", border: `1px solid ${dividerCol}` }}>
                          <p className="text-[9px] font-black tracking-widest uppercase mb-1" style={{ color: textSec }}>Capacity</p>
                          <p className="text-xs font-bold" style={{ color: textPri }}>{result.capacity.toLocaleString()}</p>
                        </div>
                      )}
                      {result.startTime && (
                        <div className="rounded-xl p-3" style={{ background: dark ? "rgba(255,255,255,0.04)" : "#faf9f7", border: `1px solid ${dividerCol}` }}>
                          <p className="text-[9px] font-black tracking-widest uppercase mb-1" style={{ color: textSec }}>Start</p>
                          <p className="text-[11px] font-semibold" style={{ color: textPri }}>{fmtDate(result.startTime)}</p>
                        </div>
                      )}
                    </div>
                    {result.tags && result.tags.length > 0 && (
                      <div>
                        <p className="text-[9px] font-black tracking-widest uppercase mb-2" style={{ color: textSec }}>Tags</p>
                        <div className="flex flex-wrap gap-2">
                          {result.tags.map(tag => (
                            <span key={tag} className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: dark ? "rgba(255,255,255,0.07)" : "#f5f5f4", color: textMuted }}>
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Apply button */}
                  <div className="px-6 pb-6" style={{ background: dark ? "rgba(5,150,105,0.04)" : "#fff" }}>
                    <button
                      onClick={handleApply}
                      className="w-full py-4 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2.5 transition-all hover:opacity-90 active:scale-[0.99]"
                      style={{
                        background: applied ? "linear-gradient(135deg,#14532d,#166534)" : "linear-gradient(135deg,#059669,#047857)",
                        fontFamily: "'DM Sans',sans-serif",
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {applied ? "Applied to form!" : "Apply to form"}
                    </button>
                  </div>

                </div>
              )}{/* end result */}

            </div>{/* end scrollable body */}

          </div>{/* end modal card */}

        </div>
      )}{/* end modal backdrop */}

    </>
  );
}