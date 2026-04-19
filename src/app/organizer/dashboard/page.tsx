"use client";

import { useState, useMemo, useEffect } from "react";
import { TYPE_META } from "@/components/EventCard";
import { useOrganizerAuth } from "@/store/eventimist/organizer/auth/AuthState";
import { useOrganizerLogout } from "@/hooks/eventimist/organizer/sessions/useOrganizerLogout";

// ─── Types ────────────────────────────────────────────────────────────────────
interface OrgEvent {
  id: string; title: string; type: string; date: string; venue: string;
  status: "live" | "upcoming" | "draft" | "ended";
  rsvps: number; capacity: number; revenue: number; image: string;
}
interface ActivityItem {
  id: string; text: string; time: string;
  kind: "rsvp" | "cancel" | "publish" | "comment" | "payout";
}

type NavTab = "dashboard" | "audience" | "revenue" | "analytics" | "settings";

// ─── Mock data ────────────────────────────────────────────────────────────────
const EVENTS: OrgEvent[] = [
  { id:"e1",  title:"Sunburn Arena ft. Martin Garrix", type:"Music",      date:"2025-08-12", venue:"JLN Stadium, Delhi",       status:"upcoming", rsvps:14820, capacity:18000, revenue:2964000, image:"https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80" },
  { id:"e2",  title:"Delhi Tech Summit 2025",          type:"Tech",       date:"2025-08-18", venue:"Bharat Mandapam, Delhi",   status:"upcoming", rsvps:3810,  capacity:5000,  revenue:762000,  image:"https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80" },
  { id:"e3",  title:"Holi Mela — Colours & Culture",  type:"Festival",   date:"2025-09-14", venue:"Purana Qila, Delhi",       status:"upcoming", rsvps:4200,  capacity:8000,  revenue:420000,  image:"https://images.unsplash.com/photo-1590736704728-f4730bb30770?w=400&q=80" },
  { id:"e4",  title:"UX Designers Meetup #22",        type:"Networking", date:"2025-08-08", venue:"91springboard, Okhla",     status:"live",     rsvps:98,    capacity:120,   revenue:0,       image:"https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&q=80" },
  { id:"e5",  title:"Photography Masterclass",        type:"Workshop",   date:"2025-09-15", venue:"India Habitat Centre",     status:"upcoming", rsvps:28,    capacity:35,    revenue:84000,   image:"https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=400&q=80" },
  { id:"e6",  title:"NH7 Weekender Delhi 2025",       type:"Music",      date:"2025-10-25", venue:"Leisure Valley, Gurugram", status:"draft",    rsvps:0,     capacity:20000, revenue:0,       image:"https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=400&q=80" },
  { id:"e7",  title:"Street Food Trail — Old Delhi",  type:"Food",       date:"2025-07-20", venue:"Chandni Chowk, Delhi",     status:"ended",    rsvps:28,    capacity:30,    revenue:22400,   image:"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80" },
  { id:"e8",  title:"Future of Work Conference",      type:"Conference", date:"2025-09-22", venue:"The Leela, Gurugram",      status:"upcoming", rsvps:420,   capacity:650,   revenue:630000,  image:"https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&q=80" },
  { id:"e9",  title:"Yamuna Cleanup Drive",           type:"Volunteer",  date:"2025-08-24", venue:"Yamuna Ghat, ITO",         status:"upcoming", rsvps:310,   capacity:500,   revenue:0,       image:"https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&q=80" },
  { id:"e10", title:"Lodhi Art Open Day",             type:"Art",        date:"2025-08-30", venue:"Lodhi Colony, Delhi",      status:"upcoming", rsvps:640,   capacity:1000,  revenue:0,       image:"https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=400&q=80" },
];
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
              className={`relative p-1 sm:p-1.5 border-r border-b ${T.border(dark)} transition-all ${day&&evs.length>0?"cursor-pointer":"cursor-default"} ${active?d(dark,"bg-amber-400/12","bg-amber-100"):day&&evs.length>0?d(dark,"hover:bg-white/4","hover:bg-gray-50"):""}`}>
              {day&&(<>
                <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] font-bold mb-1 transition-all ${active?"bg-amber-500 text-white":tod?d(dark,"bg-white/12 text-white ring-1 ring-white/25","bg-gray-200 text-gray-900 ring-1 ring-gray-300"):T.text3(dark)}`}>{day}</div>
                {evs.length>0&&<div className="flex flex-wrap gap-0.5">{evs.slice(0,2).map((ev,i)=>{const tc=TYPE_META[ev.type]??TYPE_META.default;return <span key={i} className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${tc.dot} ${ev.status==="live"?"animate-pulse":""}`}/>;})}{evs.length>2&&<span className={`text-[7px] ${T.text3(dark)} font-bold`}>+{evs.length-2}</span>}</div>}
              </>)}
            </div>
          );
        })}
      </div>
      <div className={`px-3 sm:px-4 py-2 sm:py-3 border-t ${T.border(dark)} flex flex-wrap gap-x-3 gap-y-1`}>
        {Object.entries(TYPE_META).filter(([k])=>k!=="default"&&EVENTS.some(e=>e.type===k)).map(([type,meta])=>(
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

function TabDashboard({ dark }: { dark: boolean }) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [evFilter, setEvFilter]       = useState<"all"|"live"|"upcoming"|"draft"|"ended">("all");
  const [page, setPage]               = useState(1);

  const dayEvents = useMemo(() => {
    if (!selectedDay) return [];
    const today = new Date();
    return EVENTS.filter(ev => { const d2=new Date(ev.date); return d2.getDate()===selectedDay&&d2.getMonth()===today.getMonth()&&d2.getFullYear()===today.getFullYear(); });
  }, [selectedDay]);

  const filtered     = evFilter==="all"?EVENTS:EVENTS.filter(e=>e.status===evFilter);
  const totalPages   = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated    = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);
  const totalRsvps   = EVENTS.filter(e=>e.status!=="ended").reduce((s,e)=>s+e.rsvps,0);
  const totalRevenue = EVENTS.reduce((s,e)=>s+e.revenue,0);

  // Reset to page 1 when filter changes
  const handleFilter = (f: typeof evFilter) => { setEvFilter(f); setPage(1); };

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
                          <a href={`/events/${ev.id}`} className={`w-7 h-7 rounded-lg ${d(dark,"bg-white/6 text-white/40 hover:text-white hover:bg-white/12","bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900 border border-gray-200")} flex items-center justify-center transition-all`}>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          </a>
                          <button className={`w-7 h-7 rounded-lg ${d(dark,"bg-white/6 text-white/40 hover:text-white hover:bg-white/12","bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900 border border-gray-200")} flex items-center justify-center transition-all`}>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
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
  const totalRsvps = EVENTS.reduce((s,e)=>s+e.rsvps,0);
  return (
    <div className="space-y-5">
      <h2 className={`${T.text1(dark)} font-black text-lg sm:text-xl`} style={{fontFamily:"'Playfair Display',Georgia,serif"}}>Audience</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[{label:"Total Audience",value:totalRsvps.toLocaleString(),sub:"across all events"},{label:"Return Rate",value:"73%",sub:"come back for more"},{label:"Avg. Rating",value:"4.8★",sub:"organizer rating"},{label:"Total Reach",value:"28.4K",sub:"unique attendees"}].map(s=>(
          <div key={s.label} className={`${T.surface(dark)} border ${T.border(dark)} rounded-2xl p-4 text-center`}>
            <div className={`${T.text1(dark)} font-black text-xl sm:text-2xl mb-1`} style={{fontFamily:"'Playfair Display',Georgia,serif"}}>{s.value}</div>
            <div className={`${T.text3(dark)} text-xs font-semibold mb-0.5`}>{s.label}</div>
            <div className={`${T.text3(dark)} text-[10px]`}>{s.sub}</div>
          </div>
        ))}
      </div>
      <div className={`${T.surface(dark)} border ${T.border(dark)} rounded-2xl overflow-hidden`}>
        <div className={`px-4 sm:px-5 py-4 border-b ${T.border(dark)}`}><h3 className={`${T.text1(dark)} font-black text-sm`} style={{fontFamily:"'Playfair Display',Georgia,serif"}}>RSVPs by Event</h3></div>
        <div className="p-4 sm:p-5 space-y-4">
          {EVENTS.filter(e=>e.rsvps>0).sort((a,b)=>b.rsvps-a.rsvps).map(ev=>{
            const pctVal=pct(ev.rsvps,EVENTS.reduce((s,e)=>s+e.rsvps,0));
            const tc=TYPE_META[ev.type]??TYPE_META.default;
            return(
              <div key={ev.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0"><img src={ev.image} alt={ev.title} className="w-full h-full object-cover"/></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`${T.text2(dark)} text-xs font-bold truncate mr-2`}>{ev.title}</span>
                    <span className={`${T.text3(dark)} text-[10px] flex-shrink-0`}>{ev.rsvps.toLocaleString()}</span>
                  </div>
                  <div className={`h-1.5 ${d(dark,"bg-white/8","bg-gray-100")} rounded-full overflow-hidden`}>
                    <div className="h-full rounded-full transition-all" style={{width:`${pctVal*3}%`,background:tc.hex,maxWidth:"100%"}}/>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Revenue Tab ──────────────────────────────────────────────────────────────
function TabRevenue({ dark }: { dark: boolean }) {
  const totalRevenue=EVENTS.reduce((s,e)=>s+e.revenue,0);
  const revenueEvents=EVENTS.filter(e=>e.revenue>0).sort((a,b)=>b.revenue-a.revenue);
  return (
    <div className="space-y-5">
      <h2 className={`${T.text1(dark)} font-black text-lg sm:text-xl`} style={{fontFamily:"'Playfair Display',Georgia,serif"}}>Revenue</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {[{label:"Total Revenue",value:fmt(totalRevenue),sub:"+₹3.2L vs last month",color:"text-emerald-500"},{label:"Avg. per Event",value:fmt(Math.round(totalRevenue/revenueEvents.length)),sub:"across paid events",color:T.text1(dark)},{label:"Pending Payout",value:"₹1.2L",sub:"processing in 3-5 days",color:"text-amber-500"}].map(s=>(
          <div key={s.label} className={`${T.surface(dark)} border ${T.border(dark)} rounded-2xl p-4 sm:p-5`}>
            <div className={`${s.color} font-black text-2xl sm:text-3xl mb-1`} style={{fontFamily:"'Playfair Display',Georgia,serif"}}>{s.value}</div>
            <div className={`${T.text2(dark)} text-xs font-bold mb-0.5`}>{s.label}</div>
            <div className={`${T.text3(dark)} text-[10px]`}>{s.sub}</div>
          </div>
        ))}
      </div>
      <div className={`${T.surface(dark)} border ${T.border(dark)} rounded-2xl overflow-hidden`}>
        <div className={`px-4 sm:px-5 py-4 border-b ${T.border(dark)}`}><h3 className={`${T.text1(dark)} font-black text-sm`} style={{fontFamily:"'Playfair Display',Georgia,serif"}}>Revenue by Event</h3></div>
        <div className={`divide-y ${d(dark,"divide-white/5","divide-gray-100")}`}>
          {revenueEvents.map(ev=>(
            <div key={ev.id} className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4 ${T.hover(dark)} transition-all`}>
              <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0"><img src={ev.image} alt={ev.title} className="w-full h-full object-cover"/></div>
              <div className="flex-1 min-w-0">
                <div className={`${T.text2(dark)} text-xs sm:text-sm font-bold truncate`}>{ev.title}</div>
                <div className={`${T.text3(dark)} text-[10px] mt-0.5`}>{ev.venue.split(",")[0]}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className={`${T.text1(dark)} font-black text-sm`}>{fmt(ev.revenue)}</div>
                <div className={`${T.text3(dark)} text-[10px]`}>{ev.rsvps.toLocaleString()} tickets</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────
function TabAnalytics({ dark }: { dark: boolean }) {
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
function TabSettings({ dark, onToggleDark }: { dark: boolean; onToggleDark: () => void }) {
  const name       = useOrganizerAuth((s) => s.name);
  const email      = useOrganizerAuth((s) => s.email);
  const bio        = useOrganizerAuth((s) => s.bio);
  const location   = useOrganizerAuth((s) => s.location);
  const profilePic = useOrganizerAuth((s) => s.profilePic);
  return (
    <div className="space-y-5 max-w-2xl">
      <h2 className={`${T.text1(dark)} font-black text-lg sm:text-xl`} style={{fontFamily:"'Playfair Display',Georgia,serif"}}>Settings</h2>
      {/* Profile card */}
      <div className={`${T.surface(dark)} border ${T.border(dark)} rounded-2xl overflow-hidden`}>
        <div className={`px-4 sm:px-5 py-4 border-b ${T.border(dark)}`}><h3 className={`${T.text1(dark)} font-black text-sm`}>Profile Information</h3></div>
        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-4">
            {profilePic ? <img src={profilePic} alt={name??""} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-400/30"/> :
              <div className="w-16 h-16 rounded-2xl bg-amber-400/15 ring-2 ring-amber-400/25 flex items-center justify-center text-amber-500 font-black text-2xl" style={{fontFamily:"'Playfair Display',Georgia,serif"}}>{name?.charAt(0)??'O'}</div>}
            <div>
              <div className={`${T.text1(dark)} font-bold text-sm`}>{name??'Organizer'}</div>
              <div className={`${T.text3(dark)} text-xs`}>{email??''}</div>
              {location&&<div className={`${T.text3(dark)} text-[10px] mt-1 flex items-center gap-1`}><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>{location}</div>}
            </div>
          </div>
          {bio&&<div className={`${T.text3(dark)} text-xs leading-relaxed p-3 ${d(dark,"bg-white/4","bg-gray-50")} rounded-xl`}>{bio}</div>}
        </div>
      </div>
      {/* Appearance */}
      <div className={`${T.surface(dark)} border ${T.border(dark)} rounded-2xl overflow-hidden`}>
        <div className={`px-4 sm:px-5 py-4 border-b ${T.border(dark)}`}><h3 className={`${T.text1(dark)} font-black text-sm`}>Appearance</h3></div>
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className={`${T.text2(dark)} text-sm font-semibold`}>Dark Mode</div>
              <div className={`${T.text3(dark)} text-[11px] mt-0.5`}>Toggle between light and dark theme</div>
            </div>
            <DarkToggle dark={dark} onToggle={onToggleDark}/>
          </div>
        </div>
      </div>
      {/* Notifications */}
      <div className={`${T.surface(dark)} border ${T.border(dark)} rounded-2xl overflow-hidden`}>
        <div className={`px-4 sm:px-5 py-4 border-b ${T.border(dark)}`}><h3 className={`${T.text1(dark)} font-black text-sm`}>Notifications</h3></div>
        <div className={`divide-y ${d(dark,"divide-white/5","divide-gray-100")}`}>
          {[{label:"New RSVPs",desc:"Get notified when someone RSVPs to your events",on:true},{label:"Cancellations",desc:"Alert when attendees cancel their registration",on:true},{label:"Payouts",desc:"Notification when your payout is processed",on:true},{label:"Event reminders",desc:"Reminders before your events go live",on:false}].map(item=>(
            <div key={item.label} className="flex items-center justify-between px-4 sm:px-5 py-4">
              <div><div className={`${T.text2(dark)} text-xs sm:text-sm font-semibold`}>{item.label}</div><div className={`${T.text3(dark)} text-[10px] sm:text-[11px] mt-0.5`}>{item.desc}</div></div>
              <div className={`relative w-10 h-5 rounded-full transition-all duration-300 flex-shrink-0 ${item.on?"bg-amber-400":"bg-gray-300"}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${item.on?"translate-x-5":"translate-x-0.5"}`}/>
              </div>
            </div>
          ))}
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

  const [dark, setDark]           = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [sideOpen, setSideOpen]   = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("org-dashboard-dark");
    if (saved === "1") setDark(true);
  }, []);

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
            } hover:cursor-pointer`}>
            <span className={activeTab === item.tab ? "text-amber-400" : T.text3(dark)}>{item.icon}</span>
            {item.label}
            {item.label === "Dashboard" && liveCount > 0 && (
              <span className={`ml-auto text-[9px] font-black ${d(dark,"bg-emerald-400/15 text-emerald-400 border border-emerald-400/20","bg-emerald-100 text-emerald-700 border border-emerald-200")} px-1.5 py-0.5 rounded-full`}>{liveCount} live</span>
            )}
          </button>
        ))}
      </nav>

      {/* Profile strip */}
      <div className={`px-4 py-4 border-t ${T.border(dark)} mt-auto`}>
        <div className="flex items-start gap-3 mb-3">
          <div className="relative flex-shrink-0">
            {profilePic ? <img src={profilePic} alt={name??""} className="w-9 h-9 rounded-full object-cover ring-2 ring-amber-400/30"/> :
              <div className="w-9 h-9 rounded-full bg-amber-400/15 ring-2 ring-amber-400/25 flex items-center justify-center text-amber-500 font-black text-sm">{avatarFallback}</div>}
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className={`${T.text1(dark)} text-xs font-bold truncate`}>{name ?? "Organizer"}</div>
            <div className={`${T.text3(dark)} text-[10px] truncate`}>{email ?? ""}</div>
            {location && <div className="flex items-center gap-1 mt-0.5"><svg className={`w-2.5 h-2.5 ${T.text3(dark)} flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg><span className={`${T.text3(dark)} text-[10px] truncate`}>{location}</span></div>}
          </div>
        </div>
        {bio && <p className={`${T.text3(dark)} text-[10px] leading-relaxed line-clamp-2 mb-3`}>{bio}</p>}
        <button onClick={() => setLogoutModal(true)}
          className={`w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-rose-500 ${d(dark,"bg-rose-500/12 hover:bg-rose-500/20 border border-rose-500/20","bg-rose-50 hover:bg-rose-100 border border-rose-100")} rounded-xl transition-all`}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sign out
        </button>
      </div>
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

              {/* <a href="/organizer/create_event" className="hidden sm:flex items-center gap-1.5 text-xs font-black text-white bg-gradient-to-r from-amber-500 to-orange-600 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl hover:shadow-lg hover:shadow-amber-500/25 transition-all">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <span className="hidden md:inline">Create Event</span>
                <span className="md:hidden">New</span>
              </a> */}
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
                } hover:cursor-pointer`}>
                <span className="w-5 h-5">{item.icon}</span>
                <span className="text-[9px] font-bold">{item.label.split(" ")[0]}</span>
              </button>
            ))}
          </div>

          {/* ── Content ── */}
          <main className="flex-1 px-4 sm:px-5 py-5 sm:py-7 overflow-y-auto pb-20 lg:pb-7">
            <div key={activeTab} className="tab-enter">
              {activeTab === "dashboard" && <TabDashboard dark={dark}/>}
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