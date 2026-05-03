"use client";

// src/app/discover/page.tsx

import { useCallback, useEffect, useRef, useState } from "react";
import { EventCard, MapPopupCard, TYPE_META } from "@/components/EventCard";
import type { Event } from "@/components/EventCard";
import { QueryProvider } from "@/components/QueryProvider";
import { useDiscoverEvents } from "@/hooks/eventimist/user/events/useDiscoverEvents";
import type { DiscoverEvent } from "@/services/eventimist/user/events/discoverEvents.service";

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

// ─── Dummy events (one per category) ─────────────────────────────────────────
const DUMMY_EVENTS: Event[] = [
  { id:"1",  title:"Sunburn Arena ft. Martin Garrix",  type:"Music",         description:"India's premier electronic music festival. World-class production, lasers, 20k+ fans.",       date:"2026-08-12T19:00:00", venue:"JLN Stadium, New Delhi",          tags:["EDM","Festival","Live"],           image_url:"https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80", attendance:18400, organizerName:"Percept Live",         organizer:"perceptlive",    organizerProfilepic:"https://i.pravatar.cc/40?img=11", latitude:28.5867, longitude:77.2355, organizerId:"org1" },
  { id:"2",  title:"Delhi Tech Summit 2026",            type:"Tech",          description:"Two days of AI, cloud infra, developer tooling. 80+ speakers. Workshops. Hackathon.",         date:"2026-08-18T09:00:00", venue:"Bharat Mandapam, Pragati Maidan", tags:["AI","Web3","Startup"],             image_url:"https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80", attendance:4200,  organizerName:"TechIndia Foundation", organizer:"techindia",      organizerProfilepic:"https://i.pravatar.cc/40?img=12", latitude:28.6189, longitude:77.2438, organizerId:"org2" },
  { id:"3",  title:"Street Food Trail — Old Delhi",     type:"Food",          description:"Guided walk through Chandni Chowk. 14 iconic dishes from century-old establishments.",        date:"2026-08-20T11:00:00", venue:"Chandni Chowk Metro Exit 1",      tags:["Food","Heritage","Walk"],          image_url:"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80", attendance:28,    organizerName:"Delhi Food Walks",    organizer:"delhifoodwalks", organizerProfilepic:"https://i.pravatar.cc/40?img=15", latitude:28.6562, longitude:77.2410, organizerId:"org3" },
  { id:"4",  title:"Lodhi Art District Open Day",       type:"Art",           description:"World's largest open-air art district. Meet 12 artists, live muraling, curator walkthrough.",  date:"2026-08-25T10:00:00", venue:"Lodhi Colony, New Delhi",         tags:["Mural","Contemporary","Free"],    image_url:"https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=600&q=80", attendance:800,   organizerName:"St+art India",        organizer:"startindia",     organizerProfilepic:"https://i.pravatar.cc/40?img=16", latitude:28.5906, longitude:77.2256, organizerId:"org4" },
  { id:"5",  title:"IPL Watch Party — RCB vs MI",       type:"Sports",        description:"Giant 30ft screen, fan zones, food stalls, live DJs between overs. Roar with 2,000 fans.",    date:"2026-08-28T19:30:00", venue:"Siri Fort Auditorium, Delhi",     tags:["Cricket","IPL","Screening"],      image_url:"https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&q=80", attendance:2100,  organizerName:"FanPark India",       organizer:"fanpark",        organizerProfilepic:"https://i.pravatar.cc/40?img=17", latitude:28.5530, longitude:77.2090, organizerId:"org5" },
  { id:"6",  title:"Holi Mela — Colours & Culture",     type:"Festival",      description:"Organic colours, folk music, dhol sessions, thandai, live Rajasthani performers.",            date:"2026-09-14T08:00:00", venue:"Purana Qila Grounds, Delhi",      tags:["Holi","Culture","Family"],        image_url:"https://images.unsplash.com/photo-1590736704728-f4730bb30770?w=600&q=80", attendance:6000,  organizerName:"Delhi Events Co.",    organizer:"delhievents",    organizerProfilepic:"https://i.pravatar.cc/40?img=20", latitude:28.6107, longitude:77.2427, organizerId:"org6" },
  { id:"7",  title:"Yamuna Cleanup Drive",               type:"Volunteer",     description:"500 volunteers, Delhi's largest cleanup. Equipment & breakfast provided.",                    date:"2026-09-04T06:30:00", venue:"Yamuna Ghat, Near ITO Bridge",    tags:["Environment","Community","Free"], image_url:"https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&q=80", attendance:490,   organizerName:"YamunaFirst",         organizer:"yamunafirst",    organizerProfilepic:"https://i.pravatar.cc/40?img=18", latitude:28.6304, longitude:77.2567, organizerId:"org7" },
  { id:"8",  title:"UX Designers Meetup #22",            type:"Networking",    description:"Monthly Delhi NCR meetup. Lightning talks, portfolio reviews, open craft discussions.",        date:"2026-09-08T18:30:00", venue:"91springboard, Okhla Phase 3",    tags:["Design","Product","UX"],          image_url:"https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&q=80", attendance:120,   organizerName:"DesignDelhi",         organizer:"designdelhi",    organizerProfilepic:"https://i.pravatar.cc/40?img=19", latitude:28.5357, longitude:77.2720, organizerId:"org8" },
  { id:"9",  title:"Photography Masterclass",            type:"Workshop",      description:"Full-day hands-on workshop in Old Delhi with documentary photographer Kiran Rao.",             date:"2026-09-15T08:00:00", venue:"India Habitat Centre, New Delhi", tags:["Photography","Street","Workshop"],image_url:"https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=600&q=80", attendance:35,    organizerName:"Frame India",         organizer:"frameindia",     organizerProfilepic:"https://i.pravatar.cc/40?img=22", latitude:28.5987, longitude:77.2228, organizerId:"org9" },
  { id:"10", title:"Future of Work Conference 2026",     type:"Conference",    description:"AI in hiring, remote culture, Gen-Z expectations. 650 HR leaders and founders.",              date:"2026-09-22T09:00:00", venue:"The Leela Ambience, Gurugram",    tags:["HR","Startup","Leadership"],      image_url:"https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&q=80", attendance:650,   organizerName:"WorkSphere",          organizer:"worksphere",     organizerProfilepic:"https://i.pravatar.cc/40?img=23", latitude:28.5020, longitude:77.0915, organizerId:"org10" },
  { id:"11", title:"STEM for Schools — Science Fair",    type:"Education",     description:"600+ student projects across robotics, biology, and AI. Open to public viewing.",             date:"2026-09-28T10:00:00", venue:"Pragati Maidan, Hall 7",          tags:["STEM","Science","Youth"],         image_url:"https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80", attendance:1200,  organizerName:"EduIndia Trust",      organizer:"eduindia",       organizerProfilepic:"https://i.pravatar.cc/40?img=24", latitude:28.6195, longitude:77.2440, organizerId:"org11" },
  { id:"12", title:"Startup Founders Bootcamp",          type:"Business",      description:"3-day intensive for early-stage founders. Fundraising, GTM, product-market fit.",             date:"2026-10-05T09:00:00", venue:"WeWork BKC, Mumbai",              tags:["Startup","Funding","GTM"],        image_url:"https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600&q=80", attendance:280,   organizerName:"Founder Circle",      organizer:"foundercircle",  organizerProfilepic:"https://i.pravatar.cc/40?img=25", latitude:19.0611, longitude:72.8658, organizerId:"org12" },
  { id:"13", title:"Run for Wellness — 5K & 10K",        type:"Health",        description:"Community run through Lodhi Garden. All fitness levels. Medal for all finishers.",            date:"2026-10-10T06:00:00", venue:"Lodhi Garden, New Delhi",         tags:["Running","Fitness","Community"],  image_url:"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80", attendance:3200,  organizerName:"RunIndia",            organizer:"runindia",       organizerProfilepic:"https://i.pravatar.cc/40?img=26", latitude:28.5929, longitude:77.2200, organizerId:"org13" },
  { id:"14", title:"Bollywood Night Live",               type:"Entertainment", description:"Live band, dance performances, stand-up comedy, DJ set to close. 5-hour extravaganza.",       date:"2026-10-18T19:00:00", venue:"Jawaharlal Nehru Stadium",        tags:["Bollywood","Dance","Comedy"],     image_url:"https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80", attendance:8000,  organizerName:"ShowTime India",      organizer:"showtime",       organizerProfilepic:"https://i.pravatar.cc/40?img=27", latitude:28.5820, longitude:77.2365, organizerId:"org14" },
  { id:"15", title:"IndiaGameCon 2026",                  type:"Gaming",        description:"India's largest gaming convention. 200 playable titles, esports finals, dev panels.",          date:"2026-10-25T10:00:00", venue:"NSIC Exhibition Ground, Delhi",   tags:["Esports","Indie","Console"],      image_url:"https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80", attendance:12000, organizerName:"GameOn India",        organizer:"gameon",         organizerProfilepic:"https://i.pravatar.cc/40?img=28", latitude:28.5245, longitude:77.1855, organizerId:"org15" },
];

// ─── Map API response → EventCard's Event shape ───────────────────────────────
function mapDiscoverEvent(e: DiscoverEvent): Event {
  return {
    id:                  String(e.id),
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

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
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
          <a href="/user" className={`text-sm hidden sm:block font-medium px-3 py-1.5 rounded-xl transition-all ${link}`}>Sign In</a>
          <a href="/user" className="text-sm font-black bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-amber-400/30 hover:scale-[1.02] transition-all">
            Get Started
          </a>
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
  const [dark,        setDark]        = useState(true);
  const [query,       setQuery]       = useState("");
  const [activeType,  setActiveType]  = useState("All");
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [view,        setView]        = useState<"split"|"list"|"map">("split");
  const [mapReady,    setMapReady]    = useState(false);
  const [sortBy,      setSortBy]      = useState<"date"|"attendance">("date");

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
  } = useDiscoverEvents(10);

  // Map API events → EventCard shape
  const allEvents: Event[] = rawEvents.map(mapDiscoverEvent);

  const mapDivRef  = useRef<HTMLDivElement>(null);
  const mapObjRef  = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());

  // Centre map on user's location or fallback Pune
  const MAP_CENTER = coords
    ? { lat: coords.latitude, lng: coords.longitude }
    : { lat: 18.5204, lng: 73.8567 };

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
      center: MAP_CENTER, zoom: 12, disableDefaultUI: true, gestureHandling: "greedy",
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

  const zoomIn   = useCallback(() => mapObjRef.current?.setZoom((mapObjRef.current.getZoom() ?? 12) + 1), []);
  const zoomOut  = useCallback(() => mapObjRef.current?.setZoom((mapObjRef.current.getZoom() ?? 12) - 1), []);
  const recenter = useCallback(() => { mapObjRef.current?.panTo(MAP_CENTER); mapObjRef.current?.setZoom(12); }, []);

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
                    { v:"split" as const, title:"Split",
                      icon:<><rect x="2" y="3" width="9" height="18" rx="1"/><rect x="13" y="3" width="9" height="18" rx="1"/></> },
                    { v:"list"  as const, title:"List",
                      icon:<><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></> },
                    { v:"map"   as const, title:"Map",
                      icon:<><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></> },
                  ]).map(({ v, icon, title }) => (
                    <button key={v} onClick={() => setView(v)} title={title}
                      className={`w-9 h-8 flex items-center justify-center transition-all
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
                    type="range" min="1" max="100" step="1" value={radius}
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
                  {filtered.length} event{filtered.length !== 1 ? "s" : ""} near Delhi
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
      </div>
    </>
  );
}