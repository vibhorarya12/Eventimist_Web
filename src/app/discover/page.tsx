"use client";

// src/app/discover/page.tsx

import { useCallback, useEffect, useRef, useState } from "react";
import { EventCard, MapPopupCard, TYPE_META } from "@/components/EventCard";
import type { Event } from "@/components/EventCard";
import { QueryProvider } from "@/components/QueryProvider";
import { useDiscoverEvents } from "@/hooks/eventimist/user/events/useDiscoverEvents";
import type { DiscoverEvent } from "@/services/eventimist/user/events/discoverEvents.service";
import { useUserAuth } from "@/store/eventimist/user/auth/UserAuthState";
import { useUserLogout } from "@/hooks/eventimist/user/sessions/useUserLogout";
import { EventSearchModal } from "@/components/EventSearchModal";

// ─── All 15 categories ────────────────────────────────────────────────────────
const CATEGORIES: { value: string; label: string; emoji: string; hex: string }[] = [
  { value:"Music",         label:"Music",         emoji:"🎵", hex:"#8b5cf6" },
  { value:"Tech",          label:"Tech",           emoji:"💻", hex:"#3b82f6" },
  { value:"Food",          label:"Food",           emoji:"🍜", hex:"#f97316" },
  { value:"Art",           label:"Art",            emoji:"🎨", hex:"#ec4899" },
  { value:"Sports",        label:"Sports",         emoji:"⚽", hex:"#22c55e" },
  { value:"Festival",      label:"Festival",       emoji:"🎪", hex:"#f59e0b" },
  { value:"Volunteer",     label:"Volunteer",      emoji:"🤝", hex:"#14b8a6" },
  { value:"Networking",    label:"Networking",     emoji:"🔗", hex:"#06b6d4" },
  { value:"Workshop",      label:"Workshop",       emoji:"🛠", hex:"#f43f5e" },
  { value:"Conference",    label:"Conference",     emoji:"🎤", hex:"#6366f1" },
  { value:"Education",     label:"Education",      emoji:"📚", hex:"#0ea5e9" },
  { value:"Business",      label:"Business",       emoji:"💼", hex:"#84cc16" },
  { value:"Health",        label:"Health",         emoji:"🏥", hex:"#10b981" },
  { value:"Entertainment", label:"Entertainment",  emoji:"🎬", hex:"#e879f9" },
  { value:"Gaming",        label:"Gaming",         emoji:"🎮", hex:"#fb923c" },
];

const ALL_TYPE_META: Record<string, { bg:string; text:string; dot:string; hex:string }> = {
  ...TYPE_META,
  Education:     { bg:"bg-sky-500/15",    text:"text-sky-300",    dot:"bg-sky-400",    hex:"#0ea5e9" },
  Business:      { bg:"bg-lime-500/15",   text:"text-lime-300",   dot:"bg-lime-400",   hex:"#84cc16" },
  Health:        { bg:"bg-emerald-500/15",text:"text-emerald-300",dot:"bg-emerald-400",hex:"#10b981" },
  Entertainment: { bg:"bg-fuchsia-500/15",text:"text-fuchsia-300",dot:"bg-fuchsia-400",hex:"#e879f9" },
  Gaming:        { bg:"bg-orange-500/15", text:"text-orange-300", dot:"bg-orange-400", hex:"#fb923c" },
};



// ─── Map API response → EventCard's Event shape ───────────────────────────────
function mapDiscoverEvent(e: DiscoverEvent): Event {
  return {
    id:                  String(e.id),
    slug:                e.slug,
    title:               e.title,
    description:         e.description,
    type:                e.category.charAt(0) + e.category.slice(1).toLowerCase(),
    date:                e.startTime,
    venue:               e.venue || (e.mode === "ONLINE" ? "Online" : ""),
    tags:                [],
    image_url:           e.coverImage,
    attendance:          0,
    organizerName:       e.organizerName,
    organizer:           e.organizerName.toLowerCase().replace(/\s+/g, ""),
    organizerProfilepic: e.organizerImage,
    latitude:            e.latitude,
    longitude:           e.longitude,
    organizerId:         String(e.id),
  };
}

// ─── Map styles ───────────────────────────────────────────────────────────────
const DARK_STYLES = [
  { elementType:"geometry",                stylers:[{color:"#0d0f17"}] },
  { elementType:"labels",                  stylers:[{visibility:"off"}] },
  { featureType:"administrative.locality", elementType:"labels.text.fill", stylers:[{color:"#3d4966"},{visibility:"on"}] },
  { featureType:"administrative.country",  elementType:"labels.text.fill", stylers:[{color:"#2a3355"},{visibility:"on"}] },
  { featureType:"poi",                     stylers:[{visibility:"off"}] },
  { featureType:"transit",                 stylers:[{visibility:"off"}] },
  { featureType:"road",                    elementType:"geometry",         stylers:[{color:"#161926"}] },
  { featureType:"road.highway",            elementType:"geometry",         stylers:[{color:"#1e2440"}] },
  { featureType:"road.arterial",           elementType:"geometry",         stylers:[{color:"#141620"}] },
  { featureType:"road.local",              stylers:[{visibility:"off"}] },
  { featureType:"water",                   elementType:"geometry",         stylers:[{color:"#060911"}] },
  { featureType:"landscape",               elementType:"geometry",         stylers:[{color:"#0a0c15"}] },
];

const LIGHT_STYLES = [
  { elementType:"labels",                  stylers:[{visibility:"off"}] },
  { featureType:"administrative.locality", elementType:"labels.text.fill", stylers:[{color:"#9ca3af"},{visibility:"on"}] },
  { featureType:"poi",                     stylers:[{visibility:"off"}] },
  { featureType:"transit",                 stylers:[{visibility:"off"}] },
  { featureType:"road",                    elementType:"geometry",         stylers:[{color:"#e5e7eb"}] },
  { featureType:"road.highway",            elementType:"geometry",         stylers:[{color:"#d1d5db"}] },
  { featureType:"road.local",              stylers:[{visibility:"off"}] },
  { featureType:"water",                   elementType:"geometry",         stylers:[{color:"#bfdbfe"}] },
  { featureType:"landscape",               elementType:"geometry",         stylers:[{color:"#f9fafb"}] },
];

function makeSvgIcon(color: string, active: boolean) {
  const w = active ? 42 : 34, h = Math.round(w * 1.22);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 36 44">
    <path d="M18 0C8.059 0 0 8.059 0 18c0 12.564 18 26 18 26S36 30.564 36 18C36 8.059 27.941 0 18 0z" fill="${color}"/>
    <circle cx="18" cy="18" r="9" fill="white" opacity="0.92"/>
    <circle cx="18" cy="18" r="5.5" fill="${color}"/>
    ${active ? '<circle cx="18" cy="18" r="2.5" fill="white" opacity="0.9"/>' : ""}
  </svg>`;
  const b64 = btoa(unescape(encodeURIComponent(svg)));
  return {
    url: `data:image/svg+xml;base64,${b64}`,
    scaledSize: new (window as any).google.maps.Size(w, h),
    anchor: new (window as any).google.maps.Point(w / 2, h),
  };
}

// ─── User avatar dropdown ─────────────────────────────────────────────────────
function UserMenu({ dark }: { dark: boolean }) {
  const [open, setOpen] = useState(false);
  const name       = useUserAuth(s => s.name);
  const profilePic = useUserAuth(s => s.profilePic);
  const { logout } = useUserLogout();
  const ref        = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = name.trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border transition-all hover:scale-[1.02]
          border-amber-400/40 bg-amber-400/10 hover:bg-amber-400/15">
        {/* Avatar */}
        <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-[11px] font-black">
          {profilePic
            ? <img src={profilePic} alt={name} className="w-full h-full object-cover"/>
            : initials
          }
        </div>
        <span className={`text-xs font-bold max-w-[80px] truncate ${dark ? "text-white/80" : "text-stone-700"}`}>
          {name.split(" ")[0]}
        </span>
        <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""} ${dark ? "text-white/40" : "text-stone-400"}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {open && (
        <div className={`absolute right-0 top-full mt-2 w-52 rounded-2xl border shadow-xl overflow-hidden z-50
          ${dark ? "bg-[#13151f] border-white/8" : "bg-white border-stone-200"}`}>
          {/* Profile header */}
          <div className={`px-4 py-3 border-b ${dark ? "border-white/8" : "border-stone-100"}`}>
            <p className={`text-xs font-black truncate ${dark ? "text-white" : "text-stone-900"}`}>{name}</p>
          </div>
          {/* Actions */}
          <div className="p-1.5">
            <a href="/user/profile"
              className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-xs font-semibold transition-all
                ${dark ? "text-white/60 hover:text-white hover:bg-white/8" : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"}`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              My Profile
            </a>
            <button onClick={() => { setOpen(false); logout(); }}
              className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left
                ${dark ? "text-rose-400 hover:bg-rose-400/10" : "text-rose-500 hover:bg-rose-50"}`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  const isLoggedIn  = useUserAuth(s => s.isAuthenticated());
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const bg   = dark ? "bg-[#0d0f17]/97 border-white/6"  : "bg-white/97 border-stone-200";
  const logo = dark ? "text-white"   : "text-stone-900";
  const link = dark ? "text-white/40 hover:text-white/80 hover:bg-white/5"
                    : "text-stone-500 hover:text-stone-900 hover:bg-stone-100";
  const act  = dark ? "text-amber-400 bg-amber-400/10"  : "text-amber-600 bg-amber-50";
  return (
    <nav className={`fixed top-0 inset-x-0 z-50 h-14 backdrop-blur-xl border-b flex items-center px-5 transition-colors duration-300 ${bg}`}>
      <div className="max-w-screen-2xl mx-auto w-full flex items-center gap-4">
        <a href="/" className="flex items-center gap-2 flex-shrink-0 mr-4">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <span className={`font-black text-base tracking-tight hidden sm:block ${logo}`}
            style={{fontFamily:"'Playfair Display',Georgia,serif"}}>eventimist</span>
        </a>
        <div className="hidden md:flex items-center gap-0.5 text-sm flex-1">
          {[["Discover","/discover",true],["Organise","/organize",false],["Eventix Space","/eventix",false],["Volunteer","/volunteer",false]].map(([l,h,a]) => (
            <a key={l as string} href={h as string}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all text-sm ${a ? act : link}`}>{l}</a>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={onToggle}
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all
              ${dark ? "bg-white/8 hover:bg-white/14" : "bg-stone-100 hover:bg-stone-200"}`}
            title={dark ? "Light mode" : "Dark mode"}>
            {dark ? "☀️" : "🌙"}
          </button>
          {/* Only render auth UI after client mount to avoid hydration mismatch */}
          {mounted && isLoggedIn ? (
            <UserMenu dark={dark}/>
          ) : (
            <>
              <a href="/user" className={`text-sm hidden sm:block font-medium px-3 py-1.5 rounded-xl transition-all ${link}`}>Sign In</a>
              <a href="/user" className="text-sm font-black bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-amber-400/30 hover:scale-[1.02] transition-all">
                Get Started
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DiscoverPage() {
  return (
    <QueryProvider>
      <DiscoverPageInner/>
    </QueryProvider>
  );
}

function DiscoverPageInner() {
  const [dark,        setDark]        = useState(false);
  const [query,       setQuery]       = useState("");
  const [activeType,  setActiveType]  = useState("All");
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [view, setView] = useState<"split"|"list"|"map">(
  typeof window !== "undefined" && window.innerWidth < 640 ? "list" : "split");
  const [mapReady,    setMapReady]    = useState(false);
  const [sortBy,      setSortBy]      = useState<"date"|"attendance">("date");
  
  const sentinelRef = useRef<HTMLDivElement>(null);
  // ── Real events from API ────────────────────────────────────────────────────
  const {
    events:         rawEvents,
    loading:        eventsLoading,
    error:          eventsError,
    geoLoading,
    geoError,
    locationGranted,
    coords,
    radius,
    setRadius,
    hasMore,        // ← add
  loadMore,       // ← add
  loadingMore,    // ← add
  totalEvents,    // ← add
  } = useDiscoverEvents(10);

  // Map API events → EventCard shape
  const allEvents: Event[] = rawEvents.map(mapDiscoverEvent);

  const mapDivRef  = useRef<HTMLDivElement>(null);
  const mapObjRef  = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());

  // Centre map on user's location or fallback Pune


  // ── Theme tokens ────────────────────────────────────────────────────────────
  const bgPage  = dark ? "#0d0f17"  : "#f5f5f4";
  const bgSurf  = dark ? "#13151f"  : "#ffffff";
  const bdr     = dark ? "border-white/6"   : "border-stone-200";
  const t1      = dark ? "text-white"       : "text-stone-900";
  const t2      = dark ? "text-white/50"    : "text-stone-500";
  const t3      = dark ? "text-white/25"    : "text-stone-400";
  const inp     = dark ? "bg-[#1a1d2e] border-white/10 text-white placeholder:text-white/25 focus:border-amber-400/50"
                       : "bg-white border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-amber-400";
  const ctrl    = dark ? "bg-[#13151f]/92 border-white/10 text-white/55 hover:text-white hover:border-white/25"
                       : "bg-white/95 border-stone-300 text-stone-500 hover:text-stone-900 hover:border-stone-400";
  const lgdBg   = dark ? "bg-[#13151f]/92 border-white/8"  : "bg-white/95 border-stone-200";
  const statBg  = dark ? "bg-[#13151f]/90 border-white/8"  : "bg-white/95 border-stone-200";

  // ── Filter + sort ──────────────────────────────────────────────────────────
  const filtered = allEvents.filter(e => {
    const matchType  = activeType === "All" || e.type === activeType;
    const matchQuery = !query || [e.title, e.description, e.venue, ...e.tags, e.organizerName]
      .join(" ").toLowerCase().includes(query.toLowerCase());
    return matchType && matchQuery;
  }).sort((a, b) => sortBy === "attendance"
    ? b.attendance - a.attendance
    : new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const thisWeekCount = filtered.filter(e => {
    const d = new Date(e.date), now = new Date();
    return d >= now && d.getTime() - now.getTime() < 7 * 86400000;
  }).length;

  // ── Maps init ──────────────────────────────────────────────────────────────
  const bootMap = useCallback(() => {
    if (!mapDivRef.current) return;
    const map = new (window as any).google.maps.Map(mapDivRef.current, {
      center: { lat: 18.5204, lng: 73.8567 }, zoom: 12, disableDefaultUI: true, gestureHandling: "greedy",
      styles: dark ? DARK_STYLES : LIGHT_STYLES,
    });
    mapObjRef.current = map;
    setMapReady(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY as string;
    const ID  = "gmap-script";
    if ((window as any).google?.maps?.Map) { bootMap(); return; }
    if (document.getElementById(ID)) { document.getElementById(ID)!.addEventListener("load", bootMap); return; }
    const s = document.createElement("script");
    s.id = ID; s.src = `https://maps.googleapis.com/maps/api/js?key=${KEY}&v=weekly`;
    s.async = true; s.defer = true; s.onload = bootMap;
    document.head.appendChild(s);
  }, [bootMap]);

  useEffect(() => {
    mapObjRef.current?.setOptions({ styles: dark ? DARK_STYLES : LIGHT_STYLES });
  }, [dark]);

  useEffect(() => {
    if (!mapObjRef.current || !mapReady) return;
    const gm = (window as any).google.maps;
    const ids = new Set(filtered.map(e => e.id));
    markersRef.current.forEach((m, id) => { if (!ids.has(id)) { m.setMap(null); markersRef.current.delete(id); } });
    filtered.forEach(event => {
      const isActive = activeEvent?.id === event.id;
      const color    = ALL_TYPE_META[event.type]?.hex ?? "#f59e0b";
      if (markersRef.current.has(event.id)) {
        markersRef.current.get(event.id)!.setIcon(makeSvgIcon(color, isActive));
        markersRef.current.get(event.id)!.setZIndex(isActive ? 999 : 1);
        return;
      }
      const marker = new gm.Marker({
        map: mapObjRef.current, position: { lat: event.latitude, lng: event.longitude },
        title: event.title, icon: makeSvgIcon(color, isActive), zIndex: isActive ? 999 : 1, optimized: false,
      });
      marker.addListener("mouseover", () => marker.setIcon(makeSvgIcon(color, true)));
      marker.addListener("mouseout",  () => { if (activeEvent?.id !== event.id) marker.setIcon(makeSvgIcon(color, false)); });
      marker.addListener("click",     () => setActiveEvent(p => (p?.id === event.id ? null : event) as Event | null));
      markersRef.current.set(event.id, marker);
    });
  }, [filtered, mapReady, activeEvent]);

  useEffect(() => {
    if (!mapObjRef.current || !activeEvent) return;
    mapObjRef.current.panTo({ lat: activeEvent.latitude, lng: activeEvent.longitude });
    mapObjRef.current.panBy(0, -110);
  }, [activeEvent]);

  useEffect(() => {
    if (!mapObjRef.current || !mapReady || view === "list") return;
    const t = setTimeout(() => (window as any).google?.maps?.event?.trigger(mapObjRef.current, "resize"), 50);
    return () => clearTimeout(t);
  }, [view, mapReady]);
  
  useEffect(() => {
  if (!mapObjRef.current || !mapReady) return;
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      mapObjRef.current.panTo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      mapObjRef.current.setZoom(12);
    },
    () => {} // stay on Pune if denied
  );
}, [mapReady]);

 useEffect(() => {
  if (!sentinelRef.current) return;
  const observer = new IntersectionObserver(
    entries => { if (entries[0].isIntersecting && hasMore && !loadingMore) loadMore(); },
    { threshold: 0.1 }
  );
  observer.observe(sentinelRef.current);
  return () => observer.disconnect();
}, [hasMore, loadingMore, loadMore]);

 
useEffect(() => {
  const check = () => {
    if (window.innerWidth < 640 && view === "split") setView("list");
  };
  check();
  window.addEventListener("resize", check);
  return () => window.removeEventListener("resize", check);
}, [view]);


  const zoomIn   = useCallback(() => mapObjRef.current?.setZoom((mapObjRef.current.getZoom() ?? 12) + 1), []);
  const zoomOut  = useCallback(() => mapObjRef.current?.setZoom((mapObjRef.current.getZoom() ?? 12) - 1), []);
  const recenter = useCallback(() => {
  navigator.geolocation.getCurrentPosition(
    (pos) => mapObjRef.current?.panTo({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
    () => mapObjRef.current?.panTo({ lat: 18.5204, lng: 73.8567 })
  );
  mapObjRef.current?.setZoom(12);
}, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap');
        *,*::before,*::after{box-sizing:border-box}
        html,body{margin:0;height:100%;overflow:hidden}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(128,128,128,.2);border-radius:99px}
        .fade-card{animation:fadeCard .3s ease-out both}
        @keyframes fadeCard{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .popup-enter{animation:popupIn .28s cubic-bezier(.34,1.56,.64,1) both}
        @keyframes popupIn{from{opacity:0;transform:translateX(-50%) scale(.88) translateY(10px)}to{opacity:1;transform:translateX(-50%) scale(1) translateY(0)}}
        .map-pulse{animation:mpulse 1.4s ease-in-out infinite}
        @keyframes mpulse{0%,100%{opacity:.3}50%{opacity:.85}}
        .gm-fullscreen-control,.gm-svpc,.gmnoprint,.gm-style-cc{display:none!important}
        .hide-scrollbar::-webkit-scrollbar{display:none}
        .hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>

      <div className="h-screen w-screen flex flex-col overflow-hidden transition-colors duration-300"
        style={{ background: bgPage }}>

        {/* ── Geo loading screen — shown while waiting for location ── */}
        {geoLoading && (
          <div className="absolute inset-0 z-[200] flex flex-col items-center justify-center gap-4"
            style={{ background: bgPage }}>
            <div className="w-16 h-16 rounded-2xl bg-amber-400/15 flex items-center justify-center map-pulse">
              <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
              </svg>
            </div>
            <p className={`font-black text-sm ${t1}`} style={{fontFamily:"'Playfair Display',Georgia,serif"}}>
              Getting your location…
            </p>
            <p className={`text-xs ${t3}`}>Finding events near you</p>
          </div>
        )}

        <Nav dark={dark} onToggle={() => setDark(d => !d)}/>

        <div className="flex flex-col flex-1 overflow-hidden" style={{ paddingTop: 56 }}>

          {/* ── Filter bar ── */}
          <div className={`border-b ${bdr} px-4 sm:px-5 py-3 flex-shrink-0 transition-colors duration-300`}
            style={{ background: bgSurf }}>
            <div className="max-w-screen-2xl mx-auto space-y-2.5">

              {/* Search + controls */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-xs">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input value={query} onChange={e => setQuery(e.target.value)}
                    placeholder="Search events, venues…"
                    className={`w-full pl-9 pr-4 py-2 rounded-xl border text-sm outline-none transition-all ${inp}`}/>
                  {query && (
                    <button onClick={() => setQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100">
                      <svg className="w-3 h-3" fill="none" stroke={dark?"white":"#374151"} viewBox="0 0 24 24" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  )}
                </div>

                {/* Sort */}
                <button onClick={() => setSortBy(s => s === "date" ? "attendance" : "date")}
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[11px] font-semibold transition-all flex-shrink-0
                    ${dark ? "border-white/10 text-white/40 hover:text-white hover:border-white/20 hover:bg-white/5"
                           : "border-stone-200 text-stone-500 hover:text-stone-800 hover:border-stone-300 hover:bg-stone-50"}`}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="10" y2="18"/>
                  </svg>
                  {sortBy === "date" ? "Soonest" : "Popular"}
                </button>

                {/* View toggle */}
               <div className={`ml-auto flex items-center rounded-xl border overflow-hidden flex-shrink-0 ${dark?"border-white/10":"border-stone-200"}`}>
                  {([
                    { v:"split" as const, title:"Split",hide:"hidden sm:flex",
                      icon:<><rect x="2" y="3" width="9" height="18" rx="1"/><rect x="13" y="3" width="9" height="18" rx="1"/></> },
                    { v:"list"  as const, title:"List",
                      icon:<><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></> },
                    { v:"map"   as const, title:"Map",
                      icon:<><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></> },
                  ]).map(({ v, icon, title , hide}) => (
                    <button key={v} onClick={() => setView(v)} title={title}
                      className={`${hide} w-9 h-8 flex items-center justify-center transition-all
                        ${view === v ? "bg-amber-500 text-white"
                          : dark ? "text-white/35 hover:text-white hover:bg-white/8"
                                 : "text-stone-400 hover:text-stone-700 hover:bg-stone-100"}`}>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">{icon}</svg>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
                <button onClick={() => setActiveType("All")}
                  className={`flex-shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black transition-all border
                    ${activeType === "All"
                      ? "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/25"
                      : dark ? "border-white/10 text-white/40 hover:text-white hover:border-white/20 hover:bg-white/6"
                             : "border-stone-200 text-stone-500 hover:text-stone-800 hover:border-stone-300 hover:bg-stone-50"}`}>
                  ✦ All
                </button>
                {CATEGORIES.map(cat => {
                  const active = activeType === cat.value;
                  return (
                    <button key={cat.value} onClick={() => setActiveType(active ? "All" : cat.value)}
                      className={`flex-shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black transition-all border
                        ${active
                          ? "text-white border-transparent shadow-md"
                          : dark ? "border-white/10 text-white/40 hover:text-white hover:border-white/20 hover:bg-white/6"
                                 : "border-stone-200 text-stone-500 hover:text-stone-800 hover:border-stone-300 hover:bg-stone-50"}`}
                      style={active ? { backgroundColor: cat.hex, boxShadow: `0 4px 12px ${cat.hex}40` } : {}}>
                      <span className="text-xs leading-none">{cat.emoji}</span>
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Geo status + radius slider */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Location badge */}
                <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border flex-shrink-0
                  ${locationGranted
                    ? dark ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400" : "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : dark ? "border-white/10 bg-white/5 text-white/30" : "border-stone-200 bg-stone-100 text-stone-400"
                  }`}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  {locationGranted ? "Using your location" : "Using Pune (default)"}
                </div>

                {/* API loading indicator */}
                {eventsLoading && (
                  <div className={`flex items-center gap-1.5 text-[10px] font-bold ${t3}`}>
                    <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Searching…
                  </div>
                )}

                {/* Radius slider */}
                <div className="flex items-center gap-2 ml-auto">
                  <span className={`text-[10px] font-bold flex-shrink-0 ${t3}`}>Radius</span>
                  <input
                    type="range" min="1" max="1000" step="1" value={radius}
                    onChange={e => setRadius(Number(e.target.value))}
                    className="w-24 accent-amber-500 cursor-pointer"
                  />
                  <span className={`text-[10px] font-black w-10 flex-shrink-0 ${t2}`}>{radius} km</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Two-panel layout ── */}
          <div className="flex flex-1 overflow-hidden">

            {/* Sidebar */}
            <div className={`flex flex-col border-r ${bdr} overflow-hidden flex-shrink-0 transition-all duration-300 ${
              view === "list" ? "w-full" : view === "split" ? "w-[380px] lg:w-[420px] xl:w-[460px]" : "w-0 opacity-0 pointer-events-none"
            }`} style={{ background: bgPage }}>

              <div className={`px-4 py-2 border-b ${bdr} flex items-center justify-between flex-shrink-0 transition-colors`}
                style={{ background: bgSurf }}>
                <span className={`text-xs font-bold ${t2}`}>
                {totalEvents > 0 ? `${filtered.length} of ${totalEvents}` : filtered.length} event{filtered.length !== 1 ? "s" : ""} nearby
                </span>
                <button onClick={() => setSortBy(s => s === "date" ? "attendance" : "date")}
                  className={`sm:hidden flex items-center gap-1 text-[11px] font-semibold transition-colors ${t3}`}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="10" y2="18"/>
                  </svg>
                  {sortBy === "date" ? "Soonest" : "Popular"}
                </button>
              </div>

              <div className={`flex-1 overflow-y-auto p-3 ${
                view === "list"
                  ? "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 content-start"
                  : "space-y-3"
              }`}>
                {eventsLoading && filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center col-span-full">
                    <svg className="w-8 h-8 animate-spin text-amber-500 mb-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    <p className={`text-sm font-bold ${t2}`}>Finding events near you…</p>
                  </div>
                ) : eventsError ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center col-span-full">
                    <div className="text-3xl mb-3">⚠️</div>
                    <p className={`font-bold text-sm mb-1 ${t1}`}>Failed to load events</p>
                    <p className={`text-xs mb-4 ${t3}`}>{eventsError}</p>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center col-span-full">
                    <div className="text-4xl mb-3">🔍</div>
                    <p className={`font-bold text-sm mb-1 ${t1}`}>No events found</p>
                    <p className={`text-sm mb-4 ${t3}`}>Try a different search or category</p>
                    <button onClick={() => { setQuery(""); setActiveType("All"); }}
                      className="text-amber-500 text-sm font-semibold border border-amber-500/30 px-4 py-2 rounded-xl hover:bg-amber-500/10 transition-all">
                      Clear filters
                    </button>
                  </div>
                ) : (
                  filtered.map((event, i) => (
                    <div key={event.id} className="fade-card" style={{ animationDelay: `${Math.min(i*25,250)}ms` }}>
                      <EventCard
                        event={event}
                        dark={dark}
                        active={activeEvent?.id === event.id}
                        onClick={() => setActiveEvent(p => (p?.id === event.id ? null : event) as Event | null)}
                      />
                    </div>
                  ))
                )}
              </div>

             {/* Infinite scroll sentinel */}
                  <div ref={sentinelRef} className="py-2 flex justify-center">
                    {loadingMore && (
                      <svg className="w-5 h-5 animate-spin text-amber-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                    )}
                    {/* {!hasMore && filtered.length > 0 && (
                      <p className={`text-[10px] font-semibold ${t3}`}>All events loaded</p>
                    )} */}
                  </div>

            </div>
           
            {/* Map */}
            <div className={`relative overflow-hidden flex-shrink-0 transition-all duration-300 ${
              view === "list" ? "w-0 opacity-0 pointer-events-none" : "flex-1"
            }`}>
              <div ref={mapDivRef} className="absolute inset-0 w-full h-full"/>

              {!mapReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 pointer-events-none"
                  style={{ background: bgPage }}>
                  <div className="w-14 h-14 rounded-2xl bg-amber-400/12 flex items-center justify-center map-pulse">
                    <svg className="w-7 h-7 text-amber-400/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
                      <line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
                    </svg>
                  </div>
                  <p className={`text-sm font-semibold map-pulse ${t3}`}>Loading map…</p>
                </div>
              )}

              {activeEvent && mapReady && (
                <div className="absolute bottom-5 left-1/2 z-30 popup-enter" style={{ transform:"translateX(-50%)" }}>
                  <MapPopupCard event={activeEvent} dark={dark} onClose={() => setActiveEvent(null)}/>
                </div>
              )}

              {mapReady && (
                <div className="absolute top-4 left-4 z-20 flex gap-2 pointer-events-none">
                  {[{ label:"Nearby", val:filtered.length },{ label:"This week", val:thisWeekCount }].map(s => (
                    <div key={s.label} className={`border backdrop-blur-md rounded-xl px-3 py-2 shadow-xl ${statBg}`}>
                      <div className="text-amber-500 font-black text-sm leading-none"
                        style={{fontFamily:"'Playfair Display',Georgia,serif"}}>{s.val}</div>
                      <div className={`text-[10px] font-semibold mt-0.5 ${t3}`}>{s.label}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                {[{ fn:zoomIn,ch:"+",t:"Zoom in" },{ fn:zoomOut,ch:"−",t:"Zoom out" }].map(b => (
                  <button key={b.ch} onClick={b.fn} title={b.t}
                    className={`w-9 h-9 rounded-xl border backdrop-blur-md flex items-center justify-center shadow-xl transition-all text-lg font-bold leading-none ${ctrl}`}>
                    {b.ch}
                  </button>
                ))}
                <div className={`w-px h-2.5 mx-auto ${dark?"bg-white/10":"bg-stone-300"}`}/>
                <button onClick={recenter} title="Re-centre"
                  className={`w-9 h-9 rounded-xl border backdrop-blur-md flex items-center justify-center shadow-xl transition-all ${ctrl}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
                  </svg>
                </button>
              </div>

              {mapReady && (
                <div className={`absolute bottom-5 right-4 z-20 border backdrop-blur-md rounded-2xl px-4 py-3 shadow-xl ${lgdBg}`}>
                  <div className={`text-[9px] font-black tracking-widest uppercase mb-2 ${t3}`}>Event Types</div>
                  <div className="space-y-1.5">
                    {CATEGORIES.filter(cat => filtered.some(e => e.type === cat.value)).map(cat => (
                      <button key={cat.value}
                        onClick={() => setActiveType(t => t === cat.value ? "All" : cat.value)}
                        className={`flex items-center gap-2 w-full transition-opacity hover:opacity-100 ${
                          activeType !== "All" && activeType !== cat.value ? "opacity-20" : "opacity-100"
                        }`}>
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.hex }}/>
                        <span className={`text-[10px] font-semibold ${t2}`}>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
      <EventSearchModal dark={dark} />
      </div>
    </>
  );
}