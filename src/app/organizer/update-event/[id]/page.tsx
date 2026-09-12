"use client";

// src/app/organizer/update-event/[id]/page.tsx

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { compressImages } from "@/utils/compressImages";
import { useOrganizerEvents } from "@/hooks/eventimist/organizer/event/useOrganizerEvents";
import { useUpdateEvent } from "@/hooks/eventimist/organizer/event/useUpdateEvent";
import type { UpdateEventRequest } from "@/services/eventimist/organizer/event/updateEvent.service";

// ─── Types ────────────────────────────────────────────────────────────────────
type Category =
  | "MUSIC" | "TECH" | "FOOD" | "ART" | "SPORTS"
  | "FESTIVAL" | "VOLUNTEER" | "NETWORKING"
  | "WORKSHOP" | "CONFERENCE" | "EDUCATION"
  | "BUSINESS" | "HEALTH" | "ENTERTAINMENT" | "GAMING";

type Mode = "ONLINE" | "OFFLINE" | "HYBRID";

interface UpdateFormData {
  title:          string;
  description:    string;
  category:       Category | "";
  startTime:      string;
  endTime:        string;
  timezone:       string;
  mode:           Mode | "";
  venue:          string;
  onlineLink:     string;
  latitude:       number | "";
  longitude:      number | "";
  tags:           string[];
  capacity:       number | "";
  ticketPrice:    number | "";
  isFree:         boolean;
  existingImages: string[];   // URLs to retain
  newImages:      File[];     // new uploads
}

interface PlaceSuggestion {
  place_id: string;
  description: string;
  structured_formatting: { main_text: string; secondary_text: string };
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
  "Asia/Kolkata","Asia/Dubai","Asia/Singapore","Asia/Tokyo",
  "Asia/Shanghai","Asia/Seoul","Europe/London","Europe/Paris",
  "Europe/Berlin","America/New_York","America/Chicago",
  "America/Los_Angeles","America/Toronto","Australia/Sydney","Pacific/Auckland",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function d(dark: boolean, darkCls: string, lightCls: string) { return dark ? darkCls : lightCls; }

const T = {
  bg:      (dark: boolean) => d(dark, "bg-[#0c0e1a]",   "bg-stone-50"),
  surface: (dark: boolean) => d(dark, "bg-[#13151f]",   "bg-white"),
  border:  (dark: boolean) => d(dark, "border-white/8", "border-stone-200"),
  text1:   (dark: boolean) => d(dark, "text-white",     "text-stone-900"),
  text2:   (dark: boolean) => d(dark, "text-white/60",  "text-stone-600"),
  text3:   (dark: boolean) => d(dark, "text-white/30",  "text-stone-400"),
  input:   (dark: boolean) => d(dark,
    "bg-[#1a1d2e] border-white/10 text-white placeholder:text-white/25 focus:border-amber-400/50",
    "bg-white border-stone-200 text-stone-900 placeholder:text-stone-300 focus:border-amber-400"
  ),
};

const inputCls = (dark: boolean, extra = "") =>
  `w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all ${T.input(dark)} ${extra}`;

// ─── Sub-components ───────────────────────────────────────────────────────────
function Section({ title, icon, children, dark }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; dark: boolean;
}) {
  return (
    <div className={`${T.surface(dark)} border ${T.border(dark)} rounded-2xl overflow-hidden`}>
      <div className={`flex items-center gap-3 px-5 sm:px-6 py-4 border-b ${T.border(dark)}`}>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-amber-500 flex-shrink-0
          ${d(dark,"bg-amber-400/15 border border-amber-400/20","bg-amber-50 border border-amber-200")}`}>
          {icon}
        </div>
        <h2 className={`${T.text1(dark)} font-black text-sm sm:text-base`}
          style={{fontFamily:"'Playfair Display',Georgia,serif"}}>{title}</h2>
      </div>
      <div className="px-5 sm:px-6 py-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, required, hint, children, dark }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode; dark: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className={`block text-xs font-bold ${d(dark,"text-white/70","text-stone-700")}`}>
        {label}{required && <span className="text-amber-500 ml-0.5">*</span>}
        {hint && <span className={`ml-2 font-normal ${T.text3(dark)}`}>· {hint}</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Existing image strip ─────────────────────────────────────────────────────
function ExistingImages({ urls, onRemove, dark }: {
  urls: string[]; onRemove: (url: string) => void; dark: boolean;
}) {
  if (urls.length === 0) return null;
  return (
    <div className="space-y-2">
      <p className={`text-[11px] font-bold ${T.text2(dark)}`}>Current images — uncheck to remove</p>
      <div className="flex flex-wrap gap-2">
        {urls.map(url => (
          <div key={url} className="relative group">
            <img src={url} alt="" className="w-20 h-20 rounded-xl object-cover border-2 border-emerald-400/40"/>
            <button
              type="button"
              onClick={() => onRemove(url)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
              title="Remove image"
            >
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div className="absolute bottom-1 left-1 right-1 flex items-center justify-center">
              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full bg-emerald-500/80 text-white backdrop-blur-sm`}>KEEP</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── New image uploader ───────────────────────────────────────────────────────
function NewImageUploader({ files, onChange, dark, maxTotal }: {
  files: File[]; onChange: (files: File[]) => void; dark: boolean; maxTotal: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previews = files.map(f => URL.createObjectURL(f));
  const canAdd   = files.length < maxTotal;

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    onChange([...files, ...dropped].slice(0, maxTotal));
  }, [files, onChange, maxTotal]);

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    onChange([...files, ...picked].slice(0, maxTotal));
    e.target.value = "";
  };

  const remove = (i: number) => onChange(files.filter((_, idx) => idx !== i));

  if (files.length === 0) {
    return (
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all
          ${d(dark,"border-white/12 hover:border-amber-400/40 hover:bg-amber-400/4","border-stone-200 hover:border-amber-400/50 hover:bg-amber-50")}`}
      >
        <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center mx-auto mb-2 text-amber-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"/></svg>
        </div>
        <p className={`${T.text2(dark)} text-sm font-bold mb-1`}>Add new images</p>
        <p className={`${T.text3(dark)} text-[11px]`}>PNG, JPG, WEBP · up to {maxTotal} new</p>
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePick}/>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {previews.map((src, i) => (
          <div key={i} className="relative group w-20 h-20">
            <img src={src} alt="" className="w-20 h-20 rounded-xl object-cover"/>
            {i === 0 && (
              <span className="absolute bottom-1 left-1 right-1 text-center text-[8px] font-black px-1 py-0.5 rounded-full bg-amber-500/90 text-white backdrop-blur-sm">NEW COVER</span>
            )}
            <button type="button" onClick={() => remove(i)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg">
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        ))}
        {canAdd && (
          <button type="button" onClick={() => inputRef.current?.click()}
            className={`w-20 h-20 rounded-xl border-2 border-dashed flex items-center justify-center transition-all
              ${d(dark,"border-white/12 hover:border-amber-400/40 text-white/30 hover:text-amber-400","border-stone-200 hover:border-amber-400/50 text-stone-400 hover:text-amber-500")}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePick}/>
    </div>
  );
}

// ─── Google Map preview ───────────────────────────────────────────────────────
function GoogleMap({ lat, lng, venueName, dark }: { lat: number|""; lng: number|""; venueName: string; dark: boolean }) {
  if (!lat || !lng) return (
    <div className={`h-36 rounded-xl flex items-center justify-center ${d(dark,"bg-white/4","bg-stone-100")}`}>
      <p className={`${T.text3(dark)} text-xs`}>Select a venue to preview map</p>
    </div>
  );
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
 const src = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
  return (
    <iframe src={src} width="100%" height="144" className="rounded-xl border-0 w-full" loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" title={venueName}/>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function UpdateEventPage() {
  const router  = useRouter();
  const params  = useParams();
  const eventId = params?.id as string;

  // ── Fetch from API (TanStack Query — cached after first load) ──────────────
  const { events, loading: eventsLoading } = useOrganizerEvents();
  const { submit: updateSubmit, loading: apiLoading, error: apiError, reset: resetApiError } = useUpdateEvent();
  const event = events.find(e => String(e.id) === eventId) ?? null;

  // ── Dark mode ──────────────────────────────────────────────────────────────
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(localStorage.getItem("org-dashboard-dark") === "1");
  }, []);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [form, setForm] = useState<UpdateFormData>({
    title: "", description: "", category: "",
    startTime: "", endTime: "", timezone: "Asia/Kolkata",
    mode: "", venue: "", onlineLink: "",
    latitude: "", longitude: "",
    tags: [], capacity: "", ticketPrice: "", isFree: true,
    existingImages: [], newImages: [],
  });
  const [seeded, setSeeded] = useState(false);

  // Seed form once event data arrives (works for direct URL visit too)
  useEffect(() => {
    if (!event || seeded) return;
    setForm({
      title:          event.title,
      description:    event.description,
      category:       event.category as Category,
      startTime:      event.startTime?.slice(0, 16) ?? "",
      endTime:        event.endTime?.slice(0, 16)   ?? "",
      timezone:       event.timezone ?? "Asia/Kolkata",
      mode:           event.mode as Mode,
      venue:          event.venue       ?? "",
      onlineLink:     event.onlineLink  ?? "",
      latitude:       event.latitude    ?? "",
      longitude:      event.longitude   ?? "",
      tags:           event.tags        ?? [],
      capacity:       event.capacity    ?? "",
      ticketPrice:    event.ticketPrice ?? "",
      isFree:         event.isFree,
      existingImages: [
        ...(event.coverImage ? [event.coverImage] : []),
        ...(event.images ?? []),
      ].filter((v, i, a) => a.indexOf(v) === i),
      newImages: [],
    });
    setSeeded(true);
  }, [event, seeded]);

  // ── All remaining state — must be before any conditional return ───────────
  const [errors,       setErrors]       = useState<Partial<Record<keyof UpdateFormData | "images", string>>>({});
  const [compressing,  setCompressing]  = useState(false);
  const [showSuccess,  setShowSuccess]  = useState(false);
  const [showPaidModal,setShowPaidModal]= useState(false);
  const [tagInput,     setTagInput]     = useState("");
  const [venueQuery,      setVenueQuery]      = useState("");
  const [venueSuggestions,setVenueSuggestions]= useState<PlaceSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [venueLoading,    setVenueLoading]    = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) { setVenueSuggestions([]); setShowSuggestions(false); return; }
    setVenueLoading(true);
    try {
      const res  = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(query)}`);
      const data = await res.json();
      setVenueSuggestions(data.predictions ?? []);
      setShowSuggestions(true);
    } catch { setVenueSuggestions([]); }
    finally { setVenueLoading(false); }
  }, []);

  // ── Loading / not-found guards (AFTER all hooks) ──────────────────────────
  // All hooks above — conditional returns only below this line

  const set = <K extends keyof UpdateFormData>(key: K, value: UpdateFormData[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const err = (key: keyof UpdateFormData | "images") =>
    errors[key] ? <p className="text-[10px] text-rose-400 font-medium mt-1">{errors[key]}</p> : null;

  if (eventsLoading && !event) return (
    <div className={`min-h-screen ${T.bg(dark)} flex items-center justify-center`}>
      <svg className="w-8 h-8 animate-spin text-amber-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
    </div>
  );

  if (!eventsLoading && !event) return (
    <div className={`min-h-screen ${T.bg(dark)} flex items-center justify-center`}>
      <div className="text-center max-w-xs">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h3 className={`${T.text1(dark)} font-black text-base mb-1`} style={{fontFamily:"'Playfair Display',Georgia,serif"}}>Event not found</h3>
        <p className={`${T.text3(dark)} text-sm mb-4`}>Could not load event #{eventId}. Go back to the dashboard and try again.</p>
        <button onClick={() => router.replace("/organizer/dashboard")}
          className="px-5 py-2.5 rounded-xl font-black text-sm text-white bg-gradient-to-r from-amber-400 to-orange-500">
          ← Dashboard
        </button>
      </div>
    </div>
  );

  // ── Tag helpers ────────────────────────────────────────────────────────────
  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g,"-");
    if (t && !form.tags.includes(t) && form.tags.length < 10) {
      set("tags", [...form.tags, t]);
      setTagInput("");
    }
  };
  const removeTag = (tag: string) => set("tags", form.tags.filter(t => t !== tag));

  const handleVenueInput = (val: string) => {
    setVenueQuery(val);
    set("venue", val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 350);
  };

  const selectVenue = async (suggestion: PlaceSuggestion) => {
    setVenueQuery(suggestion.description);
    set("venue", suggestion.description);
    setShowSuggestions(false);
    try {
      const res  = await fetch(`/api/places/details?place_id=${suggestion.place_id}`);
      const data = await res.json();
      if (data.result?.location) {
        set("latitude",  data.result.location.lat);
        set("longitude", data.result.location.lng);
      } else if (data.result?.geometry?.location) {
        set("latitude",  data.result.geometry.location.lat);
        set("longitude", data.result.geometry.location.lng);
      }
    } catch {}
  };

  // ── Mode helpers ───────────────────────────────────────────────────────────
  const needsVenue = form.mode === "OFFLINE" || form.mode === "HYBRID";
  const needsLink  = form.mode === "ONLINE"  || form.mode === "HYBRID";

  // ── Remove existing image ──────────────────────────────────────────────────
  const removeExisting = (url: string) =>
    set("existingImages", form.existingImages.filter(u => u !== url));

  // ── Validate ───────────────────────────────────────────────────────────────
  const validate = () => {
    const e: typeof errors = {};
    if (!form.title.trim())    e.title       = "Title is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.category)        e.category    = "Category is required";
    if (!form.startTime)       e.startTime   = "Start time is required";
    if (!form.endTime)         e.endTime     = "End time is required";
    if (form.startTime && form.endTime && form.startTime >= form.endTime)
                               e.endTime     = "End must be after start";
    if (!form.mode)            e.mode        = "Mode is required";
    if (needsVenue && !form.venue)      e.venue      = "Venue is required";
    if (needsLink  && !form.onlineLink) e.onlineLink = "Online link is required";
    if (!form.capacity || Number(form.capacity) < 1) e.capacity = "Capacity must be ≥ 1";
    const totalImages = form.existingImages.length + form.newImages.length;
    if (totalImages < 1)       e.images = "Keep or upload at least 1 image";
    return e;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    resetApiError();

    // ── Compress new images ────────────────────────────────────────────────
    let filesToUpload = form.newImages;
    if (form.newImages.length > 0) {
      try {
        setCompressing(true);
        const results = await compressImages(form.newImages);
        filesToUpload = results.map(r => r.compressed);
      } catch {} finally { setCompressing(false); }
    }

    // ── Image sync — always send final state ──────────────────────────────
    // Backend replaces image list with exactly what we send.
    // Always include existingImages (what to keep) + newImages (what to add).
    // If user removed images, existingImages will be a subset → backend removes the rest.
    // If user added nothing new, newImages is [] → backend just uses existingImages.
    const payload: UpdateEventRequest = {
      title:       form.title,
      description: form.description,
      category:    form.category   || undefined,
      startTime:   form.startTime  || undefined,
      endTime:     form.endTime    || undefined,
      timezone:    form.timezone,
      mode:        form.mode       || undefined,
      venue:       form.venue      || undefined,
      onlineLink:  form.onlineLink || undefined,
      latitude:    form.latitude  !== "" ? Number(form.latitude)  : undefined,
      longitude:   form.longitude !== "" ? Number(form.longitude) : undefined,
      tags:        form.tags,
      capacity:    form.capacity  !== "" ? Number(form.capacity)  : undefined,
      isFree:      true,
      ticketPrice: null,
      existingImages: form.existingImages,          // URLs to keep (may be subset of original)
      newImages:      filesToUpload.length > 0      // only if user added new files
                        ? filesToUpload
                        : undefined,
    };

    const result = await updateSubmit(event!.id, payload);
    if (result) setShowSuccess(true);
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const totalImages = form.existingImages.length + form.newImages.length;
  const maxNew      = Math.max(0, 5 - form.existingImages.length);

  // ── Change-tracking badge ──────────────────────────────────────────────────
  const isDirty = form.title !== "" || form.newImages.length > 0;

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className={`min-h-screen ${T.bg(dark)} transition-colors duration-300`}>

      {/* ── Top bar ── */}
      <div className={`sticky top-0 z-30 ${d(dark,"bg-[#0c0e1a]/90","bg-stone-50/90")} backdrop-blur-md border-b ${T.border(dark)}`}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all
                ${d(dark,"bg-white/6 text-white/50 hover:bg-white/12 hover:text-white","bg-white text-stone-500 hover:bg-stone-100 hover:text-stone-900 border border-stone-200")}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6"/></svg>
            </button>
            <div>
              <h1 className={`${T.text1(dark)} font-black text-sm sm:text-base leading-none`}
                style={{fontFamily:"'Playfair Display',Georgia,serif"}}>Edit Event</h1>
              <p className={`${T.text3(dark)} text-[10px] mt-0.5 truncate max-w-[180px]`}>{event?.title ?? ""}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isDirty && (
              <span className={`text-[10px] font-black px-2 py-1 rounded-full ${d(dark,"bg-amber-400/15 text-amber-400","bg-amber-100 text-amber-600")}`}>
                Unsaved changes
              </span>
            )}
            {/* Dark toggle */}
            <button onClick={() => {
              const next = !dark; setDark(next);
              localStorage.setItem("org-dashboard-dark", next ? "1" : "0");
            }}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all text-sm
                ${d(dark,"bg-white/6 hover:bg-white/12","bg-white hover:bg-stone-100 border border-stone-200")}`}>
              {dark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Hero accent ── */}
      <div className="relative overflow-hidden">
        <div className={`absolute inset-0 ${d(dark,"opacity-100","opacity-60")}`}>
          <div className="absolute top-0 left-1/4 w-96 h-32 bg-amber-500/8 rounded-full blur-3xl"/>
          <div className="absolute top-0 right-1/4 w-64 h-24 bg-orange-500/6 rounded-full blur-2xl"/>
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"/>
            <span className={`text-[11px] font-black tracking-widest uppercase ${d(dark,"text-amber-400","text-amber-600")}`}>Update Event</span>
          </div>
          <p className={`${T.text3(dark)} text-xs`}>Changes will save as a draft — publish from your dashboard.</p>
        </div>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} noValidate>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-10 space-y-4">

          {/* 1 — Basics */}
          <Section dark={dark} title="Basics" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>}>
            <Field dark={dark} label="Event Title" required>
              <input value={form.title} onChange={e => set("title", e.target.value)}
                placeholder="Give your event an unforgettable name" className={inputCls(dark, errors.title ? "border-rose-400/60":"")}/>
              {err("title")}
            </Field>

            <Field dark={dark} label="Description" required>
              <textarea value={form.description} onChange={e => set("description", e.target.value)}
                rows={4} placeholder="What's this event about? Who should attend?"
                className={inputCls(dark, `resize-none ${errors.description ? "border-rose-400/60":""}`)}/>
              {err("description")}
            </Field>

            {/* Category grid */}
            <Field dark={dark} label="Category" required>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {CATEGORIES.map(cat => (
                  <button key={cat.value} type="button" onClick={() => set("category", cat.value)}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-center transition-all
                      ${form.category === cat.value
                        ? "border-amber-400/60 bg-amber-400/10 text-amber-500"
                        : `${T.border(dark)} ${d(dark,"hover:border-white/20 hover:bg-white/4","hover:border-stone-300 hover:bg-stone-50")} ${T.text3(dark)}`
                      }`}>
                    <span className="text-lg leading-none">{cat.emoji}</span>
                    <span className="text-[10px] font-bold leading-tight">{cat.label}</span>
                  </button>
                ))}
              </div>
              {err("category")}
            </Field>

            {/* Tags */}
            <Field dark={dark} label="Tags" hint="up to 10">
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {form.tags.map(tag => (
                    <span key={tag} className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full
                      ${d(dark,"bg-amber-400/12 border border-amber-400/20 text-amber-400","bg-amber-50 border border-amber-200 text-amber-700")}`}>
                      #{tag}
                      <button type="button" onClick={() => removeTag(tag)} className="opacity-60 hover:opacity-100 ml-0.5">
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); }}}
                  placeholder="e.g. networking, web3, food"
                  className={`${inputCls(dark)} flex-1`}/>
                <button type="button" onClick={addTag}
                  className="px-3 py-2.5 rounded-xl text-xs font-black text-white bg-amber-500 hover:bg-amber-400 transition-all flex-shrink-0">
                  Add
                </button>
              </div>
            </Field>
          </Section>

          {/* 2 — Schedule */}
          <Section dark={dark} title="Schedule" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field dark={dark} label="Start Date & Time" required>
                <input type="datetime-local" value={form.startTime} onChange={e => set("startTime", e.target.value)}
                  className={inputCls(dark, errors.startTime ? "border-rose-400/60":"")}/>
                {err("startTime")}
              </Field>
              <Field dark={dark} label="End Date & Time" required>
                <input type="datetime-local" value={form.endTime} onChange={e => set("endTime", e.target.value)}
                  className={inputCls(dark, errors.endTime ? "border-rose-400/60":"")}/>
                {err("endTime")}
              </Field>
            </div>

            <Field dark={dark} label="Timezone">
              <select value={form.timezone} onChange={e => set("timezone", e.target.value)} className={inputCls(dark)}>
                {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz.replace("_", " ")}</option>)}
              </select>
            </Field>

            <Field dark={dark} label="Event Mode" required>
              <div className="grid grid-cols-3 gap-2">
                {(["OFFLINE","ONLINE","HYBRID"] as Mode[]).map(m => {
                  const icons: Record<Mode, React.ReactNode> = {
                    OFFLINE: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
                    ONLINE:  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>,
                    HYBRID:  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M8 6H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-3"/><rect x="8" y="2" width="8" height="6" rx="1"/></svg>,
                  };
                  const active = form.mode === m;
                  return (
                    <button key={m} type="button" onClick={() => set("mode", m)}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all text-xs font-black
                        ${active
                          ? "border-amber-400/60 bg-amber-400/10 text-amber-500"
                          : `${T.border(dark)} ${T.text3(dark)} ${d(dark,"hover:border-white/20 hover:bg-white/4","hover:border-stone-300 hover:bg-stone-50")}`
                        }`}>
                      {icons[m]}{m}
                    </button>
                  );
                })}
              </div>
              {err("mode")}
            </Field>
          </Section>

          {/* 3 — Location */}
          <Section dark={dark} title="Location" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>}>
            {/* Venue autocomplete */}
            {(needsVenue || form.mode === "") && (
              <Field dark={dark} label="Venue" required={needsVenue} hint="Search for a location">
                <div className="relative">
                  <input value={venueQuery || form.venue}
                    onChange={e => handleVenueInput(e.target.value)}
                    onFocus={() => venueSuggestions.length > 0 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    placeholder="Search venue…"
                    className={inputCls(dark, `pr-10 ${errors.venue ? "border-rose-400/60":""}`)}/>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {venueLoading
                      ? <svg className="w-4 h-4 animate-spin text-amber-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      : <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    }
                  </div>
                  {showSuggestions && venueSuggestions.length > 0 && (
                    <div className={`absolute top-full left-0 right-0 mt-1 ${T.surface(dark)} border ${T.border(dark)} rounded-xl shadow-2xl z-20 overflow-hidden`}>
                      {venueSuggestions.map(s => (
                        <button key={s.place_id} type="button" onMouseDown={() => selectVenue(s)}
                          className={`w-full text-left px-4 py-3 ${d(dark,"hover:bg-white/6","hover:bg-stone-50")} transition-all flex items-start gap-2.5`}>
                          <svg className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          <div>
                            <p className={`${T.text1(dark)} text-xs font-bold`}>{s.structured_formatting.main_text}</p>
                            <p className={`${T.text3(dark)} text-[10px]`}>{s.structured_formatting.secondary_text}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {err("venue")}
              </Field>
            )}

            {/* Online link */}
            {needsLink && (
              <Field dark={dark} label="Online Link" required>
                <input value={form.onlineLink} onChange={e => set("onlineLink", e.target.value)}
                  placeholder="https://meet.google.com/…"
                  className={inputCls(dark, errors.onlineLink ? "border-rose-400/60":"")}/>
                {err("onlineLink")}
              </Field>
            )}

            {/* Map + coords — hidden for ONLINE */}
            {form.mode !== "ONLINE" && (
              <>
                <GoogleMap lat={form.latitude} lng={form.longitude} venueName={form.venue} dark={dark}/>
                <div className="grid grid-cols-2 gap-3">
                  <Field dark={dark} label="Latitude" hint="Auto-filled on venue pick">
                    <input type="number" step="any" value={form.latitude}
                      onChange={e => set("latitude", e.target.value ? Number(e.target.value) : "")}
                      placeholder="18.5204" className={inputCls(dark)}/>
                  </Field>
                  <Field dark={dark} label="Longitude">
                    <input type="number" step="any" value={form.longitude}
                      onChange={e => set("longitude", e.target.value ? Number(e.target.value) : "")}
                      placeholder="73.8567" className={inputCls(dark)}/>
                  </Field>
                </div>
              </>
            )}
          </Section>

          {/* 4 — Tickets */}
          <Section dark={dark} title="Tickets & Capacity" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M2 9a3 3 0 010 6v2a2 2 0 002 2h16a2 2 0 002-2v-2a3 3 0 010-6V7a2 2 0 00-2-2H4a2 2 0 00-2 2v2z"/></svg>}>
            <Field dark={dark} label="Capacity" required>
              <input type="number" min="1" value={form.capacity}
                onChange={e => set("capacity", e.target.value ? Number(e.target.value) : "")}
                placeholder="100" className={inputCls(dark, errors.capacity ? "border-rose-400/60":"")}/>
              {err("capacity")}
            </Field>

            {/* Free toggle — paid coming soon */}
            <div className={`flex items-center justify-between p-4 rounded-xl ${d(dark,"bg-white/4 border border-white/8","bg-stone-50 border border-stone-200")}`}>
              <div>
                <div className={`${T.text1(dark)} text-sm font-bold`}>Free Event</div>
                <div className={`${T.text3(dark)} text-[11px] mt-0.5`}>Paid ticketing is a Pro feature — coming soon!</div>
              </div>
              <button type="button" onClick={() => setShowPaidModal(true)}
                className="relative w-12 h-6 rounded-full bg-amber-500 flex-shrink-0">
                <div className="absolute top-0.5 translate-x-6 w-5 h-5 rounded-full bg-white shadow-sm"/>
              </button>
            </div>
          </Section>

          {/* 5 — Images */}
          <Section dark={dark} title="Event Images" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>}>

            {/* Stats banner */}
            <div className={`flex items-center justify-between text-[11px] px-3 py-2.5 rounded-xl ${d(dark,"bg-white/4","bg-stone-50")}`}>
              <span className={T.text3(dark)}>Total images: <span className={`font-black ${T.text1(dark)}`}>{totalImages}</span></span>
              <span className={T.text3(dark)}>Existing: <span className="font-black text-emerald-500">{form.existingImages.length}</span> · New: <span className="font-black text-amber-500">{form.newImages.length}</span></span>
            </div>

            <ExistingImages urls={form.existingImages} onRemove={removeExisting} dark={dark}/>

            <Field dark={dark} label="Upload New Images" hint={`max ${maxNew} more`}>
              <NewImageUploader
                files={form.newImages}
                onChange={v => set("newImages", v)}
                dark={dark}
                maxTotal={maxNew}
              />
            </Field>
            {err("images")}
            <p className={`text-[10px] ${T.text3(dark)}`}>First image (existing or new) is the cover. Recommended: 1920×1080px.</p>
          </Section>

          {/* ── API error banner ── */}
          {apiError && (
            <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-sm px-4 py-3 rounded-xl">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>{apiError}</span>
            </div>
          )}

          {/* ── Validation error banner ── */}
          {Object.keys(errors).length > 0 && (
            <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-sm px-4 py-3 rounded-xl">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>Please fix the errors above before saving.</span>
            </div>
          )}

          {/* ── Submit row ── */}
          <div className="flex flex-col sm:flex-row gap-3 pb-8">
            <button type="button" onClick={() => router.back()}
              className={`flex-1 sm:flex-none sm:w-36 py-3.5 rounded-2xl font-bold text-sm border transition-all
                ${d(dark,"border-white/12 text-white/60 hover:text-white hover:border-white/25 hover:bg-white/5","border-stone-200 text-stone-500 hover:text-stone-900 hover:border-stone-300 hover:bg-stone-50")}`}>
              Cancel
            </button>
            <button type="submit" disabled={apiLoading || compressing}
              className="flex-1 py-3.5 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 transition-all flex items-center justify-center gap-2">
              {compressing ? (
                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Compressing…</>
              ) : apiLoading ? (
                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Saving…</>
              ) : (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Save Changes</>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* ── Success modal ── */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"/>
          <div className={`relative ${T.surface(dark)} border ${T.border(dark)} rounded-2xl shadow-2xl p-7 w-[340px] mx-4 text-center`}>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-emerald-400/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-400/15 border border-emerald-400/25 rounded-full px-3 py-1 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"/>
              <span className="text-emerald-400 text-[10px] font-black tracking-widest uppercase">Updated</span>
            </div>
            <h3 className={`${T.text1(dark)} font-black text-lg mb-2`} style={{fontFamily:"'Playfair Display',Georgia,serif"}}>Changes Saved!</h3>
            <p className={`${T.text3(dark)} text-sm mb-6 leading-relaxed`}>
              Your event has been updated. Head back to the dashboard to review and publish.
            </p>
            <button onClick={() => router.replace("/organizer/dashboard")}
              className="w-full py-3 rounded-xl font-black text-sm text-white bg-gradient-to-r from-amber-400 to-orange-500 hover:shadow-lg hover:shadow-amber-400/25 transition-all">
              Back to Dashboard →
            </button>
          </div>
        </div>
      )}

      {/* ── Paid coming soon modal ── */}
      {showPaidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPaidModal(false)}/>
          <div className={`relative ${T.surface(dark)} border ${T.border(dark)} rounded-2xl shadow-2xl p-6 w-80 mx-4`}>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-400/30">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M2 19h20v2H2v-2zM2 6l5 5 5-7 5 7 5-5v11H2V6z"/></svg>
            </div>
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-1.5 bg-amber-400/15 border border-amber-400/25 rounded-full px-3 py-1 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"/>
                <span className="text-amber-500 text-[10px] font-black tracking-widest uppercase">Pro Feature</span>
              </div>
              <h3 className={`${T.text1(dark)} font-black text-lg mb-1`} style={{fontFamily:"'Playfair Display',Georgia,serif"}}>Paid Tickets — Coming Soon</h3>
              <p className={`${T.text3(dark)} text-sm leading-relaxed`}>Paid ticketing is currently in development. All events are free for now.</p>
            </div>
            <button onClick={() => setShowPaidModal(false)}
              className="w-full py-3 rounded-xl font-black text-sm text-white bg-gradient-to-r from-amber-400 to-orange-500 hover:shadow-lg transition-all">
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}