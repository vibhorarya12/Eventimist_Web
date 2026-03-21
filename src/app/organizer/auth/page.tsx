"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useOrganizerLogin }  from "@/hooks/eventimist/organizer/auth/useOrganizerLogin";
import { useOrganizerSignup } from "@/hooks/eventimist/organizer/auth/useOrganizerSignup";

// ─── Carousel slides ──────────────────────────────────────────────────────────
const slides = [
  { url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80", label: "Music Festivals",  stat: "2.4K attendees avg" },
  { url: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&q=80", label: "Tech Conferences", stat: "890 registrations avg" },
  { url: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80", label: "Corporate Galas",  stat: "500+ connections made" },
  { url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&q=80", label: "Community Drives", stat: "340 volunteers placed" },
  { url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80", label: "Outdoor Events",   stat: "5K+ crowd managed" },
];

// ─── Left carousel ────────────────────────────────────────────────────────────
function PanelCarousel() {
  const [current, setCurrent] = useState(0);
  const [prevIdx, setPrevIdx] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback((idx: number) => {
    if (animating || idx === current) return;
    setAnimating(true); setPrevIdx(current); setCurrent(idx);
    setTimeout(() => { setPrevIdx(null); setAnimating(false); }, 800);
  }, [animating, current]);

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo]);

  useEffect(() => {
    timer.current = setTimeout(next, 5000);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [current, next]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {slides.map((s, i) => {
        const isActive = i === current; const isPrev = i === prevIdx;
        return (
          <div key={i} className="absolute inset-0 transition-all duration-800 ease-in-out"
            style={{ opacity: isActive ? 1 : 0, transform: isActive ? "scale(1)" : isPrev ? "scale(1.06)" : "scale(1)", zIndex: isActive ? 2 : isPrev ? 1 : 0 }}>
            <img src={s.url} alt={s.label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
          </div>
        );
      })}
      <div className="absolute top-8 left-8 z-10 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <span className="text-white font-black text-xl tracking-tight" style={{fontFamily:"'Playfair Display',Georgia,serif"}}>eventimist</span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 z-10 p-10">
        <div key={current + "-label"} className="slide-up inline-block bg-amber-400 text-stone-900 text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full mb-4">
          {slides[current].label}
        </div>
        <h2 key={current + "-title"} className="slide-up text-white font-black text-4xl leading-tight mb-2"
          style={{fontFamily:"'Playfair Display',Georgia,serif", animationDelay:"60ms"}}>
          Organise Events<br/>That Inspire People
        </h2>
        <p key={current + "-stat"} className="slide-up text-white/60 text-sm mb-8" style={{animationDelay:"120ms"}}>
          {slides[current].stat}
        </p>
        <div className="flex items-center gap-3">
          {slides.map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className={`transition-all duration-400 rounded-full ${i === current ? "w-8 h-2 bg-amber-400" : "w-2 h-2 bg-white/30 hover:bg-white/60"}`} />
          ))}
          <div className="ml-auto flex items-center gap-2 text-white/40 text-xs font-mono">
            <span className="text-white/70 font-bold text-sm">{String(current + 1).padStart(2,"0")}</span>
            <span>/</span>
            <span>{String(slides.length).padStart(2,"0")}</span>
          </div>
        </div>
        <div className="mt-4 h-px bg-white/15">
          <div key={current} className="h-full bg-amber-400 carousel-progress"/>
        </div>
      </div>
    </div>
  );
}

// ─── 6-digit OTP input ────────────────────────────────────────────────────────
function OtpInput({ onComplete, disabled }: {
  onComplete: (code: string) => void;
  disabled:   boolean;
}) {
  const [digits, setDigits] = useState(["","","","","",""]);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const update = (idx: number, val: string) => {
    // Allow paste of full 6-digit code
    if (val.length === 6 && /^\d{6}$/.test(val)) {
      const arr = val.split("");
      setDigits(arr);
      inputs.current[5]?.focus();
      onComplete(val);
      return;
    }
    const digit = val.replace(/\D/g, "").slice(-1);
    const next  = [...digits];
    next[idx]   = digit;
    setDigits(next);
    if (digit && idx < 5) inputs.current[idx + 1]?.focus();
    if (next.every(d => d !== "")) onComplete(next.join(""));
  };

  const onKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  return (
    <div className="flex gap-2.5 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => { inputs.current[i] = el; }}
          type="text" inputMode="numeric" maxLength={6}
          value={d}
          onChange={e => update(i, e.target.value)}
          onKeyDown={e => onKeyDown(i, e)}
          disabled={disabled}
          className={`w-11 h-14 text-center text-xl font-black text-stone-900 bg-stone-50 border-2 rounded-xl outline-none transition-all
            ${d ? "border-amber-400 bg-amber-50" : "border-stone-200"}
            focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100
            disabled:opacity-50 disabled:cursor-not-allowed`}
        />
      ))}
    </div>
  );
}

// ─── OTP Screen ───────────────────────────────────────────────────────────────
function OtpScreen({
  email, onVerify, loading, error, onResetError, onResend, resendLoading,
}: {
  email:          string;
  onVerify:       (code: string) => void;
  loading:        boolean;
  error:          string | null;
  onResetError:   () => void;
  onResend:       () => void;
  resendLoading:  boolean;
}) {
  const [resendCooldown, setResendCooldown] = useState(60);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => setResendCooldown(s => s - 1), 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  const handleResend = () => {
    setResendCooldown(60);
    onResend();
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="pt-10 pb-8 px-10 lg:px-12 flex-1 flex flex-col">
        {/* Back to form */}
        <div className="mb-8">
          <a href="/organizer/auth" className="text-stone-400 hover:text-stone-700 transition-colors text-sm flex items-center gap-1 group">
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
            Back
          </a>
        </div>

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-6">
          <svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>

        {/* Heading */}
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 mb-4 self-start">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"/>
          <span className="text-amber-600 text-xs font-bold tracking-widest uppercase">Verify Email</span>
        </div>
        <h1 className="text-stone-900 text-2xl font-black leading-tight mb-2"
          style={{fontFamily:"'Playfair Display',Georgia,serif"}}>
          Check your inbox
        </h1>
        <p className="text-stone-400 text-sm mb-8 leading-relaxed">
          We sent a 6-digit code to<br/>
          <span className="text-stone-700 font-semibold">{email}</span>
        </p>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm px-4 py-3 rounded-xl mb-6">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {/* OTP input */}
        <div className="mb-8">
          <OtpInput
            onComplete={(code) => { onResetError(); onVerify(code); }}
            disabled={loading}
          />
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center gap-2 text-stone-400 text-sm mb-6">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Verifying...
          </div>
        )}

        {/* Resend */}
        <div className="text-center mt-auto pt-4">
          <p className="text-stone-400 text-sm mb-2">Didn't receive the code?</p>
          {resendCooldown > 0 ? (
            <p className="text-stone-400 text-sm">
              Resend in <span className="text-amber-500 font-bold tabular-nums">{resendCooldown}s</span>
            </p>
          ) : (
            <button onClick={handleResend} disabled={resendLoading}
              className="text-amber-500 hover:text-amber-600 font-bold text-sm transition-colors disabled:opacity-50">
              {resendLoading ? "Sending..." : "Resend code →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Auth panel ───────────────────────────────────────────────────────────────
type Tab = "signin" | "signup";

function AuthPanel() {
  const [tab, setTab] = useState<Tab>("signup");

  // ── Signup hook (Clerk + backend) ─────────────────────────────────────────
  const {
    step, submitForm, formLoading, formError, resetFormError,
    verifyOtp, otpLoading, otpError, resetOtpError, resendOtp, resendLoading,
  } = useOrganizerSignup();

  // ── Login hook ─────────────────────────────────────────────────────────────
  const { login, loading: loginLoading, error: loginError, reset: resetLoginError } = useOrganizerLogin();

  // ── Signup form local state ────────────────────────────────────────────────
  const [name,        setName]        = useState("");
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [confirm,     setConfirm]     = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [termsError,  setTermsError]  = useState(false);

  // ── Sign-in local state ────────────────────────────────────────────────────
  const [siEmail,    setSiEmail]    = useState("");
  const [siPass,     setSiPass]     = useState("");
  const [showSiPass, setShowSiPass] = useState(false);

  const switchTab = (t: Tab) => { setTab(t); resetLoginError(); resetFormError(); };

  // ── Signup form submit ─────────────────────────────────────────────────────
  const handleSignup = async (e: React.FormEvent) => {
    console.log("clicked<<<<<<<<<<<<")
    e.preventDefault();
    if (password !== confirm) return;
    if (!agreedTerms) { setTermsError(true); return; }
    setTermsError(false);
    await submitForm(name.trim(), email.trim(), password);
  };

  // ── Login form submit ──────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email: siEmail, password: siPass });
  };

  // ── OTP screen — shown when step === "otp" regardless of tab ──────────────
  if (step === "otp") {
    return (
      <OtpScreen
        email={email}
        onVerify={verifyOtp}
        loading={otpLoading}
        error={otpError}
        onResetError={resetOtpError}
        onResend={resendOtp}
        resendLoading={resendLoading}
      />
    );
  }

  // ── EyeIcon helper ─────────────────────────────────────────────────────────
  const EyeOn  = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
  const EyeOff = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="pt-10 pb-6 px-10 lg:px-12">
        <div className="flex items-center gap-2 mb-8">
          <a href="/" className="text-stone-400 hover:text-stone-700 transition-colors text-sm flex items-center gap-1 group">
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
            Back to home
          </a>
        </div>
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"/>
          <span className="text-amber-600 text-xs font-bold tracking-widest uppercase">Organizer Portal</span>
        </div>
        <h1 className="text-stone-900 text-3xl font-black leading-tight"
          style={{fontFamily:"'Playfair Display',Georgia,serif"}}>
          {tab === "signup" ? "Start organising\nevents today" : "Welcome back,\norganizer"}
        </h1>
        <p className="text-stone-400 text-sm mt-2">
          {tab === "signup" ? "Create your free organizer account in 60 seconds." : "Sign in to manage your events and volunteers."}
        </p>
      </div>

      {/* Tab switcher */}
      <div className="px-10 lg:px-12">
        <div className="flex bg-stone-100 rounded-2xl p-1 mb-8">
          {(["signup","signin"] as Tab[]).map(t => (
            <button key={t} onClick={() => switchTab(t)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${tab === t ? "bg-white text-stone-900 shadow-sm" : "text-stone-400 hover:text-stone-600"}`}>
              {t === "signup" ? "Create Account" : "Sign In"}
            </button>
          ))}
        </div>
      </div>

      {/* ── SIGNUP FORM ── */}
      {tab === "signup" && (
        <form onSubmit={handleSignup} className="px-10 lg:px-12 pb-10 flex-1">
          <div className="space-y-4">

            {/* Form-level error */}
            {formError && (
              <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm px-4 py-3 rounded-xl">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {formError}
              </div>
            )}

            {/* Full name */}
            <div>
              <label className="block text-xs font-bold text-stone-500 mb-1.5 tracking-wider uppercase">Full Name</label>
              <input value={name} onChange={e => { setName(e.target.value); resetFormError(); }} placeholder="Rahul Verma" required
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 hover:border-stone-300 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100 rounded-xl text-sm text-stone-800 placeholder:text-stone-300 outline-none transition-all" />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-stone-500 mb-1.5 tracking-wider uppercase">Email Address</label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                <input type="email" value={email} onChange={e => { setEmail(e.target.value); resetFormError(); }} placeholder="rahul@example.com" required
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 hover:border-stone-300 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100 rounded-xl text-sm text-stone-800 placeholder:text-stone-300 outline-none transition-all" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-stone-500 mb-1.5 tracking-wider uppercase">Password</label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input type={showPass ? "text" : "password"} value={password} onChange={e => { setPassword(e.target.value); resetFormError(); }} placeholder="Min. 8 characters" required
                  className="w-full pl-10 pr-10 py-3 bg-stone-50 border border-stone-200 hover:border-stone-300 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100 rounded-xl text-sm text-stone-800 placeholder:text-stone-300 outline-none transition-all" />
                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-600 transition-colors">
                  {showPass ? <EyeOn/> : <EyeOff/>}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-2 flex gap-1 items-center">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${password.length >= i*2 ? password.length >= 8 ? "bg-green-400" : "bg-amber-400" : "bg-stone-100"}`} />
                  ))}
                  <span className="text-[10px] text-stone-400 ml-1">{password.length < 4 ? "Weak" : password.length < 8 ? "Fair" : "Strong"}</span>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs font-bold text-stone-500 mb-1.5 tracking-wider uppercase">Confirm Password</label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <input type={showConfirm ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" required
                  className={`w-full pl-10 pr-10 py-3 bg-stone-50 border hover:border-stone-300 focus:bg-white focus:ring-4 rounded-xl text-sm text-stone-800 placeholder:text-stone-300 outline-none transition-all ${
                    confirm.length > 0 && confirm !== password ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : "border-stone-200 focus:border-amber-400 focus:ring-amber-100"}`} />
                <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-600 transition-colors">
                  {showConfirm ? <EyeOn/> : <EyeOff/>}
                </button>
              </div>
              {confirm.length > 0 && confirm !== password && <p className="text-rose-500 text-xs mt-1.5">Passwords don't match</p>}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => { setAgreedTerms(v => !v); setTermsError(false); }}
                className={`w-4 h-4 mt-0.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  agreedTerms ? "bg-amber-400 border-amber-400" :
                  termsError  ? "border-rose-400" :
                  "border-stone-300 hover:border-amber-400"
                }`}
              >
                {agreedTerms && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 12 12" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 3L5 8.5 2 5.5"/>
                  </svg>
                )}
              </button>
              <div>
                <span className="text-stone-400 text-xs leading-relaxed">
                  I agree to the <a href="#" className="text-amber-500 hover:underline">Terms of Service</a> and <a href="#" className="text-amber-500 hover:underline">Privacy Policy</a>
                </span>
                {termsError && <p className="text-rose-500 text-xs mt-1">Please agree to the terms to continue.</p>}
              </div>
            </div>
          </div>

          {/* Social divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-stone-100"/>
            <span className="text-stone-300 text-xs font-medium">or continue with</span>
            <div className="flex-1 h-px bg-stone-100"/>
          </div>
          <div className="flex gap-3 mb-6">
            <button type="button" className="flex-1 flex items-center justify-center gap-2 border border-stone-200 hover:border-stone-300 hover:bg-stone-50 rounded-xl py-2.5 text-sm font-semibold text-stone-600 transition-all">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
          </div>

          {/* Submit */}
          <button  type="submit"
            disabled={formLoading || (confirm.length > 0 && confirm !== password)}
            className="w-full bg-stone-900 hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-stone-900/20 hover:scale-[1.01] active:scale-[0.99] text-sm flex items-center justify-center gap-2">
            {formLoading ? (
              <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Sending OTP...</>
            ) : (
              <>Create Organizer Account<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg></>
            )}
          </button>

          <p className="text-center text-stone-400 text-xs mt-5">
            Already have an account?{" "}
            <button type="button" onClick={() => switchTab("signin")} className="text-amber-500 hover:text-amber-600 font-bold transition-colors">Sign in →</button>
          </p>
        </form>
      )}

      {/* ── SIGN IN FORM ── */}
      {tab === "signin" && (
        <form onSubmit={handleLogin} className="px-10 lg:px-12 pb-10 flex-1">
          <div className="space-y-4">
            {loginError && (
              <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm px-4 py-3 rounded-xl">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {loginError}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-stone-500 mb-1.5 tracking-wider uppercase">Email Address</label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                <input type="email" value={siEmail} onChange={e => { setSiEmail(e.target.value); resetLoginError(); }} placeholder="rahul@example.com" required disabled={loginLoading}
                  className="w-full pl-10 pr-4 py-3.5 bg-stone-50 border border-stone-200 hover:border-stone-300 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100 rounded-xl text-sm text-stone-800 placeholder:text-stone-300 outline-none transition-all disabled:opacity-50" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-stone-500 tracking-wider uppercase">Password</label>
                <a href="#" className="text-xs text-amber-500 hover:text-amber-600 font-semibold">Forgot password?</a>
              </div>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input type={showSiPass ? "text" : "password"} value={siPass} onChange={e => { setSiPass(e.target.value); resetLoginError(); }} placeholder="Your password" required disabled={loginLoading}
                  className="w-full pl-10 pr-10 py-3.5 bg-stone-50 border border-stone-200 hover:border-stone-300 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100 rounded-xl text-sm text-stone-800 placeholder:text-stone-300 outline-none transition-all disabled:opacity-50" />
                <button type="button" onClick={() => setShowSiPass(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-600 transition-colors">
                  {showSiPass
                    ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-stone-100"/>
            <span className="text-stone-300 text-xs font-medium">or continue with</span>
            <div className="flex-1 h-px bg-stone-100"/>
          </div>
          <div className="flex gap-3 mb-6">
            <button type="button" className="flex-1 flex items-center justify-center gap-2 border border-stone-200 hover:border-stone-300 hover:bg-stone-50 rounded-xl py-2.5 text-sm font-semibold text-stone-600 transition-all">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
          </div>

          <button type="submit" disabled={loginLoading}
            className="w-full bg-stone-900 hover:bg-stone-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-stone-900/20 hover:scale-[1.01] active:scale-[0.99] text-sm flex items-center justify-center gap-2">
            {loginLoading ? (
              <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Signing in...</>
            ) : (
              <>Sign In to Dashboard<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg></>
            )}
          </button>

          <p className="text-center text-stone-400 text-xs mt-5">
            New to Eventimist?{" "}
            <button type="button" onClick={() => switchTab("signup")} className="text-amber-500 hover:text-amber-600 font-bold transition-colors">Create account →</button>
          </p>
        </form>
      )}
    </div>
  );
}

// ─── Feature pills ────────────────────────────────────────────────────────────
function FeaturePills() {
  const pills = [
    { icon:"🎯", label:"Smart Volunteer Matching" },
    { icon:"📊", label:"Live Analytics" },
    { icon:"🎟️", label:"Ticketing & RSVPs" },
    { icon:"📍", label:"Location-based Discovery" },
    { icon:"💬", label:"In-app Messaging" },
  ];
  return (
    <div className="overflow-hidden border-t border-b border-stone-100 bg-stone-50 py-4">
      <div className="flex gap-3 pills-scroll" style={{width:"max-content"}}>
        {[...pills,...pills,...pills].map((p,i) => (
          <div key={i} className="flex items-center gap-2 bg-white border border-stone-200 rounded-full px-4 py-2 text-xs font-semibold text-stone-600 whitespace-nowrap shadow-sm flex-shrink-0">
            <span>{p.icon}</span>{p.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stats strip ──────────────────────────────────────────────────────────────
function StatsStrip() {
  const stats = [
    {val:"50K+",  label:"Events hosted"},
    {val:"8K+",   label:"Volunteers placed"},
    {val:"120K+", label:"Attendees reached"},
    {val:"4.9★",  label:"Organizer rating"},
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-stone-100 border-t border-stone-100">
      {stats.map((s,i) => (
        <div key={i} className="bg-white px-6 py-5 text-center hover:bg-amber-50 transition-colors">
          <div className="text-2xl font-black text-stone-900" style={{fontFamily:"'Playfair Display',Georgia,serif"}}>{s.val}</div>
          <div className="text-stone-400 text-xs mt-0.5">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function OrganizePage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html, body { height: 100%; margin: 0; background: #fff; }
        @keyframes progress { from{width:0%} to{width:100%} }
        .carousel-progress { animation: progress 5s linear forwards; }
        @keyframes slide-up { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .slide-up { animation: slide-up 0.55s ease-out forwards; }
        @keyframes pills { 0%{transform:translateX(0)} 100%{transform:translateX(-33.333%)} }
        .pills-scroll { animation: pills 20s linear infinite; }
        .pills-scroll:hover { animation-play-state: paused; }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #fafaf9 inset !important;
          -webkit-text-fill-color: #1c1917 !important;
        }
      `}</style>

      <div className="min-h-screen flex flex-col lg:flex-row bg-white">
        {/* Left carousel */}
        <div className="hidden lg:block lg:w-[52%] xl:w-[55%] relative flex-shrink-0 h-screen sticky top-0">
          <PanelCarousel />
        </div>

        {/* Right panel */}
        <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 px-6 pt-6 pb-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <span className="text-stone-900 font-black text-lg" style={{fontFamily:"'Playfair Display',Georgia,serif"}}>eventimist</span>
          </div>

          {/* Mobile hero */}
          <div className="lg:hidden h-52 relative mx-6 mt-4 rounded-3xl overflow-hidden shadow-lg flex-shrink-0">
            <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80" alt="Organizer" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-5">
              <div>
                <div className="text-amber-400 text-xs font-bold tracking-widest uppercase mb-1">Organizer Portal</div>
                <div className="text-white text-lg font-black" style={{fontFamily:"'Playfair Display',Georgia,serif"}}>Organise Events That Inspire</div>
              </div>
            </div>
          </div>

          <div className="flex-1"><AuthPanel /></div>
          <FeaturePills />
          <StatsStrip />
        </div>
      </div>
    </>
  );
}