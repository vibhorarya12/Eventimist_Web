"use client";

// src/app/eventix/page.tsx

import { useEffect, useRef, useState, useCallback } from "react";

// ─── Theme tokens ─────────────────────────────────────────────────────────────
const LIGHT = {
  bg:       "#f5f0e8",
  bgAlt:    "#ede8de",
  surface:  "#ffffff",
  ink:      "#1a1612",
  ink2:     "#5c5346",
  ink3:     "#9c9186",
  border:   "rgba(26,22,18,.1)",
  gold:     "#b8922a",
  goldBg:   "rgba(184,146,42,.08)",
  goldBdr:  "rgba(184,146,42,.25)",
  wall:     "#ede8de",   // carousel wall
  pin:      "#8c7355",
  shadow:   "rgba(0,0,0,.18)",
};
const DARK = {
  bg:       "#18160f",
  bgAlt:    "#1f1c14",
  surface:  "#24211a",
  ink:      "#f0ead8",
  ink2:     "#b0a890",
  ink3:     "#6e6658",
  border:   "rgba(240,234,216,.08)",
  gold:     "#d4a843",
  goldBg:   "rgba(212,168,67,.08)",
  goldBdr:  "rgba(212,168,67,.2)",
  wall:     "#1f1c14",
  pin:      "#b0a890",
  shadow:   "rgba(0,0,0,.55)",
};

// ─── Carousel images & captions ───────────────────────────────────────────────
const GALLERY = [
  { url:"https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80", caption:"All-hands · TechCorp 2024",        tag:"Corporate" },
  { url:"https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&q=80", caption:"Keynote · EdSphere Summit",        tag:"Conference"},
  { url:"https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&q=80", caption:"Yamuna Drive · CitizenFirst",        tag:"Volunteer" },
  { url:"https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&q=80", caption:"UX Meetup · DesignDelhi #22",      tag:"Networking"},
  { url:"https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&q=80", caption:"Volunteer Day · GreenEarth",       tag:"Community" },
  { url:"https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600&q=80", caption:"Founders Bootcamp · NexGen",         tag:"Business"  },
];

// Slight tilts per card — feels like real prints pinned to a wall
const TILTS = [-2.5, 1.8, -1.2, 2.8, -0.8, 1.5];

// ─── Org tiles ────────────────────────────────────────────────────────────────
const ORGS = [
  { name:"TechCorp India",   abbr:"TC", h:210 },
  { name:"GreenEarth NGO",  abbr:"GE", h:150 },
  { name:"MedCare Trust",   abbr:"MC", h:350 },
  { name:"EduSphere",       abbr:"ES", h:270 },
  { name:"NexGen Solutions",abbr:"NG", h:38  },
  { name:"CitizenFirst",    abbr:"CF", h:175 },
  { name:"ArtHouse Delhi",  abbr:"AH", h:320 },
  { name:"SportZone",       abbr:"SZ", h:25  },
];

// ─── Shared UI ────────────────────────────────────────────────────────────────
function Eye({ open }: { open: boolean }) {
  return open
    ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
}

// ─── Wall-Hanging Carousel ─────────────────────────────────────────────────────
function WallCarousel({ tk }: { tk: typeof LIGHT }) {
  const [idx, setIdx] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout>|null>(null);

  const go = useCallback((i: number) => {
    setIdx(i);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setIdx(j => (j+1)%GALLERY.length), 3000);
  }, []);

  useEffect(() => {
    timer.current = setTimeout(() => go((idx+1)%GALLERY.length), 3000);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [idx, go]);

  return (
    <div className="relative py-10 overflow-visible select-none">
      {/* String line */}
      <div className="absolute left-0 right-0 pointer-events-none"
        style={{ top:18, height:2, background:`linear-gradient(90deg,transparent,${tk.pin}55 15%,${tk.pin}88 50%,${tk.pin}55 85%,transparent)` }}/>

      {/* Cards */}
      <div className="flex items-start justify-center gap-5 flex-wrap sm:flex-nowrap overflow-visible px-4">
        {GALLERY.map((g, i) => {
          const active  = i === idx;
          const tilt    = TILTS[i];
          const scale   = active ? 1.06 : 0.95;
          const zIdx    = active ? 10 : 1;
          const brightness = active ? 1 : 0.7;

          return (
            <div key={i} onClick={() => go(i)}
              className="relative flex-shrink-0 cursor-pointer transition-all duration-500"
              style={{
                width: active ? 200 : 160,
                transform:`rotate(${tilt}deg) scale(${scale})`,
                zIndex: zIdx,
                filter:`brightness(${brightness})`,
              }}>
              {/* Pin/clip */}
              <div className="absolute left-1/2 -translate-x-1/2 -top-2.5 z-10 flex flex-col items-center">
                <div className="w-2 h-2 rounded-full border" style={{ background:tk.pin, borderColor:tk.ink3, boxShadow:`0 1px 3px ${tk.shadow}` }}/>
                <div className="w-px h-3" style={{ background:tk.pin+"80" }}/>
              </div>

              {/* Photo print */}
              <div className="overflow-hidden rounded-sm"
                style={{
                  background: tk.surface,
                  boxShadow: active
                    ? `0 16px 40px ${tk.shadow}, 0 4px 8px ${tk.shadow}`
                    : `0 6px 20px ${tk.shadow}`,
                  padding: "8px 8px 28px 8px",
                }}>
                <img src={g.url} alt={g.caption}
                  className="w-full object-cover rounded-sm"
                  style={{ height: active ? 160 : 130, display:"block" }}
                  loading="lazy"
                />
                {/* Caption strip */}
                <div className="pt-2 px-0.5">
                  <p className="text-center leading-snug"
                    style={{ fontFamily:"'Caveat',cursive", fontSize:11, color:tk.ink2 }}>
                    {g.caption}
                  </p>
                </div>
              </div>

              {/* Tag badge on active */}
              {active && (
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full transition-all"
                  style={{ background:tk.goldBg, border:`1px solid ${tk.goldBdr}`, color:tk.gold, fontFamily:"'Libre Baskerville',Georgia,serif" }}>
                  {g.tag}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dot nav */}
      <div className="flex justify-center gap-1.5 mt-10">
        {GALLERY.map((_,i) => (
          <button key={i} onClick={() => go(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: i===idx ? 20 : 6, height: 6,
              background: i===idx ? tk.gold : tk.ink3+"50",
            }}/>
        ))}
      </div>
    </div>
  );
}

// ─── Field & Input components ─────────────────────────────────────────────────
function Field({ label, note, tk, children }: { label:string; note?:string; tk:typeof LIGHT; children:React.ReactNode }) {
  return (
    <div>
      <label style={{ display:"block", fontSize:9, fontWeight:800, letterSpacing:"0.2em", textTransform:"uppercase", color:tk.ink3, marginBottom:6, fontFamily:"'Barlow Condensed',sans-serif" }}>
        {label}
      </label>
      {children}
      {note && <p style={{ fontSize:10, color:tk.ink3, marginTop:4, fontFamily:"'Libre Baskerville',serif" }}>{note}</p>}
    </div>
  );
}

function TInput({ type="text", value, onChange, placeholder, required, mono, prefix, tk }: {
  type?:string; value:string; onChange:(v:string)=>void; placeholder:string;
  required?:boolean; mono?:boolean; prefix?:string; tk:typeof LIGHT;
}) {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  return (
    <div style={{ position:"relative" }}>
      {prefix && <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:13, color:tk.ink3, fontFamily:"monospace" }}>{prefix}</span>}
      <input
        type={isPass ? (show?"text":"password") : type}
        value={value} onChange={e=>onChange(e.target.value)}
        placeholder={placeholder} required={required}
        style={{
          width:"100%", padding:"10px 14px", paddingLeft: prefix?"28px":"14px", paddingRight: isPass?"36px":"14px",
          background: tk.bgAlt, border:`1.5px solid ${tk.border}`,
          borderRadius:10, fontSize:13, color:tk.ink,
          fontFamily: mono?"monospace":"'Libre Baskerville',Georgia,serif",
          outline:"none", transition:"border-color .2s, background .2s",
          boxSizing:"border-box",
        }}
        onFocus={e => { e.target.style.borderColor = tk.gold; e.target.style.background = tk.surface; }}
        onBlur={e  => { e.target.style.borderColor = tk.border; e.target.style.background = tk.bgAlt; }}
      />
      {isPass && (
        <button type="button" onClick={()=>setShow(v=>!v)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", color:tk.ink3, background:"none", border:"none", cursor:"pointer", padding:0 }}>
          <Eye open={show}/>
        </button>
      )}
    </div>
  );
}

function TBtn({ label, loading, tk }: { label:string; loading?:boolean; tk:typeof LIGHT }) {
  return (
    <button type="submit" disabled={loading} style={{
      width:"100%", padding:"12px 16px",
      background: tk.gold, color:"#fff",
      border:"none", borderRadius:10, cursor: loading?"not-allowed":"pointer",
      fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:13,
      letterSpacing:"0.12em", textTransform:"uppercase",
      opacity: loading ? 0.6 : 1, transition:"opacity .2s, filter .2s",
    }}
    onMouseOver={e => !loading && ((e.target as HTMLButtonElement).style.filter="brightness(1.1)")}
    onMouseOut={e  => ((e.target as HTMLButtonElement).style.filter="")}>
      {loading ? "Processing…" : label}
    </button>
  );
}

// ─── Auth Panel ───────────────────────────────────────────────────────────────
type AuthTab = "register" | "member" | "admin";

function AuthPanel({ tk }: { tk: typeof LIGHT }) {
  const [tab,  setTab]  = useState<AuthTab>("register");
  const [done, setDone] = useState(false);

  if (done) return (
    <div style={{ textAlign:"center", padding:"32px 24px" }}>
      <div style={{ width:52, height:52, borderRadius:14, background:tk.goldBg, border:`1.5px solid ${tk.goldBdr}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, margin:"0 auto 16px" }}>✓</div>
      <h3 style={{ margin:"0 0 8px", fontFamily:"'Spectral',Georgia,serif", fontSize:22, color:tk.ink }}>All set.</h3>
      <p style={{ margin:"0 0 20px", fontSize:13, color:tk.ink2, fontFamily:"'Libre Baskerville',serif", lineHeight:1.6 }}>Check your inbox to verify domain ownership.</p>
      <button onClick={()=>setDone(false)} style={{ background:"none", border:"none", cursor:"pointer", color:tk.gold, fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, letterSpacing:"0.1em", fontSize:12, textTransform:"uppercase" }}>← Back</button>
    </div>
  );

  return (
    <div style={{ borderRadius:18, border:`1.5px solid ${tk.border}`, background:tk.surface, overflow:"hidden", boxShadow:`0 8px 40px ${tk.shadow}` }}>
      {/* Tabs */}
      <div style={{ display:"flex", borderBottom:`1.5px solid ${tk.border}` }}>
        {([["register","Register Org"],["member","Member Login"],["admin","Admin"]] as [AuthTab,string][]).map(([id,lbl]) => (
          <button key={id} onClick={()=>setTab(id)} style={{
            flex:1, padding:"12px 8px", background:"none", border:"none", cursor:"pointer",
            fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:11,
            letterSpacing:"0.12em", textTransform:"uppercase", transition:"all .2s",
            color: tab===id ? tk.gold : tk.ink3,
            borderBottom: tab===id ? `2px solid ${tk.gold}` : "2px solid transparent",
            marginBottom:-1.5,
          }}>
            {lbl}
          </button>
        ))}
      </div>

      <div style={{ padding:24 }}>
        {tab==="register" && <RegisterForm tk={tk} onDone={()=>setDone(true)}/>}
        {tab==="member"   && <MemberForm   tk={tk} onDone={()=>setDone(true)}/>}
        {tab==="admin"    && <AdminForm    tk={tk} onDone={()=>setDone(true)}/>}
      </div>
    </div>
  );
}

function RegisterForm({ tk, onDone }: { tk:typeof LIGHT; onDone:()=>void }) {
  const [org,setOrg]=useState(""); const [domain,setDomain]=useState("");
  const [name,setName]=useState(""); const [email,setEmail]=useState("");
  const [pass,setPass]=useState(""); const [loading,setLoading]=useState(false);
  const submit=(e:React.FormEvent)=>{ e.preventDefault(); setLoading(true); setTimeout(()=>{setLoading(false);onDone();},1500); };
  return (
    <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <Field label="Organisation Name" tk={tk}><TInput value={org} onChange={setOrg} placeholder="TechCorp India" required tk={tk}/></Field>
      <Field label="Domain" note="Members with this domain auto-join" tk={tk}><TInput value={domain} onChange={setDomain} placeholder="techcorp.com" required mono prefix="@" tk={tk}/></Field>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <Field label="Your Name" tk={tk}><TInput value={name} onChange={setName} placeholder="Ravi Kumar" required tk={tk}/></Field>
        <Field label="Admin Email" tk={tk}><TInput type="email" value={email} onChange={setEmail} placeholder="admin@co.com" required tk={tk}/></Field>
      </div>
      <Field label="Password" tk={tk}><TInput type="password" value={pass} onChange={setPass} placeholder="Min 8 characters" required tk={tk}/></Field>
      <TBtn label="Register Organisation" loading={loading} tk={tk}/>
      <p style={{ textAlign:"center", fontSize:11, color:tk.ink3, margin:0, fontFamily:"'Libre Baskerville',serif" }}>Free 30-day trial · No card required</p>
    </form>
  );
}

function MemberForm({ tk, onDone }: { tk:typeof LIGHT; onDone:()=>void }) {
  const [email,setEmail]=useState(""); const [pass,setPass]=useState("");
  const [loading,setLoading]=useState(false);
  const submit=(e:React.FormEvent)=>{ e.preventDefault(); setLoading(true); setTimeout(()=>{setLoading(false);onDone();},1400); };
  return (
    <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ padding:"12px 14px", borderRadius:10, border:`1.5px solid ${tk.goldBdr}`, background:tk.goldBg, fontSize:12, color:tk.ink2, lineHeight:1.6, fontFamily:"'Libre Baskerville',serif" }}>
        Sign in with your <span style={{ fontFamily:"monospace", color:tk.gold }}>@organisation.com</span> email and you'll auto-join your org's space.
      </div>
      <Field label="Work Email" tk={tk}><TInput type="email" value={email} onChange={setEmail} placeholder="you@company.com" required tk={tk}/></Field>
      <Field label="Password" tk={tk}><TInput type="password" value={pass} onChange={setPass} placeholder="Your password" required tk={tk}/></Field>
      <TBtn label="Sign In" loading={loading} tk={tk}/>
    </form>
  );
}

function AdminForm({ tk, onDone }: { tk:typeof LIGHT; onDone:()=>void }) {
  const [orgId,setOrgId]=useState(""); const [email,setEmail]=useState("");
  const [pass,setPass]=useState(""); const [mfa,setMfa]=useState("");
  const [step,setStep]=useState(0); const [loading,setLoading]=useState(false);
  const submit=(e:React.FormEvent)=>{ e.preventDefault(); if(step===0){setStep(1);return;} setLoading(true); setTimeout(()=>{setLoading(false);onDone();},1500); };
  return (
    <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ padding:"10px 14px", borderRadius:10, border:`1.5px solid ${tk.goldBdr}`, background:tk.goldBg, fontSize:11, color:tk.ink2, fontFamily:"'Libre Baskerville',serif", lineHeight:1.6 }}>
        ⚠ Admin portal — separate from member login.
      </div>
      {step===0 ? (
        <>
          <Field label="Organisation ID" note="Your unique org slug" tk={tk}><TInput value={orgId} onChange={setOrgId} placeholder="techcorp-india" required mono tk={tk}/></Field>
          <Field label="Admin Email" tk={tk}><TInput type="email" value={email} onChange={setEmail} placeholder="admin@org.com" required tk={tk}/></Field>
          <Field label="Password" tk={tk}><TInput type="password" value={pass} onChange={setPass} placeholder="Admin password" required tk={tk}/></Field>
        </>
      ) : (
        <div style={{ textAlign:"center", padding:"8px 0" }}>
          <div style={{ fontSize:28, marginBottom:8 }}>🔑</div>
          <div style={{ fontFamily:"'Spectral',Georgia,serif", fontSize:16, color:tk.ink, fontWeight:700, marginBottom:4 }}>Two-Factor Auth</div>
          <div style={{ fontSize:12, color:tk.ink2, marginBottom:16, fontFamily:"'Libre Baskerville',serif" }}>Enter the 6-digit code from your authenticator</div>
          <input value={mfa} onChange={e=>setMfa(e.target.value.replace(/\D/g,"").slice(0,6))}
            placeholder="000000" maxLength={6} required
            style={{ width:"100%", padding:"14px", borderRadius:10, border:`1.5px solid ${tk.border}`, background:tk.bgAlt, fontSize:24, textAlign:"center", fontFamily:"monospace", letterSpacing:"0.4em", color:tk.ink, outline:"none", boxSizing:"border-box" }}
            onFocus={e=>{e.target.style.borderColor=tk.gold;}} onBlur={e=>{e.target.style.borderColor=tk.border;}}
          />
          <button type="button" onClick={()=>setStep(0)} style={{ background:"none", border:"none", cursor:"pointer", color:tk.ink3, fontSize:12, marginTop:10, fontFamily:"'Libre Baskerville',serif" }}>← Back</button>
        </div>
      )}
      <TBtn label={step===0?"Continue →":"Verify & Sign In"} loading={loading} tk={tk}/>
    </form>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────
function Features({ tk, dark }: { tk: typeof LIGHT; dark:boolean }) {
  const feats = [
    { icon:"◉", n:"01", title:"Domain Verification",  desc:"Link your email domain. Anyone with @yourcompany.com auto-joins as a verified member instantly." },
    { icon:"◎", n:"02", title:"Auto Member Join",      desc:"New hires sign up with their work email — they're in. No invite links, no approvals, no expired codes." },
    { icon:"◈", n:"03", title:"Private Event Hub",     desc:"Events visible only to verified members. Internal conferences, offsites, and team events stay truly private." },
    { icon:"◇", n:"04", title:"Org-Scoped Analytics",  desc:"Attendance, RSVP trends, volunteer activity — all in one consolidated org dashboard." },
    { icon:"◆", n:"05", title:"Multi-Admin Roles",     desc:"Assign event managers, finance leads, view-only stakeholders. Granular roles, zero confusion." },
    { icon:"◐", n:"06", title:"Volunteer Matching",    desc:"Members opt into volunteer pools. Organisers post needs. Auto-matched on skills and availability." },
  ];
  return (
    <section id="features" style={{ padding:"96px 24px", background: dark ? tk.bgAlt : tk.bg }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <div style={{ marginBottom:56, borderBottom:`1.5px solid ${tk.border}`, paddingBottom:28, display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:9, fontWeight:900, letterSpacing:"0.3em", textTransform:"uppercase", color:tk.gold, fontFamily:"'Barlow Condensed',sans-serif", marginBottom:8 }}>What you get</div>
            <h2 style={{ margin:0, fontFamily:"'Spectral',Georgia,serif", fontSize:"clamp(36px,4.5vw,60px)", color:tk.ink, lineHeight:0.95, fontWeight:700 }}>
              Built for<br/><em style={{ fontStyle:"italic", color:tk.gold }}>organisations.</em>
            </h2>
          </div>
          <span style={{ fontFamily:"'Spectral',serif", fontSize:100, lineHeight:1, color:tk.border, fontWeight:700 }}>06</span>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:1, background:tk.border }}>
          {feats.map((f,i) => (
            <div key={i} style={{ padding:"32px 28px", background:tk.bg, transition:"background .2s", cursor:"default" }}
              onMouseOver={e=>(e.currentTarget.style.background=tk.surface)}
              onMouseOut={e=>(e.currentTarget.style.background=tk.bg)}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
                <span style={{ fontSize:20, color:tk.gold }}>{f.icon}</span>
                <span style={{ fontFamily:"'Spectral',serif", fontSize:36, color:tk.border, fontWeight:700, lineHeight:1 }}>{f.n}</span>
              </div>
              <h3 style={{ margin:"0 0 10px", fontFamily:"'Spectral',Georgia,serif", fontSize:18, fontWeight:700, color:tk.ink, letterSpacing:"0.01em" }}>{f.title}</h3>
              <p style={{ margin:0, fontSize:13, color:tk.ink2, lineHeight:1.75, fontFamily:"'Libre Baskerville',Georgia,serif" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────
function Pricing({ tk }: { tk: typeof LIGHT }) {
  const [annual, setAnnual] = useState(true);
  const plans = [
    { name:"Free",       price:0,    aprice:0,    cap:"Up to 5 events/mo",    features:["1 admin","100 members","Basic analytics","Public events"],                                                       cta:"Start Free",  highlight:false },
    { name:"Pro",        price:2999, aprice:1999, cap:"Unlimited events",      features:["5 admins","Unlimited members","Advanced analytics","Private events","Domain verify","Priority support"],         cta:"Start Pro",   highlight:true  },
    { name:"Enterprise", price:null, aprice:null, cap:"Custom everything",     features:["Unlimited admins","Dedicated infra","SLA guarantee","SSO / SAML","Custom domain","White-label option"],          cta:"Contact Us",  highlight:false },
  ];
  return (
    <section id="pricing" style={{ padding:"96px 24px", background:tk.bgAlt, borderTop:`1.5px solid ${tk.border}` }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <div style={{ fontSize:9, fontWeight:900, letterSpacing:"0.3em", textTransform:"uppercase", color:tk.gold, fontFamily:"'Barlow Condensed',sans-serif", marginBottom:10 }}>Simple pricing</div>
          <h2 style={{ margin:"0 0 24px", fontFamily:"'Spectral',Georgia,serif", fontSize:"clamp(32px,4vw,56px)", color:tk.ink, fontWeight:700 }}>No surprises.</h2>
          {/* Toggle */}
          <div style={{ display:"inline-flex", border:`1.5px solid ${tk.border}`, borderRadius:10, overflow:"hidden", background:tk.bg }}>
            {["Monthly","Annual"].map(l => (
              <button key={l} onClick={()=>setAnnual(l==="Annual")}
                style={{ padding:"8px 20px", background:(l==="Annual")===annual?tk.gold:"transparent",
                  color:(l==="Annual")===annual?"#fff":tk.ink2, border:"none", cursor:"pointer",
                  fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:11, letterSpacing:"0.12em", textTransform:"uppercase", transition:"all .2s" }}>
                {l}
              </button>
            ))}
          </div>
          {annual && <div style={{ fontSize:11, color:tk.gold, marginTop:8, fontFamily:"'Libre Baskerville',serif" }}>Save up to 33% annually</div>}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:1, background:tk.border }}>
          {plans.map((p,i) => (
            <div key={i} style={{ padding:"32px 24px", background: p.highlight ? tk.surface : tk.bg, position:"relative" }}>
              {p.highlight && (
                <div style={{ position:"absolute", top:0, left:"50%", transform:"translate(-50%,-50%)", background:tk.gold, color:"#fff", fontSize:9, fontWeight:900, letterSpacing:"0.2em", textTransform:"uppercase", padding:"4px 12px", borderRadius:99, fontFamily:"'Barlow Condensed',sans-serif" }}>
                  Most Popular
                </div>
              )}
              <div style={{ fontSize:10, fontWeight:900, letterSpacing:"0.18em", textTransform:"uppercase", color:p.highlight?tk.gold:tk.ink3, fontFamily:"'Barlow Condensed',sans-serif", marginBottom:12 }}>{p.name}</div>
              <div style={{ marginBottom:6 }}>
                {p.price===null
                  ? <span style={{ fontFamily:"'Spectral',serif", fontSize:30, fontWeight:700, color:tk.ink }}>Custom</span>
                  : p.price===0
                    ? <span style={{ fontFamily:"'Spectral',serif", fontSize:36, fontWeight:700, color:tk.ink }}>₹0</span>
                    : <span><span style={{ fontFamily:"'Spectral',serif", fontSize:36, fontWeight:700, color:tk.ink }}>₹{(annual?p.aprice:p.price)?.toLocaleString()}</span><span style={{ fontSize:12, color:tk.ink3 }}>/mo</span></span>
                }
              </div>
              <div style={{ fontSize:11, color:tk.ink3, marginBottom:24, fontFamily:"'Libre Baskerville',serif" }}>{p.cap}</div>
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:28 }}>
                {p.features.map(f => (
                  <div key={f} style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ color:tk.gold, fontSize:10 }}>◉</span>
                    <span style={{ fontSize:12, color:tk.ink2, fontFamily:"'Libre Baskerville',serif" }}>{f}</span>
                  </div>
                ))}
              </div>
              <button style={{
                width:"100%", padding:"11px 16px", borderRadius:10,
                background: p.highlight ? tk.gold : "transparent",
                color: p.highlight ? "#fff" : tk.ink2,
                border: `1.5px solid ${p.highlight ? tk.gold : tk.border}`,
                cursor:"pointer", fontFamily:"'Barlow Condensed',sans-serif",
                fontWeight:900, fontSize:11, letterSpacing:"0.12em", textTransform:"uppercase",
                transition:"all .2s",
              }}
              onMouseOver={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor=tk.gold;(e.currentTarget as HTMLButtonElement).style.color=tk.gold;}}
              onMouseOut={e=>{if(!p.highlight){(e.currentTarget as HTMLButtonElement).style.borderColor=tk.border;(e.currentTarget as HTMLButtonElement).style.color=tk.ink2;}}}>
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Domain Section ───────────────────────────────────────────────────────────
function DomainSection({ tk }: { tk: typeof LIGHT }) {
  const steps = [
    { n:"01", title:"Register your org",   body:"Enter your organisation details and admin email. Takes 2 minutes." },
    { n:"02", title:"Verify your domain",  body:"Add a DNS TXT record or upload a verification file to prove domain ownership." },
    { n:"03", title:"Members auto-join",   body:"Anyone who signs up or logs in with your domain email is instantly a verified member." },
    { n:"04", title:"Host private events", body:"Create events visible only to your members. No external access, no leakage." },
  ];
  return (
    <section id="domains" style={{ padding:"96px 24px", background:tk.bg, borderTop:`1.5px solid ${tk.border}` }}>
      <div style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 460px", gap:64, alignItems:"start" }}>
        <div>
          <div style={{ fontSize:9, fontWeight:900, letterSpacing:"0.3em", textTransform:"uppercase", color:tk.gold, fontFamily:"'Barlow Condensed',sans-serif", marginBottom:10 }}>Domain verification</div>
          <h2 style={{ margin:"0 0 48px", fontFamily:"'Spectral',Georgia,serif", fontSize:"clamp(30px,4vw,54px)", color:tk.ink, fontWeight:700, lineHeight:1.05 }}>
            Four steps<br/>to secured<br/><em style={{ color:tk.gold }}>access.</em>
          </h2>
          {steps.map((s,i) => (
            <div key={i} style={{ display:"flex", gap:20, padding:"18px 0", borderTop:`1.5px solid ${tk.border}` }}
              className="step-row">
              <span style={{ fontSize:11, fontWeight:900, letterSpacing:"0.15em", color:tk.ink3, fontFamily:"'Barlow Condensed',sans-serif", flexShrink:0, marginTop:2 }}>{s.n}</span>
              <div>
                <div style={{ fontFamily:"'Spectral',Georgia,serif", fontSize:16, fontWeight:700, color:tk.ink, marginBottom:4 }}>{s.title}</div>
                <div style={{ fontSize:13, color:tk.ink2, lineHeight:1.7, fontFamily:"'Libre Baskerville',serif" }}>{s.body}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Terminal card */}
        <div>
          <div style={{ borderRadius:14, border:`1.5px solid ${tk.border}`, overflow:"hidden", background:tk.surface, boxShadow:`0 8px 32px ${tk.shadow}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 16px", borderBottom:`1.5px solid ${tk.border}`, background:tk.bgAlt }}>
              {["#ef4444","#f59e0b","#22c55e"].map((c,i)=>(<div key={i} style={{ width:10, height:10, borderRadius:"50%", background:c, opacity:.7 }}/>))}
              <span style={{ marginLeft:6, fontSize:10, color:tk.ink3, fontFamily:"monospace" }}>DNS TXT Record</span>
            </div>
            <div style={{ padding:20, fontFamily:"monospace", fontSize:12, lineHeight:2 }}>
              <div style={{ color:tk.ink3 }}>Type<span style={{ marginLeft:32, color:tk.gold }}>TXT</span></div>
              <div style={{ color:tk.ink3 }}>Host<span style={{ marginLeft:32, color:tk.ink2 }}>@</span></div>
              <div style={{ color:tk.ink3 }}>Value<span style={{ marginLeft:20, color:"#16a34a", wordBreak:"break-all" }}>eventix-verify=a3f8b2c1...</span></div>
              <div style={{ color:tk.ink3 }}>TTL<span style={{ marginLeft:36, color:tk.ink2 }}>3600</span></div>
            </div>
            <div style={{ borderTop:`1.5px solid ${tk.border}`, padding:"12px 20px", display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:"#16a34a" }} className="pulse-green"/>
              <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", color:"#16a34a", fontFamily:"'Barlow Condensed',sans-serif" }}>Domain Verified</span>
            </div>
          </div>

          {/* Live joins */}
          <div style={{ marginTop:16, borderRadius:14, border:`1.5px solid ${tk.border}`, background:tk.surface, padding:20, boxShadow:`0 4px 16px ${tk.shadow}` }}>
            <div style={{ fontSize:9, fontWeight:900, letterSpacing:"0.2em", textTransform:"uppercase", color:tk.ink3, fontFamily:"'Barlow Condensed',sans-serif", marginBottom:14 }}>Live member joins</div>
            {[{e:"priya.k@techcorp.com",t:"2s ago"},{e:"rajan.m@techcorp.com",t:"1m ago"},{e:"sneha.v@techcorp.com",t:"3m ago"}].map((m,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 0", borderBottom: i<2 ? `1px solid ${tk.border}` : "none" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:tk.goldBg, border:`1px solid ${tk.goldBdr}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <span style={{ fontSize:11, fontWeight:900, color:tk.gold, fontFamily:"'Barlow Condensed',sans-serif" }}>{m.e[0].toUpperCase()}</span>
                  </div>
                  <span style={{ fontSize:12, fontFamily:"monospace", color:tk.ink2 }}>{m.e}</span>
                </div>
                <span style={{ fontSize:10, color:tk.ink3 }}>{m.t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer({ tk }: { tk: typeof LIGHT }) {
  return (
    <footer style={{ borderTop:`1.5px solid ${tk.border}`, padding:"32px 24px", background:tk.bgAlt }}>
      <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between", gap:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ position:"relative", width:28, height:28 }}>
            <div style={{ position:"absolute", inset:0, background:tk.gold, borderRadius:6, transform:"rotate(6deg)" }}/>
            <div style={{ position:"absolute", inset:0, background:tk.surface, border:`1.5px solid ${tk.border}`, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ color:tk.gold, fontWeight:900, fontSize:10, fontFamily:"'Barlow Condensed',sans-serif" }}>EX</span>
            </div>
          </div>
          <span style={{ fontFamily:"'Spectral',Georgia,serif", fontWeight:700, fontSize:16, color:tk.ink }}>Eventix Space</span>
          <span style={{ fontSize:10, color:tk.ink3 }}>by Eventimist</span>
        </div>
        <div style={{ display:"flex", gap:24 }}>
          {["Privacy","Terms","Contact","Status"].map(l => (
            <a key={l} href="#" style={{ fontSize:10, fontWeight:800, letterSpacing:"0.15em", textTransform:"uppercase", color:tk.ink3, textDecoration:"none", fontFamily:"'Barlow Condensed',sans-serif" }}
              onMouseOver={e=>((e.target as HTMLElement).style.color=tk.gold)}
              onMouseOut={e=>((e.target as HTMLElement).style.color=tk.ink3)}>
              {l}
            </a>
          ))}
        </div>
        <span style={{ fontSize:10, color:tk.ink3, fontFamily:"'Libre Baskerville',serif" }}>© 2025 Eventimist</span>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function EventixPage() {
  const [dark, setDark] = useState(false);
  const tk = dark ? DARK : LIGHT;
  const [vis, setVis] = useState(false);
  useEffect(() => { setTimeout(()=>setVis(true),80); }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,400;0,600;0,700;1,400;1,700&family=Libre+Baskerville:wght@400;700&family=Barlow+Condensed:wght@400;700;900&family=Caveat:wght@400;600&display=swap');
        *,*::before,*::after{box-sizing:border-box}
        html{scroll-behavior:smooth}
        body{margin:0;-webkit-font-smoothing:antialiased}
        input::placeholder{opacity:.45}
        @keyframes pulse-g{0%,100%{opacity:1}50%{opacity:.4}}
        .pulse-green{animation:pulse-g 2s ease-in-out infinite}
        @keyframes marquee-ltr{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        .marquee-ltr{animation:marquee-ltr 28s linear infinite;width:max-content}
        .marquee-ltr:hover{animation-play-state:paused}
        @media(max-width:768px){
          .domain-grid{grid-template-columns:1fr!important}
          .plans-grid{grid-template-columns:1fr!important}
        }
      `}</style>

      <div style={{ minHeight:"100vh", background:tk.bg, color:tk.ink, transition:"background .4s, color .4s" }}>

        {/* ── Nav ── */}
        <nav style={{ position:"sticky", top:0, zIndex:50, borderBottom:`1.5px solid ${tk.border}`, backdropFilter:"blur(16px)", background:tk.bg+"e8" }}>
          <div style={{ maxWidth:1100, margin:"0 auto", padding:"14px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            {/* Logo */}
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ position:"relative", width:30, height:30, flexShrink:0 }}>
                <div style={{ position:"absolute", inset:0, background:tk.gold, borderRadius:7, transform:"rotate(6deg)" }}/>
                <div style={{ position:"absolute", inset:0, background:tk.surface, border:`1.5px solid ${tk.border}`, borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ color:tk.gold, fontWeight:900, fontSize:11, fontFamily:"'Barlow Condensed',sans-serif" }}>EX</span>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"baseline", gap:5 }}>
                <span style={{ fontFamily:"'Spectral',Georgia,serif", fontWeight:700, fontSize:18, color:tk.ink }}>Eventix</span>
                <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:14, letterSpacing:"0.08em", color:tk.gold }}>SPACE</span>
              </div>
              <span style={{ fontSize:9, fontWeight:800, letterSpacing:"0.15em", textTransform:"uppercase", color:tk.ink3, border:`1px solid ${tk.border}`, padding:"2px 8px", borderRadius:99, fontFamily:"'Barlow Condensed',sans-serif" }}>by eventimist</span>
            </div>

            {/* Links + dark toggle */}
            <div style={{ display:"flex", alignItems:"center", gap:20 }}>
              <div style={{ display:"flex", gap:20 }}>
                {[["Features","#features"],["Pricing","#pricing"],["Domains","#domains"]].map(([l,h])=>(
                  <a key={l} href={h} style={{ fontSize:11, fontWeight:800, letterSpacing:"0.12em", textTransform:"uppercase", color:tk.ink3, textDecoration:"none", fontFamily:"'Barlow Condensed',sans-serif", transition:"color .2s" }}
                    onMouseOver={e=>((e.target as HTMLElement).style.color=tk.gold)}
                    onMouseOut={e=>((e.target as HTMLElement).style.color=tk.ink3)}>{l}</a>
                ))}
              </div>
              {/* Dark toggle */}
              <button onClick={()=>setDark(d=>!d)} style={{
                width:36, height:36, borderRadius:10, border:`1.5px solid ${tk.border}`,
                background:tk.bgAlt, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:15, transition:"all .2s", color:tk.ink,
              }} title={dark?"Switch to light":"Switch to dark"}>
                {dark ? "☀️" : "🌙"}
              </button>
              <a href="#auth" style={{
                fontSize:11, fontWeight:900, letterSpacing:"0.12em", textTransform:"uppercase",
                padding:"9px 20px", borderRadius:10, background:tk.gold, color:"#fff",
                textDecoration:"none", fontFamily:"'Barlow Condensed',sans-serif", transition:"filter .2s",
              }}
              onMouseOver={e=>((e.target as HTMLElement).style.filter="brightness(1.08)")}
              onMouseOut={e=>((e.target as HTMLElement).style.filter="")}>
                Register Org
              </a>
            </div>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section style={{ maxWidth:1100, margin:"0 auto", padding:"72px 24px 56px", display:"grid", gridTemplateColumns:"1fr 420px", gap:64, alignItems:"center" }}>
          {/* Left */}
          <div style={{ opacity: vis?1:0, transform: vis?"translateY(0)":"translateY(20px)", transition:"opacity .6s, transform .6s" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:24 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:tk.gold }} className="pulse-green"/>
              <span style={{ fontSize:9, fontWeight:900, letterSpacing:"0.25em", textTransform:"uppercase", color:tk.gold, fontFamily:"'Barlow Condensed',sans-serif" }}>Organisation-first event space</span>
            </div>
            <h1 style={{ margin:"0 0 20px", fontFamily:"'Spectral',Georgia,serif", fontWeight:700, lineHeight:0.95, color:tk.ink }}>
              <span style={{ display:"block", fontSize:"clamp(46px,6vw,82px)" }}>Your org.</span>
              <span style={{ display:"block", fontSize:"clamp(46px,6vw,82px)", fontStyle:"italic", color:tk.gold }}>Your space.</span>
              <span style={{ display:"block", fontSize:"clamp(46px,6vw,82px)", color:tk.ink3 }}>Verified.</span>
            </h1>
            <p style={{ fontSize:15, color:tk.ink2, lineHeight:1.75, maxWidth:440, marginBottom:32, fontFamily:"'Libre Baskerville',Georgia,serif" }}>
              A domain-verified private hub where organisations host events and members join automatically — no invite chaos, no outsiders, no friction.
            </p>
            {/* Stats */}
            <div style={{ display:"flex", gap:0 }}>
              {[{ n:"2,100+", l:"Organisations" },{ n:"840K+", l:"Members" },{ n:"18K+", l:"Events" }].map((s,i)=>(
                <div key={s.l} style={{ paddingRight:28, paddingLeft: i>0?28:0, borderLeft: i>0?`1.5px solid ${tk.border}`:"none" }}>
                  <div style={{ fontFamily:"'Spectral',Georgia,serif", fontWeight:700, fontSize:26, color:tk.ink, lineHeight:1 }}>{s.n}</div>
                  <div style={{ fontSize:10, fontWeight:800, letterSpacing:"0.15em", textTransform:"uppercase", color:tk.ink3, marginTop:4, fontFamily:"'Barlow Condensed',sans-serif" }}>{s.l}</div>
                </div>
              ))}
            </div>
            {/* Domain badge */}
            <div style={{ marginTop:28, display:"inline-flex", alignItems:"center", gap:10, border:`1.5px solid ${tk.goldBdr}`, borderRadius:12, padding:"10px 16px", background:tk.goldBg }}>
              <svg style={{ width:16, height:16, color:tk.gold, flexShrink:0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              <span style={{ fontSize:12, color:tk.ink2, fontFamily:"'Libre Baskerville',serif" }}>
                <span style={{ fontFamily:"monospace", color:tk.gold }}>@yourcompany.com</span> → all members auto-join
              </span>
            </div>
          </div>

          {/* Right: auth panel */}
          <div id="auth" style={{ opacity: vis?1:0, transform: vis?"translateY(0)":"translateY(24px)", transition:"opacity .7s .1s, transform .7s .1s" }}>
            <AuthPanel tk={tk}/>
          </div>
        </section>

        {/* ── Wall Carousel ── */}
        <section style={{ padding:"24px 0 56px", background: dark ? tk.bgAlt : tk.wall, borderTop:`1.5px solid ${tk.border}`, borderBottom:`1.5px solid ${tk.border}` }}>
          <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px" }}>
            <div style={{ textAlign:"center", marginBottom:8 }}>
              <span style={{ fontSize:9, fontWeight:900, letterSpacing:"0.25em", textTransform:"uppercase", color:tk.gold, fontFamily:"'Barlow Condensed',sans-serif" }}>
                Organisations using Eventix
              </span>
            </div>
            <WallCarousel tk={tk}/>
          </div>
        </section>

        {/* ── Org marquee ── */}
        <div style={{ background:tk.ink, overflow:"hidden", padding:"12px 0", borderTop:`1.5px solid ${tk.border}` }}>
          <div className="marquee-ltr" style={{ display:"flex", gap:0 }}>
            {[...ORGS,...ORGS,...ORGS].map((o,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"0 28px", flexShrink:0 }}>
                <div style={{ width:20, height:20, borderRadius:5, background:`hsl(${o.h},50%,40%)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontSize:8, fontWeight:900, color:"#fff", fontFamily:"'Barlow Condensed',sans-serif" }}>{o.abbr}</span>
                </div>
                <span style={{ fontSize:10, fontWeight:800, letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(255,255,255,.3)", fontFamily:"'Barlow Condensed',sans-serif", whiteSpace:"nowrap" }}>{o.name}</span>
              </div>
            ))}
          </div>
        </div>

        <Features tk={tk} dark={dark}/>
        <Pricing tk={tk}/>
        <DomainSection tk={tk}/>
        <Footer tk={tk}/>
      </div>
    </>
  );
}