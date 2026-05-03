"use client";

import { useState } from "react";

export interface Event {
  id: string; title: string; type: string; description: string;
  date: string; venue: string; tags: string[]; image_url: string;
  attendance: number; organizerName: string; organizer: string;
  organizerProfilepic: string; latitude: number; longitude: number; organizerId: string;
}

export const TYPE_META: Record<string, { bg:string; text:string; bgLight:string; textLight:string; dot:string; hex:string }> = {
  Music:        { bg:"bg-violet-500/15",  text:"text-violet-300",  bgLight:"bg-violet-100",   textLight:"text-violet-700",  dot:"bg-violet-400",  hex:"#8b5cf6" },
  Tech:         { bg:"bg-blue-500/15",    text:"text-blue-300",    bgLight:"bg-blue-100",     textLight:"text-blue-700",    dot:"bg-blue-400",    hex:"#3b82f6" },
  Food:         { bg:"bg-orange-500/15",  text:"text-orange-300",  bgLight:"bg-orange-100",   textLight:"text-orange-700",  dot:"bg-orange-400",  hex:"#f97316" },
  Sports:       { bg:"bg-green-500/15",   text:"text-green-300",   bgLight:"bg-green-100",    textLight:"text-green-700",   dot:"bg-green-400",   hex:"#22c55e" },
  Art:          { bg:"bg-pink-500/15",    text:"text-pink-300",    bgLight:"bg-pink-100",     textLight:"text-pink-700",    dot:"bg-pink-400",    hex:"#ec4899" },
  Festival:     { bg:"bg-amber-500/15",   text:"text-amber-300",   bgLight:"bg-amber-100",    textLight:"text-amber-700",   dot:"bg-amber-400",   hex:"#f59e0b" },
  Volunteer:    { bg:"bg-teal-500/15",    text:"text-teal-300",    bgLight:"bg-teal-100",     textLight:"text-teal-700",    dot:"bg-teal-400",    hex:"#14b8a6" },
  Conference:   { bg:"bg-indigo-500/15",  text:"text-indigo-300",  bgLight:"bg-indigo-100",   textLight:"text-indigo-700",  dot:"bg-indigo-400",  hex:"#6366f1" },
  Networking:   { bg:"bg-cyan-500/15",    text:"text-cyan-300",    bgLight:"bg-cyan-100",     textLight:"text-cyan-700",    dot:"bg-cyan-400",    hex:"#06b6d4" },
  Workshop:     { bg:"bg-rose-500/15",    text:"text-rose-300",    bgLight:"bg-rose-100",     textLight:"text-rose-700",    dot:"bg-rose-400",    hex:"#f43f5e" },
  Education:    { bg:"bg-sky-500/15",     text:"text-sky-300",     bgLight:"bg-sky-100",      textLight:"text-sky-700",     dot:"bg-sky-400",     hex:"#0ea5e9" },
  Business:     { bg:"bg-lime-500/15",    text:"text-lime-300",    bgLight:"bg-lime-100",     textLight:"text-lime-700",    dot:"bg-lime-400",    hex:"#84cc16" },
  Health:       { bg:"bg-emerald-500/15", text:"text-emerald-300", bgLight:"bg-emerald-100",  textLight:"text-emerald-700", dot:"bg-emerald-400", hex:"#10b981" },
  Entertainment:{ bg:"bg-fuchsia-500/15", text:"text-fuchsia-300", bgLight:"bg-fuchsia-100",  textLight:"text-fuchsia-700", dot:"bg-fuchsia-400", hex:"#e879f9" },
  Gaming:       { bg:"bg-orange-500/15",  text:"text-orange-300",  bgLight:"bg-orange-100",   textLight:"text-orange-700",  dot:"bg-orange-400",  hex:"#fb923c" },
  default:      { bg:"bg-stone-500/15",   text:"text-stone-300",   bgLight:"bg-stone-100",    textLight:"text-stone-600",   dot:"bg-stone-400",   hex:"#f59e0b" },
};

function fmt(iso: string, opts: Intl.DateTimeFormatOptions) {
  return new Date(iso).toLocaleDateString("en-IN", opts);
}
const fmtDate = (iso: string) => fmt(iso, { day:"numeric", month:"short", year:"numeric" });
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", hour12:true });

function d(dark: boolean, dk: string, lt: string) { return dark ? dk : lt; }

// ── Map popup ─────────────────────────────────────────────────────────────────
export function MapPopupCard({ event, onClose, dark = true }: {
  event: Event; onClose?: () => void; dark?: boolean;
}) {
  const tc = TYPE_META[event.type] ?? TYPE_META.default;
  return (
    <div className={`w-64 rounded-2xl overflow-hidden shadow-2xl pointer-events-auto border
      ${d(dark,"bg-[#13151f] border-white/12 shadow-black/70","bg-white border-stone-200 shadow-stone-300/50")}`}>
      <div className="relative h-32 overflow-hidden">
        <img src={event.image_url} alt={event.title} className="w-full h-full object-cover"/>
        <div className={`absolute inset-0 bg-gradient-to-t ${d(dark,"from-[#13151f]","from-white/20")} via-transparent to-transparent`}/>
        <span className={`absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm border
          ${d(dark,`${tc.bg} ${tc.text} border-white/10`,`${tc.bgLight} ${tc.textLight} border-transparent`)}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${tc.dot}`}/>{event.type}
        </span>
        {onClose && (
          <button onClick={onClose}
            className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-black/55 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white transition-all hover:bg-black/80">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        )}
      </div>
      <div className="p-3.5">
        <h3 className={`font-bold text-sm leading-snug line-clamp-1 mb-2.5 ${d(dark,"text-white","text-stone-900")}`}
          style={{fontFamily:"'Playfair Display',Georgia,serif"}}>{event.title}</h3>
        <div className="space-y-1.5 mb-3">
          {[
            { icon:<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>, text:`${fmtDate(event.date)} · ${fmtTime(event.date)}` },
            { icon:<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></>, text: event.venue },
          ].map((row, i) => (
            <div key={i} className={`flex items-center gap-1.5 text-[10px] ${d(dark,"text-white/40","text-stone-400")}`}>
              <svg className="w-3 h-3 flex-shrink-0 text-amber-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">{row.icon}</svg>
              <span className="truncate">{row.text}</span>
            </div>
          ))}
        </div>
        <div className={`flex items-center justify-between pt-2.5 border-t ${d(dark,"border-white/6","border-stone-100")}`}>
          <div className="flex items-center gap-1.5">
            <img src={event.organizerProfilepic} alt={event.organizerName}
              className={`w-5 h-5 rounded-full object-cover ring-1 ${d(dark,"ring-white/15","ring-stone-200")}`}/>
            <span className={`text-[10px] font-semibold truncate max-w-[80px] ${d(dark,"text-white/45","text-stone-500")}`}>{event.organizerName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1 text-[10px] ${d(dark,"text-white/35","text-stone-400")}`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
              {event.attendance.toLocaleString()}
            </span>
            <button className="text-[10px] font-black text-amber-500 bg-amber-400/12 border border-amber-400/25 hover:bg-amber-400/22 px-2.5 py-1 rounded-lg transition-all">
              RSVP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sidebar card ──────────────────────────────────────────────────────────────
export function EventCard({ event, onClick, active, dark = true }: {
  event: Event; onClick?: () => void; active?: boolean; dark?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const tc = TYPE_META[event.type] ?? TYPE_META.default;

  return (
    <div onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border
        ${d(dark,"bg-[#13151f]","bg-white")}
        ${active
          ? "border-amber-400/50 shadow-lg shadow-amber-400/10 -translate-y-0.5"
          : hovered
          ? `${d(dark,"border-white/20","border-stone-300")} shadow-xl ${d(dark,"shadow-black/40","shadow-stone-200")} -translate-y-1`
          : d(dark,"border-white/7","border-stone-200")
        }`}>

      {active && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-400 to-orange-500 z-10 rounded-r"/>}

      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        <img src={event.image_url} alt={event.title}
          className={`w-full h-full object-cover transition-transform duration-500 ${hovered ? "scale-105" : "scale-100"}`}/>
        <div className={`absolute inset-0 bg-gradient-to-t ${d(dark,"from-[#13151f]","from-white/20")} via-transparent to-transparent`}/>

        {/* Category badge */}
        <span className={`absolute top-3 left-3 inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm border
          ${d(dark,`${tc.bg} ${tc.text} border-white/10`,`${tc.bgLight} ${tc.textLight} border-transparent`)}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${tc.dot}`}/>{event.type}
        </span>

        {/* Attendance badge */}
        <div className={`absolute top-3 right-3 flex items-center gap-1 rounded-full px-2.5 py-1 border backdrop-blur-sm
          ${d(dark,"bg-black/55 border-white/10","bg-white/80 border-stone-200")}`}>
          <svg className={`w-3 h-3 ${d(dark,"text-white/55","text-stone-400")}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
          </svg>
          <span className={`text-[10px] font-bold ${d(dark,"text-white/70","text-stone-600")}`}>{event.attendance.toLocaleString()}</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className={`font-bold text-sm leading-snug mb-1 line-clamp-2 ${d(dark,"text-white","text-stone-900")}`}
          style={{fontFamily:"'Playfair Display',Georgia,serif"}}>{event.title}</h3>
        <p className={`text-xs leading-relaxed line-clamp-2 mb-3 ${d(dark,"text-white/35","text-stone-400")}`}>{event.description}</p>

        <div className="space-y-1.5 mb-3">
          {[
            { icon:<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>, text:`${fmtDate(event.date)} · ${fmtTime(event.date)}` },
            { icon:<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></>, text: event.venue },
          ].map((row, i) => (
            <div key={i} className={`flex items-center gap-2 text-xs ${d(dark,"text-white/45","text-stone-500")}`}>
              <svg className="w-3.5 h-3.5 flex-shrink-0 text-amber-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">{row.icon}</svg>
              <span className="truncate">{row.text}</span>
            </div>
          ))}
        </div>

        {event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {event.tags.slice(0, 3).map(tag => (
              <span key={tag} className={`text-[10px] font-semibold rounded-full px-2 py-0.5 border
                ${d(dark,"text-white/35 bg-white/5 border-white/8","text-stone-400 bg-stone-100 border-stone-200")}`}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className={`flex items-center justify-between pt-3 border-t ${d(dark,"border-white/6","border-stone-100")}`}>
          <div className="flex items-center gap-2">
            <img src={event.organizerProfilepic} alt={event.organizerName}
              className={`w-6 h-6 rounded-full object-cover ring-2 ${d(dark,"ring-white/10","ring-stone-200")}`}/>
            <div>
              <div className={`text-[10px] font-semibold leading-none ${d(dark,"text-white/60","text-stone-600")}`}>{event.organizerName}</div>
              <div className={`text-[9px] mt-0.5 ${d(dark,"text-white/25","text-stone-400")}`}>@{event.organizer}</div>
            </div>
          </div>
          <button className="text-[10px] font-black text-amber-500 bg-amber-400/10 border border-amber-400/22 px-3 py-1.5 rounded-lg hover:bg-amber-400/20 transition-all hover:scale-[1.03]">
            RSVP →
          </button>
        </div>
      </div>
    </div>
  );
}

export default EventCard;