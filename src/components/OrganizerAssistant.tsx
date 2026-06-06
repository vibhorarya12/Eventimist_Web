"use client";

// src/components/eventimist/organizer/OrganizerAssistant.tsx

import { useState, useRef, useEffect } from "react";

interface Props {
  dark: boolean;
}

// ─── Theme helpers ────────────────────────────────────────────────────────────
function d(dark: boolean, darkVal: string, lightVal: string) {
  return dark ? darkVal : lightVal;
}

// ─── Message types ────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  ts: Date;
}

// ─── Dummy suggestions ────────────────────────────────────────────────────────
const SUGGESTIONS = [
  { icon: "📋", text: "List my drafted events" },
  { icon: "📊", text: "How are my events performing?" },
  { icon: "🎯", text: "Which event has the most RSVPs?" },
  { icon: "📅", text: "Show upcoming events this month" },
  { icon: "💡", text: "Help me write an event description" },
  { icon: "🤖", text: "What can you help me with?" },
];

// ─── Dummy AI reply (will be replaced by real API) ────────────────────────────
function getDummyReply(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.includes("draft"))
    return "You have **3 drafted events** right now:\n\n• Sunburn Arena ft. Martin Garrix — Dec 20\n• Delhi AI Summit — Jan 15\n• Pune Food Festival — Feb 3\n\nWould you like to publish any of these?";
  if (lower.includes("rsvp") || lower.includes("performing"))
    return "Your top event by RSVPs is **Sunburn Arena** with 2,400 attendees registered — 96% of capacity filled. Great work! 🎉";
  if (lower.includes("upcoming") || lower.includes("month"))
    return "You have **2 upcoming events** this month:\n\n• NH7 Weekender — Jun 18 (Live)\n• Photography Masterclass — Jun 28 (Upcoming)\n\nBoth are on track!";
  if (lower.includes("description") || lower.includes("write"))
    return "I'd love to help! Tell me the event name, category, and a few highlights — I'll draft a compelling description for you.";
  if (lower.includes("help") || lower.includes("what can"))
    return "I'm your AI organizer assistant. I can help you:\n\n• **Manage events** — list, filter, publish drafts\n• **Draft content** — descriptions, tags, titles\n• **Analyze performance** — RSVPs, revenue, occupancy\n• **Answer questions** — about your audience & events\n\nJust ask!";
  return "Got it! That feature is coming soon — I'm still learning. For now I can help with your events, drafts, RSVPs, and content. What would you like?";
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }).toUpperCase();
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingDots({ dark }: { dark: boolean }) {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: d(dark, "rgba(251,191,36,0.6)", "#d6d3d1"),
            animation: `assistantDot 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function Bubble({ msg, dark }: { msg: Message; dark: boolean }) {
  const isUser = msg.role === "user";

  // Render **bold** markdown
  const renderText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) =>
      p.startsWith("**") && p.endsWith("**")
        ? <strong key={i} style={{ color: isUser ? "#fde68a" : (dark ? "#fbbf24" : "#92400e") }}>{p.slice(2, -2)}</strong>
        : p
    );
  };

  return (
    <div className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      {!isUser && (
        <div
          className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: "linear-gradient(135deg,#f59e0b,#fbbf24)" }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="7" y="7" width="10" height="10" rx="2"/>
            <line x1="7" y1="9.5" x2="4" y2="9.5"/><line x1="7" y1="12" x2="4" y2="12"/><line x1="7" y1="14.5" x2="4" y2="14.5"/>
            <line x1="17" y1="9.5" x2="20" y2="9.5"/><line x1="17" y1="12" x2="20" y2="12"/><line x1="17" y1="14.5" x2="20" y2="14.5"/>
          </svg>
        </div>
      )}

      <div className={`flex flex-col gap-1 max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className="px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line"
          style={{
            background: isUser
              ? "linear-gradient(135deg,#1c1917,#292524)"
              : d(dark, "#1a1d2e", "#f5f5f4"),
            color: isUser
              ? "#fff"
              : d(dark, "rgba(255,255,255,0.85)", "#1c1917"),
            border: isUser
              ? "1px solid rgba(251,191,36,0.2)"
              : `1px solid ${d(dark, "rgba(255,255,255,0.06)", "#e7e5e4")}`,
            borderRadius: isUser ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
          }}
        >
          {renderText(msg.text)}
        </div>
        <span className="text-[9px]" style={{ color: d(dark, "rgba(255,255,255,0.2)", "#a8a29e") }}>
          {fmtTime(msg.ts)}
        </span>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export function OrganizerAssistant({ dark }: Props) {
  const [open,     setOpen]     = useState(false);
  const [input,    setInput]    = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hey! I'm your AI organizer assistant ✦\n\nAsk me about your events, drafts, RSVPs, or let me help you create content. What's on your mind?",
      ts: new Date(),
    },
  ]);
  const [typing,   setTyping]   = useState(false);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setInput("");

    const userMsg: Message = { id: Date.now().toString(), role: "user", text: trimmed, ts: new Date() };
    setMessages(m => [...m, userMsg]);
    setTyping(true);

    // ── Replace this timeout with real API call ──
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    const reply = getDummyReply(trimmed);

    setTyping(false);
    setMessages(m => [...m, {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      text: reply,
      ts: new Date(),
    }]);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  const surface   = d(dark, "#13151f", "#ffffff");
  const surface2  = d(dark, "#1a1d2e", "#faf9f7");
  const border    = d(dark, "rgba(255,255,255,0.08)", "#e7e5e4");
  const text1     = d(dark, "#ffffff", "#1c1917");
  const text3     = d(dark, "rgba(255,255,255,0.3)", "#a8a29e");
  const inputBg   = d(dark, "#1a1d2e", "#fff");
  const inputBord = d(dark, "rgba(255,255,255,0.1)", "#e7e5e4");

  return (
    <>
      <style>{`
        @keyframes assistantDot {
          0%,100% { transform:translateY(0); opacity:0.4; }
          50%      { transform:translateY(-4px); opacity:1; }
        }
        @keyframes assistantSlideUp {
          from { opacity:0; transform:translateY(20px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        .assistant-modal {
          animation: assistantSlideUp 0.3s cubic-bezier(0.34,1.4,0.64,1) both;
        }
      `}</style>

      {/* ── FAB ── */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed z-50 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          bottom: "2rem",
          right: "1.25rem",
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: open
            ? d(dark, "#1a1d2e", "#1c1917")
            : "linear-gradient(135deg,#1c1917,#292524)",
          border: "1px solid rgba(251,191,36,0.25)",
          boxShadow: open
            ? "none"
            : "0 4px 20px rgba(0,0,0,0.35), 0 0 0 1px rgba(251,191,36,0.1)",
        }}
        title="AI Organizer Assistant"
      >
        {open ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            <line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="13" y2="14"/>
          </svg>
        )}
        {/* Unread dot */}
        {!open && (
          <span
            className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full border-2 flex items-center justify-center"
            style={{
              background: "#fbbf24",
              borderColor: d(dark, "#0c0e1a", "#faf9f7"),
            }}
          />
        )}
      </button>

      {/* ── Chat modal ── */}
      {open && (
        <div
          className="assistant-modal fixed z-50 flex flex-col overflow-hidden shadow-2xl"
          style={{
            bottom: "8.5rem",
            right: "1.25rem",
            width: "min(420px, calc(100vw - 2.5rem))",
            height: "min(580px, calc(100vh - 11rem))",
            background: surface,
            border: `1px solid ${border}`,
            borderRadius: 20,
          }}
        >
          {/* Header */}
          <div
            className="flex-shrink-0 flex items-center gap-3 px-4 py-3.5"
            style={{
              background: "linear-gradient(135deg,#1c1917,#292524)",
              borderBottom: "1px solid rgba(251,191,36,0.12)",
            }}
          >
            {/* AI icon */}
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.25)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="7" y="7" width="10" height="10" rx="2"/>
                <line x1="7" y1="9.5" x2="4" y2="9.5"/><line x1="7" y1="12" x2="4" y2="12"/><line x1="7" y1="14.5" x2="4" y2="14.5"/>
                <line x1="17" y1="9.5" x2="20" y2="9.5"/><line x1="17" y1="12" x2="20" y2="12"/><line x1="17" y1="14.5" x2="20" y2="14.5"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-white leading-none">Organizer Assistant</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[9px] font-semibold" style={{ color: "rgba(255,255,255,0.35)" }}>
                  AI · Powered by Eventimist
                </span>
              </div>
            </div>
            {/* Clear chat */}
            <button
              onClick={() => setMessages([{
                id: "welcome-reset",
                role: "assistant",
                text: "Chat cleared. How can I help you?",
                ts: new Date(),
              }])}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}
              title="Clear chat"
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.3)"; }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
              </svg>
            </button>

            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}
              title="Close"
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#fff"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.3)"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"; }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
            style={{ background: surface2 }}
          >
            {messages.map(msg => <Bubble key={msg.id} msg={msg} dark={dark} />)}

            {/* Typing indicator */}
            {typing && (
              <div className="flex gap-2.5">
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#f59e0b,#fbbf24)" }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="7" y="7" width="10" height="10" rx="2"/>
                    <line x1="7" y1="9.5" x2="4" y2="9.5"/><line x1="7" y1="12" x2="4" y2="12"/>
                    <line x1="17" y1="9.5" x2="20" y2="9.5"/><line x1="17" y1="12" x2="20" y2="12"/>
                  </svg>
                </div>
                <div
                  className="rounded-2xl"
                  style={{
                    background: d(dark, "#1a1d2e", "#f5f5f4"),
                    border: `1px solid ${border}`,
                    borderRadius: "4px 18px 18px 18px",
                  }}
                >
                  <TypingDots dark={dark} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions — only when no user messages yet */}
          {messages.filter(m => m.role === "user").length === 0 && !typing && (
            <div
              className="flex-shrink-0 px-3 py-2.5 flex gap-2 overflow-x-auto"
              style={{ borderTop: `1px solid ${border}`, background: surface }}
            >
              {SUGGESTIONS.map(s => (
                <button
                  key={s.text}
                  onClick={() => send(s.text)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors"
                  style={{
                    background: d(dark, "rgba(251,191,36,0.06)", "#faf9f7"),
                    border: `1px solid ${d(dark, "rgba(251,191,36,0.18)", "#fde68a")}`,
                    color: d(dark, "rgba(255,255,255,0.6)", "#78716c"),
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#fbbf24";
                    (e.currentTarget as HTMLButtonElement).style.color = d(dark, "#fbbf24", "#92400e");
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = d(dark, "rgba(251,191,36,0.18)", "#fde68a");
                    (e.currentTarget as HTMLButtonElement).style.color = d(dark, "rgba(255,255,255,0.6)", "#78716c");
                  }}
                >
                  <span>{s.icon}</span>
                  {s.text}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div
            className="flex-shrink-0 px-3 py-3 flex items-end gap-2"
            style={{ borderTop: `1px solid ${border}`, background: surface }}
          >
            <div
              className="flex-1 rounded-2xl overflow-hidden flex items-end"
              style={{ background: inputBg, border: `1.5px solid ${inputBord}` }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about your events…"
                rows={1}
                className="flex-1 resize-none outline-none px-4 py-2.5 text-sm"
                style={{
                  background: "transparent",
                  color: text1,
                  fontFamily: "'DM Sans',sans-serif",
                  lineHeight: 1.5,
                  maxHeight: 96,
                }}
                onInput={e => {
                  const t = e.currentTarget;
                  t.style.height = "auto";
                  t.style.height = Math.min(t.scrollHeight, 96) + "px";
                }}
              />
              <span className="text-[9px] px-2 pb-2.5 flex-shrink-0" style={{ color: text3 }}>⏎</span>
            </div>
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || typing}
              className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 active:scale-95"
              style={{ background: "linear-gradient(135deg,#f59e0b,#fbbf24)" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}