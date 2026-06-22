"use client";

// src/components/EventSearchModal.tsx
// AI-powered event search chatbot modal with FAB trigger
// Uses dummy events for now — replace with real API call later

import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DummyEvent {
  id: string;
  title: string;
  category: string;
  date: string;
  venue: string;
  mode: "IN_PERSON" | "ONLINE" | "HYBRID";
  coverImage: string;
  organizerName: string;
  slug: string;
  hex: string;
  emoji: string;
}

type MessageRole = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  events?: DummyEvent[];
  thinking?: boolean;
}

// ─── Dummy data ───────────────────────────────────────────────────────────────
const DUMMY_EVENTS: DummyEvent[] = [
  {
    id: "1", title: "Pune Jazz & Soul Night", category: "Music", date: "2026-07-04T19:30:00",
    venue: "Blue Frog, Pune", mode: "IN_PERSON", organizerName: "Pune Music Collective",
    coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80",
    slug: "pune-jazz-soul-night", hex: "#8b5cf6", emoji: "🎵",
  },
  {
    id: "2", title: "Indie Electronic Festival 2026", category: "Music", date: "2026-07-12T17:00:00",
    venue: "Amanora Amphitheatre", mode: "IN_PERSON", organizerName: "Bassline Events",
    coverImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80",
    slug: "indie-electronic-festival", hex: "#8b5cf6", emoji: "🎵",
  },
  {
    id: "3", title: "Watercolour & Wine Evening", category: "Art", date: "2026-07-06T18:00:00",
    venue: "The Courtyard Gallery, Koregaon Park", mode: "IN_PERSON", organizerName: "Brushstroke Studio",
    coverImage: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&q=80",
    slug: "watercolour-wine-evening", hex: "#ec4899", emoji: "🎨",
  },
  {
    id: "4", title: "Generative Art × AI Exhibition", category: "Art", date: "2026-07-18T11:00:00",
    venue: "Symbiosis Gallery", mode: "IN_PERSON", organizerName: "Digital Canvas Pune",
    coverImage: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&q=80",
    slug: "generative-art-ai", hex: "#ec4899", emoji: "🎨",
  },
  {
    id: "5", title: "React & Next.js Deep Dive", category: "Tech", date: "2026-07-08T10:00:00",
    venue: "Online", mode: "ONLINE", organizerName: "PuneTech Community",
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80",
    slug: "react-nextjs-deep-dive", hex: "#3b82f6", emoji: "💻",
  },
  {
    id: "6", title: "Street Food Fest — Monsoon Edition", category: "Food", date: "2026-07-20T12:00:00",
    venue: "FC Road, Pune", mode: "IN_PERSON", organizerName: "Pune Foodies Club",
    coverImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80",
    slug: "street-food-fest-monsoon", hex: "#f97316", emoji: "🍜",
  },
  {
    id: "7", title: "5K Monsoon Run", category: "Sports", date: "2026-07-13T06:00:00",
    venue: "Mula-Mutha Riverfront", mode: "IN_PERSON", organizerName: "Pune Runners",
    coverImage: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&q=80",
    slug: "5k-monsoon-run", hex: "#22c55e", emoji: "⚽",
  },
  {
    id: "8", title: "Startup Networking Mixer", category: "Networking", date: "2026-07-10T18:30:00",
    venue: "91springboard Baner", mode: "HYBRID", organizerName: "Pune Startup Hub",
    coverImage: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&q=80",
    slug: "startup-networking-mixer", hex: "#06b6d4", emoji: "🔗",
  },
];

// ─── Prompt parser — returns filtered dummy events ────────────────────────────
function parsePromptToEvents(prompt: string): { reply: string; events: DummyEvent[] } {
  const lower = prompt.toLowerCase();

  const keywords: Record<string, string[]> = {
    Music:      ["music", "concert", "jazz", "electronic", "band", "song", "festival", "gig"],
    Art:        ["art", "painting", "gallery", "exhibition", "creative", "watercolour", "canvas"],
    Tech:       ["tech", "coding", "developer", "react", "nextjs", "programming", "ai", "software"],
    Food:       ["food", "eat", "restaurant", "street food", "cuisine", "taste", "chef"],
    Sports:     ["sport", "run", "fitness", "gym", "race", "game", "cricket", "football"],
    Networking: ["network", "meetup", "startup", "business", "connect", "mixer"],
    Festival:   ["festival", "carnival", "celebration", "fair"],
  };

  const timeFilters: { key: string; test: (d: Date) => boolean }[] = [
    {
      key: "this week",
      test: d => { const now = new Date(); const end = new Date(); end.setDate(now.getDate() + 7); return d >= now && d <= end; },
    },
    {
      key: "this month",
      test: d => { const now = new Date(); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); },
    },
    {
      key: "weekend",
      test: d => { const day = d.getDay(); return day === 0 || day === 6; },
    },
    {
      key: "upcoming",
      test: d => d >= new Date(),
    },
    {
      key: "today",
      test: d => { const now = new Date(); return d.toDateString() === now.toDateString(); },
    },
  ];

  // Find matching categories
  const matchedCats = Object.entries(keywords)
    .filter(([, kws]) => kws.some(kw => lower.includes(kw)))
    .map(([cat]) => cat);

  // Find time filter
  const timeFilter = timeFilters.find(tf => lower.includes(tf.key));

  let events = DUMMY_EVENTS.filter(e => {
    const catMatch = matchedCats.length === 0 || matchedCats.includes(e.category);
    const dateMatch = !timeFilter || timeFilter.test(new Date(e.date));
    return catMatch && dateMatch;
  });

  // Fallback — return all if no events matched
  if (events.length === 0) events = DUMMY_EVENTS.slice(0, 4);

  // Generate a natural reply
  const catLabel = matchedCats.length > 0
    ? matchedCats.join(" & ").toLowerCase()
    : "all categories";
  const timeLabel = timeFilter ? ` ${timeFilter.key}` : " near you";
  const reply = `Found ${events.length} event${events.length !== 1 ? "s" : ""} for ${catLabel}${timeLabel}. Here's what's on:`;

  return { reply, events };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

const SUGGESTIONS = [
  "Find Art events near me",
  "Music this weekend",
  "Upcoming Tech meetups",
  "Show Food festivals this month",
  "Sports events nearby",
];

// ─── Mini event card (inside chat) ───────────────────────────────────────────
function ChatEventCard({ event, dark }: { event: DummyEvent; dark: boolean }) {
  return (
    <a
      href={`/events/${event.slug}`}
      className="group flex gap-3 rounded-2xl overflow-hidden border transition-all duration-200 hover:scale-[1.015] hover:shadow-lg"
      style={{
        background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
        borderColor: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
      }}
    >
      {/* Cover image */}
      <div className="w-20 h-20 flex-shrink-0 overflow-hidden relative">
        <img
          src={event.coverImage}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${event.hex}33, transparent)` }}/>
      </div>
      {/* Info */}
      <div className="flex-1 py-2.5 pr-3 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[10px]">{event.emoji}</span>
          <span className="text-[10px] font-black tracking-wide uppercase" style={{ color: event.hex }}>
            {event.category}
          </span>
          {event.mode === "ONLINE" && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: dark ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
              Online
            </span>
          )}
        </div>
        <p className="text-xs font-black leading-tight truncate"
          style={{ color: dark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)", fontFamily: "'Playfair Display',Georgia,serif" }}>
          {event.title}
        </p>
        <p className="text-[10px] mt-1 font-medium truncate"
          style={{ color: dark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)" }}>
          {formatDate(event.date)}
        </p>
        <p className="text-[10px] font-medium truncate"
          style={{ color: dark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.3)" }}>
          📍 {event.venue}
        </p>
      </div>
    </a>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingDots({ dark }: { dark: boolean }) {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: "#f59e0b",
            animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
interface EventSearchModalProps {
  dark?: boolean;
}

export function EventSearchModal({ dark = false }: EventSearchModalProps) {
  const [open, setOpen]           = useState(false);
  const [input, setInput]         = useState("");
  const [messages, setMessages]   = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hey! 👋 I'm your event concierge. Ask me anything — try \"Find Music events near me\" or \"Show Art workshops this month\".",
    },
  ]);
  const [thinking, setThinking]   = useState(false);
  const bottomRef                 = useRef<HTMLDivElement>(null);
  const inputRef                  = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  // Focus input when modal opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSend = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setThinking(true);

    // Simulate AI "thinking" delay
    setTimeout(() => {
      const { reply, events } = parsePromptToEvents(trimmed);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: reply,
        events,
      };
      setMessages(prev => [...prev, assistantMsg]);
      setThinking(false);
    }, 900 + Math.random() * 600);
  }, [thinking]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(input); }
  };

  // ── Tokens ────────────────────────────────────────────────────────────────
  const modalBg   = dark ? "#0d0f17"         : "#ffffff";
  const headerBg  = dark ? "#13151f"         : "#fafafa";
  const bdr       = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const t1        = dark ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.88)";
  const t3        = dark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.35)";
  const inputBg   = dark ? "#1a1d2e"         : "#f4f4f5";
  const inputBdr  = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const userBubBg = "linear-gradient(135deg, #f59e0b, #f97316)";
  const aiBubBg   = dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
  const aiBubBdr  = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
  const suggBg    = dark ? "rgba(245,158,11,0.08)" : "rgba(245,158,11,0.07)";
  const suggBdr   = dark ? "rgba(245,158,11,0.2)"  : "rgba(245,158,11,0.25)";

  return (
    <>
      {/* ── Inject keyframes ───────────────────────────────────────────────── */}
      <style>{`
        @keyframes fabPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.45), 0 8px 32px rgba(245,158,11,0.35); }
          60%       { box-shadow: 0 0 0 14px rgba(245,158,11,0), 0 8px 32px rgba(245,158,11,0.35); }
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes backdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30%            { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .chat-msg { animation: msgIn 0.28s cubic-bezier(.22,1,.36,1) both; }
        .fab-btn:not(.open) { animation: fabPulse 2.8s ease-in-out infinite; }
      `}</style>

      {/* ── FAB ────────────────────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`fab-btn${open ? " open" : ""} fixed bottom-6 right-6 z-[999] w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95`}
        style={{
          background: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
          boxShadow: open
            ? "0 8px 32px rgba(245,158,11,0.5)"
            : undefined,
        }}
        aria-label="Event AI Search"
      >
        <span
          className="transition-all duration-300"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          {open ? (
            // X icon
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            // Sparkle / AI icon
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/>
              <path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75z" opacity=".6"/>
              <path d="M5 3l.5 1.5L7 5l-1.5.5L5 7l-.5-1.5L3 5l1.5-.5z" opacity=".5"/>
            </svg>
          )}
        </span>
      </button>

      {/* ── Backdrop ───────────────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-[998]"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", animation: "backdropIn 0.2s ease both" }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Modal ──────────────────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center pointer-events-none">
          <div
          className="flex flex-col rounded-3xl overflow-hidden pointer-events-auto"
          style={{
            width: "min(560px, calc(100vw - 32px))",
            height: "min(700px, calc(100vh - 80px))",
            background: modalBg,
            border: `1px solid ${bdr}`,
            boxShadow: dark
              ? "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)"
              : "0 32px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)",
            animation: "modalSlideUp 0.35s cubic-bezier(.22,1,.36,1) both",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-5 py-4 flex-shrink-0 border-b"
            style={{ background: headerBg, borderColor: bdr }}
          >
            {/* Orb */}
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #f59e0b22, #f9731622)", border: "1px solid rgba(245,158,11,0.3)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black leading-none" style={{ color: t1, fontFamily: "'Playfair Display',Georgia,serif" }}>
                Event Concierge
              </p>
              <p className="text-[10px] mt-0.5 font-semibold" style={{ color: "#f59e0b" }}>
                ✦ AI-powered discovery
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-xl flex items-center justify-center transition-all hover:scale-110"
              style={{ background: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={t3} strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ scrollbarWidth: "thin" }}>

            {/* Suggestion chips — only show when just welcome msg */}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-1.5 pb-1">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="text-[11px] font-semibold px-3 py-1.5 rounded-full transition-all hover:scale-[1.03]"
                    style={{ background: suggBg, border: `1px solid ${suggBdr}`, color: "#f59e0b" }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {messages.map(msg => (
              <div
                key={msg.id}
                className={`chat-msg flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" ? (
                  <div className="max-w-[92%] space-y-2">
                    {/* AI avatar + text */}
                    <div className="flex items-start gap-2">
                      <div
                        className="w-6 h-6 rounded-lg flex-shrink-0 mt-0.5 flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, #f59e0b22, #f9731622)", border: "1px solid rgba(245,158,11,0.25)" }}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/>
                        </svg>
                      </div>
                      <div
                        className="rounded-2xl rounded-tl-sm px-4 py-3 text-xs leading-relaxed font-medium"
                        style={{ background: aiBubBg, border: `1px solid ${aiBubBdr}`, color: t1, fontFamily: "'Playfair Display', Georgia, serif" }}
                      >
                        {msg.text}
                      </div>
                    </div>

                    {/* Event cards */}
                    {msg.events && msg.events.length > 0 && (
                      <div className="ml-8 space-y-2">
                        {msg.events.map(ev => (
                          <ChatEventCard key={ev.id} event={ev} dark={dark}/>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className="max-w-[78%] rounded-2xl rounded-tr-sm px-4 py-3 text-xs font-semibold leading-relaxed"
                    style={{ background: userBubBg, color: "white", boxShadow: "0 4px 14px rgba(245,158,11,0.3)" }}
                  >
                    {msg.text}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {thinking && (
              <div className="chat-msg flex justify-start">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #f59e0b22, #f9731622)", border: "1px solid rgba(245,158,11,0.25)" }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/>
                    </svg>
                  </div>
                  <div
                    className="rounded-2xl rounded-tl-sm"
                    style={{ background: aiBubBg, border: `1px solid ${aiBubBdr}` }}
                  >
                    <TypingDots dark={dark}/>
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef}/>
          </div>

          {/* Input bar */}
          <div
            className="flex-shrink-0 px-4 py-4 border-t"
            style={{ borderColor: bdr, background: headerBg }}
          >
            <div
              className="flex items-center gap-2 rounded-2xl px-4 py-2.5 transition-all"
              style={{ background: inputBg, border: `1.5px solid ${inputBdr}` }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about events near you…"
                className="flex-1 bg-transparent text-xs font-medium outline-none placeholder:opacity-40 min-w-0"
                style={{ color: t1 }}
              />
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim() || thinking}
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)" }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
            <p className="text-center text-[10px] mt-2 font-medium" style={{ color: t3 }}>
              Try: "Art events near me" · "Music this weekend"
            </p>
          </div>
        </div>
        </div>
      )}
    </>
  );
}