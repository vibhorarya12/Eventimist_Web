"use client";

// src/components/eventimist/organizer/OrganizerAssistant.tsx

import { useState, useRef, useEffect } from "react";
import { useOrganizerAiAction } from "@/hooks/eventimist/organizer/Ai/useoOrganizerAiAction";
import type {
  AiChatResponse,
  AiChatEventItem,
  AiChatSubscriptionData,
} from "@/services/eventimist/organizer/AiService/organizerAiActions.service";

interface Props { dark: boolean; }

function d(dark: boolean, darkVal: string, lightVal: string) {
  return dark ? darkVal : lightVal;
}

// ─── Message types ────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  ts: Date;
  chatResponse?: AiChatResponse; // structured response for rich rendering
}

const SUGGESTIONS = [
  { icon: "📋", text: "List my drafted events" },
  { icon: "🚀", text: "Show my published events" },
  { icon: "⚡", text: "How many AI credits do I have?" },
  { icon: "📊", text: "How are my events performing?" },
  { icon: "📅", text: "Show upcoming events this month" },
  { icon: "🤖", text: "What can you help me with?" },
];

function fmtTime(d: Date) {
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }).toUpperCase();
}

// ─── Typing dots ──────────────────────────────────────────────────────────────
function TypingDots({ dark }: { dark: boolean }) {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map(i => (
        <span key={i} className="w-1.5 h-1.5 rounded-full"
          style={{ background: d(dark, "rgba(251,191,36,0.6)", "#d6d3d1"), animation: `assistantDot 1.2s ease-in-out ${i * 0.2}s infinite` }}/>
      ))}
    </div>
  );
}

// ─── Event card (DRAFT / PUBLISHED) ──────────────────────────────────────────
function EventCard({ event, dark, type }: { event: AiChatEventItem; dark: boolean; type: string }) {
  const isDraft = type === "DRAFT_EVENTS";
  const statusColor = isDraft
    ? d(dark, "rgba(251,191,36,0.15)", "#fffbeb")
    : d(dark, "rgba(52,211,153,0.12)", "#ecfdf5");
  const statusText = isDraft
    ? d(dark, "#fbbf24", "#92400e")
    : d(dark, "#34d399", "#065f46");

  return (
    <a
      href={`/organizer/update-event/${event.id}`}
      className="flex items-center gap-3 rounded-xl p-3 transition-colors"
      style={{
        background: d(dark, "rgba(255,255,255,0.04)", "#faf9f7"),
        border: `1px solid ${d(dark, "rgba(255,255,255,0.08)", "#e7e5e4")}`,
        textDecoration: "none",
      }}
    >
      {/* Cover image or fallback */}
      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
        style={{ background: d(dark, "#1a1d2e", "#f5f5f4") }}>
        {event.coverImage
          ? <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover"/>
          : <div className="w-full h-full flex items-center justify-center text-lg">📅</div>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold truncate" style={{ color: d(dark, "#fff", "#1c1917") }}>
          {event.title}
        </p>
        <p className="text-[10px] mt-0.5" style={{ color: d(dark, "rgba(255,255,255,0.4)", "#a8a29e") }}>
          /{event.slug}
        </p>
      </div>
      <span className="text-[9px] font-black tracking-widest uppercase px-2 py-1 rounded-full flex-shrink-0"
        style={{ background: statusColor, color: statusText }}>
        {event.status}
      </span>
    </a>
  );
}

// ─── Subscription card ────────────────────────────────────────────────────────
function SubscriptionCard({ data, dark }: { data: AiChatSubscriptionData; dark: boolean }) {
  const pct = Math.round((data.aiCreditsRemaining / data.monthlyAiCredits) * 100);
  const credColor = data.aiCreditsRemaining === 0 ? "#ef4444"
    : data.aiCreditsRemaining <= 3 ? "#f59e0b" : "#fbbf24";

  return (
    <div className="rounded-xl p-4 space-y-3"
      style={{
        background: d(dark, "rgba(251,191,36,0.05)", "#fffbeb"),
        border: `1px solid ${d(dark, "rgba(251,191,36,0.2)", "#fde68a")}`,
      }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black tracking-widest uppercase mb-0.5"
            style={{ color: d(dark, "rgba(255,255,255,0.4)", "#a8a29e") }}>Plan</p>
          <p className="text-sm font-black" style={{ color: "#fbbf24" }}>{data.planType}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black tracking-widest uppercase mb-0.5"
            style={{ color: d(dark, "rgba(255,255,255,0.4)", "#a8a29e") }}>Credits</p>
          <p className="text-sm font-black" style={{ color: credColor }}>
            {data.aiCreditsRemaining} / {data.monthlyAiCredits}
          </p>
        </div>
      </div>
      {/* Progress bar */}
      <div className="h-1.5 rounded-full overflow-hidden"
        style={{ background: d(dark, "rgba(255,255,255,0.08)", "#e7e5e4") }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg,${credColor},${credColor}99)` }}/>
      </div>
      <p className="text-[10px]" style={{ color: d(dark, "rgba(255,255,255,0.35)", "#a8a29e") }}>
        Prompt limit: {data.promptCharacterLimit} chars · {data.active ? "Active" : "Inactive"}
      </p>
    </div>
  );
}

// ─── Rich assistant message renderer ─────────────────────────────────────────
function AssistantContent({ msg, dark }: { msg: Message; dark: boolean }) {
  const surface2 = d(dark, "#1a1d2e", "#f5f5f4");
  const border   = d(dark, "rgba(255,255,255,0.06)", "#e7e5e4");
  const text1    = d(dark, "#fff", "#1c1917");
  const text2    = d(dark, "rgba(255,255,255,0.6)", "#57534e");

  const res = msg.chatResponse;

  // Text bubble wrapper
  const bubbleStyle: React.CSSProperties = {
    background: surface2,
    border: `1px solid ${border}`,
    borderRadius: "4px 18px 18px 18px",
    padding: "10px 14px",
  };

  if (!res) {
    return (
      <div style={bubbleStyle}>
        <p className="text-sm leading-relaxed" style={{ color: text2 }}>{msg.text}</p>
      </div>
    );
  }

  const { type, message, data } = res;

  // GENERAL_CHAT / UNKNOWN / ERROR — plain bubble
  if (type === "GENERAL_CHAT" || type === "UNKNOWN" || type === "ERROR") {
    return (
      <div style={{
        ...bubbleStyle,
        background: type === "ERROR" ? "rgba(239,68,68,0.08)" : surface2,
        borderColor: type === "ERROR" ? "rgba(239,68,68,0.2)" : border,
      }}>
        <p className="text-sm leading-relaxed"
          style={{ color: type === "ERROR" ? "#ef4444" : text2 }}>
          {message}
        </p>
      </div>
    );
  }

  // SUBSCRIPTION_INFO
  if (type === "SUBSCRIPTION_INFO" && data) {
    return (
      <div className="space-y-2">
        <div style={bubbleStyle}>
          <p className="text-sm leading-relaxed" style={{ color: text2 }}>{message}</p>
        </div>
        <SubscriptionCard data={data as AiChatSubscriptionData} dark={dark}/>
      </div>
    );
  }

  // DRAFT_EVENTS / PUBLISHED_EVENTS
  if ((type === "DRAFT_EVENTS" || type === "PUBLISHED_EVENTS") && data) {
    const events = data as AiChatEventItem[];
    return (
      <div className="space-y-2">
        <div style={bubbleStyle}>
          <p className="text-sm leading-relaxed" style={{ color: text2 }}>{message}</p>
        </div>
        {events.length === 0 ? (
          <p className="text-xs px-1" style={{ color: d(dark, "rgba(255,255,255,0.3)", "#a8a29e") }}>
            No events found.
          </p>
        ) : (
          <div className="space-y-1.5">
            {events.map(ev => (
              <EventCard key={ev.id} event={ev} dark={dark} type={type}/>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Fallback
  return (
    <div style={bubbleStyle}>
      <p className="text-sm leading-relaxed" style={{ color: text2 }}>{message || msg.text}</p>
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function Bubble({ msg, dark }: { msg: Message; dark: boolean }) {
  const isUser = msg.role === "user";
  const text3  = d(dark, "rgba(255,255,255,0.2)", "#a8a29e");

  return (
    <div className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: "linear-gradient(135deg,#f59e0b,#fbbf24)" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="7" y="7" width="10" height="10" rx="2"/>
            <line x1="7" y1="9.5" x2="4" y2="9.5"/><line x1="7" y1="12" x2="4" y2="12"/><line x1="7" y1="14.5" x2="4" y2="14.5"/>
            <line x1="17" y1="9.5" x2="20" y2="9.5"/><line x1="17" y1="12" x2="20" y2="12"/><line x1="17" y1="14.5" x2="20" y2="14.5"/>
          </svg>
        </div>
      )}

      <div className={`flex flex-col gap-1 max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
        {isUser ? (
          <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
            style={{
              background: "linear-gradient(135deg,#1c1917,#292524)",
              color: "#fff",
              border: "1px solid rgba(251,191,36,0.2)",
              borderRadius: "18px 4px 18px 18px",
            }}>
            {msg.text}
          </div>
        ) : (
          <AssistantContent msg={msg} dark={dark}/>
        )}
        <span className="text-[9px]" style={{ color: text3 }}>{fmtTime(msg.ts)}</span>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function OrganizerAssistant({ dark }: Props) {
  const [open,     setOpen]     = useState(false);
  const [input,    setInput]    = useState("");
  const [messages, setMessages] = useState<Message[]>([{
    id: "welcome",
    role: "assistant",
    text: "Hey! I'm your AI organizer assistant ✦\n\nAsk me about your events, drafts, RSVPs, credits, or let me help you create content.",
    ts: new Date(),
  }]);

  const { aiChat } = useOrganizerAiAction();
  const loading   = aiChat.loading;
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 300); }, [open]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput("");

    const userMsg: Message = { id: Date.now().toString(), role: "user", text: trimmed, ts: new Date() };
    setMessages(m => [...m, userMsg]);

    const res = await aiChat.submit(trimmed);

    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      text: res?.message ?? "Something went wrong.",
      ts: new Date(),
      chatResponse: res ?? undefined,
    };
    setMessages(m => [...m, assistantMsg]);
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
        @keyframes assistantDot { 0%,100%{transform:translateY(0);opacity:0.4} 50%{transform:translateY(-4px);opacity:1} }
        @keyframes assistantSlideUp { from{opacity:0;transform:translateY(20px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        .assistant-modal { animation: assistantSlideUp 0.3s cubic-bezier(0.34,1.4,0.64,1) both; }
      `}</style>

      {/* ── FAB ── */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed z-50 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          bottom: "7rem", right: "1.25rem",
          width: 52, height: 52, borderRadius: "50%",
          background: open ? d(dark, "#1a1d2e", "#1c1917") : "linear-gradient(135deg,#1c1917,#292524)",
          border: "1px solid rgba(251,191,36,0.25)",
          boxShadow: open ? "none" : "0 4px 20px rgba(0,0,0,0.35), 0 0 0 1px rgba(251,191,36,0.1)",
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
        {!open && (
          <span className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full border-2 flex items-center justify-center"
            style={{ background: "#fbbf24", borderColor: d(dark, "#0c0e1a", "#faf9f7") }}/>
        )}
      </button>

      {/* ── Chat modal ── */}
      {open && (
        <div className="assistant-modal fixed z-50 flex flex-col overflow-hidden shadow-2xl"
          style={{
            bottom: "8.5rem", right: "1.25rem",
            width: "min(420px, calc(100vw - 2.5rem))",
            height: "min(580px, calc(100vh - 11rem))",
            background: surface,
            border: `1px solid ${border}`,
            borderRadius: 20,
          }}>

          {/* Header */}
          <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3.5"
            style={{ background: "linear-gradient(135deg,#1c1917,#292524)", borderBottom: "1px solid rgba(251,191,36,0.12)" }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.25)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="7" y="7" width="10" height="10" rx="2"/>
                <line x1="7" y1="9.5" x2="4" y2="9.5"/><line x1="7" y1="12" x2="4" y2="12"/><line x1="7" y1="14.5" x2="4" y2="14.5"/>
                <line x1="17" y1="9.5" x2="20" y2="9.5"/><line x1="17" y1="12" x2="20" y2="12"/><line x1="17" y1="14.5" x2="20" y2="14.5"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-white leading-none">Organizer Assistant</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"/>
                <span className="text-[9px] font-semibold" style={{ color: "rgba(255,255,255,0.35)" }}>AI · Powered by Eventimist</span>
              </div>
            </div>
            {/* Clear */}
            <button onClick={() => setMessages([{ id: "reset", role: "assistant", text: "Chat cleared. How can I help?", ts: new Date() }])}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}
              onMouseEnter={e => (e.currentTarget.style.color="#fff")}
              onMouseLeave={e => (e.currentTarget.style.color="rgba(255,255,255,0.3)")}
              title="Clear chat">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
              </svg>
            </button>
            {/* Close */}
            <button onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}
              onMouseEnter={e => { e.currentTarget.style.color="#fff"; e.currentTarget.style.background="rgba(255,255,255,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.color="rgba(255,255,255,0.3)"; e.currentTarget.style.background="rgba(255,255,255,0.06)"; }}
              title="Close">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ background: surface2 }}>
            {messages.map(msg => <Bubble key={msg.id} msg={msg} dark={dark}/>)}
            {loading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#f59e0b,#fbbf24)" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="7" y="7" width="10" height="10" rx="2"/>
                    <line x1="7" y1="9.5" x2="4" y2="9.5"/><line x1="7" y1="12" x2="4" y2="12"/>
                    <line x1="17" y1="9.5" x2="20" y2="9.5"/><line x1="17" y1="12" x2="20" y2="12"/>
                  </svg>
                </div>
                <div className="rounded-2xl" style={{ background: d(dark,"#1a1d2e","#f5f5f4"), border:`1px solid ${border}`, borderRadius:"4px 18px 18px 18px" }}>
                  <TypingDots dark={dark}/>
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Suggestions — first message only */}
          {messages.filter(m => m.role === "user").length === 0 && !loading && (
            <div className="flex-shrink-0 px-3 py-2.5 flex gap-2 overflow-x-auto"
              style={{ borderTop:`1px solid ${border}`, background: surface }}>
              {SUGGESTIONS.map(s => (
                <button key={s.text} onClick={() => send(s.text)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors"
                  style={{ background: d(dark,"rgba(251,191,36,0.06)","#faf9f7"), border:`1px solid ${d(dark,"rgba(251,191,36,0.18)","#fde68a")}`, color: d(dark,"rgba(255,255,255,0.6)","#78716c") }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor="#fbbf24"; e.currentTarget.style.color=d(dark,"#fbbf24","#92400e"); }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor=d(dark,"rgba(251,191,36,0.18)","#fde68a"); e.currentTarget.style.color=d(dark,"rgba(255,255,255,0.6)","#78716c"); }}>
                  <span>{s.icon}</span>{s.text}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex-shrink-0 px-3 py-3 flex items-end gap-2"
            style={{ borderTop:`1px solid ${border}`, background: surface }}>
            <div className="flex-1 rounded-2xl overflow-hidden flex items-end"
              style={{ background: inputBg, border:`1.5px solid ${inputBord}` }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about your events…"
                rows={1}
                disabled={loading}
                className="flex-1 resize-none outline-none px-4 py-2.5 text-sm disabled:opacity-50"
                style={{ background:"transparent", color:text1, fontFamily:"'DM Sans',sans-serif", lineHeight:1.5, maxHeight:96 }}
                onInput={e => { const t=e.currentTarget; t.style.height="auto"; t.style.height=Math.min(t.scrollHeight,96)+"px"; }}
              />
              <span className="text-[9px] px-2 pb-2.5 flex-shrink-0" style={{ color:text3 }}>⏎</span>
            </div>
            <button onClick={() => send(input)} disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 active:scale-95"
              style={{ background:"linear-gradient(135deg,#f59e0b,#fbbf24)" }}>
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