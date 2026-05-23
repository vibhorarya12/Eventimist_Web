"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCreateEvent } from "@/hooks/eventimist/organizer/event/useCreateEvent";
import type { CreateEventRequest, EventCategory, EventMode } from "@/services/eventimist/organizer/event/Createevent.service";
import { compressImages, type CompressionResult } from "@/utils/compressImages";

import {AIGenerateButton} from "@/components/AIGenerateButton"

// ─── Types ────────────────────────────────────────────────────────────────────
type Category =
  | "MUSIC" | "TECH" | "FOOD" | "ART" | "SPORTS"
  | "FESTIVAL" | "VOLUNTEER" | "NETWORKING"
  | "WORKSHOP" | "CONFERENCE" | "EDUCATION"
  | "BUSINESS" | "HEALTH" | "ENTERTAINMENT" | "GAMING";

type Mode = "ONLINE" | "OFFLINE" | "HYBRID";

interface FormData {
  title: string;
  description: string;
  category: Category | "";
  startTime: string;
  endTime: string;
  timezone: string;
  mode: Mode | "";
  venue: string;
  onlineLink: string;
  latitude: number | "";
  longitude: number | "";
  tags: string[];
  capacity: number | "";
  ticketPrice: number | "";
  isFree: boolean;
  files: File[];
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: "MUSIC",         label: "Music",         emoji: "🎵" },
  { value: "TECH",          label: "Tech",           emoji: "💻" },
  { value: "FOOD",          label: "Food",           emoji: "🍜" },
  { value: "ART",           label: "Art",            emoji: "🎨" },
  { value: "SPORTS",        label: "Sports",         emoji: "⚽" },
  { value: "FESTIVAL",      label: "Festival",       emoji: "🎪" },
  { value: "VOLUNTEER",     label: "Volunteer",      emoji: "🤝" },
  { value: "NETWORKING",    label: "Networking",     emoji: "🔗" },
  { value: "WORKSHOP",      label: "Workshop",       emoji: "🛠" },
  { value: "CONFERENCE",    label: "Conference",     emoji: "🎤" },
  { value: "EDUCATION",     label: "Education",      emoji: "📚" },
  { value: "BUSINESS",      label: "Business",       emoji: "💼" },
  { value: "HEALTH",        label: "Health",         emoji: "🏥" },
  { value: "ENTERTAINMENT", label: "Entertainment",  emoji: "🎬" },
  { value: "GAMING",        label: "Gaming",         emoji: "🎮" },
];

const TIMEZONES = [
  "Asia/Kolkata", "Asia/Dubai", "Asia/Singapore", "Asia/Tokyo",
  "Asia/Shanghai", "Asia/Seoul", "Europe/London", "Europe/Paris",
  "Europe/Berlin", "America/New_York", "America/Chicago",
  "America/Los_Angeles", "America/Toronto", "Australia/Sydney",
  "Pacific/Auckland",
];

// ─── Google Places types ──────────────────────────────────────────────────────
interface PlaceSuggestion {
  place_id: string;
  description: string;
  structured_formatting: { main_text: string; secondary_text: string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function d(dark: boolean, darkCls: string, lightCls: string) { return dark ? darkCls : lightCls; }

const T = {
  bg:      (dark: boolean) => d(dark, "bg-[#0c0e1a]",   "bg-stone-50"),
  surface: (dark: boolean) => d(dark, "bg-[#13151f]",   "bg-white"),
  surface2:(dark: boolean) => d(dark, "bg-[#1a1d2e]",   "bg-stone-50"),
  border:  (dark: boolean) => d(dark, "border-white/8", "border-stone-200"),
  text1:   (dark: boolean) => d(dark, "text-white",     "text-stone-900"),
  text2:   (dark: boolean) => d(dark, "text-white/60",  "text-stone-600"),
  text3:   (dark: boolean) => d(dark, "text-white/30",  "text-stone-400"),
  input:   (dark: boolean) => d(dark, "bg-[#1a1d2e] border-white/10 text-white placeholder:text-white/25 focus:border-amber-400/50", "bg-white border-stone-200 text-stone-900 placeholder:text-stone-300 focus:border-amber-400"),
  label:   (dark: boolean) => d(dark, "text-white/70",  "text-stone-700"),
};

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, icon, children, dark }: { title: string; icon: React.ReactNode; children: React.ReactNode; dark: boolean }) {
  return (
    <div className={`${T.surface(dark)} border ${T.border(dark)} rounded-2xl overflow-hidden`}>
      <div className={`flex items-center gap-3 px-5 sm:px-6 py-4 border-b ${T.border(dark)}`}>
        <div className={`w-8 h-8 rounded-xl ${d(dark,"bg-amber-400/15 border border-amber-400/20","bg-amber-50 border border-amber-200")} flex items-center justify-center text-amber-500 flex-shrink-0`}>
          {icon}
        </div>
        <h2 className={`${T.text1(dark)} font-black text-sm sm:text-base`} style={{fontFamily:"'Playfair Display',Georgia,serif"}}>{title}</h2>
      </div>
      <div className="px-5 sm:px-6 py-5 space-y-4">{children}</div>
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, required, hint, children, dark }: { label: string; required?: boolean; hint?: string; children: React.ReactNode; dark: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className={`flex items-center gap-1 text-xs font-bold ${T.label(dark)}`}>
        {label}
        {required && <span className="text-amber-500">*</span>}
      </label>
      {children}
      {hint && <p className={`text-[10px] ${T.text3(dark)}`}>{hint}</p>}
    </div>
  );
}

// ─── Input base class ─────────────────────────────────────────────────────────
const inputCls = (dark: boolean, extra = "") =>
  `w-full border rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all duration-200 ${T.input(dark)} ${extra}`;

// ─── Google Map embed ─────────────────────────────────────────────────────────
function GoogleMap({ lat, lng, venueName, dark }: {
  lat: number | ""; lng: number | ""; venueName: string; dark: boolean;
}) {
  const hasCoords = lat !== "" && lng !== "";
  // Read key at render time — guaranteed available on client
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

  if (!hasCoords) {
    return (
      <div className={`relative w-full h-48 sm:h-56 rounded-xl overflow-hidden border ${T.border(dark)} ${d(dark,"bg-[#1a1d2e]","bg-stone-100")} flex flex-col items-center justify-center gap-2`}>
        <div className={`w-10 h-10 rounded-xl ${d(dark,"bg-white/8","bg-stone-200")} flex items-center justify-center`}>
          <svg className={`w-5 h-5 ${T.text3(dark)}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <p className={`${T.text3(dark)} text-xs`}>Search a venue to preview the map</p>
      </div>
    );
  }

  // Google Maps Embed API — coords mode, no JS SDK needed
  const src =
    `https://www.google.com/maps/embed/v1/place` +
    `?key=${key}` +
    `&q=${lat},${lng}` +
    `&zoom=16` +
    `&maptype=roadmap`;

  return (
    <div className={`relative w-full h-48 sm:h-56 rounded-xl overflow-hidden border ${T.border(dark)}`}>
      <iframe
        key={`${lat}-${lng}`}
        src={src}
        width="100%"
        height="100%"
        style={{ border: 0, display: "block" }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Map — ${venueName}`}
      />
      {/* Coords badge */}
      <div className={`absolute bottom-3 left-3 ${d(dark,"bg-black/70","bg-white/90")} backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-[10px] font-mono ${T.text2(dark)} border ${T.border(dark)} pointer-events-none`}>
        {Number(lat).toFixed(5)}, {Number(lng).toFixed(5)}
      </div>
    </div>
  );
}


// ─── Image uploader ───────────────────────────────────────────────────────────
function ImageUploader({ files, onChange, dark }: { files: File[]; onChange: (f: File[]) => void; dark: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const previews = files.map(f => URL.createObjectURL(f));

  const add = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const valid = Array.from(newFiles).filter(f => f.type.startsWith("image/"));
    onChange([...files, ...valid].slice(0, 5));
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); add(e.dataTransfer.files); }}
        onClick={() => ref.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
          dragging
            ? d(dark, "border-amber-400 bg-amber-400/8", "border-amber-400 bg-amber-50")
            : d(dark, "border-white/15 hover:border-amber-400/40 hover:bg-white/3", "border-stone-200 hover:border-amber-300 hover:bg-amber-50/30")
        }`}
      >
        <input ref={ref} type="file" multiple accept="image/*" className="hidden" onChange={e => add(e.target.files)}/>
        <div className={`w-12 h-12 rounded-2xl ${d(dark,"bg-amber-400/12 border border-amber-400/20","bg-amber-50 border border-amber-100")} flex items-center justify-center mx-auto mb-3`}>
          <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
          </svg>
        </div>
        <p className={`${T.text2(dark)} text-sm font-semibold mb-1`}>Drop images here or <span className="text-amber-500 underline underline-offset-2">browse</span></p>
        <p className={`${T.text3(dark)} text-[11px]`}>PNG, JPG, WEBP up to 10MB each · Min 2, Max 5 images</p>
      </div>

      {/* Preview grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {previews.map((src, i) => (
            <div key={i} className="relative group aspect-square rounded-xl overflow-hidden">
              <img src={src} alt="" className="w-full h-full object-cover"/>
              {i === 0 && (
                <div className="absolute top-1.5 left-1.5 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">Cover</div>
              )}
              <button
                type="button"
                onClick={e => { e.stopPropagation(); onChange(files.filter((_,j) => j !== i)); }}
                className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          ))}
          {files.length < 5 && (
            <button type="button" onClick={() => ref.current?.click()}
              className={`aspect-square rounded-xl border-2 border-dashed ${d(dark,"border-white/15 hover:border-amber-400/40","border-stone-200 hover:border-amber-300")} flex items-center justify-center transition-all`}>
              <svg className={`w-5 h-5 ${T.text3(dark)}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Tag input ────────────────────────────────────────────────────────────────
function TagInput({ tags, onChange, dark }: { tags: string[]; onChange: (t: string[]) => void; dark: boolean }) {
  const [val, setVal] = useState("");

  const add = () => {
    const trimmed = val.trim().toLowerCase().replace(/\s+/g, "-");
    if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
      onChange([...tags, trimmed]);
      setVal("");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
          placeholder="Add tag and press Enter…"
          className={inputCls(dark, "flex-1")}
        />
        <button type="button" onClick={add}
          className="px-3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-xs font-black transition-all">
          Add
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map(tag => (
            <span key={tag} className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${d(dark,"bg-amber-400/15 text-amber-300 border border-amber-400/20","bg-amber-50 text-amber-700 border border-amber-200")}`}>
              #{tag}
              <button type="button" onClick={() => onChange(tags.filter(t => t !== tag))} className="hover:text-rose-400 transition-colors">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </span>
          ))}
        </div>
      )}
      <p className={`text-[10px] ${T.text3(dark)}`}>{10 - tags.length} tags remaining</p>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function CreateEventPage() {
  // ── Dark mode ──────────────────────────────────────────────────────────────
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("org-dashboard-dark");
    if (saved === "1") setDark(true);
  }, []);
  const toggleDark = () => setDark(p => {
    localStorage.setItem("org-dashboard-dark", !p ? "1" : "0");
    return !p;
  });

  // ── Form state ─────────────────────────────────────────────────────────────
  const [form, setForm] = useState<FormData>({
    title: "", description: "", category: "", startTime: "",
    endTime: "", timezone: "Asia/Kolkata", mode: "", venue: "",
    onlineLink: "", latitude: "", longitude: "", tags: [],
    capacity: "", ticketPrice: "", isFree: true, files: [],
  });

  const set = <K extends keyof FormData>(key: K, val: FormData[K]) =>
    setForm(p => ({ ...p, [key]: val }));

  // ── Venue autocomplete — Google Places ────────────────────────────────────
  const [venueQuery,       setVenueQuery]       = useState("");
  const [venueSuggestions, setVenueSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showSuggestions,  setShowSuggestions]  = useState(false);
  const [venueLoading,     setVenueLoading]     = useState(false);
  const [showPaidModal,    setShowPaidModal]    = useState(false);
  const [compressing,      setCompressing]      = useState(false);
  const [compressionResults, setCompressionResults] = useState<CompressionResult[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Autocomplete: Places Autocomplete API (no CORS issue — proxied via Next.js route or called with key)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (venueQuery.length < 2) { setVenueSuggestions([]); setShowSuggestions(false); return; }

    debounceRef.current = setTimeout(async () => {
      setVenueLoading(true);
      try {
        const res  = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(venueQuery)}`);
        const data = await res.json();
        if (data.predictions) {
          setVenueSuggestions(data.predictions);
          setShowSuggestions(true);
        }
      } catch {
        // Fallback: silently fail, user can still type manually
      } finally {
        setVenueLoading(false);
      }
    }, 300);
  }, [venueQuery]);

  // Place Details: get lat/lng from place_id
  const selectVenue = async (suggestion: PlaceSuggestion) => {
    setVenueQuery(suggestion.description);
    set("venue", suggestion.description);
    setShowSuggestions(false);
    setVenueLoading(true);
    try {
      const res  = await fetch(`/api/places/details?place_id=${encodeURIComponent(suggestion.place_id)}`);
      const data = await res.json();
      if (data.result?.location) {
        const { lat, lng } = data.result.location;
        set("latitude",  lat);
        set("longitude", lng);
      } else if (data.result?.geometry?.location) {
        // fallback in case route returns raw Google response
        const { lat, lng } = data.result.geometry.location;
        set("latitude",  lat);
        set("longitude", lng);
      }
    } catch {
      // coords stay empty — user can fill manually
    } finally {
      setVenueLoading(false);
    }
  };

  // ── Compression ────────────────────────────────────────────────────────────
  const handleCompress = async () => {
    if (form.files.length === 0) return;
    setCompressing(true);
    setCompressionResults([]);
    try {
      const results = await compressImages(form.files);
      setCompressionResults(results);
      // Swap form files with compressed versions
      set("files", results.map(r => r.compressed));
    } finally {
      setCompressing(false);
    }
  };

  // ── Submission ─────────────────────────────────────────────────────────────
  const router   = useRouter();
  const { submit, loading: submitting, error: apiError, reset: resetApiError } = useCreateEvent();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdTitle,     setCreatedTitle]     = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.category) e.category = "Category is required";
    if (!form.startTime) e.startTime = "Start time is required";
    if (!form.endTime) e.endTime = "End time is required";
    if (form.startTime && form.endTime && form.startTime >= form.endTime) e.endTime = "End time must be after start";
    if (!form.mode) e.mode = "Mode is required";
    if ((form.mode === "OFFLINE" || form.mode === "HYBRID") && !form.venue) e.venue = "Venue is required for this mode";
    if ((form.mode === "ONLINE" || form.mode === "HYBRID") && !form.onlineLink) e.onlineLink = "Online link is required for this mode";
    if (!form.capacity || Number(form.capacity) < 1) e.capacity = "Capacity must be at least 1";
    if (form.files.length < 2) e.files = "Please upload at least 2 images";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetApiError();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});

    // ── 1. Compress images before upload ──────────────────────────────────
    let filesToUpload = form.files;
    try {
      setCompressing(true);
      const results = await compressImages(form.files);
      filesToUpload = results.map(r => r.compressed);
    } catch {
      // compression failed — fall back to originals, don't block submit
    } finally {
      setCompressing(false);
    }

    // ── 2. Build payload and fire API ─────────────────────────────────────
    const payload: CreateEventRequest = {
      title:       form.title,
      description: form.description,
      category:    form.category as EventCategory,
      startTime:   form.startTime,
      endTime:     form.endTime,
      timezone:    form.timezone,
      mode:        form.mode as EventMode,
      capacity:    Number(form.capacity),
      isFree:      true,
      ticketPrice: null,
      tags:        form.tags,
      files:       filesToUpload,
      ...(form.venue      ? { venue:      form.venue }      : {}),
      ...(form.onlineLink ? { onlineLink: form.onlineLink } : {}),
      ...(form.latitude  !== "" ? { latitude:  Number(form.latitude)  } : {}),
      ...(form.longitude !== "" ? { longitude: Number(form.longitude) } : {}),
    };

    const result = await submit(payload);
    if (result) {
      setCreatedTitle(form.title);
      setShowSuccessModal(true);
    }
  };

  // ── Mode helpers ───────────────────────────────────────────────────────────
  const needsVenue = form.mode === "OFFLINE" || form.mode === "HYBRID";
  const needsLink  = form.mode === "ONLINE"  || form.mode === "HYBRID";

  // ── Error helper ───────────────────────────────────────────────────────────
  const err = (key: keyof FormData) => errors[key]
    ? <p className="text-[10px] text-rose-400 font-medium mt-1">{errors[key]}</p>
    : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; font-family: 'DM Sans', system-ui, sans-serif; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(128,128,128,.2); border-radius: 99px; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fu { animation: fadeUp .5s cubic-bezier(0.16,1,0.3,1) both; }
        .d1{animation-delay:.05s}.d2{animation-delay:.12s}.d3{animation-delay:.2s}
        .d4{animation-delay:.28s}.d5{animation-delay:.36s}.d6{animation-delay:.44s}
        input[type="datetime-local"]::-webkit-calendar-picker-indicator { opacity: 0.4; cursor: pointer; filter: ${dark ? "invert(1)" : "none"}; }
      `}</style>

      <div className={`min-h-screen ${T.bg(dark)} transition-colors duration-300`}>
        {/* ── Top bar ── */}
        <header className={`sticky top-0 z-40 ${T.surface(dark)}/95 backdrop-blur-xl border-b ${T.border(dark)} transition-colors duration-300`}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <a href="/organizer/dashboard" className={`w-8 h-8 rounded-xl flex items-center justify-center ${d(dark,"bg-white/8 text-white/60 hover:text-white hover:bg-white/14","bg-stone-100 text-stone-500 hover:text-stone-900 hover:bg-stone-200")} transition-all`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6"/></svg>
              </a>
              <div>
                <div className={`${T.text1(dark)} font-black text-sm sm:text-base leading-tight`} style={{fontFamily:"'Playfair Display',Georgia,serif"}}>Create Event</div>
                <div className={`${T.text3(dark)} text-[10px] hidden sm:block`}>Fill in the details below to publish your event</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Dark mode toggle */}
              <button onClick={toggleDark} title="Toggle theme"
                className={`relative w-10 h-5 rounded-full transition-all duration-300 flex-shrink-0 border ${dark?"bg-amber-400/20 border-amber-400/30":"bg-stone-200 border-stone-300"}`}>
                <span className={`absolute left-1 top-1/2 -translate-y-1/2 text-[9px] transition-opacity ${dark?"opacity-100":"opacity-0"}`}>🌙</span>
                <span className={`absolute right-1 top-1/2 -translate-y-1/2 text-[9px] transition-opacity ${dark?"opacity-0":"opacity-100"}`}>☀️</span>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full shadow-sm transition-all duration-300 ${dark?"translate-x-5 bg-amber-400":"translate-x-0.5 bg-white"}`}/>
              </button>
              {/* Logo */}
              <div className="flex items-center gap-2 pl-2 border-l border-current/10">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <span className={`${T.text1(dark)} font-black text-xs hidden sm:block`} style={{fontFamily:"'Playfair Display',Georgia,serif"}}>eventimist</span>
              </div>
            </div>
          </div>
        </header>

        {/* ── Progress strip ── */}
        <div className={`${T.surface(dark)} border-b ${T.border(dark)}`}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex items-center gap-2">
              {["Basics","Schedule","Location","Tickets","Media"].map((step, i) => {
                const done = (
                  i === 0 ? !!(form.title && form.description && form.category) :
                  i === 1 ? !!(form.startTime && form.endTime && form.mode) :
                  i === 2 ? (form.mode === "ONLINE" ? !!form.onlineLink : !!form.venue) :
                  i === 3 ? !!(form.capacity) :
                  form.files.length >= 2
                );
                return (
                  <div key={step} className="flex items-center gap-1.5 flex-1 min-w-0">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-black transition-all ${done ? "bg-amber-500 text-white" : d(dark,"bg-white/10 text-white/30","bg-stone-100 text-stone-400")}`}>
                      {done ? <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg> : i+1}
                    </div>
                    <span className={`text-[10px] font-semibold hidden sm:block truncate ${done ? "text-amber-500" : T.text3(dark)}`}>{step}</span>
                    {i < 4 && <div className={`flex-1 h-px ${done ? "bg-amber-400/40" : d(dark,"bg-white/8","bg-stone-200")}`}/>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">

          {/* ── 1. Basics ── */}
          <div className="fu d1">
            <Section dark={dark} title="Event Basics" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>}>
              {/* Title */}
              <Field dark={dark} label="Event Title" required>
                <input
                  value={form.title}
                  onChange={e => set("title", e.target.value)}
                  placeholder="e.g. Sunburn Arena ft. Martin Garrix"
                  className={inputCls(dark, errors.title ? "border-rose-400/60" : "")}
                  maxLength={120}
                />
                <div className="flex items-center justify-between mt-1">
                  {err("title")}
                  <span className={`text-[10px] ${T.text3(dark)} ml-auto`}>{form.title.length}/120</span>
                </div>
              </Field>

              {/* Description */}
              <Field dark={dark} label="Description" required hint="Describe what attendees can expect, highlights, speakers, performers, etc.">
                <textarea
                  value={form.description}
                  onChange={e => set("description", e.target.value)}
                  placeholder="Tell people what makes your event special…"
                  rows={4}
                  className={inputCls(dark, `resize-none ${errors.description ? "border-rose-400/60" : ""}`)}
                  maxLength={2000}
                />
                <div className="flex items-center justify-between">
                  {err("description")}
                  <span className={`text-[10px] ${T.text3(dark)} ml-auto`}>{form.description.length}/2000</span>
                </div>
              </Field>

              {/* Category */}
              <Field dark={dark} label="Category" required>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat.value} type="button"
                      onClick={() => set("category", cat.value)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-center transition-all ${
                        form.category === cat.value
                          ? d(dark,"bg-amber-400/15 border-amber-400/50 text-amber-400","bg-amber-50 border-amber-400 text-amber-600")
                          : `${d(dark,"border-white/8 hover:border-white/20 hover:bg-white/4","border-stone-200 hover:border-stone-300 hover:bg-stone-50")} ${T.text2(dark)}`
                      }`}
                    >
                      <span className="text-lg leading-none">{cat.emoji}</span>
                      <span className="text-[9px] font-bold leading-tight">{cat.label}</span>
                    </button>
                  ))}
                </div>
                {err("category")}
              </Field>

              {/* Tags */}
              <Field dark={dark} label="Tags" hint="Press Enter or comma to add. Tags help attendees discover your event.">
                <TagInput tags={form.tags} onChange={v => set("tags", v)} dark={dark}/>
              </Field>
            </Section>
          </div>

          {/* ── 2. Schedule ── */}
          <div className="fu d2">
            <Section dark={dark} title="Schedule & Format" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}>
              {/* Start / End */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Field dark={dark} label="Start Date & Time" required>
                  <input type="datetime-local" value={form.startTime} onChange={e => set("startTime", e.target.value)}
                    className={inputCls(dark, errors.startTime ? "border-rose-400/60" : "")}/>
                  {err("startTime")}
                </Field>
                <Field dark={dark} label="End Date & Time" required>
                  <input type="datetime-local" value={form.endTime} onChange={e => set("endTime", e.target.value)}
                    className={inputCls(dark, errors.endTime ? "border-rose-400/60" : "")}/>
                  {err("endTime")}
                </Field>
              </div>

              {/* Timezone */}
              <Field dark={dark} label="Timezone" required>
                <select value={form.timezone} onChange={e => set("timezone", e.target.value)}
                  className={inputCls(dark)}>
                  {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz.replace("_"," ")}</option>)}
                </select>
              </Field>

              {/* Mode */}
              <Field dark={dark} label="Event Mode" required>
                <div className="grid grid-cols-3 gap-3">
                  {(["OFFLINE", "ONLINE", "HYBRID"] as Mode[]).map(m => {
                    const icons: Record<Mode, React.ReactNode> = {
                      OFFLINE: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
                      ONLINE:  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
                      HYBRID:  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M8 12h8m-4-4v8"/><circle cx="12" cy="12" r="10"/></svg>,
                    };
                    const labels: Record<Mode,string> = { OFFLINE:"In Person", ONLINE:"Online", HYBRID:"Hybrid" };
                    const active = form.mode === m;
                    return (
                      <button key={m} type="button" onClick={() => set("mode", m)}
                        className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl border transition-all ${
                          active
                            ? d(dark,"bg-amber-400/15 border-amber-400/50 text-amber-400","bg-amber-50 border-amber-400 text-amber-600")
                            : `${d(dark,"border-white/8 hover:border-white/20 hover:bg-white/4","border-stone-200 hover:border-stone-300")} ${T.text2(dark)}`
                        }`}
                      >
                        {icons[m]}
                        <span className="text-[11px] font-bold">{labels[m]}</span>
                      </button>
                    );
                  })}
                </div>
                {err("mode")}
              </Field>
            </Section>
          </div>

          {/* ── 3. Location ── */}
          <div className="fu d3">
            <Section dark={dark} title="Location & Links" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>}>
              {/* Venue autocomplete */}
              {(needsVenue || form.mode === "") && (
                <Field dark={dark} label="Venue" required={needsVenue} hint="Start typing to search venues via Google Places.">
                  <div className="relative">
                    <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${T.text3(dark)}`}>
                      {venueLoading
                        ? <svg className="w-4 h-4 animate-spin text-amber-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                        : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                      }
                    </div>
                    <input
                      value={venueQuery}
                      onChange={e => { setVenueQuery(e.target.value); set("venue", e.target.value); }}
                      onFocus={() => venueSuggestions.length > 0 && setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                      placeholder="Search venue or address…"
                      autoComplete="off"
                      className={inputCls(dark, `pl-10 ${errors.venue ? "border-rose-400/60" : ""}`)}
                    />
                    {/* Clear button */}
                    {venueQuery && (
                      <button type="button" onClick={() => { setVenueQuery(""); set("venue",""); set("latitude",""); set("longitude",""); setVenueSuggestions([]); }}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full ${d(dark,"bg-white/15 text-white/50 hover:text-white","bg-stone-200 text-stone-400 hover:text-stone-700")} flex items-center justify-center transition-all`}>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    )}
                    {/* Dropdown */}
                    {showSuggestions && venueSuggestions.length > 0 && (
                      <div className={`absolute top-full left-0 right-0 mt-1.5 ${T.surface(dark)} border ${T.border(dark)} rounded-xl shadow-2xl overflow-hidden z-30 max-h-64 overflow-y-auto`}>
                        {venueSuggestions.map(v => (
                          <button key={v.place_id} type="button" onMouseDown={() => selectVenue(v)}
                            className={`w-full flex items-start gap-3 px-4 py-3 text-left ${d(dark,"hover:bg-white/6","hover:bg-stone-50")} transition-all`}>
                            <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
                            </div>
                            <div className="min-w-0">
                              <div className={`${T.text1(dark)} text-xs font-bold truncate`}>{v.structured_formatting.main_text}</div>
                              <div className={`${T.text3(dark)} text-[10px] mt-0.5 truncate`}>{v.structured_formatting.secondary_text}</div>
                            </div>
                          </button>
                        ))}
                        {/* Powered by Google */}
                        <div className={`px-4 py-2 border-t ${T.border(dark)} flex items-center gap-2`}>
                          <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                          <span className={`${T.text3(dark)} text-[10px]`}>Powered by Google Places</span>
                        </div>
                      </div>
                    )}
                  </div>
                  {err("venue")}
                </Field>
              )}

              {/* Map + lat/lng — only for OFFLINE or HYBRID */}
              {(needsVenue || form.mode === "") && (
                <>
              {/* Map */}
              {/* Real Google Map */}
              <GoogleMap lat={form.latitude} lng={form.longitude} venueName={form.venue} dark={dark}/>

              {/* Manual lat/lng */}
              <div className="grid grid-cols-2 gap-3">
                <Field dark={dark} label="Latitude" hint="Auto-filled when you pick a venue">
                  <input type="number" step="any" value={form.latitude} onChange={e => set("latitude", e.target.value ? Number(e.target.value) : "")}
                    placeholder="28.6139" className={inputCls(dark)}/>
                </Field>
                <Field dark={dark} label="Longitude">
                  <input type="number" step="any" value={form.longitude} onChange={e => set("longitude", e.target.value ? Number(e.target.value) : "")}
                    placeholder="77.2090" className={inputCls(dark)}/>
                </Field>
              </div>
                </>
              )}

              {/* Online link */}
              {(needsLink || form.mode === "") && (
                <Field dark={dark} label="Online Meeting / Stream Link" required={needsLink} hint="Zoom, Google Meet, YouTube Live, Teams, etc.">
                  <div className="relative">
                    <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${T.text3(dark)}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/></svg>
                    </div>
                    <input value={form.onlineLink} onChange={e => set("onlineLink", e.target.value)}
                      placeholder="https://meet.google.com/abc-def-ghi"
                      className={inputCls(dark, `pl-10 ${errors.onlineLink ? "border-rose-400/60" : ""}`)}/>
                  </div>
                  {err("onlineLink")}
                </Field>
              )}
            </Section>
          </div>

          {/* ── 4. Tickets ── */}
          <div className="fu d4">
            <Section dark={dark} title="Capacity & Tickets" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M2 9a3 3 0 010-6h20a3 3 0 010 6"/><path d="M2 15a3 3 0 000 6h20a3 3 0 000-6"/><path d="M4 9h16M4 15h16"/></svg>}>
              {/* Capacity */}
              <Field dark={dark} label="Capacity" required hint="Maximum number of attendees allowed">
                <div className="relative">
                  <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${T.text3(dark)}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                  </div>
                  <input type="number" min="1" value={form.capacity} onChange={e => set("capacity", e.target.value ? Number(e.target.value) : "")}
                    placeholder="500" className={inputCls(dark, `pl-10 ${errors.capacity ? "border-rose-400/60" : ""}`)}/>
                </div>
                {err("capacity")}
              </Field>

              {/* Free toggle — paid is coming soon */}
              <div className={`flex items-center justify-between p-4 rounded-xl ${d(dark,"bg-white/4 border border-white/8","bg-stone-50 border border-stone-200")}`}>
                <div>
                  <div className={`${T.text1(dark)} text-sm font-bold`}>Free Event</div>
                  <div className={`${T.text3(dark)} text-[11px] mt-0.5`}>Paid tickets are a Pro feature — coming soon!</div>
                </div>
                <button type="button" onClick={() => setShowPaidModal(true)}
                  className="relative w-12 h-6 rounded-full bg-amber-500 flex-shrink-0">
                  <div className="absolute top-0.5 translate-x-6 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300"/>
                </button>
              </div>
            </Section>
          </div>

          {/* ── 5. Media ── */}
          <div className="fu d5">
            <Section dark={dark} title="Event Images" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>}>
              <ImageUploader files={form.files} onChange={v => set("files", v)} dark={dark}/>
              {errors.files && <p className="text-[10px] text-rose-400 font-medium mt-1">{errors.files}</p>}
              <p className={`text-[10px] ${T.text3(dark)} mt-1`}>First image will be used as the cover. Recommended size: 1920×1080px.</p>

              {/* ── Compress button — commented out (testing only) ──
              {form.files.length > 0 && (
                <button
                  type="button"
                  onClick={handleCompress}
                  disabled={compressing}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed
                    ${d(dark,
                      "bg-sky-400/12 border border-sky-400/25 text-sky-400 hover:bg-sky-400/20",
                      "bg-sky-50 border border-sky-200 text-sky-600 hover:bg-sky-100"
                    )}`}
                >
                  {compressing ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      Compressing…
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M4 14l4-8 4 8"/><path d="M12 14l4-8 4 8"/><line x1="5.5" y1="11" x2="10.5" y2="11"/><line x1="13.5" y1="11" x2="18.5" y2="11"/></svg>
                      Compress Images ({form.files.length})
                    </>
                  )}
                </button>
              )}

              {/* ── Compression results — commented out (testing only) ──
              {compressionResults.length > 0 && (
                <div className={`rounded-xl border ${T.border(dark)} overflow-hidden`}>
                  <div className={`px-4 py-3 flex items-center justify-between border-b ${T.border(dark)} ${d(dark,"bg-emerald-400/8","bg-emerald-50")}`}>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                      <span className={`text-xs font-black ${d(dark,"text-emerald-400","text-emerald-700")}`}>Compression Complete</span>
                    </div>
                    <span className={`text-[10px] font-bold ${T.text3(dark)}`}>
                      {compressionResults.reduce((s,r) => s + r.originalSizeKB, 0)} KB
                      {" → "}
                      {compressionResults.reduce((s,r) => s + r.compressedSizeKB, 0)} KB
                    </span>
                  </div>
                  <div className={`divide-y ${d(dark,"divide-white/6","divide-stone-100")}`}>
                    {compressionResults.map((r, i) => (
                      <div key={i} className="px-4 py-3 flex items-center gap-3">
                        <img src={URL.createObjectURL(r.compressed)} alt={r.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className={`${T.text2(dark)} text-[11px] font-bold truncate`}>{r.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`${T.text3(dark)} text-[10px]`}>{r.originalSizeKB} KB</span>
                            <svg className={`w-3 h-3 ${T.text3(dark)}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                            <span className="text-emerald-500 text-[10px] font-bold">{r.compressedSizeKB} KB</span>
                          </div>
                          <div className={`mt-1.5 h-1 rounded-full ${d(dark,"bg-white/8","bg-stone-100")} overflow-hidden`}>
                            <div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${r.savedPercent}%` }} />
                          </div>
                        </div>
                        <span className={`flex-shrink-0 text-[10px] font-black px-2 py-1 rounded-lg
                          ${r.savedPercent >= 50
                            ? d(dark,"bg-emerald-400/15 text-emerald-400","bg-emerald-100 text-emerald-700")
                            : r.savedPercent >= 20
                              ? d(dark,"bg-amber-400/15 text-amber-400","bg-amber-100 text-amber-700")
                              : d(dark,"bg-white/8 text-white/40","bg-stone-100 text-stone-500")
                          }`}>
                          -{r.savedPercent}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              ── end commented out ── */}
            </Section>
          </div>

          {/* ── Submit ── */}
          {/* ── API error banner ── */}
          {apiError && (
            <div className="fu d6 flex items-start gap-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-sm px-4 py-3 rounded-xl">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>{apiError}</span>
            </div>
          )}

          {/* ── Submit row ── */}
          <div className="fu d6 flex flex-col sm:flex-row gap-3 pb-8">
            <button type="button" onClick={() => window.history.back()}
              className={`flex-1 sm:flex-none sm:w-36 py-3.5 rounded-2xl font-bold text-sm border ${d(dark,"border-white/12 text-white/60 hover:text-white hover:border-white/25 hover:bg-white/5","border-stone-200 text-stone-500 hover:text-stone-900 hover:border-stone-300 hover:bg-stone-50")} transition-all`}>
              Cancel
            </button>
            <button type="submit" disabled={submitting || compressing}
              className="flex-1 py-3.5 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 transition-all flex items-center justify-center gap-2">
              {compressing ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Compressing images…
                </>
              ) : submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Saving draft…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  Save Event
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── Success Modal ── */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className={`relative ${T.surface(dark)} border ${T.border(dark)} rounded-2xl shadow-2xl p-7 w-[340px] mx-4 text-center`}>
            {/* Tick icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-emerald-400/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-400/15 border border-emerald-400/25 rounded-full px-3 py-1 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"/>
              <span className="text-emerald-400 text-[10px] font-black tracking-widest uppercase">Event Drafted</span>
            </div>
            <h3 className={`${T.text1(dark)} font-black text-lg mb-2`} style={{fontFamily:"'Playfair Display',Georgia,serif"}}>
              Saved Successfully!
            </h3>
            <p className={`${T.text3(dark)} text-sm mb-6 leading-relaxed`}>
              <span className="text-amber-500 font-bold">"{createdTitle}"</span> has been drafted.
              Head to your dashboard to review and publish it.
            </p>
            <button
              onClick={() => router.replace("/organizer/dashboard")}
              className="w-full py-3 rounded-xl font-black text-sm text-white bg-gradient-to-r from-amber-400 to-orange-500 hover:shadow-lg hover:shadow-amber-400/25 hover:scale-[1.01] transition-all">
              Go to Dashboard →
            </button>
          </div>
        </div>
      )}

      {/* ── Paid Coming Soon Modal ── */}
      {showPaidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPaidModal(false)} />
          <div className={`relative ${T.surface(dark)} border ${T.border(dark)} rounded-2xl shadow-2xl p-6 w-80 mx-4`}>
            {/* Crown icon */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-400/30">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2 19h20v2H2v-2zM2 6l5 5 5-7 5 7 5-5v11H2V6z"/>
              </svg>
            </div>
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-1.5 bg-amber-400/15 border border-amber-400/25 rounded-full px-3 py-1 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"/>
                <span className="text-amber-500 text-[10px] font-black tracking-widest uppercase">Pro Feature</span>
              </div>
              <h3 className={`${T.text1(dark)} font-black text-lg mb-1`} style={{fontFamily:"'Playfair Display',Georgia,serif"}}>Paid Tickets — Coming Soon</h3>
              <p className={`${T.text3(dark)} text-sm leading-relaxed`}>
                Paid ticketing is a premium feature currently in development. For now, all events on Eventimist are free to attend.
              </p>
            </div>
            <button onClick={() => setShowPaidModal(false)}
              className="w-full py-3 rounded-xl font-black text-sm text-white bg-gradient-to-r from-amber-400 to-orange-500 hover:shadow-lg hover:shadow-amber-400/25 transition-all">
              Got it!
            </button>
          </div>

   

        </div>
      )}


            <AIGenerateButton
  dark={dark}
  onApply={(data) => {
    if (data.title)       set("title",       data.title);
    if (data.description) set("description", data.description);
    if (data.category)    set("category",    data.category as Category);
    if (data.mode)        set("mode",        data.mode as Mode);
    if (data.capacity)    set("capacity",    data.capacity);
    if (data.startTime)   set("startTime",   data.startTime);
    if (data.endTime)     set("endTime",     data.endTime);
    if (data.tags)        set("tags",        data.tags);
  }}
/>
    </>
  );
}