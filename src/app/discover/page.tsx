"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EventCard, MapPopupCard, TYPE_META } from "@/components/EventCard";
import type { Event } from "@/components/EventCard";

// ─── Dummy events ─────────────────────────────────────────────────────────────
const DUMMY_EVENTS: Event[] = [
  {
    id: "1", title: "Sunburn Arena ft. Martin Garrix", type: "Music",
    description: "India's premier electronic music festival returns. World-class production, lasers, pyrotechnics, and 20,000+ fans.",
    date: "2025-04-12T19:00:00", venue: "JLN Stadium, New Delhi",
    tags: ["EDM", "Festival", "Live"],
    image_url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80",
    attendance: 18400, organizerName: "Percept Live", organizer: "perceptlive",
    organizerProfilepic: "https://i.pravatar.cc/40?img=11",
    latitude: 28.5867, longitude: 77.2355, organizerId: "org1",
  },
  {
    id: "2", title: "Delhi Tech Summit 2025", type: "Tech",
    description: "Two days of AI, cloud infra, and developer tooling. 80+ speakers. Workshops. Hackathon.",
    date: "2025-04-18T09:00:00", venue: "Bharat Mandapam, Pragati Maidan",
    tags: ["AI", "Web3", "Startup"],
    image_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80",
    attendance: 4200, organizerName: "TechIndia Foundation", organizer: "techindia",
    organizerProfilepic: "https://i.pravatar.cc/40?img=12",
    latitude: 28.6189, longitude: 77.2438, organizerId: "org2",
  },
  {
    id: "3", title: "Street Food Trail — Old Delhi", type: "Food",
    description: "Guided walk through Chandni Chowk. 14 iconic dishes from century-old establishments. Capped at 30.",
    date: "2025-04-20T11:00:00", venue: "Chandni Chowk Metro Exit 1",
    tags: ["Food", "Heritage", "Walk"],
    image_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
    attendance: 28, organizerName: "Delhi Food Walks", organizer: "delhifoodwalks",
    organizerProfilepic: "https://i.pravatar.cc/40?img=15",
    latitude: 28.6562, longitude: 77.2410, organizerId: "org3",
  },
  {
    id: "4", title: "Lodhi Art District Open Day", type: "Art",
    description: "World's largest open-air art district. Meet 12 artists, live muraling, curator-led walkthrough.",
    date: "2025-04-25T10:00:00", venue: "Lodhi Colony, New Delhi",
    tags: ["Mural", "Contemporary", "Free"],
    image_url: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=600&q=80",
    attendance: 800, organizerName: "St+art India", organizer: "startindia",
    organizerProfilepic: "https://i.pravatar.cc/40?img=16",
    latitude: 28.5906, longitude: 77.2256, organizerId: "org4",
  },
  {
    id: "5", title: "IPL Watch Party — RCB vs MI", type: "Sports",
    description: "Giant 30ft screen, fan zones, food stalls, live DJs between overs. Roar with 2,000 fans.",
    date: "2025-04-28T19:30:00", venue: "Siri Fort Auditorium, Delhi",
    tags: ["Cricket", "IPL", "Screening"],
    image_url: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&q=80",
    attendance: 2100, organizerName: "FanPark India", organizer: "fanpark",
    organizerProfilepic: "https://i.pravatar.cc/40?img=17",
    latitude: 28.5530, longitude: 77.2090, organizerId: "org5",
  },
  {
    id: "6", title: "Yamuna Riverfront Cleanup Drive", type: "Volunteer",
    description: "500 volunteers, one of Delhi's largest cleanup drives. Equipment and breakfast provided.",
    date: "2025-05-04T06:30:00", venue: "Yamuna Ghat, Near ITO Bridge",
    tags: ["Environment", "Community", "Free"],
    image_url: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&q=80",
    attendance: 490, organizerName: "YamunaFirst", organizer: "yamunafirst",
    organizerProfilepic: "https://i.pravatar.cc/40?img=18",
    latitude: 28.6304, longitude: 77.2567, organizerId: "org6",
  },
  {
    id: "7", title: "UX Designers Meetup #22", type: "Networking",
    description: "Monthly Delhi NCR meetup. Lightning talks, portfolio reviews, open craft discussions.",
    date: "2025-05-08T18:30:00", venue: "91springboard, Okhla Phase 3",
    tags: ["Design", "Product", "UX"],
    image_url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&q=80",
    attendance: 120, organizerName: "DesignDelhi", organizer: "designdelhi",
    organizerProfilepic: "https://i.pravatar.cc/40?img=19",
    latitude: 28.5357, longitude: 77.2720, organizerId: "org7",
  },
  {
    id: "8", title: "Holi Mela — Colours & Culture", type: "Festival",
    description: "Organic colours, folk music, dhol sessions, thandai, live Rajasthani performers.",
    date: "2025-03-14T08:00:00", venue: "Purana Qila Grounds, Delhi",
    tags: ["Holi", "Culture", "Family"],
    image_url: "https://images.unsplash.com/photo-1590736704728-f4730bb30770?w=600&q=80",
    attendance: 6000, organizerName: "Delhi Events Co.", organizer: "delhievents",
    organizerProfilepic: "https://i.pravatar.cc/40?img=20",
    latitude: 28.6107, longitude: 77.2427, organizerId: "org8",
  },
  {
    id: "9", title: "Photography Masterclass — Street & Documentary", type: "Workshop",
    description: "Full-day hands-on workshop in Old Delhi with documentary photographer Kiran Rao.",
    date: "2025-05-15T08:00:00", venue: "India Habitat Centre, New Delhi",
    tags: ["Photography", "Street", "Workshop"],
    image_url: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=600&q=80",
    attendance: 35, organizerName: "Frame India", organizer: "frameindia",
    organizerProfilepic: "https://i.pravatar.cc/40?img=22",
    latitude: 28.5987, longitude: 77.2228, organizerId: "org9",
  },
  {
    id: "10", title: "Future of Work Conference 2025", type: "Conference",
    description: "One-day conference for HR leaders and founders. AI in hiring, remote culture, Gen-Z expectations.",
    date: "2025-05-22T09:00:00", venue: "The Leela Ambience, Gurugram",
    tags: ["HR", "Startup", "Leadership"],
    image_url: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&q=80",
    attendance: 650, organizerName: "WorkSphere", organizer: "worksphere",
    organizerProfilepic: "https://i.pravatar.cc/40?img=23",
    latitude: 28.5020, longitude: 77.0915, organizerId: "org10",
  },
];

const EVENT_TYPES = ["All","Music","Tech","Food","Art","Sports","Festival","Volunteer","Networking","Workshop","Conference"];

const TYPE_PILL_ACTIVE: Record<string, string> = {
  All: "bg-amber-400 text-[#0d0f17]", Music: "bg-violet-500 text-white",
  Tech: "bg-blue-500 text-white", Food: "bg-orange-500 text-white",
  Art: "bg-pink-500 text-white", Sports: "bg-green-500 text-white",
  Festival: "bg-amber-500 text-[#0d0f17]", Volunteer: "bg-teal-500 text-white",
  Networking: "bg-cyan-500 text-white", Workshop: "bg-rose-500 text-white",
  Conference: "bg-indigo-500 text-white",
};

const DARK_STYLES = [
  { elementType: "geometry",                stylers: [{ color: "#0d0f17" }] },
  { elementType: "labels.text.stroke",      stylers: [{ color: "#0d0f17" }] },
  { elementType: "labels.text.fill",        stylers: [{ color: "#3d4966" }] },
  { featureType: "administrative",          elementType: "geometry",         stylers: [{ color: "#1a2035" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#6b7a99" }] },
  { featureType: "poi",                     stylers: [{ visibility: "off" }] },
  { featureType: "road",                    elementType: "geometry",         stylers: [{ color: "#1e2440" }] },
  { featureType: "road",                    elementType: "geometry.stroke",  stylers: [{ color: "#0d0f17" }] },
  { featureType: "road",                    elementType: "labels.text.fill", stylers: [{ color: "#374160" }] },
  { featureType: "road.highway",            elementType: "geometry",         stylers: [{ color: "#263052" }] },
  { featureType: "road.highway",            elementType: "geometry.stroke",  stylers: [{ color: "#1a2035" }] },
  { featureType: "road.highway",            elementType: "labels.text.fill", stylers: [{ color: "#4a5878" }] },
  { featureType: "transit",                 stylers: [{ visibility: "off" }] },
  { featureType: "water",                   elementType: "geometry",         stylers: [{ color: "#080b14" }] },
  { featureType: "water",                   elementType: "labels.text.fill", stylers: [{ color: "#1a2035" }] },
];

// SVG marker icon as base64 data-URI — works on all map types, no mapId needed
function makeSvgIcon(color: string, active: boolean) {
  const w = active ? 42 : 34;
  const h = Math.round(w * 1.22);
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
function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#0d0f17]/97 backdrop-blur-xl border-b border-white/6 flex items-center px-5">
      <div className="max-w-screen-2xl mx-auto w-full flex items-center gap-4">
        <a href="/" className="flex items-center gap-2 flex-shrink-0 mr-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <span className="text-white font-black text-lg tracking-tight hidden sm:block" style={{ fontFamily: "'Playfair Display',Georgia,serif" }}>
            eventimist
          </span>
        </a>
        <div className="hidden md:flex items-center gap-0.5 text-sm flex-1">
          {[
            { label: "Discover",      href: "/discover",  active: true  },
            { label: "Organise",      href: "/organize",  active: false },
            { label: "Eventix Space", href: "/eventix",   active: false },
            { label: "Volunteer",     href: "/volunteer", active: false },
          ].map(l => (
            <a key={l.label} href={l.href}
              className={`px-3.5 py-2 rounded-xl font-semibold transition-all ${l.active ? "text-amber-400 bg-amber-400/10" : "text-white/40 hover:text-white/80 hover:bg-white/5"}`}>
              {l.label}
            </a>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <a href="/user" className="text-sm text-white/45 hover:text-white hidden sm:block font-medium px-3 py-2 rounded-xl hover:bg-white/5 transition-all">
            Sign In
          </a>
          <a href="/user" className="text-sm font-black bg-gradient-to-r from-amber-400 to-orange-500 text-[#0d0f17] px-4 py-2.5 rounded-xl hover:shadow-lg hover:shadow-amber-400/30 hover:scale-[1.02] transition-all">
            Get Started
          </a>
        </div>
      </div>
    </nav>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DiscoverPage() {
  const [query,       setQuery]       = useState("");
  const [activeType,  setActiveType]  = useState("All");
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [view,        setView]        = useState<"split" | "list" | "map">("split");
  const [mapReady,    setMapReady]    = useState(false);
  const [sortBy,      setSortBy]      = useState<"date" | "attendance">("date");

  const mapDivRef  = useRef<HTMLDivElement>(null);
  const mapObjRef  = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());

  const userCity   = "New Delhi";
  const MAP_CENTER = { lat: 28.6139, lng: 77.2090 };

  // ── Filtered + sorted events ───────────────────────────────────────────────
  const filtered = DUMMY_EVENTS.filter(e => {
    const matchType  = activeType === "All" || e.type === activeType;
    const matchQuery = query === "" ||
      [e.title, e.description, e.venue, ...e.tags, e.organizerName]
        .join(" ").toLowerCase().includes(query.toLowerCase());
    return matchType && matchQuery;
  }).sort((a, b) =>
    sortBy === "attendance"
      ? b.attendance - a.attendance
      : new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const thisWeekCount = filtered.filter(e => {
    const d = new Date(e.date), now = new Date();
    return d >= now && d.getTime() - now.getTime() < 7 * 86400000;
  }).length;

  // ── Google Maps init ───────────────────────────────────────────────────────
  useEffect(() => {
    const KEY       = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY as string;
    const SCRIPT_ID = "gmap-script";

    function bootMap() {
      if (!mapDivRef.current) return;
      const map = new (window as any).google.maps.Map(mapDivRef.current, {
        center: MAP_CENTER,
        zoom: 12,
        disableDefaultUI: true,
        gestureHandling: "greedy",
        styles: DARK_STYLES,
      });
      mapObjRef.current = map;
      setMapReady(true);
    }

    if ((window as any).google?.maps?.Map) { bootMap(); return; }
    if (document.getElementById(SCRIPT_ID)) {
      document.getElementById(SCRIPT_ID)!.addEventListener("load", bootMap);
      return;
    }
    const s   = document.createElement("script");
    s.id      = SCRIPT_ID;
    s.src     = `https://maps.googleapis.com/maps/api/js?key=${KEY}&v=weekly`;
    s.async   = true;
    s.defer   = true;
    s.onload  = bootMap;
    s.onerror = () => console.error("[Eventimist] Google Maps failed. Check NEXT_PUBLIC_GOOGLE_MAPS_KEY.");
    document.head.appendChild(s);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Place / update markers ─────────────────────────────────────────────────
  useEffect(() => {
    if (!mapObjRef.current || !mapReady) return;
    const gm = (window as any).google.maps;
    const filteredIds = new Set(filtered.map(e => e.id));

    markersRef.current.forEach((marker, id) => {
      if (!filteredIds.has(id)) { marker.setMap(null); markersRef.current.delete(id); }
    });

    filtered.forEach(event => {
      const isActive = activeEvent?.id === event.id;
      const color    = TYPE_META[event.type]?.hex ?? TYPE_META.default.hex;

      if (markersRef.current.has(event.id)) {
        markersRef.current.get(event.id)!.setIcon(makeSvgIcon(color, isActive));
        markersRef.current.get(event.id)!.setZIndex(isActive ? 999 : 1);
        return;
      }

      const marker = new gm.Marker({
        map: mapObjRef.current,
        position: { lat: event.latitude, lng: event.longitude },
        title: event.title,
        icon: makeSvgIcon(color, isActive),
        zIndex: isActive ? 999 : 1,
        optimized: false,
      });

      marker.addListener("mouseover", () => marker.setIcon(makeSvgIcon(color, true)));
      marker.addListener("mouseout",  () => {
        if (activeEvent?.id !== event.id) marker.setIcon(makeSvgIcon(color, false));
      });
      marker.addListener("click", () =>
        setActiveEvent(prev => prev?.id === event.id ? null : event)
      );
      markersRef.current.set(event.id, marker);
    });
  }, [filtered, mapReady, activeEvent]);

  // ── Pan to active event ────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapObjRef.current || !activeEvent) return;
    mapObjRef.current.panTo({ lat: activeEvent.latitude, lng: activeEvent.longitude });
    mapObjRef.current.panBy(0, -110);
  }, [activeEvent]);

  // ── Resize map when view switches back to split/map ────────────────────────
  // The map div is always in the DOM (never unmounted) so the Maps instance is
  // preserved. But after being hidden the container has zero painted size —
  // firing 'resize' makes Maps re-measure and redraw tiles correctly.
  useEffect(() => {
    if (!mapObjRef.current || !mapReady || view === "list") return;
    const t = setTimeout(() => {
      (window as any).google?.maps?.event?.trigger(mapObjRef.current, "resize");
    }, 50);
    return () => clearTimeout(t);
  }, [view, mapReady]);

  // ── Map controls ───────────────────────────────────────────────────────────
  const zoomIn   = useCallback(() => mapObjRef.current?.setZoom((mapObjRef.current.getZoom() ?? 12) + 1), []);
  const zoomOut  = useCallback(() => mapObjRef.current?.setZoom((mapObjRef.current.getZoom() ?? 12) - 1), []);
  const recenter = useCallback(() => { mapObjRef.current?.panTo(MAP_CENTER); mapObjRef.current?.setZoom(12); }, []);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin: 0; background: #0d0f17; height: 100%; overflow: hidden; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 99px; }
        .fade-card { animation: fadeCard .32s ease-out both; }
        @keyframes fadeCard { from { opacity:0; transform:translateY(7px); } to { opacity:1; transform:translateY(0); } }
        .popup-enter { animation: popupIn .28s cubic-bezier(.34,1.56,.64,1) both; }
        @keyframes popupIn {
          from { opacity:0; transform:translateX(-50%) scale(.88) translateY(10px); }
          to   { opacity:1; transform:translateX(-50%) scale(1)   translateY(0);    }
        }
        .map-pulse { animation: mpulse 1.4s ease-in-out infinite; }
        @keyframes mpulse { 0%,100%{ opacity:.3; } 50%{ opacity:.85; } }
        .gm-fullscreen-control, .gm-svpc, .gmnoprint, .gm-style-cc { display: none !important; }
      `}</style>

      <div className="h-screen w-screen bg-[#0d0f17] text-white flex flex-col overflow-hidden">
        <Nav />

        <div className="flex flex-col flex-1 overflow-hidden" style={{ paddingTop: 64 }}>

          {/* ── Search + filter bar ──────────────────────────────────────── */}
          <div className="bg-[#0d0f17]/98 backdrop-blur-xl border-b border-white/7 px-4 md:px-5 py-3 z-30 flex-shrink-0">
            <div className="max-w-screen-2xl mx-auto space-y-2.5">

              {/* Row 1: search · location · sort · view toggle */}
              <div className="flex items-center gap-2.5">

                {/* Search */}
                <div className="flex-1 relative group min-w-0">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-amber-400/70 transition-colors pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                  </span>
                  <input
                    type="text" value={query} onChange={e => setQuery(e.target.value)}
                    placeholder="Search events, venues, organisers, tags…"
                    className="w-full pl-9 pr-9 py-2.5 bg-white/5 border border-white/8 hover:border-white/16 focus:border-amber-400/45 focus:bg-white/7 focus:ring-4 focus:ring-amber-400/8 rounded-xl text-sm text-white/80 placeholder:text-white/22 outline-none transition-all font-medium"
                  />
                  {query && (
                    <button onClick={() => setQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  )}
                </div>

                {/* Location pill */}
                <div className="flex items-center gap-2 bg-white/5 border border-white/8 hover:border-white/18 hover:bg-white/8 rounded-xl px-3.5 py-2.5 cursor-pointer flex-shrink-0 group transition-all">
                  <div className="relative">
                    <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
                  </div>
                  <span className="text-white/75 text-sm font-semibold hidden sm:block">{userCity}</span>
                  <svg className="w-3 h-3 text-white/20 group-hover:text-white/45 hidden sm:block transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>

                {/* Sort */}
                <div className="hidden lg:flex items-center bg-white/5 border border-white/8 rounded-xl p-1 gap-0.5 flex-shrink-0">
                  {(["date", "attendance"] as const).map(s => (
                    <button key={s} onClick={() => setSortBy(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sortBy === s ? "bg-white/12 text-white" : "text-white/30 hover:text-white/60"}`}>
                      {s === "date" ? "Soonest" : "Popular"}
                    </button>
                  ))}
                </div>

                {/* View toggle */}
                <div className="hidden sm:flex items-center bg-white/5 border border-white/8 rounded-xl p-1 gap-0.5 flex-shrink-0">
                  {([
                    { id: "split" as const, label: "Split",
                      icon: <><rect x="3" y="3" width="8" height="18" rx="1"/><rect x="13" y="3" width="8" height="18" rx="1"/></> },
                    { id: "list"  as const, label: "List",
                      icon: <><line x1="9" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="9" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1.2" fill="currentColor"/><circle cx="4" cy="12" r="1.2" fill="currentColor"/><circle cx="4" cy="18" r="1.2" fill="currentColor"/></> },
                    { id: "map"   as const, label: "Map",
                      icon: <><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></> },
                  ]).map(v => (
                    <button key={v.id} onClick={() => setView(v.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${view === v.id ? "bg-amber-400 text-[#0d0f17]" : "text-white/30 hover:text-white/65"}`}>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">{v.icon}</svg>
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 2: type filter pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
                {EVENT_TYPES.map(type => (
                  <button key={type} onClick={() => setActiveType(type)}
                    className={`flex-shrink-0 text-xs font-black px-3.5 py-1.5 rounded-full border transition-all ${
                      activeType === type
                        ? `${TYPE_PILL_ACTIVE[type] ?? "bg-amber-400 text-[#0d0f17]"} border-transparent shadow-md`
                        : "text-white/38 bg-white/4 border-white/7 hover:border-white/18 hover:text-white/70"
                    }`}>
                    {type}
                  </button>
                ))}
                <div className="ml-auto flex items-center gap-2 flex-shrink-0 pl-3">
                  {thisWeekCount > 0 && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full whitespace-nowrap">
                      {thisWeekCount} this week
                    </span>
                  )}
                  <span className="text-white/22 text-xs font-semibold whitespace-nowrap">
                    {filtered.length} event{filtered.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Two-panel layout ─────────────────────────────────────────── */}
          {/* IMPORTANT: Both panels are ALWAYS in the DOM — we use CSS to     */}
          {/* show/hide them. Unmounting the map div destroys the Maps instance */}
          {/* which causes it to go blank when toggling views.                  */}
          <div className="flex flex-1 overflow-hidden">

            {/* ── Sidebar ─────────────────────────────────────────────────── */}
            {/* Hidden in map-only mode via w-0 + overflow-hidden               */}
            <div className={`flex flex-col border-r border-white/6 overflow-hidden flex-shrink-0 transition-all duration-300 ${
              view === "list"
                ? "w-full"
                : view === "split"
                ? "w-[390px] lg:w-[430px] xl:w-[460px]"
                : "w-0 opacity-0 pointer-events-none"
            }`}>
              <div className="px-4 py-2.5 border-b border-white/5 bg-[#0d0f17] flex items-center justify-between flex-shrink-0">
                <span className="text-white/55 text-xs font-bold">
                  {filtered.length} event{filtered.length !== 1 ? "s" : ""} near {userCity}
                </span>
                <button onClick={() => setSortBy(s => s === "date" ? "attendance" : "date")}
                  className="flex items-center gap-1.5 text-white/28 hover:text-white/60 text-[11px] font-semibold transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="10" y2="18"/>
                  </svg>
                  {sortBy === "date" ? "Soonest first" : "Most popular"}
                </button>
              </div>

              <div className={`flex-1 overflow-y-auto p-3 ${
                view === "list"
                  ? "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 content-start"
                  : "space-y-3"
              }`}>
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center col-span-full">
                    <div className="text-5xl mb-4">🔍</div>
                    <div className="text-white/50 font-bold text-base mb-1">No events found</div>
                    <div className="text-white/25 text-sm mb-4">Try a different search or filter</div>
                    <button onClick={() => { setQuery(""); setActiveType("All"); }}
                      className="text-amber-400 text-sm font-semibold border border-amber-400/25 px-4 py-2 rounded-xl hover:bg-amber-400/10 transition-all">
                      Clear filters
                    </button>
                  </div>
                ) : (
                  filtered.map((event, i) => (
                    <div key={event.id} className="fade-card" style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}>
                      <EventCard
                        event={event}
                        active={activeEvent?.id === event.id}
                        onClick={() => setActiveEvent(prev => prev?.id === event.id ? null : event)}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ── Map panel ───────────────────────────────────────────────── */}
            {/* Hidden in list-only mode via w-0 + overflow-hidden             */}
            {/* Maps instance stays alive — only its container is hidden       */}
            <div className={`relative overflow-hidden flex-shrink-0 transition-all duration-300 ${
              view === "list" ? "w-0 opacity-0 pointer-events-none" : "flex-1"
            }`}>

              {/* Google Maps renders into this div */}
              <div ref={mapDivRef} className="absolute inset-0 w-full h-full" />

              {/* Loading overlay */}
              {!mapReady && (
                <div className="absolute inset-0 bg-[#0d0f17] flex flex-col items-center justify-center gap-4 z-10 pointer-events-none">
                  <div className="w-14 h-14 rounded-2xl bg-amber-400/12 flex items-center justify-center map-pulse">
                    <svg className="w-7 h-7 text-amber-400/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
                      <line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
                    </svg>
                  </div>
                  <p className="text-white/30 text-sm font-semibold map-pulse">Loading map…</p>
                </div>
              )}

              {/* Active event popup — bottom-centre */}
              {activeEvent && mapReady && (
                <div className="absolute bottom-5 left-1/2 z-30 popup-enter" style={{ transform: "translateX(-50%)" }}>
                  <MapPopupCard event={activeEvent} onClose={() => setActiveEvent(null)} />
                </div>
              )}

              {/* Stats — top left */}
              {mapReady && (
                <div className="absolute top-4 left-4 z-20 flex gap-2 pointer-events-none">
                  {[
                    { label: "Nearby",    val: filtered.length },
                    { label: "This week", val: thisWeekCount   },
                  ].map(s => (
                    <div key={s.label} className="bg-[#13151f]/90 border border-white/8 backdrop-blur-md rounded-xl px-3 py-2 shadow-xl">
                      <div className="text-amber-400 font-black text-base leading-none" style={{ fontFamily: "'Playfair Display',Georgia,serif" }}>
                        {s.val}
                      </div>
                      <div className="text-white/30 text-[10px] font-semibold mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Zoom + recenter — top right */}
              <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                {[
                  { fn: zoomIn,  ch: "+", t: "Zoom in"  },
                  { fn: zoomOut, ch: "−", t: "Zoom out" },
                ].map(b => (
                  <button key={b.ch} onClick={b.fn} title={b.t}
                    className="w-9 h-9 rounded-xl bg-[#13151f]/92 border border-white/10 backdrop-blur-md text-white/55 hover:text-white flex items-center justify-center shadow-xl transition-all hover:border-white/25 text-lg font-bold leading-none">
                    {b.ch}
                  </button>
                ))}
                <div className="w-px h-2.5 bg-white/10 mx-auto" />
                <button onClick={recenter} title="Re-centre"
                  className="w-9 h-9 rounded-xl bg-[#13151f]/92 border border-white/10 backdrop-blur-md text-white/55 hover:text-white flex items-center justify-center shadow-xl transition-all hover:border-white/25">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
                  </svg>
                </button>
              </div>

              {/* Legend — bottom right */}
              {mapReady && (
                <div className="absolute bottom-5 right-4 z-20 bg-[#13151f]/92 border border-white/8 backdrop-blur-md rounded-2xl px-4 py-3 shadow-xl">
                  <div className="text-white/22 text-[9px] font-black tracking-widest uppercase mb-2.5">
                    Event Types
                  </div>
                  <div className="space-y-2">
                    {Object.entries(TYPE_META)
                      .filter(([k]) => k !== "default" && filtered.some(e => e.type === k))
                      .map(([type, meta]) => (
                        <button key={type}
                          onClick={() => setActiveType(t => t === type ? "All" : type)}
                          className={`flex items-center gap-2 w-full transition-opacity hover:opacity-100 ${
                            activeType !== "All" && activeType !== type ? "opacity-25" : "opacity-100"
                          }`}>
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: meta.hex }} />
                          <span className="text-white/50 text-[10px] font-semibold">{type}</span>
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