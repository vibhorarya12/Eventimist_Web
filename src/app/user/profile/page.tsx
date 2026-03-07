"use client";

import { useEffect, useRef, useState } from "react";
import { TYPE_META } from "@/components/EventCard";
import type { Event } from "@/components/EventCard";

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserProfile {
  id: string; name: string; username: string; email: string;
  phone: string; bio: string; city: string; website: string;
  avatar: string; banner: string; joinedAt: string;
  stats: { attended: number; saved: number; followers: number; following: number };
  interests: string[];
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const USER: UserProfile = {
  id: "u1", name: "Aryan Kapoor", username: "aryankapoor",
  email: "aryan.kapoor@gmail.com", phone: "+91 98765 43210",
  bio: "Live music obsessive. Chasing the best nights out across Delhi NCR. Always first in the queue, last to leave.",
  city: "New Delhi, India", website: "aryankapoor.in",
  avatar: "https://i.pravatar.cc/200?img=8",
  banner: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1400&q=80",
  joinedAt: "March 2024",
  stats: { attended: 24, saved: 47, followers: 312, following: 138 },
  interests: ["Music", "Tech", "Art", "Food", "Festival"],
};

const ATTENDING: Event[] = [
  {
    id: "1", title: "Sunburn Arena ft. Martin Garrix", type: "Music",
    description: "India's premier electronic music festival.", date: "2025-08-12T19:00:00",
    venue: "JLN Stadium, New Delhi", tags: ["EDM", "Festival"],
    image_url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=700&q=80",
    attendance: 18400, organizerName: "Percept Live", organizer: "perceptlive",
    organizerProfilepic: "https://i.pravatar.cc/40?img=11",
    latitude: 28.5867, longitude: 77.2355, organizerId: "org1",
  },
  {
    id: "2", title: "Delhi Tech Summit 2025", type: "Tech",
    description: "80+ speakers. Workshops. Hackathon.", date: "2025-08-18T09:00:00",
    venue: "Bharat Mandapam, Delhi", tags: ["AI", "Web3"],
    image_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=700&q=80",
    attendance: 4200, organizerName: "TechIndia Foundation", organizer: "techindia",
    organizerProfilepic: "https://i.pravatar.cc/40?img=12",
    latitude: 28.6189, longitude: 77.2438, organizerId: "org2",
  },
  {
    id: "3", title: "UX Designers Meetup #22", type: "Networking",
    description: "Monthly Delhi NCR design meetup.", date: "2025-08-08T18:30:00",
    venue: "91springboard, Okhla", tags: ["Design", "UX"],
    image_url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=700&q=80",
    attendance: 120, organizerName: "DesignDelhi", organizer: "designdelhi",
    organizerProfilepic: "https://i.pravatar.cc/40?img=19",
    latitude: 28.5357, longitude: 77.272, organizerId: "org7",
  },
];

const SAVED: Event[] = [
  {
    id: "4", title: "Lodhi Art District Open Day", type: "Art",
    description: "World's largest open-air art district.", date: "2025-08-25T10:00:00",
    venue: "Lodhi Colony, Delhi", tags: ["Mural", "Free"],
    image_url: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=700&q=80",
    attendance: 800, organizerName: "St+art India", organizer: "startindia",
    organizerProfilepic: "https://i.pravatar.cc/40?img=16",
    latitude: 28.5906, longitude: 77.2256, organizerId: "org4",
  },
  {
    id: "5", title: "Holi Mela — Colours & Culture", type: "Festival",
    description: "Organic colours, folk music, dhol sessions.", date: "2025-09-14T08:00:00",
    venue: "Purana Qila Grounds, Delhi", tags: ["Holi", "Culture"],
    image_url: "https://images.unsplash.com/photo-1590736704728-f4730bb30770?w=700&q=80",
    attendance: 6000, organizerName: "Delhi Events Co.", organizer: "delhievents",
    organizerProfilepic: "https://i.pravatar.cc/40?img=20",
    latitude: 28.6107, longitude: 77.2427, organizerId: "org8",
  },
  {
    id: "6", title: "Photography Masterclass — Street & Documentary", type: "Workshop",
    description: "Hands-on workshop with Kiran Rao.", date: "2025-09-15T08:00:00",
    venue: "India Habitat Centre, Delhi", tags: ["Photography"],
    image_url: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=700&q=80",
    attendance: 35, organizerName: "Frame India", organizer: "frameindia",
    organizerProfilepic: "https://i.pravatar.cc/40?img=22",
    latitude: 28.5987, longitude: 77.2228, organizerId: "org9",
  },
  {
    id: "7", title: "Future of Work Conference 2025", type: "Conference",
    description: "AI in hiring, remote culture, Gen-Z expectations.", date: "2025-09-22T09:00:00",
    venue: "The Leela Ambience, Gurugram", tags: ["HR", "Startup"],
    image_url: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=700&q=80",
    attendance: 650, organizerName: "WorkSphere", organizer: "worksphere",
    organizerProfilepic: "https://i.pravatar.cc/40?img=23",
    latitude: 28.502, longitude: 77.0915, organizerId: "org10",
  },
];

const PAST: Event[] = [
  {
    id: "p1", title: "NH7 Weekender Delhi 2024", type: "Music",
    description: "Three stages, two days, one legendary weekend.", date: "2024-11-30T16:00:00",
    venue: "Leisure Valley, Gurugram", tags: ["Indie", "Multi-Stage"],
    image_url: "https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=700&q=80",
    attendance: 15000, organizerName: "OML Entertainment", organizer: "omlive",
    organizerProfilepic: "https://i.pravatar.cc/40?img=30",
    latitude: 28.4595, longitude: 77.0266, organizerId: "orgP1",
  },
  {
    id: "p2", title: "Street Food Trail — Old Delhi", type: "Food",
    description: "14 iconic dishes from century-old establishments.", date: "2024-10-20T11:00:00",
    venue: "Chandni Chowk, Delhi", tags: ["Food", "Heritage"],
    image_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=700&q=80",
    attendance: 28, organizerName: "Delhi Food Walks", organizer: "delhifoodwalks",
    organizerProfilepic: "https://i.pravatar.cc/40?img=15",
    latitude: 28.6562, longitude: 77.241, organizerId: "org3",
  },
  {
    id: "p3", title: "Yamuna Cleanup Drive Spring '24", type: "Volunteer",
    description: "500 volunteers. One river. One morning.", date: "2024-09-04T06:30:00",
    venue: "Yamuna Ghat, ITO, Delhi", tags: ["Environment", "Free"],
    image_url: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=700&q=80",
    attendance: 490, organizerName: "YamunaFirst", organizer: "yamunafirst",
    organizerProfilepic: "https://i.pravatar.cc/40?img=18",
    latitude: 28.6304, longitude: 77.2567, organizerId: "org6",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtShort  = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const fmtFull   = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const fmtTime   = (iso: string) => new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
const daysLeft  = (iso: string) => Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000));
const isPast    = (iso: string) => new Date(iso) < new Date();

// ─── Toggle switch ────────────────────────────────────────────────────────────
function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} role="switch" aria-checked={on}
      className={`relative w-10 h-5 rounded-full flex-shrink-0 transition-colors duration-300 ${on ? "bg-amber-400" : "bg-white/12"}`}>
      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${on ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

// ─── Field input ──────────────────────────────────────────────────────────────
function Field({ label, value, onChange, type = "text", placeholder = "" }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-white/35 text-[10px] font-black uppercase tracking-[0.16em]">{label}</span>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#0d0f17] border border-white/8 hover:border-white/18 focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder:text-white/20 outline-none transition-all" />
    </label>
  );
}

// ─── Event card (profile variant) ────────────────────────────────────────────
function PCard({ event, grayscale = false }: { event: Event; grayscale?: boolean }) {
  const tc   = TYPE_META[event.type] ?? TYPE_META.default;
  const days = daysLeft(event.date);
  return (
    <a href={`/events/${event.id}`}
      className="group flex flex-col bg-[#13151f] border border-white/7 hover:border-white/17 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/50">
      {/* Image */}
      <div className="relative h-[130px] flex-shrink-0 overflow-hidden">
        <img src={event.image_url} alt={event.title}
          className={`w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ${grayscale ? "grayscale opacity-60" : ""}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#13151f] via-transparent to-transparent" />
        <span className={`absolute top-2 left-2 inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-sm ${tc.bg} ${tc.text}`}>
          <span className={`w-1 h-1 rounded-full ${tc.dot}`} />{event.type}
        </span>
        {!grayscale && days <= 7 && days >= 0 && (
          <span className="absolute top-2 right-2 text-[9px] font-black bg-rose-500/85 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
            {days === 0 ? "Today" : `${days}d`}
          </span>
        )}
        {grayscale && (
          <span className="absolute top-2 right-2 text-[9px] font-black bg-white/12 text-white/50 border border-white/10 px-2 py-0.5 rounded-full">
            Done
          </span>
        )}
      </div>
      {/* Body */}
      <div className="flex flex-col flex-1 p-3">
        <h4 className="text-white/80 font-bold text-xs leading-snug line-clamp-2 mb-2 group-hover:text-white transition-colors"
          style={{ fontFamily: "'Playfair Display',Georgia,serif" }}>{event.title}</h4>
        <div className="mt-auto space-y-1">
          <div className="flex items-center gap-1.5 text-white/30 text-[10px]">
            <svg className="w-2.5 h-2.5 flex-shrink-0 text-amber-400/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {fmtFull(event.date)} · {fmtTime(event.date)}
          </div>
          <div className="flex items-center gap-1.5 text-white/30 text-[10px]">
            <svg className="w-2.5 h-2.5 flex-shrink-0 text-amber-400/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <span className="truncate">{event.venue.split(",")[0]}</span>
          </div>
        </div>
      </div>
    </a>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHead({ title, count, action }: { title: string; count?: number; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <h2 className="text-white font-black text-lg" style={{ fontFamily: "'Playfair Display',Georgia,serif" }}>{title}</h2>
        {count !== undefined && (
          <span className="text-[10px] font-black text-white/30 bg-white/6 border border-white/8 rounded-full px-2 py-0.5">{count}</span>
        )}
      </div>
      {action}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function Empty({ emoji, title, sub, href }: { emoji: string; title: string; sub: string; href: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="text-4xl mb-4">{emoji}</span>
      <div className="text-white/50 font-bold text-sm mb-1">{title}</div>
      <div className="text-white/25 text-xs mb-5 max-w-xs leading-relaxed">{sub}</div>
      <a href={href} className="text-xs font-black text-amber-400 bg-amber-400/10 border border-amber-400/20 px-5 py-2.5 rounded-xl hover:bg-amber-400/18 transition-all">
        Discover events →
      </a>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function UserProfilePage() {
  type Tab = "attending" | "saved" | "past" | "settings";
  const [tab,           setTab]           = useState<Tab>("attending");
  const [profile,       setProfile]       = useState({ ...USER });
  const [avatarSrc,     setAvatarSrc]     = useState(USER.avatar);
  const [bannerSrc,     setBannerSrc]     = useState(USER.banner);
  const [notifEmail,    setNotifEmail]    = useState(true);
  const [notifPush,     setNotifPush]     = useState(true);
  const [notifReminder, setNotifReminder] = useState(false);
  const [privMode,      setPrivMode]      = useState<"public"|"private">("public");
  const [savedMsg,      setSavedMsg]      = useState(false);
  const [scrolled,      setScrolled]      = useState(false);
  const avatarRef = useRef<HTMLInputElement | null>(null);
  const bannerRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const pickImage = (ref: React.RefObject<HTMLInputElement>, cb: (s: string) => void) => {
    ref.current?.click();
    if (ref.current) ref.current.onchange = (e) => {
      const f = (e.target as HTMLInputElement).files?.[0];
      if (f) cb(URL.createObjectURL(f));
    };
  };

  const handleSave = () => {
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count: number | null }[] = [
    {
      id: "attending", label: "Attending", count: ATTENDING.length,
      icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    },
    {
      id: "saved", label: "Saved", count: SAVED.length,
      icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
    },
    {
      id: "past", label: "Past", count: USER.stats.attended,
      icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    },
    {
      id: "settings", label: "Settings", count: null,
      icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; background: #0d0f17; color: white; font-family: 'DM Sans', system-ui, sans-serif; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 99px; }
        .fade-up  { animation: fu .5s cubic-bezier(0.16,1,0.3,1) both; }
        .tab-anim { animation: fu .38s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes fu { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .d1{animation-delay:.07s} .d2{animation-delay:.14s} .d3{animation-delay:.22s} .d4{animation-delay:.32s}
        .banner-overlay { background: linear-gradient(to bottom, rgba(13,15,23,0.25) 0%, rgba(13,15,23,0.55) 60%, #0d0f17 100%); }
        .avatar-glow { box-shadow: 0 0 0 3px #f59e0b, 0 0 0 5px rgba(245,158,11,.2), 0 8px 32px rgba(0,0,0,.7); }
        .stat-item:hover .stat-val { color: #fbbf24; transition: color .2s; }
      `}</style>

      {/* Hidden file inputs */}
      <input ref={avatarRef} type="file" accept="image/*" className="hidden" />
      <input ref={bannerRef} type="file" accept="image/*" className="hidden" />

      <div className="min-h-screen bg-[#0d0f17]">

        {/* ── NAV ──────────────────────────────────────────── */}
        <nav className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-5 transition-all duration-300 ${scrolled ? "bg-[#0d0f17]/96 backdrop-blur-xl border-b border-white/6" : "bg-transparent"}`}>
          <div className="max-w-5xl mx-auto w-full flex items-center gap-3">
            <a href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-400/30">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <span className="text-white font-black text-base hidden sm:block" style={{fontFamily:"'Playfair Display',Georgia,serif"}}>eventimist</span>
            </a>
            <div className="ml-auto flex items-center gap-3">
              <a href="/discover" className="text-white/35 hover:text-white/70 transition-colors text-sm font-semibold px-3 py-2 rounded-xl hover:bg-white/5 hidden sm:block">Discover</a>
              <a href="/discover" className="w-8 h-8 rounded-xl flex items-center justify-center text-white/35 hover:text-white/70 hover:bg-white/5 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </a>
              <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-amber-400/50 cursor-pointer">
                <img src={avatarSrc} alt={USER.name} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </nav>

        {/* ── BANNER ───────────────────────────────────────── */}
        <div className="relative h-56 md:h-72 overflow-hidden">
          <img src={bannerSrc} alt="Banner" className="w-full h-full object-cover" />
          <div className="banner-overlay absolute inset-0" />
          <button onClick={() => pickImage(bannerRef, setBannerSrc)}
            className="absolute bottom-4 right-4 flex items-center gap-1.5 text-xs font-bold text-white/60 bg-black/45 border border-white/12 backdrop-blur-md px-3 py-2 rounded-xl hover:text-white hover:bg-black/65 hover:border-white/25 transition-all">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>
            </svg>
            Change banner
          </button>
        </div>

        {/* ── PROFILE HEADER ───────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-5">
          <div className="relative flex flex-col md:flex-row md:items-end gap-5 -mt-14 pb-8 border-b border-white/7">

            {/* Avatar */}
            <div className="fade-up d1 relative flex-shrink-0 self-start">
              <div className="avatar-glow w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-[#13151f] border-4 border-[#0d0f17]">
                <img src={avatarSrc} alt={USER.name} className="w-full h-full object-cover" />
              </div>
              <button onClick={() => pickImage(avatarRef, setAvatarSrc)}
                className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center shadow-md shadow-amber-400/40 hover:bg-amber-300 hover:scale-110 transition-all">
                <svg className="w-3 h-3 text-[#0d0f17]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>
                </svg>
              </button>
            </div>

            {/* Name / bio */}
            <div className="fade-up d2 flex-1 min-w-0 md:pb-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-white font-black text-2xl md:text-[1.75rem] leading-none tracking-tight" style={{fontFamily:"'Playfair Display',Georgia,serif"}}>
                  {profile.name}
                </h1>
                <span className="inline-flex items-center gap-1 text-[9px] font-black text-amber-400 bg-amber-400/12 border border-amber-400/22 px-2 py-0.5 rounded-full">
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  verified
                </span>
              </div>
              <div className="text-white/30 text-sm mb-2.5">@{profile.username} · {profile.city}</div>
              <p className="text-white/45 text-sm leading-relaxed max-w-lg">{profile.bio}</p>
              {/* Interest pills */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {USER.interests.map(i => {
                  const tc = TYPE_META[i] ?? TYPE_META.default;
                  return (
                    <span key={i} className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${tc.bg} ${tc.text}`}>{i}</span>
                  );
                })}
              </div>
            </div>

            {/* Stats */}
            {/* <div className="fade-up d3 flex items-center gap-5 md:gap-6 md:pb-1 flex-shrink-0">
              {[
                { val: USER.stats.attended,  label: "Attended" },
                { val: USER.stats.saved,     label: "Saved" },
                { val: USER.stats.followers, label: "Followers" },
                { val: USER.stats.following, label: "Following" },
              ].map(s => (
                <div key={s.label} className="stat-item flex flex-col items-center cursor-default select-none">
                  <span className="stat-val text-white font-black text-xl leading-none" style={{fontFamily:"'Playfair Display',Georgia,serif"}}>{s.val}</span>
                  <span className="text-white/25 text-[9px] font-semibold mt-1 tracking-wide">{s.label}</span>
                </div>
              ))}
            </div> */}
          </div>
        </div>

        {/* ── TAB BAR ──────────────────────────────────────── */}
        <div className={`sticky top-16 z-40 bg-[#0d0f17]/97 backdrop-blur-xl border-b border-white/7 transition-all`}>
          <div className="max-w-5xl mx-auto px-5">
            <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-none">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`relative flex items-center gap-2 px-4 py-4 text-sm font-bold whitespace-nowrap transition-colors ${tab === t.id ? "text-white" : "text-white/28 hover:text-white/60"}`}>
                  <span className={`transition-colors ${tab === t.id ? "text-amber-400" : "text-white/25"}`}>{t.icon}</span>
                  {t.label}
                  {t.count !== null && (
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full transition-all ${tab === t.id ? "bg-amber-400 text-[#0d0f17]" : "bg-white/7 text-white/25"}`}>
                      {t.count}
                    </span>
                  )}
                  {tab === t.id && <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-amber-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT ─────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-5 py-8 pb-20">

          {/* ATTENDING ─────────────────────────────────────── */}
          {tab === "attending" && (
            <div className="tab-anim space-y-8">
              {ATTENDING.length === 0
                ? <Empty emoji="🎟️" title="Nothing on your calendar yet" sub="Events you RSVP to will show up here." href="/discover" />
                : (
                  <>
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Next up — featured */}
                      <div className="lg:flex-1">
                        <SectionHead title="Next up" count={ATTENDING.length}
                          action={<a href="/discover" className="text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/18 px-3 py-1.5 rounded-xl hover:bg-amber-400/18 transition-all">+ Add event</a>}
                        />
                        <a href={`/events/${ATTENDING[0].id}`}
                          className="group relative block rounded-2xl overflow-hidden border border-white/8 hover:border-white/20 transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-black/50">
                          <div className="relative h-52 overflow-hidden">
                            <img src={ATTENDING[0].image_url} alt={ATTENDING[0].title}
                              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f17] via-[#0d0f17]/20 to-transparent" />
                            {(() => { const tc = TYPE_META[ATTENDING[0].type] ?? TYPE_META.default; return (
                              <span className={`absolute top-3 left-3 inline-flex items-center gap-1.5 text-xs font-black px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-sm ${tc.bg} ${tc.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${tc.dot}`} />{ATTENDING[0].type}
                              </span>
                            ); })()}
                            <span className="absolute top-3 right-3 text-[10px] font-black bg-amber-400 text-[#0d0f17] px-2.5 py-1 rounded-full shadow-lg">
                              {daysLeft(ATTENDING[0].date) === 0 ? "Today!" : `In ${daysLeft(ATTENDING[0].date)} days`}
                            </span>
                          </div>
                          <div className="p-4">
                            <h3 className="text-white font-black text-lg leading-snug mb-2" style={{fontFamily:"'Playfair Display',Georgia,serif"}}>{ATTENDING[0].title}</h3>
                            <div className="flex flex-wrap gap-x-4 gap-y-1">
                              <div className="flex items-center gap-1.5 text-white/40 text-xs">
                                <svg className="w-3.5 h-3.5 text-amber-400/55" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                {fmtFull(ATTENDING[0].date)} · {fmtTime(ATTENDING[0].date)}
                              </div>
                              <div className="flex items-center gap-1.5 text-white/40 text-xs">
                                <svg className="w-3.5 h-3.5 text-amber-400/55" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                {ATTENDING[0].venue}
                              </div>
                            </div>
                          </div>
                        </a>
                      </div>

                      {/* Other upcoming */}
                      <div className="lg:w-72 space-y-3">
                        <div className="text-white/28 text-[10px] font-black uppercase tracking-[0.14em] mb-4">Also coming up</div>
                        {ATTENDING.slice(1).map(ev => (
                          <a key={ev.id} href={`/events/${ev.id}`}
                            className="group flex gap-3 bg-[#13151f] border border-white/7 hover:border-white/16 rounded-xl p-3 transition-all hover:-translate-y-0.5">
                            <div className="w-14 h-14 rounded-lg flex-shrink-0 overflow-hidden">
                              <img src={ev.image_url} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400" />
                            </div>
                            <div className="flex flex-col justify-between min-w-0">
                              <div className="text-white/75 text-xs font-bold line-clamp-2 leading-snug group-hover:text-white transition-colors">{ev.title}</div>
                              <div className="text-white/28 text-[10px]">{fmtShort(ev.date)} · {ev.venue.split(",")[0]}</div>
                            </div>
                          </a>
                        ))}
                        {/* Calendar export */}
                        <div className="flex items-center gap-3 bg-white/3 border border-white/7 rounded-xl p-3 mt-1">
                          <svg className="w-4 h-4 text-amber-400/60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                          <div className="flex-1 min-w-0">
                            <div className="text-white/55 text-xs font-semibold">Sync to calendar</div>
                            <div className="text-white/22 text-[10px]">Google · Apple · Outlook</div>
                          </div>
                          <button className="text-[10px] font-bold text-amber-400/70 hover:text-amber-400 transition-colors flex-shrink-0">.ics →</button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
            </div>
          )}

          {/* SAVED ─────────────────────────────────────────── */}
          {tab === "saved" && (
            <div className="tab-anim">
              {SAVED.length === 0
                ? <Empty emoji="🔖" title="Your wishlist is empty" sub="Tap the heart on any event to save it here." href="/discover" />
                : (
                  <>
                    <SectionHead title="Your wishlist" count={SAVED.length}
                      action={<button className="text-xs font-semibold text-white/25 hover:text-white/55 transition-colors border border-white/8 px-3 py-1.5 rounded-xl hover:border-white/18">Clear all</button>}
                    />
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {SAVED.map(ev => <PCard key={ev.id} event={ev} />)}
                    </div>
                  </>
                )}
            </div>
          )}

          {/* PAST ──────────────────────────────────────────── */}
          {tab === "past" && (
            <div className="tab-anim space-y-7">
              <SectionHead title="Events attended" count={USER.stats.attended} />

              {/* Activity bar chart */}
              <div className="bg-[#13151f] border border-white/7 rounded-2xl p-5">
                <div className="text-white/25 text-[10px] font-black uppercase tracking-[0.14em] mb-4">Activity — last 12 months</div>
                <div className="flex items-end gap-1.5 h-16 mb-2">
                  {[1,0,2,3,0,1,4,2,0,2,3,1].map((v, i) => (
                    <div key={i} className="flex-1 rounded-sm transition-all hover:opacity-100"
                      title={["Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun","Jul"][i]}
                      style={{
                        height: `${v === 0 ? 6 : v * 16}px`,
                        background: v === 0 ? "rgba(255,255,255,0.05)" : `rgba(251,191,36,${0.15 + v * 0.18})`,
                        cursor: "default",
                      }}
                    />
                  ))}
                </div>
                <div className="flex justify-between">
                  {["A","S","O","N","D","J","F","M","A","M","J","J"].map((m, i) => (
                    <span key={i} className="flex-1 text-center text-white/15 text-[9px] font-bold">{m}</span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PAST.map(ev => <PCard key={ev.id} event={ev} grayscale />)}
              </div>
            </div>
          )}

          {/* SETTINGS ──────────────────────────────────────── */}
          {tab === "settings" && (
            <div className="tab-anim">
              <div className="flex flex-col lg:flex-row gap-8">

                {/* ── Left: form ── */}
                <div className="flex-1 min-w-0 space-y-7">

                  {/* Profile info */}
                  <div className="bg-[#13151f] border border-white/8 rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/7 flex items-center gap-2.5">
                      <div className="w-1 h-4 rounded-full bg-amber-400" />
                      <h3 className="text-white font-black text-sm" style={{fontFamily:"'Playfair Display',Georgia,serif"}}>Profile</h3>
                    </div>
                    <div className="p-5 space-y-4">
                      {/* Avatar row inside settings */}
                      <div className="flex items-center gap-4 pb-4 border-b border-white/6">
                        <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-amber-400/30 flex-shrink-0">
                          <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <button onClick={() => pickImage(avatarRef, setAvatarSrc)}
                            className="text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/18 px-3.5 py-2 rounded-xl hover:bg-amber-400/18 transition-all">
                            Change photo
                          </button>
                          <div className="text-white/20 text-[10px] mt-1">JPG, PNG or GIF · max 2MB</div>
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="Full Name" value={profile.name} onChange={v => setProfile(p => ({...p, name: v}))} />
                        <Field label="Username" value={profile.username} onChange={v => setProfile(p => ({...p, username: v}))} placeholder="@handle" />
                      </div>
                      <div>
                        <span className="block text-white/35 text-[10px] font-black uppercase tracking-[0.16em] mb-1.5">Bio</span>
                        <textarea value={profile.bio} onChange={e => setProfile(p => ({...p, bio: e.target.value}))} rows={3} maxLength={160}
                          className="w-full bg-[#0d0f17] border border-white/8 hover:border-white/18 focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/10 rounded-xl px-4 py-2.5 text-sm text-white/80 outline-none transition-all resize-none" />
                        <div className="text-white/18 text-[10px] text-right -mt-1">{profile.bio.length}/160</div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="City" value={profile.city} onChange={v => setProfile(p => ({...p, city: v}))} />
                        <Field label="Website" value={profile.website} onChange={v => setProfile(p => ({...p, website: v}))} placeholder="yoursite.com" />
                      </div>
                    </div>
                  </div>

                  {/* Contact & security */}
                  <div className="bg-[#13151f] border border-white/8 rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/7 flex items-center gap-2.5">
                      <div className="w-1 h-4 rounded-full bg-amber-400" />
                      <h3 className="text-white font-black text-sm" style={{fontFamily:"'Playfair Display',Georgia,serif"}}>Contact & Security</h3>
                    </div>
                    <div className="p-5 space-y-4">
                      <Field label="Email" type="email" value={profile.email} onChange={v => setProfile(p => ({...p, email: v}))} />
                      <Field label="Phone" type="tel" value={profile.phone} onChange={v => setProfile(p => ({...p, phone: v}))} />
                      <div className="pt-1">
                        <button className="flex items-center gap-2 text-sm font-bold text-amber-400/80 hover:text-amber-400 transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                          Change password
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Save bar */}
                  <div className="flex items-center gap-3">
                    <button onClick={handleSave}
                      className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-[#0d0f17] font-black px-6 py-3 rounded-xl text-sm hover:shadow-lg hover:shadow-amber-400/25 hover:scale-[1.02] active:scale-[0.98] transition-all">
                      {savedMsg
                        ? <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Saved!</>
                        : <>Save changes</>
                      }
                    </button>
                    <button className="text-sm font-semibold text-white/25 hover:text-white/55 transition-colors px-3 py-3">Discard</button>
                  </div>
                </div>

                {/* ── Right: sidebar panels ── */}
                <div className="lg:w-64 space-y-5 flex-shrink-0">

                  {/* Notifications */}
                  <div className="bg-[#13151f] border border-white/8 rounded-2xl overflow-hidden">
                    <div className="px-4 py-3.5 border-b border-white/7 flex items-center gap-2">
                      <div className="w-1 h-3.5 rounded-full bg-amber-400" />
                      <span className="text-white font-black text-sm" style={{fontFamily:"'Playfair Display',Georgia,serif"}}>Notifications</span>
                    </div>
                    <div className="divide-y divide-white/5">
                      {[
                        { label: "Email alerts",      sub: "Event reminders by email",          val: notifEmail,    set: setNotifEmail },
                        { label: "Push notifications", sub: "Nearby & saved events",             val: notifPush,     set: setNotifPush },
                        { label: "Day-before reminder", sub: "24h heads-up for RSVP'd events",  val: notifReminder, set: setNotifReminder },
                      ].map(n => (
                        <div key={n.label} className="flex items-center justify-between px-4 py-3.5">
                          <div>
                            <div className="text-white/70 text-xs font-semibold">{n.label}</div>
                            <div className="text-white/25 text-[10px] mt-0.5 leading-relaxed">{n.sub}</div>
                          </div>
                          <Toggle on={n.val} onChange={() => n.set(v => !v)} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Privacy */}
                  <div className="bg-[#13151f] border border-white/8 rounded-2xl overflow-hidden">
                    <div className="px-4 py-3.5 border-b border-white/7 flex items-center gap-2">
                      <div className="w-1 h-3.5 rounded-full bg-amber-400" />
                      <span className="text-white font-black text-sm" style={{fontFamily:"'Playfair Display',Georgia,serif"}}>Privacy</span>
                    </div>
                    <div className="p-4 space-y-2.5">
                      {(["public","private"] as const).map(opt => (
                        <label key={opt} onClick={() => setPrivMode(opt)}
                          className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${privMode === opt ? "border-amber-400/35 bg-amber-400/5" : "border-white/6 hover:border-white/14"}`}>
                          <div className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 mt-0.5 transition-all ${privMode === opt ? "border-amber-400 bg-amber-400" : "border-white/22"}`} />
                          <div>
                            <div className="text-white/70 text-xs font-bold capitalize">{opt}</div>
                            <div className="text-white/25 text-[10px] leading-relaxed mt-0.5">
                              {opt === "public" ? "Anyone can see your profile." : "Only followers see your activity."}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Danger zone */}
                  <div className="bg-[#13151f] border border-rose-500/12 rounded-2xl overflow-hidden">
                    <div className="px-4 py-3.5 border-b border-white/5 flex items-center gap-2">
                      <div className="w-1 h-3.5 rounded-full bg-rose-500" />
                      <span className="text-white/80 font-black text-sm" style={{fontFamily:"'Playfair Display',Georgia,serif"}}>Danger Zone</span>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-white/55 text-xs font-semibold">Deactivate</div>
                          <div className="text-white/22 text-[10px]">Temporarily hide profile</div>
                        </div>
                        <button className="text-[10px] font-bold text-white/30 border border-white/8 px-2.5 py-1.5 rounded-lg hover:border-white/22 hover:text-white/55 transition-all flex-shrink-0">
                          Deactivate
                        </button>
                      </div>
                      <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/5">
                        <div>
                          <div className="text-rose-400/70 text-xs font-semibold">Delete account</div>
                          <div className="text-white/22 text-[10px]">Irreversible action</div>
                        </div>
                        <button className="text-[10px] font-bold text-rose-400/55 border border-rose-500/18 px-2.5 py-1.5 rounded-lg hover:border-rose-400/40 hover:text-rose-300 transition-all flex-shrink-0">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

        </div>

        {/* ── FOOTER ───────────────────────────────────────── */}
        <div className="border-t border-white/5 py-6 px-5">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <span className="text-white/18 text-xs">eventimist © 2025</span>
            </div>
            <div className="flex gap-5 text-white/18 text-xs">
              {["Privacy","Terms","Help"].map(l => <a key={l} href="#" className="hover:text-white/40 transition-colors">{l}</a>)}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}