"use client";

// src/components/EventSearchModal.tsx

import { useCallback, useEffect, useRef, useState } from "react";
import { useAiChat } from "@/hooks/eventimist/public/useAiChat";
import type { AiChatEvent } from "@/services/eventimist/public/aiChat.service";

// ─── Category meta for colors ─────────────────────────────────────────────────
const CAT_META: Record<string, { hex: string; emoji: string }> = {
  MUSIC:         { hex: "#8b5cf6", emoji: "🎵" },
  TECH:          { hex: "#3b82f6", emoji: "💻" },
  FOOD:          { hex: "#f97316", emoji: "🍜" },
  ART:           { hex: "#ec4899", emoji: "🎨" },
  SPORTS:        { hex: "#22c55e", emoji: "⚽" },
  FESTIVAL:      { hex: "#f59e0b", emoji: "🎪" },
  VOLUNTEER:     { hex: "#14b8a6", emoji: "🤝" },
  NETWORKING:    { hex: "#06b6d4", emoji: "🔗" },
  WORKSHOP:      { hex: "#f43f5e", emoji: "🛠" },
  CONFERENCE:    { hex: "#6366f1", emoji: "🎤" },
  EDUCATION:     { hex: "#0ea5e9", emoji: "📚" },
  BUSINESS:      { hex: "#84cc16", emoji: "💼" },
  HEALTH:        { hex: "#10b981", emoji: "🏥" },
  ENTERTAINMENT: { hex: "#e879f9", emoji: "🎬" },
  GAMING:        { hex: "#fb923c", emoji: "🎮" },
};

const SUGGESTIONS = [
  "Find Art events near me",
  "Music this weekend",
  "Upcoming Tech meetups",
  "Food festivals this month",
  "Sports events nearby",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    weekday: "short", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatDistance(km: number) {
  if (km === 0) return null;
  return km < 1 ? `${Math.round(km * 1000)}m away` : `${km.toFixed(1)}km away`;
}

// ─── Chat event card ──────────────────────────────────────────────────────────
function ChatEventCard({ event, dark }: { event: AiChatEvent; dark: boolean }) {
  const meta = CAT_META[event.category.toUpperCase()] ?? { hex: "#f59e0b", emoji: "📅" };
  const dist = formatDistance(event.distance);

  return (
    <a
      href={`/events/${event.slug}`}
      className="group flex gap-3 rounded-2xl overflow-hidden border transition-all duration-200 hover:scale-[1.015] hover:shadow-lg"
      style={{
        background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
        borderColor: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
      }}
    >
      {/* Cover */}
      <div className="w-20 h-20 flex-shrink-0 overflow-hidden relative">
        {event.coverImage ? (
          <img
            src={event.coverImage}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl"
            style={{ background: `${meta.hex}22` }}>
            {meta.emoji}
          </div>
        )}
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${meta.hex}33, transparent)` }}/>
      </div>

      {/* Info */}
      <div className="flex-1 py-2.5 pr-3 min-w-0">
        {/* Category + mode row */}
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[10px]">{meta.emoji}</span>
          <span className="text-[10px] font-black tracking-wide uppercase" style={{ color: meta.hex }}>
            {event.category}
          </span>
          {event.mode === "ONLINE" && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: dark ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
              Online
            </span>
          )}
          {dist && (
            <span className="text-[9px] font-semibold ml-auto flex-shrink-0"
              style={{ color: dark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }}>
              📍 {dist}
            </span>
          )}
        </div>

        {/* Title */}
        <p className="text-xs font-black leading-tight line-clamp-2"
          style={{ color: dark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)", fontFamily: "'Playfair Display',Georgia,serif" }}>
          {event.title}
        </p>

        {/* Date */}
        <p className="text-[10px] mt-1 font-medium truncate"
          style={{ color: dark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)" }}>
          🗓 {formatDate(event.startTime)}
        </p>

        {/* Venue */}
        {event.venue && (
          <p className="text-[10px] font-medium truncate"
            style={{ color: dark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.3)" }}>
            📍 {event.venue}
          </p>
        )}

        {/* Organizer */}
        <div className="flex items-center gap-1.5 mt-1.5">
          {event.organizerImage && (
            <img src={event.organizerImage} alt={event.organizerName}
              className="w-3.5 h-3.5 rounded-full object-cover flex-shrink-0"
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}/>
          )}
          <span className="text-[10px] truncate"
            style={{ color: dark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.35)" }}>
            {event.organizerName}
          </span>
        </div>
      </div>
    </a>
  );
}

// ─── Typing dots ──────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <span key={i} className="w-1.5 h-1.5 rounded-full bg-amber-400"
          style={{ animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite` }}/>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
interface EventSearchModalProps {
  dark?: boolean;
}

export function EventSearchModal({ dark = false }: EventSearchModalProps) {
  const [open, setOpen]   = useState(false);
  const [input, setInput] = useState("");
  const bottomRef         = useRef<HTMLDivElement>(null);
  const inputRef          = useRef<HTMLInputElement>(null);

  const { messages, thinking, sendMessage } = useAiChat();

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  // Focus input when modal opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const handleSend = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;
    sendMessage(trimmed);
    setInput("");
  }, [thinking, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(input); }
  };

  // ── Tokens ────────────────────────────────────────────────────────────────
  const modalBg  = dark ? "#0d0f17"                    : "#ffffff";
  const headerBg = dark ? "#13151f"                    : "#fafafa";
  const bdr      = dark ? "rgba(255,255,255,0.07)"     : "rgba(0,0,0,0.08)";
  const t1       = dark ? "rgba(255,255,255,0.92)"     : "rgba(0,0,0,0.88)";
  const t3       = dark ? "rgba(255,255,255,0.28)"     : "rgba(0,0,0,0.35)";
  const inputBg  = dark ? "#1a1d2e"                    : "#f4f4f5";
  const inputBdr = dark ? "rgba(255,255,255,0.1)"      : "rgba(0,0,0,0.1)";
  const aiBubBg  = dark ? "rgba(255,255,255,0.05)"     : "rgba(0,0,0,0.04)";
  const aiBubBdr = dark ? "rgba(255,255,255,0.08)"     : "rgba(0,0,0,0.07)";
  const suggBg   = dark ? "rgba(245,158,11,0.08)"      : "rgba(245,158,11,0.07)";
  const suggBdr  = dark ? "rgba(245,158,11,0.2)"       : "rgba(245,158,11,0.25)";

  return (
    <>
      <style>{`
        @keyframes fabPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.45), 0 8px 32px rgba(245,158,11,0.35); }
          60%      { box-shadow: 0 0 0 14px rgba(245,158,11,0), 0 8px 32px rgba(245,158,11,0.35); }
        }
        @keyframes modalSlideUp {
          from { opacity:0; transform:translateY(28px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes backdropIn { from { opacity:0; } to { opacity:1; } }
        @keyframes typingBounce {
          0%,60%,100% { transform:translateY(0); opacity:0.4; }
          30%          { transform:translateY(-5px); opacity:1; }
        }
        @keyframes msgIn {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .chat-msg { animation: msgIn 0.28s cubic-bezier(.22,1,.36,1) both; }
        .fab-btn:not(.open) { animation: fabPulse 2.8s ease-in-out infinite; }
      `}</style>

      {/* ── FAB ─────────────────────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`fab-btn${open ? " open" : ""} fixed bottom-6 right-6 z-[999] w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95`}
        style={{
          background: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
          boxShadow: open ? "0 8px 32px rgba(245,158,11,0.5)" : undefined,
        }}
        aria-label="AI Event Search"
      >
        <span className="transition-all duration-300 flex items-center justify-center"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}>
          {open ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/>
              <path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75z" opacity=".6"/>
              <path d="M5 3l.5 1.5L7 5l-1.5.5L5 7l-.5-1.5L3 5l1.5-.5z" opacity=".5"/>
            </svg>
          )}
        </span>
      </button>

      {/* ── Backdrop ─────────────────────────────────────────────────────────── */}
      {open && (
        <div className="fixed inset-0 z-[998]"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", animation: "backdropIn 0.2s ease both" }}
          onClick={() => setOpen(false)}/>
      )}

      {/* ── Modal ────────────────────────────────────────────────────────────── */}
      {open && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center pointer-events-none">
          <div className="flex flex-col rounded-3xl overflow-hidden pointer-events-auto"
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
            <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0 border-b"
              style={{ background: headerBg, borderColor: bdr }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #f59e0b22, #f9731622)", border: "1px solid rgba(245,158,11,0.3)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black leading-none"
                  style={{ color: t1, fontFamily: "'Playfair Display',Georgia,serif" }}>
                  Event Concierge
                </p>
                <p className="text-[10px] mt-0.5 font-semibold" style={{ color: "#f59e0b" }}>
                  ✦ AI-powered discovery
                </p>
              </div>
              <button onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                style={{ background: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={t3} strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ scrollbarWidth: "thin" }}>

              {/* Suggestion chips — only on welcome */}
              {messages.length === 1 && (
                <div className="flex flex-wrap gap-1.5 pb-1">
                  {SUGGESTIONS.map(s => (
                    <button key={s} onClick={() => handleSend(s)}
                      className="text-[11px] font-semibold px-3 py-1.5 rounded-full transition-all hover:scale-[1.03]"
                      style={{ background: suggBg, border: `1px solid ${suggBdr}`, color: "#f59e0b" }}>
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {messages.map(msg => (
                <div key={msg.id} className={`chat-msg flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" ? (
                    <div className="max-w-[92%] space-y-2">
                      {/* AI bubble */}
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-lg flex-shrink-0 mt-0.5 flex items-center justify-center"
                          style={{ background: "linear-gradient(135deg, #f59e0b22, #f9731622)", border: "1px solid rgba(245,158,11,0.25)" }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/>
                          </svg>
                        </div>
                        <div className="rounded-2xl rounded-tl-sm px-4 py-3 text-xs leading-relaxed font-medium"
                          style={{ background: aiBubBg, border: `1px solid ${aiBubBdr}`, color: t1, fontFamily: "'Playfair Display',Georgia,serif" }}>
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
                    <div className="max-w-[78%] rounded-2xl rounded-tr-sm px-4 py-3 text-xs font-semibold leading-relaxed"
                      style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)", color: "white", boxShadow: "0 4px 14px rgba(245,158,11,0.3)" }}>
                      {msg.text}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {thinking && (
                <div className="chat-msg flex justify-start">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #f59e0b22, #f9731622)", border: "1px solid rgba(245,158,11,0.25)" }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/>
                      </svg>
                    </div>
                    <div className="rounded-2xl rounded-tl-sm"
                      style={{ background: aiBubBg, border: `1px solid ${aiBubBdr}` }}>
                      <TypingDots/>
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef}/>
            </div>

            {/* Input bar */}
            <div className="flex-shrink-0 px-4 py-4 border-t" style={{ borderColor: bdr, background: headerBg }}>
              <div className="flex items-center gap-2 rounded-2xl px-4 py-2.5 transition-all"
                style={{ background: inputBg, border: `1.5px solid ${inputBdr}` }}>
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
                  style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)" }}>
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