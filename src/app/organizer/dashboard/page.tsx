"use client";

import { useState, useMemo, useEffect } from "react";
import { TYPE_META } from "@/components/EventCard";
import { useOrganizerAuth ,useSubscriptionLoaded, useOrganizerSubscription} from "@/store/eventimist/organizer/auth/AuthState";
import { useOrganizerLogout } from "@/hooks/eventimist/organizer/sessions/useOrganizerLogout";
import { useOrganizerEvents } from "@/hooks/eventimist/organizer/event/useOrganizerEvents";
import { usePublishEvent } from "@/hooks/eventimist/organizer/event/usePublishEvent";
import type { OrganizerEvent } from "@/services/eventimist/organizer/event/getOrganizerEvents.service";

import { useSubscriptionAction } from "@/hooks/eventimist/organizer/subscriptions/useSuscriptionAction";
import { PricingModal } from "@/components/PricingModal";
import { OrganizerAssistant } from "@/components/OrganizerAssistant";


// ─── Local shape used by UI components ───────────────────────────────────────
// Mapped from OrganizerEvent (API) so the rest of the UI stays unchanged.
interface OrgEvent {
  id: string; title: string; type: string; date: string; venue: string;
  status: "live" | "upcoming" | "draft" | "ended";
  rsvps: number; capacity: number; revenue: number; image: string;
}

function mapEvent(e: OrganizerEvent): OrgEvent {
  const now    = new Date();
  const start  = new Date(e.startTime);
  const end    = new Date(e.endTime);
  const status: OrgEvent["status"] =
    e.status === "DRAFT"      ? "draft"    :
    e.status === "CANCELLED"  ? "ended"    :
    e.status === "COMPLETED"  ? "ended"    :
    now >= start && now <= end ? "live"    :
    now > end                  ? "ended"   : "upcoming";

  return {
    id:       String(e.id),
    title:    e.title,
    type:     e.category.charAt(0) + e.category.slice(1).toLowerCase(), // "TECH" → "Tech"
    date:     e.startTime.split("T")[0],
    venue:    e.venue || e.onlineLink || "Online",
    status,
    rsvps:    e.rsvpCount,
    capacity: e.capacity,
    revenue:  e.ticketPrice * e.rsvpCount,
    image:    e.coverImage || (e.images?.[0] ?? ""),
  };
}
interface ActivityItem {
  id: string; text: string; time: string;
  kind: "rsvp" | "cancel" | "publish" | "comment" | "payout";
}

type NavTab = "dashboard" | "audience" | "revenue" | "analytics" | "settings";

const ACTIVITY: ActivityItem[] = [
  { id:"a1", text:"243 new RSVPs for Sunburn Arena",          time:"2 min ago",  kind:"rsvp" },
  { id:"a2", text:"Delhi Tech Summit published successfully", time:"1 hr ago",   kind:"publish" },
  { id:"a3", text:"12 cancellations — Holi Mela",            time:"3 hrs ago",  kind:"cancel" },
  { id:"a4", text:"Payout ₹2,40,000 processed",             time:"Yesterday",  kind:"payout" },
  { id:"a5", text:"New comment on Photography Masterclass",  time:"Yesterday",  kind:"comment" },
  { id:"a6", text:"NH7 Weekender saved as draft",            time:"2 days ago", kind:"publish" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : n >= 1000 ? `₹${(n/1000).toFixed(0)}K` : `₹${n}`;
const pct = (a: number, b: number) => b ? Math.round((a / b) * 100) : 0;
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
function d(dark: boolean, darkCls: string, lightCls: string) { return dark ? darkCls : lightCls; }
const T = {
  bg:      (dark: boolean) => d(dark, "bg-[#0c0e1a]",    "bg-gray-50"),
  surface: (dark: boolean) => d(dark, "bg-[#13151f]",    "bg-white"),
  border:  (dark: boolean) => d(dark, "border-white/8",  "border-gray-200"),
  text1:   (dark: boolean) => d(dark, "text-white",      "text-gray-900"),
  text2:   (dark: boolean) => d(dark, "text-white/55",   "text-gray-600"),
  text3:   (dark: boolean) => d(dark, "text-white/30",   "text-gray-400"),
  hover:   (dark: boolean) => d(dark, "hover:bg-white/4","hover:bg-gray-50"),
};
const SM_LIGHT = { live:{label:"Live",bg:"bg-emerald-500/10",text:"text-emerald-600",dot:"bg-emerald-500"},upcoming:{label:"Upcoming",bg:"bg-amber-500/10",text:"text-amber-600",dot:"bg-amber-500"},draft:{label:"Draft",bg:"bg-gray-100",text:"text-gray-600",dot:"bg-gray-400"},ended:{label:"Ended",bg:"bg-gray-50",text:"text-gray-500",dot:"bg-gray-300"} };
const SM_DARK  = { live:{label:"Live",bg:"bg-emerald-500/15",text:"text-emerald-300",dot:"bg-emerald-400"},upcoming:{label:"Upcoming",bg:"bg-amber-500/15",text:"text-amber-300",dot:"bg-amber-400"},draft:{label:"Draft",bg:"bg-white/8",text:"text-white/40",dot:"bg-white/30"},ended:{label:"Ended",bg:"bg-white/5",text:"text-white/25",dot:"bg-white/20"} };
const AC_LIGHT: Record<ActivityItem["kind"],string> = { rsvp:"text-amber-600 bg-amber-100",cancel:"text-rose-600 bg-rose-100",publish:"text-emerald-600 bg-emerald-100",comment:"text-blue-600 bg-blue-100",payout:"text-teal-600 bg-teal-100" };
const AC_DARK:  Record<ActivityItem["kind"],string> = { rsvp:"text-amber-400 bg-amber-400/12",cancel:"text-rose-400 bg-rose-400/12",publish:"text-emerald-400 bg-emerald-400/12",comment:"text-blue-400 bg-blue-400/12",payout:"text-teal-400 bg-teal-400/12" };
const ACTIVITY_ICON: Record<ActivityItem["kind"],React.ReactNode> = {
  rsvp:   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  cancel: <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  publish:<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  comment:<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  payout: <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
};

// ─── Dark Toggle ──────────────────────────────────────────────────────────────
function DarkToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} title={dark ? "Light mode" : "Dark mode"}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0 border ${dark ? "bg-amber-400/20 border-amber-400/30" : "bg-gray-200 border-gray-300"}`}>
      <span className={`absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] transition-opacity ${dark ? "opacity-100" : "opacity-0"}`}>🌙</span>
      <span className={`absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] transition-opacity ${dark ? "opacity-0" : "opacity-100"}`}>☀️</span>
      <div className={`absolute top-0.5 w-5 h-5 rounded-full shadow-md transition-all duration-300 ${dark ? "translate-x-5 bg-amber-400" : "translate-x-0.5 bg-white"}`} />
    </button>
  );
}

// ─── Spark ────────────────────────────────────────────────────────────────────
function Spark({ data, color="#f59e0b" }: { data: number[]; color?: string }) {
  const max=Math.max(...data),min=Math.min(...data),range=max-min||1,w=80,h=28,pts=data.length;
  const coords=data.map((v,i)=>[(i/(pts-1))*w,h-((v-min)/range)*(h-4)-2]);
  const path=coords.map((p,i)=>`${i===0?"M":"L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const fill=[...coords,[w,h],[0,h]].map((p,i)=>`${i===0?"M":"L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ")+"Z";
  return <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible"><path d={fill} fill={color} fillOpacity="0.08"/><path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx={coords[coords.length-1][0]} cy={coords[coords.length-1][1]} r="2.5" fill={color}/></svg>;
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, sub, trend, spark, dark }: { icon: React.ReactNode; label: string; value: string; sub: string; trend: "up"|"down"|"flat"; spark: number[]; dark: boolean }) {
  const trendColor = trend==="up" ? d(dark,"text-emerald-400","text-emerald-600") : trend==="down" ? d(dark,"text-rose-400","text-rose-500") : T.text3(dark);
  const sparkColor = trend==="up" ? "#34d399" : trend==="down" ? "#fb7185" : "#f59e0b";
  return (
    <div className={`${T.surface(dark)} border ${T.border(dark)} rounded-2xl p-4 sm:p-5 transition-all hover:-translate-y-0.5 hover:shadow-xl flex flex-col gap-3`}>
      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 rounded-xl ${d(dark,"bg-amber-400/12 border border-amber-400/20","bg-amber-100 border border-amber-200")} flex items-center justify-center text-amber-500`}>{icon}</div>
        <Spark data={spark} color={sparkColor} />
      </div>
      <div>
        <div className={`${T.text1(dark)} font-black text-xl sm:text-2xl leading-none mb-1`} style={{fontFamily:"'Playfair Display',Georgia,serif"}}>{value}</div>
        <div className={`${T.text3(dark)} text-xs font-semibold`}>{label}</div>
      </div>
      <div className={`flex items-center gap-1.5 text-xs font-bold ${trendColor}`}>
        {trend==="up"   && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 15l-6-6-6 6"/></svg>}
        {trend==="down" && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6"/></svg>}
        <span>{sub}</span>
      </div>
    </div>
  );
}

// ─── Event Row ────────────────────────────────────────────────────────────────
function EventRow({ event, dark }: { event: OrgEvent; dark: boolean }) {
  const sm=dark?SM_DARK[event.status]:SM_LIGHT[event.status];
  const tc=TYPE_META[event.type]??TYPE_META.default;
  const occ=pct(event.rsvps,event.capacity);
  return (
    <div className={`group flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 ${T.hover(dark)} rounded-xl transition-all cursor-pointer`}>
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden flex-shrink-0">
        <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
      </div>
      <div className="flex-1 min-w-0">
        <div className={`${T.text2(dark)} text-xs sm:text-sm font-bold leading-snug truncate ${d(dark,"group-hover:text-white","group-hover:text-gray-900")} transition-colors`}>{event.title}</div>
        <div className={`${T.text3(dark)} text-[10px] truncate mt-0.5`}>{event.venue.split(",")[0]} · {new Date(event.date).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</div>
      </div>
      <span className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${tc.bg} ${tc.text}`}>
        <span className={`w-1 h-1 rounded-full ${tc.dot}`}/>{event.type}
      </span>
      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 sm:px-2.5 py-1 rounded-full flex-shrink-0 ${sm.bg} ${sm.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${sm.dot} ${event.status==="live"?"animate-pulse":""}`}/>{sm.label}
      </span>
      <div className="hidden md:flex flex-col gap-1 w-20 flex-shrink-0">
        <div className="flex items-center justify-between">
          <span className={`${T.text3(dark)} text-[9px]`}>{event.rsvps.toLocaleString()}</span>
          <span className={`${T.text3(dark)} text-[9px]`}>{occ}%</span>
        </div>
        <div className={`h-1 ${d(dark,"bg-white/8","bg-gray-200")} rounded-full overflow-hidden`}>
          <div className="h-full rounded-full" style={{width:`${occ}%`,background:occ>=90?"#f87171":occ>=70?"#fbbf24":"#34d399"}}/>
        </div>
      </div>
      <div className="hidden lg:block text-right flex-shrink-0 w-16">
        <div className={`${T.text2(dark)} text-sm font-bold`}>{event.revenue?fmt(event.revenue):"—"}</div>
        <div className={`${T.text3(dark)} text-[9px]`}>revenue</div>
      </div>
    </div>
  );
}

// ─── Calendar ─────────────────────────────────────────────────────────────────
function Calendar({ events, onDaySelect, selectedDay, dark }: { events: OrgEvent[]; onDaySelect:(day:number|null)=>void; selectedDay:number|null; dark:boolean }) {
  const today=new Date();
  const [viewYear,setViewYear]=useState(today.getFullYear());
  const [viewMonth,setViewMonth]=useState(today.getMonth());
  const firstDay=new Date(viewYear,viewMonth,1).getDay();
  const daysInMonth=new Date(viewYear,viewMonth+1,0).getDate();
  const eventsByDay=useMemo(()=>{
    const map:Record<number,OrgEvent[]>={};
    events.forEach(ev=>{const d2=new Date(ev.date);if(d2.getFullYear()===viewYear&&d2.getMonth()===viewMonth){const day=d2.getDate();if(!map[day])map[day]=[];map[day].push(ev);}});
    return map;
  },[events,viewYear,viewMonth]);
  const prevMonth=()=>{if(viewMonth===0){setViewMonth(11);setViewYear(y=>y-1);}else setViewMonth(m=>m-1);onDaySelect(null);};
  const nextMonth=()=>{if(viewMonth===11){setViewMonth(0);setViewYear(y=>y+1);}else setViewMonth(m=>m+1);onDaySelect(null);};
  const isToday=(d2:number)=>d2===today.getDate()&&viewMonth===today.getMonth()&&viewYear===today.getFullYear();
  const cells:(number|null)[]=[...Array(firstDay).fill(null),...Array.from({length:daysInMonth},(_,i)=>i+1)];
  while(cells.length%7!==0)cells.push(null);
  return (
    <div className={`${T.surface(dark)} border ${T.border(dark)} rounded-2xl overflow-hidden`}>
      <div className={`flex items-center justify-between px-4 sm:px-5 py-4 border-b ${T.border(dark)}`}>
        <h3 className={`${T.text1(dark)} font-black text-sm sm:text-base`} style={{fontFamily:"'Playfair Display',Georgia,serif"}}>{MONTHS[viewMonth]} <span className={T.text3(dark)}>{viewYear}</span></h3>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center ${T.text3(dark)} ${d(dark,"hover:text-white hover:bg-white/8","hover:text-gray-900 hover:bg-gray-100")} transition-all`}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6"/></svg></button>
          <button onClick={()=>{setViewMonth(today.getMonth());setViewYear(today.getFullYear());onDaySelect(null);}} className={`text-[10px] font-black ${T.text3(dark)} hover:text-amber-500 px-2 py-1 rounded-lg hover:bg-amber-100/10 transition-all`}>Today</button>
          <button onClick={nextMonth} className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center ${T.text3(dark)} ${d(dark,"hover:text-white hover:bg-white/8","hover:text-gray-900 hover:bg-gray-100")} transition-all`}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/></svg></button>
        </div>
      </div>
      <div className={`grid grid-cols-7 border-b ${T.border(dark)}`}>
        {DAYS.map(d2=><div key={d2} className={`py-2 text-center text-[9px] sm:text-[10px] font-black ${T.text3(dark)} tracking-wider`}>{d2}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day,idx)=>{
          const evs=day?(eventsByDay[day]||[]):[];
          const active=day===selectedDay;
          const tod=day?isToday(day):false;
          return (
            <div key={idx} onClick={()=>day&&evs.length>0?onDaySelect(active?null:day):undefined}
              className={`relative min-h-[40px] sm:min-h-[52px] p-1 sm:p-1.5 border-r border-b ${T.border(dark)} transition-all ${day&&evs.length>0?"cursor-pointer":"cursor-default"} ${active?d(dark,"bg-amber-400/12","bg-amber-100"):day&&evs.length>0?d(dark,"hover:bg-white/4","hover:bg-gray-50"):""}`}>
              {day&&(<>
                <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] font-bold mb-1 transition-all ${active?"bg-amber-500 text-white":tod?d(dark,"bg-white/12 text-white ring-1 ring-white/25","bg-gray-200 text-gray-900 ring-1 ring-gray-300"):T.text3(dark)}`}>{day}</div>
                {evs.length>0&&<div className="flex flex-wrap gap-0.5">{evs.slice(0,2).map((ev,i)=>{const tc=TYPE_META[ev.type]??TYPE_META.default;return <span key={i} className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${tc.dot} ${ev.status==="live"?"animate-pulse":""}`}/>;})}{evs.length>2&&<span className={`text-[7px] ${T.text3(dark)} font-bold`}>+{evs.length-2}</span>}</div>}
              </>)}
            </div>
          );
        })}
      </div>
      <div className={`px-3 sm:px-4 py-2 sm:py-3 border-t ${T.border(dark)} flex flex-wrap gap-x-3 gap-y-1`}>
        {Object.entries(TYPE_META).filter(([k])=>k!=="default"&&events.some(e=>e.type===k)).map(([type,meta])=>(
          <span key={type} className={`flex items-center gap-1 text-[9px] sm:text-[10px] ${T.text3(dark)}`}><span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`}/>{type}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Logout Modal ─────────────────────────────────────────────────────────────
function LogoutModal({ onConfirm, onCancel, dark }: { onConfirm:()=>void; onCancel:()=>void; dark:boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className={`absolute inset-0 ${d(dark,"bg-black/60","bg-black/30")} backdrop-blur-sm`} onClick={onCancel}/>
      <div className={`relative ${T.surface(dark)} border ${T.border(dark)} rounded-2xl shadow-2xl p-6 w-80 mx-4`}>
        <div className={`w-12 h-12 rounded-2xl ${d(dark,"bg-rose-500/15","bg-rose-100")} flex items-center justify-center mx-auto mb-4`}>
          <svg className="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </div>
        <h3 className={`${T.text1(dark)} font-black text-base text-center mb-1`} style={{fontFamily:"'Playfair Display',Georgia,serif"}}>Sign out?</h3>
        <p className={`${T.text3(dark)} text-sm text-center mb-6`}>You'll need to sign in again to access your dashboard.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className={`flex-1 py-2.5 text-sm font-bold ${T.text2(dark)} ${d(dark,"bg-white/8 hover:bg-white/14","bg-gray-100 hover:bg-gray-200")} rounded-xl transition-all`}>Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-all">Sign out</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB CONTENT COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Dashboard Tab ────────────────────────────────────────────────────────────
const PAGE_SIZE = 6; // cards per page

function TabDashboard({ dark, onPublish }: { dark: boolean; onPublish: (id: string) => void }) {
  const { events: rawEvents, loading, error } = useOrganizerEvents();
  const EVENTS = useMemo(() => rawEvents.map(mapEvent), [rawEvents]);

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [evFilter,    setEvFilter]    = useState<"all"|"live"|"upcoming"|"draft"|"ended">("all");
  const [page,        setPage]        = useState(1);

  const dayEvents = useMemo(() => {
    if (!selectedDay) return [];
    const today = new Date();
    return EVENTS.filter(ev => { const d2=new Date(ev.date); return d2.getDate()===selectedDay&&d2.getMonth()===today.getMonth()&&d2.getFullYear()===today.getFullYear(); });
  }, [selectedDay, EVENTS]);

  const filtered     = evFilter==="all"?EVENTS:EVENTS.filter(e=>e.status===evFilter);
  const totalPages   = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated    = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);
  const totalRsvps   = EVENTS.filter(e=>e.status!=="ended").reduce((s,e)=>s+e.rsvps,0);
  const totalRevenue = EVENTS.reduce((s,e)=>s+e.revenue,0);

  const handleFilter = (f: typeof evFilter) => { setEvFilter(f); setPage(1); };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading && EVENTS.length === 0) return (
    <div className="flex items-center justify-center py-24">
      <div className="flex flex-col items-center gap-3">
        <svg className="w-8 h-8 animate-spin text-amber-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        <span className={`${T.text3(dark)} text-sm`}>Loading your events…</span>
      </div>
    </div>
  );

  // ── Error state ───────────────────────────────────────────────────────────
  if (error && EVENTS.length === 0) return (
    <div className="flex items-center justify-center py-24">
      <div className={`text-center max-w-xs`}>
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <p className={`${T.text2(dark)} text-sm font-bold mb-1`}>Failed to load events</p>
        <p className={`${T.text3(dark)} text-xs`}>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-5 sm:space-y-7">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard dark={dark} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>} label="Total Events" value={String(EVENTS.length)} sub="+3 this month" trend="up" spark={[3,5,4,6,5,7,6,8,7,10]}/>
        <KpiCard dark={dark} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>} label="Total RSVPs" value={totalRsvps.toLocaleString()} sub="+1,240 this week" trend="up" spark={[800,1200,980,1500,1300,1800,1600,2100,1900,2400]}/>
        <KpiCard dark={dark} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>} label="Revenue" value={fmt(totalRevenue)} sub="+₹3.2L vs last month" trend="up" spark={[120,200,180,310,270,400,360,500,440,620]}/>
        <KpiCard dark={dark} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>} label="Avg. Occupancy" value={`${pct(totalRsvps,EVENTS.reduce((s,e)=>s+e.capacity,0))}%`} sub="–2% vs last month" trend="down" spark={[72,68,74,71,69,75,73,70,72,68]}/>
      </div>

      {/* Calendar + side */}
      <div className="grid lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_340px] gap-4 sm:gap-5">
        <Calendar events={EVENTS} onDaySelect={setSelectedDay} selectedDay={selectedDay} dark={dark}/>
        <div className="space-y-4">
          {selectedDay&&dayEvents.length>0 ? (
            <div className={`${T.surface(dark)} border ${d(dark,"border-amber-400/20","border-amber-200")} rounded-2xl overflow-hidden`}>
              <div className={`px-4 py-3.5 border-b ${T.border(dark)} flex items-center justify-between`}>
                <div>
                  <div className={`${T.text1(dark)} font-black text-sm`} style={{fontFamily:"'Playfair Display',Georgia,serif"}}>{new Date(new Date().getFullYear(),new Date().getMonth(),selectedDay).toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}</div>
                  <div className={`${T.text3(dark)} text-[10px] mt-0.5`}>{dayEvents.length} event{dayEvents.length>1?"s":""} scheduled</div>
                </div>
                <button onClick={()=>setSelectedDay(null)} className={`w-6 h-6 rounded-full ${d(dark,"bg-white/8 text-white/40 hover:text-white","bg-gray-100 text-gray-500 hover:text-gray-900")} flex items-center justify-center transition-all`}><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
              </div>
              <div className={`divide-y ${d(dark,"divide-white/5","divide-gray-100")}`}>
                {dayEvents.map(ev=>{const sm=dark?SM_DARK[ev.status]:SM_LIGHT[ev.status];const tc=TYPE_META[ev.type]??TYPE_META.default;return(<a key={ev.id} href={`/events/${ev.id}`} className={`group flex gap-3 px-4 py-3.5 ${T.hover(dark)} transition-all`}><div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"><img src={ev.image} alt={ev.title} className="w-full h-full object-cover"/></div><div className="flex-1 min-w-0"><div className={`${T.text2(dark)} text-xs font-bold line-clamp-1`}>{ev.title}</div><div className={`${T.text3(dark)} text-[10px] mt-0.5`}>{ev.venue.split(",")[0]}</div><div className="flex items-center gap-2 mt-1.5"><span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${tc.bg} ${tc.text}`}><span className={`w-1 h-1 rounded-full ${tc.dot}`}/>{ev.type}</span><span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${sm.bg} ${sm.text}`}>{sm.label}</span></div></div></a>);})}
              </div>
            </div>
          ) : (
            <div className={`${T.surface(dark)} border ${T.border(dark)} rounded-2xl overflow-hidden`}>
              <div className={`px-4 py-3.5 border-b ${T.border(dark)}`}><div className={`${T.text1(dark)} font-black text-sm`} style={{fontFamily:"'Playfair Display',Georgia,serif"}}>Upcoming next 30 days</div></div>
              <div className={`divide-y ${d(dark,"divide-white/5","divide-gray-100")}`}>
                {EVENTS.filter(e=>e.status==="upcoming"||e.status==="live").sort((a,b)=>new Date(a.date).getTime()-new Date(b.date).getTime()).slice(0,5).map(ev=>{const sm=dark?SM_DARK[ev.status]:SM_LIGHT[ev.status];return(<a key={ev.id} href={`/events/${ev.id}`} className={`group flex items-center gap-3 px-4 py-3 ${T.hover(dark)} transition-all`}><div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0"><img src={ev.image} alt={ev.title} className="w-full h-full object-cover"/></div><div className="flex-1 min-w-0"><div className={`${T.text2(dark)} text-[11px] font-bold line-clamp-1`}>{ev.title}</div><div className={`${T.text3(dark)} text-[9px] mt-0.5`}>{new Date(ev.date).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</div></div><span className={`text-[9px] font-black px-2 py-0.5 rounded-full flex-shrink-0 ${sm.bg} ${sm.text}`}>{sm.label}</span></a>);})}
              </div>
              {!selectedDay&&<div className={`px-4 py-3 border-t ${T.border(dark)} text-center ${T.text3(dark)} text-[10px]`}>Click a date on the calendar to see details</div>}
            </div>
          )}
          {/* Activity */}
          <div className={`${T.surface(dark)} border ${T.border(dark)} rounded-2xl overflow-hidden`}>
            <div className={`px-4 py-3.5 border-b ${T.border(dark)}`}><div className={`${T.text1(dark)} font-black text-sm`} style={{fontFamily:"'Playfair Display',Georgia,serif"}}>Recent Activity</div></div>
            <div className={`divide-y ${d(dark,"divide-white/5","divide-gray-100")}`}>
              {ACTIVITY.map(a=>(
                <div key={a.id} className={`flex items-start gap-3 px-4 py-3 ${T.hover(dark)} transition-all`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${dark?AC_DARK[a.kind]:AC_LIGHT[a.kind]}`}>{ACTIVITY_ICON[a.kind]}</div>
                  <div className="flex-1 min-w-0"><div className={`${T.text2(dark)} text-[11px] leading-relaxed`}>{a.text}</div><div className={`${T.text3(dark)} text-[9px] mt-0.5`}>{a.time}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── My Events — card grid with pagination ───────────────────────────── */}
      <div className={`${T.surface(dark)} border ${T.border(dark)} rounded-2xl overflow-hidden`}>
        {/* Header */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b ${T.border(dark)}`}>
          <div className="flex items-center gap-3">
            <h3 className={`${T.text1(dark)} font-black text-sm sm:text-base`} style={{fontFamily:"'Playfair Display',Georgia,serif"}}>My Events</h3>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${d(dark,"bg-white/8 text-white/40","bg-gray-100 text-gray-500")}`}>{filtered.length} total</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 ${d(dark,"bg-white/5 border-white/8","bg-gray-100 border-gray-200")} border rounded-xl p-1 overflow-x-auto`}>
              {(["all","live","upcoming","draft","ended"] as const).map(f=>(
                <button key={f} onClick={()=>handleFilter(f)}
                  className={`text-[10px] font-black capitalize px-2.5 sm:px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${evFilter===f?"bg-amber-500 text-white shadow-sm":`${T.text3(dark)} ${d(dark,"hover:text-white","hover:text-gray-700")}`}`}>{f}
                </button>
              ))}
            </div>
            <a href="/organizer/create_event" className={`flex items-center gap-1 text-[10px] font-black text-white bg-gradient-to-r from-amber-500 to-orange-600 px-2.5 py-1.5 rounded-xl hover:shadow-md transition-all whitespace-nowrap`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New
            </a>
          </div>
        </div>

        {/* Card grid */}
        <div className="p-4 sm:p-5">
          {paginated.length === 0 ? (
            <div className={`py-12 text-center ${T.text3(dark)} text-sm`}>No events found</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginated.map(ev => {
                const sm  = dark ? SM_DARK[ev.status] : SM_LIGHT[ev.status];
                const tc  = TYPE_META[ev.type] ?? TYPE_META.default;
                const occ = pct(ev.rsvps, ev.capacity);
                return (
                  <div key={ev.id} className={`${d(dark,"bg-white/4 border-white/8","bg-gray-50 border-gray-200")} border rounded-2xl overflow-hidden group hover:-translate-y-0.5 transition-all hover:shadow-lg`}>
                    {/* Image */}
                    <div className="relative h-32 overflow-hidden">
                      <img src={ev.image} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
                      <span className={`absolute top-2.5 left-2.5 inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm ${sm.bg} ${sm.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sm.dot} ${ev.status==="live"?"animate-pulse":""}`}/>{sm.label}
                      </span>
                      <span className={`absolute top-2.5 right-2.5 inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm ${tc.bg} ${tc.text}`}>
                        {ev.type}
                      </span>
                    </div>
                    {/* Content */}
                    <div className="p-3.5">
                      <h4 className={`${T.text1(dark)} font-bold text-xs leading-snug line-clamp-2 mb-1`}>{ev.title}</h4>
                      <p className={`${T.text3(dark)} text-[10px] mb-2.5`}>{ev.venue.split(",")[0]} · {new Date(ev.date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</p>
                      {/* Occupancy */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`${T.text3(dark)} text-[10px]`}>{ev.rsvps.toLocaleString()} RSVPs</span>
                        <span className={`${T.text3(dark)} text-[10px] font-bold`}>{occ}%</span>
                      </div>
                      <div className={`h-1 ${d(dark,"bg-white/8","bg-gray-200")} rounded-full overflow-hidden mb-3`}>
                        <div className="h-full rounded-full transition-all" style={{width:`${occ}%`,background:occ>=90?"#f87171":occ>=70?"#fbbf24":"#34d399"}}/>
                      </div>
                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <span className={`${T.text2(dark)} text-xs font-bold`}>{ev.revenue ? fmt(ev.revenue) : "Free"}</span>
                        <div className="flex gap-1.5">
                          {ev.status === "draft" && (() => {
                            const hoursLeft = (new Date(rawEvents.find(r=>String(r.id)===ev.id)?.startTime??0).getTime() - Date.now()) / 3600000;
                            const canPublish = hoursLeft >= 48;
                            return (
                              <button
                                onClick={() => onPublish(ev.id)}
                                title={canPublish ? "Publish event" : `Start time must be ≥ 48h from now (${Math.max(0,Math.ceil(hoursLeft))}h remaining)`}
                                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all
                                  ${canPublish
                                    ? "text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-md hover:shadow-amber-400/30 hover:scale-[1.02] ring-1 ring-amber-400/60 ring-offset-1 ring-offset-transparent animate-pulse-ring"
                                    : d(dark,"text-white/30 bg-white/6 border border-white/10 cursor-not-allowed","text-stone-400 bg-stone-100 border border-stone-200 cursor-not-allowed")
                                  }`}>
                                {canPublish
                                  ? <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12l5 5L20 7"/></svg>Publish</>
                                  : <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>~{Math.max(0,Math.ceil(hoursLeft))}h</>
                                }
                              </button>
                            );
                          })()}
                          <a href={`/events/${ev.id}`} className={`w-7 h-7 rounded-lg ${d(dark,"bg-white/6 text-white/40 hover:text-white hover:bg-white/12","bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900 border border-gray-200")} flex items-center justify-center transition-all`}>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          </a>
                          <a href={`/organizer/update-event/${ev.id}`} className={`w-7 h-7 rounded-lg ${d(dark,"bg-white/6 text-white/40 hover:text-white hover:bg-white/12","bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900 border border-gray-200")} flex items-center justify-center transition-all`}>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-dashed border-opacity-50"
              style={{borderColor: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}}>
              {/* Info */}
              <span className={`${T.text3(dark)} text-[11px]`}>
                Showing <span className={`${T.text2(dark)} font-bold`}>{(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE,filtered.length)}</span> of <span className={`${T.text2(dark)} font-bold`}>{filtered.length}</span>
              </span>
              {/* Controls */}
              <div className="flex items-center gap-1">
                {/* Prev */}
                <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed ${d(dark,"text-white/50 hover:text-white hover:bg-white/8","text-gray-500 hover:text-gray-900 hover:bg-gray-100")}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6"/></svg>
                </button>
                {/* Page numbers */}
                {Array.from({length: totalPages}, (_,i) => i+1).map(p => (
                  <button key={p} onClick={()=>setPage(p)}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                      p === page
                        ? "bg-amber-500 text-white shadow-sm shadow-amber-500/30"
                        : `${T.text3(dark)} ${d(dark,"hover:text-white hover:bg-white/8","hover:text-gray-900 hover:bg-gray-100")}`
                    }`}>
                    {p}
                  </button>
                ))}
                {/* Next */}
                <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed ${d(dark,"text-white/50 hover:text-white hover:bg-white/8","text-gray-500 hover:text-gray-900 hover:bg-gray-100")}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
        <div className={`${T.surface(dark)} border ${T.border(dark)} rounded-2xl p-4 sm:p-5`}>
          <h3 className={`${T.text1(dark)} font-black text-sm mb-5`} style={{fontFamily:"'Playfair Display',Georgia,serif"}}>Top Event Categories</h3>
          <div className="space-y-3.5">
            {[{type:"Music",total:EVENTS.filter(e=>e.type==="Music").reduce((s,e)=>s+e.rsvps,0)},{type:"Tech",total:EVENTS.filter(e=>e.type==="Tech").reduce((s,e)=>s+e.rsvps,0)},{type:"Festival",total:EVENTS.filter(e=>e.type==="Festival").reduce((s,e)=>s+e.rsvps,0)},{type:"Conference",total:EVENTS.filter(e=>e.type==="Conference").reduce((s,e)=>s+e.rsvps,0)}].map(cat=>{
              const tc=TYPE_META[cat.type]??TYPE_META.default;const w=Math.min(100,(cat.total/20000)*100);
              return(<div key={cat.type} className="flex items-center gap-3"><span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black flex-shrink-0 ${tc.bg} ${tc.text}`}>{cat.type[0]}</span><div className="flex-1 min-w-0"><div className="flex items-center justify-between mb-1"><span className={`${T.text2(dark)} text-xs font-semibold`}>{cat.type}</span><span className={`${T.text3(dark)} text-[10px]`}>{cat.total.toLocaleString()} RSVPs</span></div><div className={`h-1.5 ${d(dark,"bg-white/8","bg-gray-200")} rounded-full overflow-hidden`}><div className="h-full rounded-full" style={{width:`${w}%`,background:tc.hex}}/></div></div></div>);
            })}
          </div>
        </div>
        <div className={`${T.surface(dark)} border ${T.border(dark)} rounded-2xl p-4 sm:p-5`}>
          <div className="flex items-start justify-between mb-5">
            <h3 className={`${T.text1(dark)} font-black text-sm`} style={{fontFamily:"'Playfair Display',Georgia,serif"}}>Audience Growth</h3>
            <span className={`text-[10px] font-black ${d(dark,"text-emerald-400 bg-emerald-400/12","text-emerald-700 bg-emerald-100")} px-2 py-0.5 rounded-full`}>+18% MoM</span>
          </div>
          <div className="flex items-end gap-1 sm:gap-2 h-20 sm:h-24 mb-2">
            {[820,1100,980,1450,1200,1800,1600,2100,1900,2400,2200,2800].map((v,i)=>{const p2=Math.round((v/2800)*100);const isLast=i===11;return(<div key={i} className="flex-1 flex flex-col justify-end"><div className="rounded-sm w-full" style={{height:`${p2}%`,background:isLast?"#f59e0b":i>=9?"rgba(245,158,11,0.5)":dark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.05)"}}/></div>);})}
          </div>
          <div className="flex items-center justify-between">
            {["A","S","O","N","D","J","F","M","A","M","J","J"].map((m,i)=><span key={i} className={`flex-1 text-center ${T.text3(dark)} text-[9px] font-bold`}>{m}</span>)}
          </div>
          <div className={`flex items-center gap-4 mt-4 pt-4 border-t ${T.border(dark)}`}>
            {[{v:"28.4K",l:"Total reach"},{v:"73%",l:"Return rate"},{v:"4.8★",l:"Avg. rating"}].map(s=>(
              <div key={s.l}><div className={`${T.text1(dark)} font-black text-base sm:text-lg leading-none`} style={{fontFamily:"'Playfair Display',Georgia,serif"}}>{s.v}</div><div className={`${T.text3(dark)} text-[10px] mt-0.5`}>{s.l}</div></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Audience Tab ─────────────────────────────────────────────────────────────
function TabAudience({ dark }: { dark: boolean }) {
  const { events: rawEvents } = useOrganizerEvents();
  const EVENTS = useMemo(() => rawEvents.map(mapEvent), [rawEvents]);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalRsvps        = EVENTS.reduce((s, e) => s + e.rsvps, 0);
  const upcomingAttendees = EVENTS.filter(e => e.status === "upcoming" || e.status === "live")
                                  .reduce((s, e) => s + e.rsvps, 0);
  const publishedEvents   = EVENTS.filter(e => e.status !== "draft").length;
  const draftEvents       = EVENTS.filter(e => e.status === "draft").length;

  // Bar chart data — top 8 by RSVP
  const chartData = [...EVENTS]
    .filter(e => e.rsvps > 0)
    .sort((a, b) => b.rsvps - a.rsvps)
    .slice(0, 8);
  const maxRsvp = chartData[0]?.rsvps || 1;

  // ── Stat card config ───────────────────────────────────────────────────────
  const stats = [
    {
      label: "Total RSVPs",
      value: totalRsvps.toLocaleString(),
      sub: "across all events",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87"/>
          <path d="M16 3.13a4 4 0 010 7.75"/>
        </svg>
      ),
      accent: "#f59e0b",
      accentBg: dark ? "rgba(245,158,11,0.10)" : "rgba(245,158,11,0.08)",
      accentBorder: dark ? "rgba(245,158,11,0.20)" : "rgba(245,158,11,0.25)",
    },
    {
      label: "Upcoming Attendees",
      value: upcomingAttendees.toLocaleString(),
      sub: "live + upcoming events",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
      accent: "#34d399",
      accentBg: dark ? "rgba(52,211,153,0.10)" : "rgba(52,211,153,0.08)",
      accentBorder: dark ? "rgba(52,211,153,0.20)" : "rgba(52,211,153,0.25)",
    },
    {
      label: "Published Events",
      value: String(publishedEvents),
      sub: "visible to attendees",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ),
      accent: "#60a5fa",
      accentBg: dark ? "rgba(96,165,250,0.10)" : "rgba(96,165,250,0.08)",
      accentBorder: dark ? "rgba(96,165,250,0.20)" : "rgba(96,165,250,0.25)",
    },
    {
      label: "Draft Events",
      value: String(draftEvents),
      sub: "not yet published",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      ),
      accent: dark ? "rgba(255,255,255,0.35)" : "#9ca3af",
      accentBg: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
      accentBorder: dark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)",
    },
  ];

  return (
    <div className="space-y-6">

      {/* ── Page heading ─────────────────────────────────────────────────── */}
      <div>
        <p className="text-[10px] font-black tracking-widest uppercase mb-1" style={{ color: "#f59e0b" }}>
          Overview
        </p>
        <h2
          className={`text-2xl font-black ${T.text1(dark)}`}
          style={{ fontFamily: "'Playfair Display',Georgia,serif" }}
        >
          Audience
        </h2>
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`${T.surface(dark)} border ${T.border(dark)} rounded-2xl p-4 sm:p-5 flex flex-col gap-3
              hover:-translate-y-0.5 hover:shadow-xl transition-all`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {/* Icon */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: s.accentBg, border: `1px solid ${s.accentBorder}`, color: s.accent }}
            >
              {s.icon}
            </div>
            {/* Value */}
            <div>
              <div
                className="font-black text-xl sm:text-2xl leading-none mb-1"
                style={{ color: s.accent, fontFamily: "'Playfair Display',Georgia,serif" }}
              >
                {s.value}
              </div>
              <div className={`${T.text3(dark)} text-[10px] font-bold`}>{s.label}</div>
            </div>
            {/* Sub */}
            <div className={`${T.text3(dark)} text-[10px]`}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Bar chart: RSVPs by Event ─────────────────────────────────────── */}
      <div className={`${T.surface(dark)} border ${T.border(dark)} rounded-2xl overflow-hidden`}>

        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${T.border(dark)}`}>
          <div>
            <h3
              className={`${T.text1(dark)} font-black text-sm sm:text-base`}
              style={{ fontFamily: "'Playfair Display',Georgia,serif" }}
            >
              RSVP Count by Event
            </h3>
            <p className={`${T.text3(dark)} text-[10px] mt-0.5`}>Top events sorted by attendance</p>
          </div>
          <span
            className={`text-[10px] font-black px-2.5 py-1 rounded-full
              ${d(dark, "bg-white/6 text-white/35 border border-white/10", "bg-gray-100 text-gray-400 border border-gray-200")}`}
          >
            {chartData.length} events
          </span>
        </div>

        {/* Chart body */}
        <div className="p-4 sm:p-6">
          {chartData.length === 0 ? (
            <div className={`py-16 text-center ${T.text3(dark)} text-sm`}>No RSVP data yet</div>
          ) : (
            <div className="space-y-3">
              {chartData.map((ev, i) => {
                const barPct   = Math.round((ev.rsvps / maxRsvp) * 100);
                const tc       = TYPE_META[ev.type] ?? TYPE_META.default;
                const isTop    = i === 0;
                // Bar color: top bar = amber gradient, rest = type color faded
                const barBg    = isTop
                  ? "linear-gradient(90deg,#f59e0b,#fb923c)"
                  : dark
                    ? `${tc.hex}55`
                    : `${tc.hex}40`;

                return (
                  <div key={ev.id} className="group">
                    {/* Label row */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        {/* Rank */}
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black flex-shrink-0
                            ${isTop
                              ? "bg-amber-500 text-white"
                              : d(dark, "bg-white/6 text-white/30", "bg-gray-100 text-gray-400")
                            }`}
                        >
                          {i + 1}
                        </span>
                        {/* Thumbnail */}
                        <div className="w-6 h-6 rounded-md overflow-hidden flex-shrink-0">
                          <img src={ev.image} alt={ev.title} className="w-full h-full object-cover"/>
                        </div>
                        {/* Title */}
                        <span
                          className={`text-xs font-semibold truncate ${T.text2(dark)}
                            ${d(dark, "group-hover:text-white", "group-hover:text-gray-900")} transition-colors`}
                        >
                          {ev.title}
                        </span>
                      </div>
                      {/* Count + type badge */}
                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        <span
                          className={`hidden sm:inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full
                            ${tc.bg} ${tc.text}`}
                        >
                          <span className={`w-1 h-1 rounded-full ${tc.dot}`}/>
                          {ev.type}
                        </span>
                        <span
                          className={`text-xs font-black ${isTop ? "text-amber-500" : T.text2(dark)}`}
                          style={{ fontFamily: "'Playfair Display',Georgia,serif" }}
                        >
                          {ev.rsvps.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Bar track */}
                    <div
                      className={`h-2 rounded-full overflow-hidden
                        ${d(dark, "bg-white/6", "bg-gray-100")}`}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${barPct}%`,
                          background: barBg,
                          transitionDelay: `${i * 50}ms`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer: capacity context */}
        {chartData.length > 0 && (
          <div className={`px-5 py-3 border-t ${T.border(dark)} flex flex-wrap items-center gap-x-5 gap-y-1`}>
            <span className={`${T.text3(dark)} text-[10px]`}>
              Top event: <span className={`font-black ${d(dark, "text-amber-400", "text-amber-600")}`}>{chartData[0].title.length > 28 ? chartData[0].title.slice(0,28)+"…" : chartData[0].title}</span>
            </span>
            <span className={`${T.text3(dark)} text-[10px]`}>
              Total shown: <span className={`font-bold ${T.text2(dark)}`}>{chartData.reduce((s,e)=>s+e.rsvps,0).toLocaleString()} RSVPs</span>
            </span>
          </div>
        )}
      </div>

    </div>
  );
}

// ─── Revenue Tab ──────────────────────────────────────────────────────────────
function TabRevenue({ dark }: { dark: boolean }) {
  return (
    <div className="relative min-h-[70vh] flex flex-col items-center justify-center overflow-hidden select-none">

      {/* Ambient blobs */}
      <div className={`absolute -top-20 -left-20 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none ${dark ? "bg-amber-500" : "bg-amber-300"}`}/>
      <div className={`absolute -bottom-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none ${dark ? "bg-orange-600" : "bg-orange-300"}`}/>

      {/* Decorative grid lines */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: dark
          ? "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)"
          : "linear-gradient(rgba(0,0,0,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.04) 1px,transparent 1px)",
        backgroundSize: "48px 48px",
      }}/>

      {/* Central card */}
      <div className={`relative z-10 flex flex-col items-center text-center px-8 py-12 rounded-3xl border max-w-md w-full mx-4
        ${dark ? "bg-[#13151f]/80 border-white/8 backdrop-blur-xl" : "bg-white/90 border-gray-200 backdrop-blur-xl shadow-xl shadow-gray-200/60"}`}>

        {/* Icon lockup */}
        <div className="relative mb-7">
          {/* Outer ring */}
          <div className={`w-24 h-24 rounded-3xl flex items-center justify-center
            ${dark ? "bg-amber-400/10 border border-amber-400/20" : "bg-amber-50 border border-amber-200"}`}>
            {/* Coin stack icon */}
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <ellipse cx="20" cy="30" rx="12" ry="4" fill={dark ? "rgba(251,191,36,0.15)" : "rgba(251,191,36,0.2)"}/>
              <rect x="8" y="18" width="24" height="8" rx="4" fill={dark ? "rgba(251,191,36,0.25)" : "rgba(251,191,36,0.35)"}/>
              <rect x="8" y="18" width="24" height="4" rx="4" fill={dark ? "rgba(251,191,36,0.4)" : "rgba(245,158,11,0.5)"}/>
              <ellipse cx="20" cy="14" rx="12" ry="4" fill={dark ? "rgba(251,191,36,0.6)" : "#f59e0b"}/>
              <text x="20" y="18" textAnchor="middle" fontSize="7" fontWeight="900" fill={dark ? "#0c0e1a" : "#fff"} fontFamily="Georgia,serif">₹</text>
            </svg>
          </div>
          {/* Floating badge */}
          <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-400/40">
            <svg width="12" height="12" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
        </div>

        {/* Label pill */}
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-4
          ${dark ? "bg-amber-400/10 border border-amber-400/20 text-amber-400" : "bg-amber-100 border border-amber-200 text-amber-700"}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"/>
          Coming Soon
        </div>

        {/* Heading */}
        <h2 className={`font-black text-2xl sm:text-3xl mb-3 ${dark ? "text-white" : "text-gray-900"}`}
          style={{fontFamily:"'Playfair Display',Georgia,serif"}}>
          Revenue Analytics
        </h2>

        {/* Description */}
        <p className={`text-sm leading-relaxed mb-8 ${dark ? "text-white/45" : "text-gray-500"}`}>
          Detailed payout reports, ticket sales breakdowns, and month-over-month revenue trends are on their way.
        </p>

        {/* Feature teasers */}
        <div className="w-full space-y-2.5 mb-8">
          {[
            { icon: "₹", label: "Payout history & processing status" },
            { icon: "📊", label: "Per-event revenue breakdown" },
            { icon: "📈", label: "Month-over-month trend charts" },
            { icon: "🧾", label: "Downloadable invoices & receipts" },
          ].map((f, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left
              ${dark ? "bg-white/4 border border-white/6" : "bg-gray-50 border border-gray-100"}`}>
              <span className="text-base leading-none">{f.icon}</span>
              <span className={`text-xs font-semibold ${dark ? "text-white/50" : "text-gray-500"}`}>{f.label}</span>
              <span className={`ml-auto text-[9px] font-black px-2 py-0.5 rounded-full
                ${dark ? "bg-white/6 text-white/25" : "bg-gray-200 text-gray-400"}`}>Soon</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <a href="/organizer/subscriptions"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black text-stone-900 bg-gradient-to-r from-amber-400 to-orange-500 hover:shadow-lg hover:shadow-amber-400/30 hover:scale-[1.01] transition-all">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
          Notify me when it's ready
        </a>
      </div>

      {/* Floating ghost stat cards for atmosphere */}
      <div className={`hidden sm:block absolute top-12 left-8 px-4 py-3 rounded-2xl border pointer-events-none opacity-30
        ${dark ? "bg-[#13151f] border-white/8" : "bg-white border-gray-200 shadow-sm"}`}>
        <div className={`text-[9px] font-black tracking-widest uppercase mb-1 ${dark ? "text-white/25" : "text-gray-400"}`}>Total Revenue</div>
        <div className={`text-lg font-black blur-[6px] ${dark ? "text-white" : "text-gray-900"}`} style={{fontFamily:"'Playfair Display',serif"}}>₹24.6L</div>
      </div>
      <div className={`hidden sm:block absolute bottom-16 right-10 px-4 py-3 rounded-2xl border pointer-events-none opacity-20
        ${dark ? "bg-[#13151f] border-white/8" : "bg-white border-gray-200 shadow-sm"}`}>
        <div className={`text-[9px] font-black tracking-widest uppercase mb-1 ${dark ? "text-white/25" : "text-gray-400"}`}>Pending Payout</div>
        <div className={`text-lg font-black blur-[6px] ${dark ? "text-white" : "text-gray-900"}`} style={{fontFamily:"'Playfair Display',serif"}}>₹1.2L</div>
      </div>

    </div>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────
function TabAnalytics({ dark }: { dark: boolean }) {
  const { events: rawEvents } = useOrganizerEvents();
  const EVENTS = useMemo(() => rawEvents.map(mapEvent), [rawEvents]);
  return (
    <div className="space-y-5">
      <h2 className={`${T.text1(dark)} font-black text-lg sm:text-xl`} style={{fontFamily:"'Playfair Display',Georgia,serif"}}>Analytics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <div className={`${T.surface(dark)} border ${T.border(dark)} rounded-2xl p-4 sm:p-5`}>
          <div className="flex items-start justify-between mb-5">
            <h3 className={`${T.text1(dark)} font-black text-sm`} style={{fontFamily:"'Playfair Display',Georgia,serif"}}>Audience Growth</h3>
            <span className={`text-[10px] font-black ${d(dark,"text-emerald-400 bg-emerald-400/12","text-emerald-700 bg-emerald-100")} px-2 py-0.5 rounded-full`}>+18% MoM</span>
          </div>
          <div className="flex items-end gap-1 sm:gap-2 h-24 mb-2">
            {[820,1100,980,1450,1200,1800,1600,2100,1900,2400,2200,2800].map((v,i)=>{const p2=Math.round((v/2800)*100);const isLast=i===11;return<div key={i} className="flex-1 flex flex-col justify-end"><div className="rounded-sm w-full" style={{height:`${p2}%`,background:isLast?"#f59e0b":i>=9?"rgba(245,158,11,0.5)":dark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.05)"}}/></div>;})}
          </div>
          <div className="flex items-center justify-between">
            {["A","S","O","N","D","J","F","M","A","M","J","J"].map((m,i)=><span key={i} className={`flex-1 text-center ${T.text3(dark)} text-[9px] font-bold`}>{m}</span>)}
          </div>
        </div>
        <div className={`${T.surface(dark)} border ${T.border(dark)} rounded-2xl p-4 sm:p-5`}>
          <h3 className={`${T.text1(dark)} font-black text-sm mb-5`} style={{fontFamily:"'Playfair Display',Georgia,serif"}}>Event Type Breakdown</h3>
          <div className="space-y-3">
            {[{type:"Music",count:2},{type:"Tech",count:1},{type:"Festival",count:1},{type:"Conference",count:1},{type:"Workshop",count:1},{type:"Networking",count:1}].map(({type,count})=>{
              const tc=TYPE_META[type]??TYPE_META.default;
              return(
                <div key={type} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black flex-shrink-0 ${tc.bg} ${tc.text}`}>{type[0]}</span>
                  <div className="flex-1"><div className="flex items-center justify-between mb-1"><span className={`${T.text2(dark)} text-xs font-semibold`}>{type}</span><span className={`${T.text3(dark)} text-[10px]`}>{count} events</span></div><div className={`h-1.5 ${d(dark,"bg-white/8","bg-gray-100")} rounded-full overflow-hidden`}><div className="h-full rounded-full" style={{width:`${(count/EVENTS.length)*100}%`,background:tc.hex}}/></div></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className={`${T.surface(dark)} border ${T.border(dark)} rounded-2xl p-4 sm:p-5`}>
        <h3 className={`${T.text1(dark)} font-black text-sm mb-5`} style={{fontFamily:"'Playfair Display',Georgia,serif"}}>Performance Overview</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[{label:"Avg. Fill Rate",value:`${pct(EVENTS.reduce((s,e)=>s+e.rsvps,0),EVENTS.reduce((s,e)=>s+e.capacity,0))}%`,desc:"of capacity filled"},{label:"Live Events",value:String(EVENTS.filter(e=>e.status==="live").length),desc:"currently running"},{label:"Upcoming",value:String(EVENTS.filter(e=>e.status==="upcoming").length),desc:"scheduled events"},{label:"Completed",value:String(EVENTS.filter(e=>e.status==="ended").length),desc:"events ended"}].map(s=>(
            <div key={s.label} className={`${d(dark,"bg-white/4","bg-gray-50")} rounded-xl p-3 sm:p-4 text-center`}>
              <div className={`${T.text1(dark)} font-black text-xl sm:text-2xl mb-1`} style={{fontFamily:"'Playfair Display',Georgia,serif"}}>{s.value}</div>
              <div className={`${T.text2(dark)} text-[10px] sm:text-xs font-bold`}>{s.label}</div>
              <div className={`${T.text3(dark)} text-[9px] mt-0.5`}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────

// ─── Drop-in replacement for TabSettings in dashboard/page.tsx ────────────────
// Replace the existing TabSettings function entirely with this one.
// Props: { dark, onToggleDark, onOpenAssistant? }



function TabSettings({
  dark,
  onToggleDark,
  onOpenAssistant,
}: {
  dark: boolean;
  onToggleDark: () => void;
  onOpenAssistant?: () => void;
}) {
  const name        = useOrganizerAuth((s) => s.name);
  const email       = useOrganizerAuth((s) => s.email);
  const bio         = useOrganizerAuth((s) => s.bio);
  const location    = useOrganizerAuth((s) => s.location);
  const profilePic  = useOrganizerAuth((s) => s.profilePic);
  const subscription = useOrganizerSubscription();
  const { logout }  = useOrganizerLogout();

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ── Palette ──────────────────────────────────────────────────────────────────
  const surface   = d(dark, "#13151f", "#ffffff");
  const surface2  = d(dark, "#1a1d2e", "#f5f5f4");
  const border    = d(dark, "rgba(255,255,255,0.07)", "#e7e5e4");
  const text1     = d(dark, "#ffffff", "#1c1917");
  const text2     = d(dark, "rgba(255,255,255,0.6)", "#57534e");
  const text3     = d(dark, "rgba(255,255,255,0.3)", "#a8a29e");

  const plan      = subscription?.plan ?? "FREE";
  const remaining = subscription?.aiCreditsRemaining ?? 0;
  const total     = subscription?.aiCreditsTotal ?? 10;
  const active    = subscription?.canUseAI ?? false;
  const limit     = (subscription as any)?.promptCharacterLimit ?? 300;
  const isPro     = plan === "PRO";
  const pct       = total > 0 ? Math.round((remaining / total) * 100) : 0;
  const credColor = remaining === 0 ? "#ef4444" : remaining <= 3 ? "#f59e0b" : "#fbbf24";

  // ── Section wrapper ───────────────────────────────────────────────────────────
  const Section = ({
    title, icon, children,
  }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: surface, border: `1px solid ${border}` }}>
      <div className="flex items-center gap-3 px-5 py-4"
        style={{ borderBottom: `1px solid ${border}` }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)" }}>
          <span style={{ color: "#fbbf24" }}>{icon}</span>
        </div>
        <h3 className="text-sm font-black" style={{ color: text1, fontFamily: "'DM Serif Display',Georgia,serif" }}>
          {title}
        </h3>
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  );

  // ── Row (label + right content) ───────────────────────────────────────────────
  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between py-3.5"
      style={{ borderBottom: `1px solid ${border}` }}>
      <span className="text-xs font-semibold" style={{ color: text3 }}>{label}</span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );

  return (
    <div className="space-y-5 max-w-2xl">

      {/* Page heading */}
      <div className="mb-2">
        <p className="text-[10px] font-black tracking-widest uppercase mb-1" style={{ color: "#f59e0b" }}>
          Account
        </p>
        <h2 className="text-2xl font-black" style={{ fontFamily: "'DM Serif Display',Georgia,serif", color: text1 }}>
          Settings
        </h2>
      </div>

      {/* ── 1. Profile ── */}
      <Section title="Profile" icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      }>
        {/* Avatar + name row */}
        <div className="flex items-center gap-4 mb-5 pb-5" style={{ borderBottom: `1px solid ${border}` }}>
          <div className="relative flex-shrink-0">
            {profilePic
              ? <img src={profilePic} alt={name ?? ""} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-400/20"/>
              : <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-amber-400 font-black text-2xl ring-2 ring-amber-400/20"
                  style={{ background: "rgba(251,191,36,0.08)", fontFamily: "'DM Serif Display',serif" }}>
                  {name?.charAt(0) ?? "O"}
                </div>
            }
            {/* Online dot */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 bg-emerald-500"
              style={{ borderColor: surface }}/>
          </div>
          <div className="min-w-0">
            <p className="font-black text-base leading-tight truncate" style={{ color: text1, fontFamily: "'DM Serif Display',serif" }}>
              {name ?? "Organizer"}
            </p>
            <p className="text-xs mt-0.5 truncate" style={{ color: text3 }}>{email ?? ""}</p>
            {location && (
              <div className="flex items-center gap-1 mt-1">
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" style={{ color: text3 }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <span className="text-[11px] truncate" style={{ color: text3 }}>{location}</span>
              </div>
            )}
          </div>
          <div className="ml-auto flex-shrink-0">
            <span className="text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full"
              style={{ background: surface2, border: `1px solid ${border}`, color: text3 }}>
              Read-only
            </span>
          </div>
        </div>

        {bio && (
          <div className="rounded-xl px-4 py-3" style={{ background: surface2, border: `1px solid ${border}` }}>
            <p className="text-[10px] font-black tracking-widest uppercase mb-1.5" style={{ color: text3 }}>Bio</p>
            <p className="text-xs leading-relaxed" style={{ color: text2 }}>{bio}</p>
          </div>
        )}

        <p className="text-[10px] mt-4" style={{ color: text3 }}>
          Profile editing is coming in a future update. Contact support to update your details.
        </p>
      </Section>

      {/* ── 2. Subscription ── */}
      <Section title="Subscription" icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
      }>
        {/* Plan badge */}
        <div className="flex items-center justify-between mb-5 pb-5" style={{ borderBottom: `1px solid ${border}` }}>
          <div>
            <p className="text-[10px] font-black tracking-widest uppercase mb-1" style={{ color: text3 }}>Current Plan</p>
            <div className="flex items-center gap-2">
              {isPro && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              )}
              <span className="text-xl font-black" style={{ fontFamily: "'DM Serif Display',serif", color: isPro ? "#fbbf24" : text1 }}>
                {plan}
              </span>
              <span className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full"
                style={{ background: active ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)", color: active ? "#34d399" : "#ef4444", border: `1px solid ${active ? "rgba(52,211,153,0.2)" : "rgba(239,68,68,0.2)"}` }}>
                {active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
          {!isPro && (
            <a href="/organizer/subscriptions"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black text-stone-900 transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#f59e0b,#fbbf24)" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              Upgrade to Pro
            </a>
          )}
        </div>

        {/* AI credits */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black tracking-widest uppercase" style={{ color: text3 }}>
              AI Credits this month
            </p>
            <span className="text-xs font-black" style={{ color: credColor }}>
              {remaining} / {total} remaining
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: surface2 }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: remaining === 0 ? "#ef4444"
                  : remaining <= 3 ? "linear-gradient(90deg,#f59e0b,#fbbf24)"
                  : "linear-gradient(90deg,#f59e0b,#fbbf24)",
              }}/>
          </div>
          {remaining === 0 && (
            <p className="text-[10px] mt-1.5 text-red-400">Credits exhausted — resets on the 1st of next month</p>
          )}
        </div>

        {/* Stat rows */}
        <div style={{ borderTop: `1px solid ${border}` }}>
          <Row label="Monthly credits total">
            <span className="text-xs font-black" style={{ color: text1 }}>{total}</span>
          </Row>
          <Row label="Prompt character limit">
            <span className="text-xs font-black" style={{ color: text1 }}>{limit} chars</span>
          </Row>
          <Row label="Credits reset">
            <span className="text-xs font-semibold" style={{ color: text2 }}>1st of every month</span>
          </Row>
          <div className="flex items-center justify-between pt-3.5">
            <span className="text-xs font-semibold" style={{ color: text3 }}>View full plan details</span>
            <a href="/organizer/subscriptions"
              className="text-xs font-black flex items-center gap-1 transition-colors"
              style={{ color: "#fbbf24" }}>
              Manage subscription
              <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/>
              </svg>
            </a>
          </div>
        </div>
      </Section>

      {/* ── 3. Appearance ── */}
      <Section title="Appearance" icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
      }>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold" style={{ color: text1 }}>Dark mode</p>
            <p className="text-[11px] mt-0.5" style={{ color: text3 }}>
              {dark ? "Currently using dark theme" : "Currently using light theme"}
            </p>
          </div>
          {/* Toggle */}
          <button onClick={onToggleDark}
            className="relative flex-shrink-0 transition-all duration-300"
            style={{
              width: 48, height: 26, borderRadius: 99,
              background: dark ? "rgba(251,191,36,0.15)" : surface2,
              border: `1.5px solid ${dark ? "rgba(251,191,36,0.3)" : border}`,
            }}>
            <span className="absolute text-[10px]" style={{ left: 7, top: "50%", transform: "translateY(-50%)", opacity: dark ? 1 : 0, transition: "opacity .2s" }}>🌙</span>
            <span className="absolute text-[10px]" style={{ right: 7, top: "50%", transform: "translateY(-50%)", opacity: dark ? 0 : 1, transition: "opacity .2s" }}>☀️</span>
            <div className="absolute top-0.5 w-5 h-5 rounded-full shadow transition-all duration-300"
              style={{
                transform: dark ? "translateX(24px)" : "translateX(2px)",
                background: dark ? "#fbbf24" : "#fff",
              }}/>
          </button>
        </div>
      </Section>

      {/* ── 4. AI Assistant ── */}
      <Section title="AI Assistant" icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="7" y="7" width="10" height="10" rx="2"/>
          <line x1="7" y1="9.5" x2="4" y2="9.5"/><line x1="7" y1="12" x2="4" y2="12"/><line x1="7" y1="14.5" x2="4" y2="14.5"/>
          <line x1="17" y1="9.5" x2="20" y2="9.5"/><line x1="17" y1="12" x2="20" y2="12"/><line x1="17" y1="14.5" x2="20" y2="14.5"/>
        </svg>
      }>
        <div className="flex items-start gap-4">
          {/* Credit orb */}
          <div className="flex-shrink-0 w-16 h-16 rounded-2xl flex flex-col items-center justify-center"
            style={{ background: "rgba(251,191,36,0.06)", border: `1.5px solid rgba(251,191,36,0.2)` }}>
            <span className="text-xl font-black leading-none" style={{ color: credColor, fontFamily: "'DM Serif Display',serif" }}>
              {remaining}
            </span>
            <span className="text-[8px] font-black tracking-widest uppercase mt-0.5" style={{ color: "rgba(251,191,36,0.5)" }}>
              CREDITS
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold mb-1" style={{ color: text1 }}>
              AI-powered event tools
            </p>
            <p className="text-xs leading-relaxed mb-4" style={{ color: text2 }}>
              Generate event titles, descriptions, tags, and dates from a plain-English prompt. Your AI assistant can also list events, check your credits, and answer questions about your account.
            </p>
            <div className="flex items-center gap-2">
              {onOpenAssistant && (
                <button onClick={onOpenAssistant}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg,#1c1917,#292524)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                  </svg>
                  Open Assistant
                </button>
              )}
              <a href="/organizer/subscriptions"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-colors"
                style={{ background: surface2, border: `1px solid ${border}`, color: text3 }}>
                {remaining === 0 ? "Get more credits →" : "View usage →"}
              </a>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 5. Account ── */}
      <Section title="Account" icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      }>
        <div className="space-y-3">
          {/* Logout */}
          <div className="flex items-center justify-between py-3"
            style={{ borderBottom: `1px solid ${border}` }}>
            <div>
              <p className="text-sm font-bold" style={{ color: text1 }}>Sign out</p>
              <p className="text-[11px] mt-0.5" style={{ color: text3 }}>
                Sign out of your organizer account on this device
              </p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all hover:bg-rose-500 hover:text-white"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#ef4444",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign out
            </button>
          </div>

          {/* Delete account */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-bold text-red-500">Delete account</p>
              <p className="text-[11px] mt-0.5" style={{ color: text3 }}>
                Permanently delete your account and all event data
              </p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-colors"
              style={{
                background: surface2,
                border: `1px solid ${border}`,
                color: text3,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.08)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(239,68,68,0.2)";
                (e.currentTarget as HTMLButtonElement).style.color = "#ef4444";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = surface2;
                (e.currentTarget as HTMLButtonElement).style.borderColor = border;
                (e.currentTarget as HTMLButtonElement).style.color = text3;
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
              </svg>
              Delete
            </button>
          </div>
        </div>
      </Section>

      {/* ── Delete account confirmation modal ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(12px)" }}>
          <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: surface, border: `1px solid ${border}` }}>
            {/* Header */}
            <div className="px-6 pt-6 pb-5 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                  <path d="M10 11v6"/><path d="M14 11v6"/>
                </svg>
              </div>
              <h3 className="text-lg font-black mb-2"
                style={{ fontFamily: "'DM Serif Display',serif", color: text1 }}>
                Delete your account?
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: text2 }}>
                This will permanently delete your account, all events, and event data. This action cannot be undone.
              </p>
            </div>

            {/* Warning */}
            <div className="mx-6 mb-5 px-4 py-3 rounded-xl"
              style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
              <p className="text-[11px] text-red-400 leading-relaxed">
                ⚠ All published events, RSVPs, and organizer data will be lost permanently.
              </p>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 rounded-xl text-sm font-bold transition-colors"
                style={{ background: surface2, border: `1px solid ${border}`, color: text2 }}>
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  // TODO: call delete account API
                }}
                className="flex-1 py-3 rounded-xl text-sm font-black text-white transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#dc2626,#ef4444)" }}>
                Delete account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// ─── Publish Modal ────────────────────────────────────────────────────────────
function PublishModal({ eventId, rawEvents, dark, onClose }: {
  eventId: string;
  rawEvents: import("@/services/eventimist/organizer/event/getOrganizerEvents.service").OrganizerEvent[];
  dark: boolean;
  onClose: () => void;
}) {
  const { publish, loading, error, reset } = usePublishEvent();
  const [published,   setPublished]   = useState(false);
  const [imgIdx,      setImgIdx]      = useState(0);

  const raw = rawEvents.find(e => String(e.id) === eventId);
  if (!raw) return null;

  const allImages = [
    ...(raw.coverImage ? [raw.coverImage] : []),
    ...(raw.images ?? []),
  ].filter((v, i, a) => a.indexOf(v) === i);

  const prev = () => setImgIdx(i => (i - 1 + allImages.length) % allImages.length);
  const next = () => setImgIdx(i => (i + 1) % allImages.length);

  const fmtDate = (dt: string) => new Date(dt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
  const fmtTime = (dt: string) => new Date(dt).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", hour12:true });

  const hoursUntilStart = (new Date(raw.startTime).getTime() - Date.now()) / 3600000;
  const canPublish      = hoursUntilStart >= 48;
  const hoursLeft       = Math.max(0, Math.ceil(hoursUntilStart));
  const minsLeft        = Math.max(0, Math.ceil((hoursUntilStart * 60) % 60));

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose}/>

      {/* Sheet */}
      <div className={`relative w-full sm:max-w-md rounded-t-[2rem] sm:rounded-2xl shadow-2xl overflow-hidden
        ${d(dark,"bg-[#0e1120]","bg-white")} border-t sm:border ${T.border(dark)}`}>

        {/* Mobile pill */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className={`w-8 h-1 rounded-full ${d(dark,"bg-white/15","bg-stone-200")}`}/>
        </div>

        {/* Image slider */}
        <div className="relative h-48 mx-4 mt-4 rounded-2xl overflow-hidden flex-shrink-0 group">
          {allImages.length > 0
            ? <img
                key={imgIdx}
                src={allImages[imgIdx]}
                alt={raw.title}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
            : <div className={`w-full h-full flex items-center justify-center ${d(dark,"bg-white/6","bg-stone-100")}`}>
                <svg className="w-10 h-10 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
          }
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"/>

          {/* Prev / Next buttons */}
          {allImages.length > 1 && (
            <>
              <button onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/70 transition-all">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6"/></svg>
              </button>
              <button onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/70 transition-all">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/></svg>
              </button>
            </>
          )}

          {/* Dot indicators */}
          {allImages.length > 1 && (
            <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-1">
              {allImages.map((_, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  className={`rounded-full transition-all duration-200 ${i === imgIdx ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"}`}/>
              ))}
            </div>
          )}

          {/* Image counter */}
          {allImages.length > 1 && (
            <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5 text-white text-[9px] font-black">
              {imgIdx + 1} / {allImages.length}
            </div>
          )}

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="inline-flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/30 backdrop-blur-sm rounded-full px-2.5 py-0.5 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"/>
              <span className="text-amber-300 text-[9px] font-black tracking-widest uppercase">Draft · Ready to publish</span>
            </div>
            <h3 className="text-white font-black text-base leading-snug line-clamp-2"
              style={{fontFamily:"'Playfair Display',Georgia,serif"}}>{raw.title}</h3>
          </div>

          {/* Close */}
          <button onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm text-white/70 hover:text-white hover:bg-black/60 flex items-center justify-center transition-all">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="p-4 space-y-3 max-h-[38vh] overflow-y-auto">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label:"Category", value: raw.category.charAt(0)+raw.category.slice(1).toLowerCase() },
              { label:"Mode",     value: raw.mode },
              { label:"Capacity", value: raw.capacity.toLocaleString() },
            ].map(s => (
              <div key={s.label} className={`rounded-xl p-2.5 text-center ${d(dark,"bg-white/5","bg-stone-50 border border-stone-100")}`}>
                <p className={`${T.text3(dark)} text-[9px] font-bold uppercase tracking-wider mb-0.5`}>{s.label}</p>
                <p className={`${T.text1(dark)} text-[11px] font-black`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Schedule */}
          <div className={`rounded-xl p-3 flex items-center gap-3 ${d(dark,"bg-white/5","bg-stone-50 border border-stone-100")}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${d(dark,"bg-amber-400/15","bg-amber-100")}`}>
              <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`${T.text3(dark)} text-[9px] font-bold uppercase tracking-wider`}>Schedule</p>
              <p className={`${T.text1(dark)} text-[11px] font-bold`}>{fmtDate(raw.startTime)} · {fmtTime(raw.startTime)} → {fmtTime(raw.endTime)}</p>
              <p className={`${T.text3(dark)} text-[9px]`}>{raw.timezone}</p>
            </div>
          </div>

          {/* Venue / link */}
          {(raw.venue || raw.onlineLink) && (
            <div className={`rounded-xl p-3 flex items-center gap-3 ${d(dark,"bg-white/5","bg-stone-50 border border-stone-100")}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${d(dark,"bg-amber-400/15","bg-amber-100")}`}>
                <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`${T.text3(dark)} text-[9px] font-bold uppercase tracking-wider`}>{raw.onlineLink ? "Online Link" : "Venue"}</p>
                <p className={`${T.text1(dark)} text-[11px] font-bold truncate`}>{raw.venue || raw.onlineLink}</p>
              </div>
            </div>
          )}

          {/* Description */}
          {raw.description && (
            <div className={`rounded-xl p-3 ${d(dark,"bg-white/5","bg-stone-50 border border-stone-100")}`}>
              <p className={`${T.text3(dark)} text-[9px] font-bold uppercase tracking-wider mb-1.5`}>About</p>
              <p className={`${T.text2(dark)} text-[11px] leading-relaxed line-clamp-3`}>{raw.description}</p>
            </div>
          )}

          {/* Tags */}
          {raw.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {raw.tags.map(tag => (
                <span key={tag} className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full
                  ${d(dark,"bg-white/6 text-white/50 border border-white/8","bg-stone-100 text-stone-500 border border-stone-200")}`}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Sticky footer */}
        <div className={`px-4 pb-5 pt-3 border-t ${T.border(dark)}`}>

          {/* Success state */}
          {published ? (
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-400/25">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              </div>
              <p className={`${T.text1(dark)} font-black text-sm`}>Published successfully!</p>
              <button onClick={onClose}
                className="w-full py-3 rounded-xl font-black text-sm text-white bg-gradient-to-r from-emerald-500 to-teal-500 transition-all">
                Done
              </button>
            </div>
          ) : (
            <>
              {/* API error */}
              {error && (
                <div className="flex items-start gap-2 mb-3 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <svg className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <p className="text-[10px] leading-relaxed text-rose-400">{error}</p>
                </div>
              )}

              {/* 48h warning or standard warning */}
              {!canPublish ? (
                <div className="flex items-start gap-2 mb-3 px-3 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <svg className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <p className="text-[10px] leading-relaxed text-rose-400">
                    Event must start at least <strong>48 hours from now</strong>. Currently {hoursLeft}h {minsLeft > 0 ? `${minsLeft}m ` : ""}away — update the start time to enable publishing.
                  </p>
                </div>
              ) : (
                <div className={`flex items-start gap-2 mb-3 px-3 py-2 rounded-xl ${d(dark,"bg-amber-400/8 border border-amber-400/15","bg-amber-50 border border-amber-200")}`}>
                  <svg className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                  <p className={`text-[10px] leading-relaxed ${d(dark,"text-amber-400/80","text-amber-700")}`}>
                    This event becomes visible to all users immediately after publishing.
                  </p>
                </div>
              )}

              <div className="flex gap-2.5">
                <button onClick={onClose} disabled={loading}
                  className={`flex-none px-4 py-3 rounded-xl text-xs font-bold transition-all border disabled:opacity-40
                    ${d(dark,"border-white/10 text-white/50 hover:text-white hover:bg-white/6","border-stone-200 text-stone-500 hover:text-stone-800 hover:bg-stone-50")}`}>
                  Cancel
                </button>
                <button
                  disabled={loading || !canPublish}
                  onClick={async () => {
                    reset();
                    const result = await publish(raw.id);
                    if (result) setPublished(true);
                  }}
                  className={`flex-1 py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2
                    ${canPublish
                      ? "text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:shadow-lg hover:shadow-amber-500/25 hover:scale-[1.01] active:scale-[0.99]"
                      : d(dark,"text-white/20 bg-white/6 border border-white/8 cursor-not-allowed","text-stone-400 bg-stone-100 border border-stone-200 cursor-not-allowed")
                    } disabled:scale-100`}>
                  {loading ? (
                    <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Publishing…</>
                  ) : !canPublish ? (
                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>Locked — {hoursLeft}h to go</>
                  ) : (
                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12l5 5L20 7"/></svg>Publish Now</>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function OrganizerDashboard() {
  const name       = useOrganizerAuth((s) => s.name);
  const email      = useOrganizerAuth((s) => s.email);
  const bio        = useOrganizerAuth((s) => s.bio);
  const location   = useOrganizerAuth((s) => s.location);
  const profilePic = useOrganizerAuth((s) => s.profilePic);
  const { logout } = useOrganizerLogout();
  const { events: rawEvents } = useOrganizerEvents();
  const EVENTS = useMemo(() => rawEvents.map(mapEvent), [rawEvents]);

  const [dark, setDark]               = useState(false);
  const [activeTab, setActiveTab]     = useState<NavTab>("dashboard");
  const [sideOpen, setSideOpen]       = useState(false);
  const [publishEventId, setPublishEventId] = useState<string | null>(null);
  const [logoutModal, setLogoutModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("org-dashboard-dark");
    if (saved === "1") setDark(true);
  }, []);
  

   const subscriptionLoaded = useSubscriptionLoaded();
  const subscription       = useOrganizerSubscription();
 const [showPricing, setShowPricing] = useState(false);
  // Fetch subscription only once — skip if already loaded from a previous session
  const { refetch: refetchSubscription } = useSubscriptionAction();
 
  useEffect(() => {
    if (!subscriptionLoaded) {
      refetchSubscription();
    }
  }, [subscriptionLoaded, refetchSubscription]);


  const toggleDark = () => setDark(prev => {
    const next = !prev;
    localStorage.setItem("org-dashboard-dark", next ? "1" : "0");
    return next;
  });

  const liveCount      = EVENTS.filter(e => e.status === "live").length;
  const greeting       = new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening";
  const firstName      = name ? name.split(" ")[0] : "Organizer";
  const avatarFallback = name ? name.charAt(0).toUpperCase() : "O";

  const NAV_ITEMS: { label: string; tab: NavTab; icon: React.ReactNode }[] = [
    { label:"Dashboard", tab:"dashboard", icon:<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
    { label:"Audience",  tab:"audience",  icon:<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> },
    { label:"Revenue",   tab:"revenue",   icon:<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
    { label:"Analytics", tab:"analytics", icon:<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
    { label:"Settings",  tab:"settings",  icon:<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> },
  ];

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    setSideOpen(false); // close mobile sidebar on tab change
  };

  // ── Sidebar (shared between desktop and mobile overlay) ────────────────────

  const SidebarContent = () => (
    <div className={`flex flex-col h-full ${T.surface(dark)} transition-colors duration-300`}>
      {/* Logo */}
      <div className={`px-5 pt-6 pb-5 border-b ${T.border(dark)}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-400/30">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div>
            <div className={`${T.text1(dark)} font-black text-sm leading-none`} style={{fontFamily:"'Playfair Display',Georgia,serif"}}>eventimist</div>
            <div className="text-amber-500 text-[9px] font-bold tracking-wider mt-0.5">ORGANIZER</div>
          </div>
        </div>
      </div>

      {/* Create CTA */}
      <div className="px-4 py-4">
        <a href="/organizer/create-event" className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black text-sm py-3 rounded-2xl hover:shadow-xl hover:shadow-amber-400/25 hover:scale-[1.02] transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Create Event
        </a>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => (
          <button key={item.tab} onClick={() => handleTabChange(item.tab)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === item.tab
                ? d(dark,"bg-amber-400/12 text-amber-400 border border-amber-400/18","bg-amber-100 text-amber-700 border border-amber-200")
                : `${T.text2(dark)} ${d(dark,"hover:text-white hover:bg-white/6","hover:text-gray-900 hover:bg-gray-100")}`
            }`}>
            <span className={activeTab === item.tab ? "text-amber-400" : T.text3(dark)}>{item.icon}</span>
            {item.label}
            {item.label === "Dashboard" && liveCount > 0 && (
              <span className={`ml-auto text-[9px] font-black ${d(dark,"bg-emerald-400/15 text-emerald-400 border border-emerald-400/20","bg-emerald-100 text-emerald-700 border border-emerald-200")} px-1.5 py-0.5 rounded-full`}>{liveCount} live</span>
            )}
          </button>
        ))}
      </nav>

   
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; font-family: 'DM Sans', system-ui, sans-serif; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(128,128,128,.2); border-radius: 99px; }
        .sidebar-overlay { background: rgba(0,0,0,.6); backdrop-filter: blur(4px); }
        @keyframes enter { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .tab-enter { animation: enter .4s cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>

      {logoutModal && <LogoutModal onConfirm={() => { setLogoutModal(false); logout(); }} onCancel={() => setLogoutModal(false)} dark={dark}/>}

      {publishEventId && (
        <PublishModal
          eventId={publishEventId}
          rawEvents={rawEvents}
          dark={dark}
          onClose={() => setPublishEventId(null)}
        />
      )}
      
    {/* <PricingModal
  currentPlan={subscription?.plan ?? "FREE"}
  dark={dark}
  onUpgrade={() => setShowPricing(false)}
/> */}


      <OrganizerAssistant dark={dark} />

      <div className={`flex min-h-screen ${T.bg(dark)} transition-colors duration-300`}>

        {/* ── Desktop Sidebar ── */}
        <aside className={`hidden lg:flex flex-col w-60 xl:w-64 border-r ${T.border(dark)} flex-shrink-0 h-screen sticky top-0 overflow-y-auto transition-colors duration-300`}>
          <SidebarContent/>
        </aside>

        {/* ── Mobile Sidebar overlay ── */}
        {sideOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="sidebar-overlay absolute inset-0" onClick={() => setSideOpen(false)}/>
            <aside className="relative z-10 w-72 max-w-[85vw] h-full overflow-y-auto shadow-2xl border-r border-white/10">
              <SidebarContent/>
            </aside>
          </div>
        )}

        {/* ── Main ── */}
        <div className="flex-1 min-w-0 flex flex-col">

          {/* Top bar */}
          <header className={`sticky top-0 z-40 h-14 sm:h-16 flex items-center gap-3 sm:gap-4 px-4 sm:px-5 ${T.surface(dark)}/95 backdrop-blur-xl border-b ${T.border(dark)} transition-colors duration-300`}>
            {/* Hamburger */}
            <button className={`lg:hidden w-8 h-8 rounded-xl flex items-center justify-center ${T.text2(dark)} ${d(dark,"hover:text-white hover:bg-white/8","hover:text-gray-900 hover:bg-gray-100")} transition-all flex-shrink-0`} onClick={() => setSideOpen(true)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>

            {/* Greeting */}
            <div className="hidden sm:block min-w-0">
              <div className={`${T.text1(dark)} font-black text-sm truncate`} style={{fontFamily:"'Playfair Display',Georgia,serif"}}>Good {greeting}, {firstName} 👋</div>
              <div className={`${T.text3(dark)} text-[10px]`}>Here's what's happening with your events</div>
            </div>

            {/* Mobile: active tab title */}
            <div className="sm:hidden min-w-0 flex-1">
              <div className={`${T.text1(dark)} font-black text-sm truncate`} style={{fontFamily:"'Playfair Display',Georgia,serif"}}>
                {NAV_ITEMS.find(n => n.tab === activeTab)?.label}
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2 flex-shrink-0">
              {/* Search — hidden on small screens */}
              <div className={`hidden md:flex items-center gap-2 ${d(dark,"bg-white/5 border-white/8","bg-gray-100 border-gray-200")} border rounded-xl px-3.5 py-2 w-44 xl:w-52 transition-all`}>
                <svg className={`w-3.5 h-3.5 ${T.text3(dark)} flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input placeholder="Search events…" className={`bg-transparent text-sm ${T.text2(dark)} outline-none w-full`}/>
              </div>

              <DarkToggle dark={dark} onToggle={toggleDark}/>

              {/* Notifications */}
              <div className="relative">
                <button className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center ${T.text2(dark)} ${d(dark,"hover:text-white hover:bg-white/8","hover:text-gray-700 hover:bg-gray-100")} transition-all`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
                </button>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-[inherit]"/>
              </div>

              {/* Avatar */}
              {profilePic ? <img src={profilePic} alt={name??""} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-amber-400/30 cursor-pointer"/> :
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-400/15 ring-2 ring-amber-400/25 flex items-center justify-center text-amber-500 font-black text-sm cursor-pointer">{avatarFallback}</div>}

              <a href="/organizer/create-event" className="hidden sm:flex items-center gap-1.5 text-xs font-black text-white bg-gradient-to-r from-amber-500 to-orange-600 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl hover:shadow-lg hover:shadow-amber-500/25 transition-all">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <span className="hidden md:inline">Create Event</span>
                <span className="md:hidden">New</span>
              </a>
            </div>
          </header>

          {/* ── Mobile bottom tab bar ── */}
          <div className={`lg:hidden fixed bottom-0 inset-x-0 z-40 ${T.surface(dark)} border-t ${T.border(dark)} flex items-center justify-around px-1 py-2 transition-colors duration-300`}
            style={{paddingBottom: 'max(8px, env(safe-area-inset-bottom))'}}>
            {NAV_ITEMS.map(item => (
              <button key={item.tab} onClick={() => handleTabChange(item.tab)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all ${
                  activeTab === item.tab
                    ? "text-amber-500"
                    : T.text3(dark)
                }`}>
                <span className="w-5 h-5">{item.icon}</span>
                <span className="text-[9px] font-bold">{item.label.split(" ")[0]}</span>
              </button>
            ))}
          </div>

          {/* ── Content ── */}
          <main className="flex-1 px-4 sm:px-5 py-5 sm:py-7 overflow-y-auto pb-20 lg:pb-7">
            <div key={activeTab as string} className="tab-enter">
              {activeTab === "dashboard" && <TabDashboard dark={dark} onPublish={setPublishEventId}/>}
              {activeTab === "audience"  && <TabAudience  dark={dark}/>}
              {activeTab === "revenue"   && <TabRevenue   dark={dark}/>}
              {activeTab === "analytics" && <TabAnalytics dark={dark}/>}
              {activeTab === "settings"  && <TabSettings  dark={dark} onToggleDark={toggleDark}/>}
            </div>
          </main>
        </div>
      </div>
      
    </>
  );
}