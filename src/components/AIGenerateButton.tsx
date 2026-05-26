"use client";

// src/components/eventimist/organizer/AIGenerateButton.tsx

import { useState, useEffect, useRef } from "react";
import { useOrganizerAiAction } from "@/hooks/eventimist/organizer/Ai/useoOrganizerAiAction";
import type { GenerateEventDraftResponse } from "@/services/eventimist/organizer/AiService/organizerAiActions.service";

export interface AIGeneratedEvent {
  title?: string;
  description?: string;
  category?: string;
  mode?: string;
  tags?: string[];
  startTime?: string;
  endTime?: string;
  onlineLink?: string;
}

interface Props {
  dark: boolean;
  onApply: (data: AIGeneratedEvent) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const LOADING_MESSAGES = [
  "Reading your prompt…",
  "Identifying event type…",
  "Crafting the perfect title…",
  "Writing description…",
  "Picking category & tags…",
  "Almost there…",
];

const SUGGESTIONS = [
  { icon: "🎵", label: "Music festival in Goa",       text: "A free 2-day music festival in Goa this December, outdoor, 1000 attendees, indie and electronic acts" },
  { icon: "💻", label: "AI developer workshop",        text: "A 3-hour AI workshop for developers in Bangalore on 10 September, free, max 80 attendees, online" },
  { icon: "🔗", label: "Startup networking dinner",   text: "Networking dinner for startup founders in Mumbai next Friday evening, 50 people, rooftop venue, free" },
  { icon: "🍜", label: "Street food fair",             text: "A weekend food fair in Pune celebrating street food culture, free entry, 500 attendees, offline" },
  { icon: "🎨", label: "Art & design conference",      text: "A 1-day art and design conference in Hyderabad, 200 attendees, hybrid format, free entry" },
  { icon: "🏋️", label: "Fitness & wellness workshop", text: "A morning wellness and yoga workshop in Bangalore, 60 attendees, outdoor, free, this Sunday" },
  { icon: "🎤", label: "Open mic night",               text: "An open mic comedy and spoken word night in Delhi, 100 attendees, indoor, free, next Saturday" },
  { icon: "🎮", label: "Gaming tournament",            text: "A 2-day gaming tournament in Chennai, 150 participants, offline, free to enter, focus on indie games" },
];

function isPresent(v: string | null | undefined): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function fmtDate(dt: string) {
  try {
    return new Date(dt).toLocaleString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return dt; }
}

// ─── Typing animation hook ────────────────────────────────────────────────────
function useTypingText(fullText: string, enabled: boolean, speed = 18) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!enabled || !fullText) { setDisplayed(""); setDone(false); return; }
    setDisplayed("");
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(fullText.slice(0, i));
      if (i >= fullText.length) { clearInterval(id); setDone(true); }
    }, speed);
    return () => clearInterval(id);
  }, [fullText, enabled, speed]);

  return { displayed, done };
}

// ─── SVG Illustration ─────────────────────────────────────────────────────────
function AIEventsIllustration() {
  return (
    <svg width="300" height="180" viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="150" cy="90" r="72" fill="rgba(251,191,36,0.04)" stroke="rgba(251,191,36,0.08)" strokeWidth="1"/>
      <circle cx="150" cy="90" r="52" fill="rgba(251,191,36,0.03)" stroke="rgba(251,191,36,0.06)" strokeWidth="0.8"/>
      <rect x="112" y="52" width="76" height="76" rx="12" fill="rgba(251,191,36,0.07)" stroke="rgba(251,191,36,0.3)" strokeWidth="1.5"/>
      <rect x="112" y="52" width="76" height="22" rx="12" fill="rgba(251,191,36,0.15)" stroke="none"/>
      <rect x="112" y="62" width="76" height="12" fill="rgba(251,191,36,0.15)" stroke="none"/>
      <circle cx="128" cy="63" r="2.5" fill="rgba(251,191,36,0.7)"/>
      <circle cx="150" cy="63" r="2.5" fill="rgba(251,191,36,0.7)"/>
      <circle cx="172" cy="63" r="2.5" fill="rgba(251,191,36,0.7)"/>
      <rect x="132" y="48" width="5" height="10" rx="2.5" fill="rgba(251,191,36,0.5)" stroke="rgba(251,191,36,0.4)" strokeWidth="1"/>
      <rect x="163" y="48" width="5" height="10" rx="2.5" fill="rgba(251,191,36,0.5)" stroke="rgba(251,191,36,0.4)" strokeWidth="1"/>
      <line x1="120" y1="90" x2="180" y2="90" stroke="rgba(251,191,36,0.12)" strokeWidth="0.8"/>
      <line x1="120" y1="103" x2="180" y2="103" strokeWidth="0.8" stroke="rgba(251,191,36,0.12)"/>
      <line x1="138" y1="78" x2="138" y2="118" stroke="rgba(251,191,36,0.1)" strokeWidth="0.8"/>
      <line x1="155" y1="78" x2="155" y2="118" stroke="rgba(251,191,36,0.1)" strokeWidth="0.8"/>
      <line x1="172" y1="78" x2="172" y2="118" stroke="rgba(251,191,36,0.1)" strokeWidth="0.8"/>
      <circle cx="126" cy="84" r="2" fill="rgba(251,191,36,0.25)"/>
      <circle cx="143" cy="84" r="2" fill="rgba(251,191,36,0.25)"/>
      <circle cx="160" cy="84" r="2.5" fill="rgba(251,191,36,0.6)" stroke="rgba(251,191,36,0.8)" strokeWidth="0.8"/>
      <circle cx="177" cy="84" r="2" fill="rgba(251,191,36,0.25)"/>
      <circle cx="126" cy="97" r="2" fill="rgba(251,191,36,0.25)"/>
      <circle cx="143" cy="97" r="2.5" fill="rgba(251,191,36,0.5)"/>
      <circle cx="160" cy="97" r="2" fill="rgba(251,191,36,0.25)"/>
      <circle cx="177" cy="97" r="2" fill="rgba(251,191,36,0.25)"/>
      <circle cx="126" cy="110" r="2" fill="rgba(251,191,36,0.25)"/>
      <circle cx="143" cy="110" r="2" fill="rgba(251,191,36,0.25)"/>
      <rect x="170" y="38" width="34" height="34" rx="7" fill="rgba(251,191,36,0.06)" stroke="rgba(251,191,36,0.28)" strokeWidth="1.2"/>
      <line x1="170" y1="46" x2="163" y2="46" stroke="rgba(251,191,36,0.45)" strokeWidth="1.2"/>
      <line x1="170" y1="52" x2="163" y2="52" stroke="rgba(251,191,36,0.45)" strokeWidth="1.2"/>
      <line x1="170" y1="58" x2="163" y2="58" stroke="rgba(251,191,36,0.45)" strokeWidth="1.2"/>
      <line x1="204" y1="46" x2="211" y2="46" stroke="rgba(251,191,36,0.45)" strokeWidth="1.2"/>
      <line x1="204" y1="52" x2="211" y2="52" stroke="rgba(251,191,36,0.45)" strokeWidth="1.2"/>
      <line x1="204" y1="58" x2="211" y2="58" stroke="rgba(251,191,36,0.45)" strokeWidth="1.2"/>
      <line x1="178" y1="38" x2="178" y2="31" stroke="rgba(251,191,36,0.45)" strokeWidth="1.2"/>
      <line x1="184" y1="38" x2="184" y2="31" stroke="rgba(251,191,36,0.45)" strokeWidth="1.2"/>
      <line x1="190" y1="38" x2="190" y2="31" stroke="rgba(251,191,36,0.45)" strokeWidth="1.2"/>
      <line x1="178" y1="72" x2="178" y2="79" stroke="rgba(251,191,36,0.45)" strokeWidth="1.2"/>
      <line x1="184" y1="72" x2="184" y2="79" stroke="rgba(251,191,36,0.45)" strokeWidth="1.2"/>
      <line x1="190" y1="72" x2="190" y2="79" stroke="rgba(251,191,36,0.45)" strokeWidth="1.2"/>
      <rect x="178" y="46" width="18" height="18" rx="3" fill="rgba(251,191,36,0.1)" stroke="rgba(251,191,36,0.25)" strokeWidth="0.8"/>
      <circle cx="187" cy="55" r="4" fill="rgba(251,191,36,0.2)" stroke="#fbbf24" strokeWidth="1"/>
      <circle cx="187" cy="55" r="1.8" fill="#fbbf24"/>
      <rect x="62" y="100" width="54" height="32" rx="7" fill="rgba(251,191,36,0.06)" stroke="rgba(251,191,36,0.25)" strokeWidth="1.2"/>
      <circle cx="62" cy="116" r="5" fill="rgba(0,0,0,0)" stroke="rgba(251,191,36,0.25)" strokeWidth="1.2"/>
      <circle cx="116" cy="116" r="5" fill="rgba(0,0,0,0)" stroke="rgba(251,191,36,0.25)" strokeWidth="1.2"/>
      <line x1="82" y1="116" x2="100" y2="116" stroke="rgba(251,191,36,0.2)" strokeWidth="0.8" strokeDasharray="3 2"/>
      <rect x="70" y="107" width="20" height="2.5" rx="1.2" fill="rgba(251,191,36,0.3)"/>
      <rect x="70" y="113" width="14" height="2" rx="1" fill="rgba(251,191,36,0.2)"/>
      <rect x="70" y="119" width="17" height="2" rx="1" fill="rgba(251,191,36,0.2)"/>
      <line x1="96" y1="107" x2="96" y2="126" stroke="rgba(251,191,36,0.3)" strokeWidth="1"/>
      <line x1="99" y1="107" x2="99" y2="126" stroke="rgba(251,191,36,0.2)" strokeWidth="2"/>
      <line x1="103" y1="107" x2="103" y2="126" stroke="rgba(251,191,36,0.3)" strokeWidth="1"/>
      <line x1="106" y1="107" x2="106" y2="126" stroke="rgba(251,191,36,0.15)" strokeWidth="1.5"/>
      <rect x="30" y="30" width="62" height="38" rx="10" fill="rgba(251,191,36,0.06)" stroke="rgba(251,191,36,0.22)" strokeWidth="1.2"/>
      <path d="M 58 68 L 54 78 L 66 68 Z" fill="rgba(251,191,36,0.06)" stroke="rgba(251,191,36,0.22)" strokeWidth="1"/>
      <rect x="40" y="39" width="42" height="2.5" rx="1.2" fill="rgba(251,191,36,0.3)"/>
      <rect x="40" y="45" width="35" height="2.5" rx="1.2" fill="rgba(251,191,36,0.2)"/>
      <rect x="40" y="51" width="28" height="2.5" rx="1.2" fill="rgba(251,191,36,0.15)"/>
      <path d="M34 42 L35.2 38.5 L36.4 42 L40 43.2 L36.4 44.4 L35.2 47.9 L34 44.4 L30.4 43.2 Z" fill="rgba(251,191,36,0.5)"/>
      <circle cx="22" cy="90" r="7" fill="rgba(251,191,36,0.06)" stroke="rgba(251,191,36,0.22)" strokeWidth="1.2"/>
      <circle cx="22" cy="90" r="3" fill="rgba(251,191,36,0.35)"/>
      <circle cx="248" cy="130" r="8" fill="rgba(251,191,36,0.06)" stroke="rgba(251,191,36,0.22)" strokeWidth="1.2"/>
      <circle cx="248" cy="130" r="3.5" fill="rgba(251,191,36,0.35)"/>
      <circle cx="258" cy="52" r="6" fill="rgba(251,191,36,0.06)" stroke="rgba(251,191,36,0.2)" strokeWidth="1"/>
      <circle cx="258" cy="52" r="2.5" fill="rgba(251,191,36,0.3)"/>
      <circle cx="34" cy="148" r="6" fill="rgba(251,191,36,0.06)" stroke="rgba(251,191,36,0.18)" strokeWidth="1"/>
      <circle cx="34" cy="148" r="2.5" fill="rgba(251,191,36,0.3)"/>
      <circle cx="264" cy="95" r="5" fill="rgba(251,191,36,0.05)" stroke="rgba(251,191,36,0.18)" strokeWidth="1"/>
      <circle cx="264" cy="95" r="2" fill="rgba(251,191,36,0.25)"/>
      <line x1="29" y1="90" x2="112" y2="80" stroke="rgba(251,191,36,0.12)" strokeWidth="1"/>
      <line x1="56" y1="76" x2="112" y2="68" stroke="rgba(251,191,36,0.1)" strokeWidth="0.8"/>
      <line x1="116" y1="100" x2="62" y2="110" stroke="rgba(251,191,36,0.12)" strokeWidth="1"/>
      <line x1="40" y1="148" x2="112" y2="120" stroke="rgba(251,191,36,0.1)" strokeWidth="0.8"/>
      <line x1="188" y1="72" x2="240" y2="130" stroke="rgba(251,191,36,0.12)" strokeWidth="1"/>
      <line x1="211" y1="52" x2="258" y2="55" stroke="rgba(251,191,36,0.1)" strokeWidth="0.8"/>
      <line x1="188" y1="72" x2="260" y2="90" stroke="rgba(251,191,36,0.1)" strokeWidth="0.8"/>
      <path d="M228 108 C228 100 240 100 240 108 C240 116 234 124 234 124 C234 124 228 116 228 108 Z" fill="rgba(251,191,36,0.08)" stroke="rgba(251,191,36,0.28)" strokeWidth="1.2"/>
      <circle cx="234" cy="108" r="3.5" fill="rgba(251,191,36,0.4)" stroke="rgba(251,191,36,0.5)" strokeWidth="0.8"/>
      <circle cx="148" cy="148" r="6" fill="rgba(251,191,36,0.06)" stroke="rgba(251,191,36,0.2)" strokeWidth="1"/>
      <circle cx="160" cy="148" r="6" fill="rgba(251,191,36,0.06)" stroke="rgba(251,191,36,0.2)" strokeWidth="1"/>
      <circle cx="136" cy="148" r="6" fill="rgba(251,191,36,0.06)" stroke="rgba(251,191,36,0.2)" strokeWidth="1"/>
      <circle cx="148" cy="143" r="3" fill="rgba(251,191,36,0.25)"/>
      <circle cx="160" cy="143" r="3" fill="rgba(251,191,36,0.2)"/>
      <circle cx="136" cy="143" r="3" fill="rgba(251,191,36,0.2)"/>
      <path d="M270 140 L271.4 136 L272.8 140 L276.8 141.4 L272.8 142.8 L271.4 146.8 L270 142.8 L266 141.4 Z" fill="rgba(251,191,36,0.3)"/>
      <path d="M16 55 L17 52.5 L18 55 L20.5 56 L18 57 L17 59.5 L16 57 L13.5 56 Z" fill="rgba(251,191,36,0.25)"/>
      <path d="M218 20 L219 17.5 L220 20 L222.5 21 L220 22 L219 24.5 L218 22 L215.5 21 Z" fill="rgba(251,191,36,0.2)"/>
      <circle cx="280" cy="70" r="1.5" fill="rgba(251,191,36,0.25)"/>
      <circle cx="10" cy="130" r="1.5" fill="rgba(251,191,36,0.2)"/>
      <path d="M 22 97 L 22 112 L 40 112" stroke="rgba(251,191,36,0.1)" strokeWidth="0.8" strokeDasharray="3 2" fill="none"/>
      <path d="M 248 122 L 248 108 L 230 108" stroke="rgba(251,191,36,0.1)" strokeWidth="0.8" strokeDasharray="3 2" fill="none"/>
      <path d="M 264 100 L 264 116 L 248 116" stroke="rgba(251,191,36,0.08)" strokeWidth="0.8" strokeDasharray="3 2" fill="none"/>
    </svg>
  );
}

// ─── Result display with typing animation ─────────────────────────────────────
function ResultView({
  result, dark, textPri, textSec, textMuted, dividerCol, inputBorder, chipBg,
  onApply, onReset, applied,
}: {
  result: AIGeneratedEvent;
  dark: boolean; textPri: string; textSec: string; textMuted: string;
  dividerCol: string; inputBorder: string; chipBg: string;
  onApply: () => void; onReset: () => void; applied: boolean;
}) {
  const titleText = result.title ?? "";
  const descText  = result.description ?? "";

  const { displayed: typedTitle, done: titleDone } = useTypingText(titleText, true, 22);
  const { displayed: typedDesc }                   = useTypingText(descText, titleDone, 8);

  const metaFields = [
    result.category  && { label: "Category",  value: result.category },
    result.mode      && { label: "Mode",       value: result.mode },
    result.startTime && { label: "Start",      value: fmtDate(result.startTime) },
    result.endTime   && { label: "End",        value: fmtDate(result.endTime) },
    result.onlineLink&& { label: "Link",       value: result.onlineLink },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid rgba(251,191,36,0.3)` }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4"
        style={{ background: "linear-gradient(135deg,#1c1917 0%,#292524 100%)" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.25)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="3"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
            <path d="M8 15 L10.5 17.5 L16 13" strokeWidth="2.2"/>
          </svg>
        </div>
        <div>
          <p className="text-[11px] font-black tracking-widest uppercase" style={{ color: "#fbbf24" }}>Generated — ready to apply</p>
          <p className="text-[10px] mt-0.5" style={{ color: "rgba(251,191,36,0.45)" }}>Review the content below then click Apply to fill your form</p>
        </div>
        {/* Spark */}
        <svg className="ml-auto flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="rgba(251,191,36,0.4)">
          <path d="M12 2L14 9H21L15.5 13.5L17.5 20.5L12 16L6.5 20.5L8.5 13.5L3 9H10Z"/>
        </svg>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-5" style={{ background: dark ? "rgba(251,191,36,0.02)" : "#fffdf5" }}>

        {/* Title with typing */}
        {titleText && (
          <div>
            <p className="text-[9px] font-black tracking-widest uppercase mb-1.5" style={{ color: textSec }}>Title</p>
            <p className="text-xl font-bold leading-tight" style={{ fontFamily: "'Playfair Display',serif", color: textPri }}>
              {typedTitle}
              {!titleDone && (
                <span className="inline-block w-0.5 h-5 ml-0.5 align-middle" style={{ background: "#fbbf24", borderRadius: 1 }} />
              )}
            </p>
          </div>
        )}

        {/* Description with typing — starts after title done */}
        {descText && titleDone && (
          <div>
            <p className="text-[9px] font-black tracking-widest uppercase mb-1.5" style={{ color: textSec }}>Description</p>
            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: textMuted }}>
              {typedDesc}
              {typedDesc.length < descText.length && (
                <span className="inline-block w-0.5 h-4 ml-0.5 align-middle" style={{ background: "#fbbf24", borderRadius: 1 }} />
              )}
            </p>
          </div>
        )}

        {/* Meta chips */}
        {metaFields.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {metaFields.map(f => (
              <div key={f.label} className="rounded-xl p-3.5" style={{ background: dark ? "rgba(255,255,255,0.04)" : "#faf9f7", border: `1px solid ${dividerCol}` }}>
                <p className="text-[9px] font-black tracking-widest uppercase mb-1" style={{ color: textSec }}>{f.label}</p>
                <p className="text-xs font-bold truncate" style={{ color: f.label === "Category" || f.label === "Mode" ? (dark ? "#fbbf24" : "#92400e") : textPri }}>
                  {f.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Tags */}
        {result.tags && result.tags.length > 0 && (
          <div>
            <p className="text-[9px] font-black tracking-widest uppercase mb-2" style={{ color: textSec }}>Tags</p>
            <div className="flex flex-wrap gap-2">
              {result.tags.map(tag => (
                <span key={tag} className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: dark ? "rgba(255,255,255,0.07)" : "#f5f5f4", color: textMuted }}>
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 pb-6 flex gap-3" style={{ background: dark ? "rgba(251,191,36,0.02)" : "#fffdf5" }}>
        <button
          onClick={onReset}
          className="px-5 py-3.5 rounded-xl font-bold text-sm border transition-colors"
          style={{ borderColor: inputBorder, color: textMuted, background: chipBg, fontFamily: "'DM Sans',sans-serif" }}
        >
          ← Try again
        </button>
        <button
          onClick={onApply}
          className="flex-1 py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2.5 transition-all hover:opacity-90 active:scale-[0.99]"
          style={{
            background: applied
              ? "linear-gradient(135deg,#1c1917,#292524)"
              : "linear-gradient(135deg,#1c1917,#292524)",
            color: "#fbbf24",
            border: "1px solid rgba(251,191,36,0.25)",
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
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function AIGenerateButton({ dark, onApply }: Props) {
  const [open,    setOpen]    = useState(false);
  const [prompt,  setPrompt]  = useState("");
  const [result,  setResult]  = useState<AIGeneratedEvent | null>(null);
  const [applied, setApplied] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  const [credits, setCredits] = useState(10); // demo: 10 credits

  const { generateEventDraft } = useOrganizerAiAction();
  const loading = generateEventDraft.loading;
  const apiError = generateEventDraft.error;

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const closeModal = () => setOpen(false);

  const handleGenerate = async () => {
    if (!prompt.trim() || loading || credits <= 0) return;
    setResult(null);
    setApplied(false);
    generateEventDraft.reset();

    let idx = 0;
    setLoadingMsg(LOADING_MESSAGES[0]);
    intervalRef.current = setInterval(() => {
      idx = (idx + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[idx]);
    }, 600);

    const raw: GenerateEventDraftResponse | null = await generateEventDraft.submit(prompt);

    if (intervalRef.current) clearInterval(intervalRef.current);

    if (!raw) return;

    // Map response → AIGeneratedEvent, skip empty/null fields
    const mapped: AIGeneratedEvent = {};
    if (isPresent(raw.title))       mapped.title       = raw.title;
    if (isPresent(raw.description)) mapped.description = raw.description;
    if (isPresent(raw.category))    mapped.category    = raw.category;
    if (isPresent(raw.mode))        mapped.mode        = raw.mode;
    if (isPresent(raw.startTime))   mapped.startTime   = raw.startTime;
    if (isPresent(raw.endTime))     mapped.endTime     = raw.endTime;
    if (isPresent(raw.onlineLink))  mapped.onlineLink  = raw.onlineLink;
    if (raw.tags && raw.tags.filter(t => isPresent(t)).length > 0)
      mapped.tags = raw.tags.filter(t => isPresent(t));

    setResult(mapped);
    setCredits(c => Math.max(0, c - 1));
  };

  const handleApply = () => {
    if (!result) return;
    onApply(result);
    setApplied(true);
    setTimeout(() => { closeModal(); setApplied(false); setResult(null); setPrompt(""); generateEventDraft.reset(); }, 900);
  };

  // Theme vars
  const surfaceBg   = dark ? "#13151f" : "#faf9f7";
  const borderCol   = dark ? "rgba(255,255,255,0.06)" : "#e7e5e4";
  const inputBg     = dark ? "#1a1d2e" : "#fff";
  const inputBorder = dark ? "rgba(255,255,255,0.1)" : "#e7e5e4";
  const textPri     = dark ? "#fff" : "#1c1917";
  const textSec     = dark ? "rgba(255,255,255,0.4)" : "#a8a29e";
  const textMuted   = dark ? "rgba(255,255,255,0.5)" : "#78716c";
  const dividerCol  = dark ? "rgba(255,255,255,0.06)" : "#f5f5f4";
  const chipBg      = dark ? "rgba(255,255,255,0.04)" : "#fff";
  const chipBorder  = dark ? "rgba(255,255,255,0.08)" : "#e7e5e4";

  return (
    <>
      {/* ── FAB ── */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-50 flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 sm:py-3.5 rounded-full font-bold text-xs sm:text-sm transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 active:scale-95"
        style={{
          background: "linear-gradient(135deg,#1c1917,#292524)",
          color: "#fbbf24",
          boxShadow: "0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(251,191,36,0.15)",
          fontFamily: "'DM Sans',sans-serif",
        }}
      >
        <span className="relative flex h-2 w-2 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
        </span>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="3"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
          <path d="M8 15 L10.5 17.5 L16 13" strokeWidth="2"/>
        </svg>
        Generate with AI
      </button>

      {/* ── Modal ── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 md:p-6"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(16px)" }}
        >
          <div
            className="relative w-full flex flex-col overflow-hidden shadow-2xl"
            style={{
              background: surfaceBg,
              border: `1px solid ${borderCol}`,
              maxWidth: "1100px",
              // Mobile: sheet from bottom, full width, tall; Desktop: rounded modal
              borderRadius: "24px 24px 0 0",
              height: "95vh",
            }}
          >
            {/* Mobile drag handle */}
            <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full" style={{ background: dark ? "rgba(255,255,255,0.15)" : "#d6d3d1" }}/>
            </div>

            {/* Header */}
            <div className="relative flex-shrink-0 overflow-hidden"
              style={{ background: "linear-gradient(135deg,#0c0b0a 0%,#1c1917 50%,#292524 100%)" }}>
              <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: "radial-gradient(circle, rgba(251,191,36,0.09) 1px, transparent 1px)",
                backgroundSize: "22px 22px",
                maskImage: "linear-gradient(to right, transparent 0%, black 25%, black 75%, transparent 100%)",
              }}/>
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 65% 50%, rgba(251,191,36,0.05) 0%, transparent 60%)" }}/>

              <div className="relative z-10 flex items-center justify-between px-5 sm:px-8 md:px-10 py-5 sm:py-7 md:py-8">
                <div style={{ maxWidth: 480 }}>
                  <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-2 sm:mb-4 text-[10px] font-black tracking-widest uppercase"
                    style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.22)", color: "#fbbf24" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="#fbbf24">
                      <path d="M12 2L14 9H21L15.5 13.5L17.5 20.5L12 16L6.5 20.5L8.5 13.5L3 9H10Z"/>
                    </svg>
                    AI Content Generator
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-1 sm:mb-2.5 leading-tight" style={{ fontFamily: "'Playfair Display',Georgia,serif" }}>
                    Describe your event,{" "}
                    <span style={{ color: "#fbbf24" }}>AI fills the form.</span>
                  </h2>
                  <p className="text-xs sm:text-sm leading-relaxed hidden sm:block" style={{ color: "rgba(255,255,255,0.38)" }}>
                    Type a plain-English description — AI generates title, description, category, mode, dates and tags.
                  </p>
                </div>
                <div className="flex-shrink-0 hidden lg:block">
                  <AIEventsIllustration />
                </div>
              </div>

              {/* X close */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-colors"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.13)", color: "rgba(255,255,255,0.55)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.15)"; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.55)"; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* ── Credits strip ── */}
            <div
              className="flex-shrink-0 flex items-center justify-between px-5 sm:px-8 py-2.5"
              style={{
                background: credits === 0
                  ? "rgba(239,68,68,0.06)"
                  : credits <= 3
                  ? "rgba(245,158,11,0.06)"
                  : dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                borderBottom: `1px solid ${dividerCol}`,
              }}
            >
              {/* Left — label + bar */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke={credits === 0 ? "#f87171" : credits <= 3 ? "#f59e0b" : "#fbbf24"}
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                  <span className="text-[10px] font-black tracking-widest uppercase"
                    style={{ color: credits === 0 ? "#f87171" : credits <= 3 ? "#f59e0b" : textSec }}>
                    AI Credits
                  </span>
                </div>
                {/* Progress bar */}
                <div className="flex-1 max-w-[160px] h-1.5 rounded-full overflow-hidden"
                  style={{ background: dark ? "rgba(255,255,255,0.08)" : "#e7e5e4" }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(credits / 10) * 100}%`,
                      background: credits === 0
                        ? "#ef4444"
                        : credits <= 3
                        ? "linear-gradient(90deg,#f59e0b,#fbbf24)"
                        : "linear-gradient(90deg,#fbbf24,#fde68a)",
                    }}
                  />
                </div>
                <span className="text-[11px] font-bold flex-shrink-0"
                  style={{ color: credits === 0 ? "#f87171" : credits <= 3 ? "#f59e0b" : textSec }}>
                  {credits} / 10
                </span>
              </div>
              {/* Right — status message */}
              <span className="text-[10px] font-semibold ml-4 flex-shrink-0 hidden sm:block"
                style={{ color: credits === 0 ? "#f87171" : credits <= 3 ? "#f59e0b" : textSec }}>
                {credits === 0
                  ? "No credits left — upgrade to Pro"
                  : credits <= 3
                  ? `Only ${credits} generation${credits === 1 ? "" : "s"} left`
                  : "Demo plan · 10 credits total"}
              </span>
            </div>

            {/* Body: single col on mobile, two-col on md+ */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden" style={{ minHeight: 0 }}>

              {/* ── LEFT: prompt + suggestions ── */}
              <div className="flex flex-col md:w-[400px] lg:w-[420px] flex-shrink-0 overflow-y-auto px-5 sm:px-7 md:px-8 py-5 sm:py-6 md:py-7 space-y-4 sm:space-y-5"
                style={{ borderBottom: `1px solid ${dividerCol}`, borderRight: "none" }}
                ref={el => {
                  // On md+ apply right border instead of bottom
                  if (el) {
                    const applyBorder = () => {
                      if (window.innerWidth >= 768) {
                        el.style.borderRight = `1px solid ${dividerCol}`;
                        el.style.borderBottom = "none";
                      } else {
                        el.style.borderRight = "none";
                        el.style.borderBottom = `1px solid ${dividerCol}`;
                        el.style.maxHeight = "55%";
                      }
                    };
                    applyBorder();
                    window.addEventListener("resize", applyBorder);
                  }
                }}
              >

                {/* Textarea */}
                <div>
                  <p className="text-[10px] font-black tracking-widest uppercase mb-2.5" style={{ color: textSec }}>
                    Describe your event
                  </p>
                  <div className="relative rounded-2xl overflow-hidden"
                    style={{ border: `1.5px solid ${inputBorder}`, background: inputBg }}>
                    <textarea
                      value={prompt}
                      onChange={e => setPrompt(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate(); }}
                      placeholder="e.g. A 2-day tech & AI conference in Pune on 15–16 August, free entry, 300 attendees, hybrid format…"
                      maxLength={500}
                      rows={7}
                      className="w-full px-4 pt-4 pb-14 text-sm outline-none resize-none"
                      style={{ background: "transparent", color: textPri, fontFamily: "'DM Sans',sans-serif", lineHeight: 1.75 }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-2.5"
                      style={{ borderTop: `1px solid ${dividerCol}`, background: surfaceBg }}>
                      <span className="text-[10px] font-semibold" style={{ color: textSec }}>
                        {prompt.length} / 500
                      </span>
                      <button
                        onClick={handleGenerate}
                        disabled={!prompt.trim() || loading || credits <= 0}
                        className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-black transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: credits <= 0 ? "rgba(239,68,68,0.15)" : "linear-gradient(135deg,#1c1917,#292524)", color: credits <= 0 ? "#f87171" : "#fbbf24", fontFamily: "'DM Sans',sans-serif" }}
                      >
                        {loading ? (
                          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                        ) : (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="#fbbf24">
                            <path d="M12 2L14 9H21L15.5 13.5L17.5 20.5L12 16L6.5 20.5L8.5 13.5L3 9H10Z"/>
                          </svg>
                        )}
                        {loading ? "Generating…" : "Generate"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Suggestions */}
                <div>
                  <p className="text-[10px] font-black tracking-widest uppercase mb-2.5" style={{ color: textSec }}>
                    Try a suggestion
                  </p>
                  <div className="flex flex-col gap-2">                    {SUGGESTIONS.map(s => (
                      <button
                        key={s.label}
                        onClick={() => setPrompt(s.text)}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-left transition-colors"
                        style={{ background: chipBg, borderColor: chipBorder, fontFamily: "'DM Sans',sans-serif" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(251,191,36,0.35)"; (e.currentTarget as HTMLButtonElement).style.background = dark ? "rgba(251,191,36,0.05)" : "#fffbeb"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = chipBorder; (e.currentTarget as HTMLButtonElement).style.background = chipBg; }}
                      >
                        <span className="text-base leading-none flex-shrink-0">{s.icon}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate" style={{ color: textPri }}>{s.label}</p>
                          <p className="text-[10px] mt-0.5 truncate" style={{ color: textSec }}>{s.text.slice(0, 48)}…</p>
                        </div>
                        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" style={{ color: textSec }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/>
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>

              </div>{/* end left */}

              {/* ── RIGHT: result / loading / empty state ── */}
              <div className="flex-1 overflow-y-auto px-5 sm:px-7 md:px-8 py-5 sm:py-6 md:py-7" style={{ minWidth: 0 }}>

                {/* Empty state */}
                {!result && !loading && !apiError && (
                  <div className="h-full flex flex-col items-center justify-center gap-4 text-center" style={{ opacity: credits === 0 ? 1 : 0.5 }}>
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ background: credits === 0 ? "rgba(239,68,68,0.08)" : dark ? "rgba(251,191,36,0.06)" : "#faf9f7", border: `1px solid ${credits === 0 ? "rgba(239,68,68,0.2)" : dividerCol}` }}>
                      {credits === 0 ? (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round">
                          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                        </svg>
                      ) : (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={dark ? "rgba(251,191,36,0.5)" : "#d6d3d1"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="3"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                          <line x1="8" y1="15" x2="16" y2="15"/>
                          <line x1="8" y1="19" x2="13" y2="19"/>
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: credits === 0 ? "#f87171" : textPri }}>
                        {credits === 0 ? "No credits remaining" : "Generated content appears here"}
                      </p>
                      <p className="text-xs mt-1" style={{ color: credits === 0 ? "rgba(248,113,113,0.7)" : textSec }}>
                        {credits === 0 ? "Upgrade to Pro for unlimited AI generations" : "Describe your event and hit Generate"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Loading */}
                {loading && (
                  <div className="h-full flex flex-col items-center justify-center gap-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.18)" }}>
                      <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24" style={{ color: "#fbbf24" }}>
                        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                        <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold" style={{ color: textPri }}>{loadingMsg}</p>
                      <p className="text-xs mt-1" style={{ color: textSec }}>AI is crafting your event details…</p>
                    </div>
                    {/* Skeleton preview */}
                    <div className="w-full space-y-3 mt-2">
                      {[70, 90, 55, 80, 65].map((w, i) => (
                        <div key={i} className="h-3 rounded-full" style={{ width: `${w}%`, background: dark ? "rgba(255,255,255,0.06)" : "#f5f5f4" }} />
                      ))}
                    </div>
                  </div>
                )}

                {/* API Error */}
                {apiError && !loading && !result && (
                  <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)" }}>
                      <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-red-400">{apiError}</p>
                    <p className="text-xs" style={{ color: textSec }}>Try again with a different prompt</p>
                  </div>
                )}

                {/* Result */}
                {result && !loading && (
                  <ResultView
                    result={result}
                    dark={dark}
                    textPri={textPri} textSec={textSec} textMuted={textMuted}
                    dividerCol={dividerCol} inputBorder={inputBorder} chipBg={chipBg}
                    onApply={handleApply}
                    onReset={() => { setResult(null); generateEventDraft.reset(); }}
                    applied={applied}
                  />
                )}

              </div>{/* end right */}

            </div>{/* end body flex */}

          </div>{/* end modal card */}

        </div>
      )}{/* end modal */}

    </>
  );
}