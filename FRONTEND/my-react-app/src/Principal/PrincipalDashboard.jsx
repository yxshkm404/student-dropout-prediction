import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const SLIDES = [
  "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1800&q=80",
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1800&q=80",
  "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1800&q=80",
];

const GRAD_CARDS = [
  { key:"totalTeachers",   label:"Total Teachers",   icon:"👨‍🏫", grad:"linear-gradient(135deg,#7c3aed,#a855f7)", shadow:"rgba(124,58,237,.35)" },
  { key:"pendingTeachers", label:"Pending Approval",  icon:"⏳",   grad:"linear-gradient(135deg,#f59e0b,#fb923c)", shadow:"rgba(245,158,11,.35)" },
  { key:"totalStudents",   label:"Total Students",    icon:"👨‍🎓", grad:"linear-gradient(135deg,#2563eb,#38bdf8)", shadow:"rgba(37,99,235,.35)"  },
  { key:"atRiskStudents",  label:"At Risk Students",  icon:"⚠️",   grad:"linear-gradient(135deg,#ef4444,#f97316)", shadow:"rgba(239,68,68,.35)"  },
];

export default function PrincipalDashboard() {
  const navigate  = useNavigate();
  const name      = sessionStorage.getItem("name") || "Principal";

  const [stats,   setStats]   = useState(null);
  const [pending, setPending] = useState([]);
  const [preds,   setPreds]   = useState([]);

  // Slideshow
  const [current, setCurrent] = useState(0);
  const [prev,    setPrev]    = useState(null);
  const [trans,   setTrans]   = useState(false);
  const [loaded,  setLoaded]  = useState(false);
  const timer = useRef(null);

  const today = new Date().toLocaleDateString("en-US", { weekday:"long", year:"numeric", month:"long", day:"numeric" });

  // Preload first slide
  useEffect(() => {
    const img = new Image();
    img.src = SLIDES[0];
    img.onload = img.onerror = () => setLoaded(true);
  }, []);

  // Auto-advance slides
  const kick = () => {
    clearInterval(timer.current);
    timer.current = setInterval(() => {
      setCurrent(c => {
        const n = (c + 1) % SLIDES.length;
        setPrev(c); setTrans(true);
        setTimeout(() => { setPrev(null); setTrans(false); }, 1000);
        return n;
      });
    }, 5000);
  };
  useEffect(() => { kick(); return () => clearInterval(timer.current); }, []);

  // Data fetches
  useEffect(() => {
    fetch("http://localhost:8080/api/principal/statistics")
      .then(r => r.json()).then(d => { if (d.success) setStats(d); }).catch(() => {});
    fetch("http://localhost:8080/api/principal/teachers/pending")
      .then(r => r.json()).then(d => { if (d.success) setPending(d.teachers || []); }).catch(() => {});
    fetch("http://localhost:8080/api/principal/monitor")
      .then(r => r.json()).then(d => { if (d.success) setPreds((d.predictions || []).slice(0, 5)); }).catch(() => {});
  }, []);

  const handleApprove = async (id) => {
    await fetch(`http://localhost:8080/api/principal/teachers/approve/${id}`, { method:"PUT" });
    setPending(p => p.filter(t => t.id !== id));
    setStats(s => s ? { ...s, pendingTeachers: s.pendingTeachers - 1, approvedTeachers: s.approvedTeachers + 1 } : s);
  };

  const handleReject = async (id) => {
    await fetch(`http://localhost:8080/api/principal/teachers/reject/${id}`, { method:"PUT" });
    setPending(p => p.filter(t => t.id !== id));
    setStats(s => s ? { ...s, pendingTeachers: s.pendingTeachers - 1 } : s);
  };

  return (
    <div style={{ background:"#f1f5f9", minHeight:"100vh", display:"flex", flexDirection:"column", fontFamily:"'Outfit',sans-serif" }}>
      <style>{`
        @keyframes fadeUp   { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeUpIn { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes floatOrb { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-20px) scale(1.05)} }
        .stat-card { transition:transform .25s, box-shadow .25s; cursor:default; }
        .stat-card:hover { transform:translateY(-5px) !important; }
        .act-row  { transition:background .2s; }
        .act-row:hover { background:#f8fafc !important; }
        .abtn { transition:all .2s; cursor:pointer; font-family:inherit; }
        .abtn:hover { opacity:.85; transform:translateY(-1px); }
      `}</style>

      {/* ══ HERO — same as LandingPage ═══════════════════════ */}
      <section style={{ position:"relative", height:"460px", overflow:"hidden", flexShrink:0 }}>

        {/* Dark base */}
        <div style={{ position:"absolute", inset:0, zIndex:0, background:"#060c2e" }} />

        {/* Prev slide fading out */}
        {prev !== null && (
          <div style={{ position:"absolute", inset:0, zIndex:1,
            backgroundImage:`url(${SLIDES[prev]})`, backgroundSize:"cover", backgroundPosition:"center",
            opacity: trans ? 0 : 1, transition:"opacity 1s ease" }} />
        )}

        {/* Current slide */}
        <div style={{ position:"absolute", inset:0, zIndex:2,
          backgroundImage:`url(${SLIDES[current]})`, backgroundSize:"cover", backgroundPosition:"center",
          opacity: loaded ? 1 : 0, transition:"opacity 1s ease" }} />

        {/* Dark overlay */}
        <div style={{ position:"absolute", inset:0, zIndex:3,
          background:"linear-gradient(120deg,rgba(6,12,46,0.78) 0%,rgba(10,18,68,0.70) 45%,rgba(28,8,56,0.78) 100%)" }} />

        {/* Grid texture */}
        <div style={{ position:"absolute", inset:0, zIndex:4, pointerEvents:"none",
          backgroundImage:"linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)",
          backgroundSize:"60px 60px" }} />

        {/* Glow orbs */}
        <div style={{ position:"absolute", top:"-80px", left:"10%", zIndex:4, width:"420px", height:"420px", borderRadius:"50%",
          background:"radial-gradient(circle,rgba(37,99,235,0.18) 0%,transparent 70%)",
          animation:"floatOrb 8s ease-in-out infinite", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"-60px", right:"12%", zIndex:4, width:"360px", height:"360px", borderRadius:"50%",
          background:"radial-gradient(circle,rgba(124,58,237,0.16) 0%,transparent 70%)",
          animation:"floatOrb 10s ease-in-out infinite 2s", pointerEvents:"none" }} />

        {/* Fade bottom into page bg */}
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"160px", zIndex:5,
          background:"linear-gradient(to bottom,transparent 0%,#f1f5f9 100%)" }} />

        {/* Slide dots */}
        <div style={{ position:"absolute", bottom:"70px", left:"50%", transform:"translateX(-50%)", zIndex:6, display:"flex", gap:"8px" }}>
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => {
              if (i === current || trans) return;
              setPrev(current); setTrans(true); setCurrent(i);
              clearInterval(timer.current);
              setTimeout(() => { setPrev(null); setTrans(false); kick(); }, 1000);
            }}
            style={{ width: i===current ? "24px" : "8px", height:"8px", borderRadius:"100px",
              background: i===current ? "#fff" : "rgba(255,255,255,0.35)", border:"none", cursor:"pointer",
              padding:0, transition:"all .4s cubic-bezier(.4,0,.2,1)" }} />
          ))}
        </div>

        {/* Hero content */}
        <div style={{ position:"relative", zIndex:6, height:"100%", display:"flex", flexDirection:"column", justifyContent:"center", padding:"0 48px", paddingBottom:"60px" }}>

          {/* Date badge */}
          <div style={{ display:"inline-flex", alignItems:"center", gap:"8px",
            background:"rgba(255,255,255,.10)", border:"1px solid rgba(255,255,255,.20)",
            borderRadius:"100px", padding:"5px 16px", fontSize:"11px", fontWeight:600,
            color:"rgba(255,255,255,.85)", letterSpacing:".5px", marginBottom:"20px",
            width:"fit-content", backdropFilter:"blur(8px)",
            animation:"fadeUpIn .6s ease both" }}>
            <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#a78bfa", display:"inline-block" }} />
            {today}
          </div>

          {/* Heading */}
          <h1 style={{ fontWeight:900, fontSize:"clamp(28px,4vw,52px)", color:"#fff",
            letterSpacing:"-1.5px", lineHeight:1.1, marginBottom:"14px",
            animation:"fadeUpIn .7s ease both .1s" }}>
            Welcome back,{" "}
            <span style={{ background:"linear-gradient(90deg,#a78bfa,#60a5fa)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              {name}
            </span>{" "}👋
          </h1>

          {/* Subtitle */}
          <p style={{ fontSize:"16px", color:"rgba(255,255,255,.55)", fontWeight:400, marginBottom:"28px",
            animation:"fadeUpIn .7s ease both .2s" }}>
            Here's your school overview for today
          </p>

          {/* Quick action pills */}
          <div style={{ display:"flex", gap:"12px", flexWrap:"wrap", animation:"fadeUpIn .7s ease both .3s" }}>
            <button onClick={() => navigate("/principal/teachers")}
              style={{ background:"linear-gradient(135deg,#7c3aed,#2563eb)", color:"#fff", border:"none",
                padding:"10px 22px", borderRadius:"8px", fontSize:"13px", fontWeight:700,
                cursor:"pointer", fontFamily:"inherit", boxShadow:"0 4px 18px rgba(124,58,237,.4)",
                transition:"all .25s" }}
              onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 28px rgba(124,58,237,.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 4px 18px rgba(124,58,237,.4)"; }}>
              👨‍🏫 Manage Teachers →
            </button>
            <button onClick={() => navigate("/principal/students")}
              style={{ background:"rgba(255,255,255,0.12)", color:"#fff", border:"1.5px solid rgba(255,255,255,.30)",
                padding:"10px 22px", borderRadius:"8px", fontSize:"13px", fontWeight:600,
                cursor:"pointer", fontFamily:"inherit", backdropFilter:"blur(8px)",
                transition:"all .25s" }}
              onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,0.20)"; }}
              onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.12)"; }}>
              👥 Monitor Students →
            </button>
          </div>
        </div>
      </section>

      {/* ══ BODY ══════════════════════════════════════════ */}
      <div style={{ flex:1, padding:"0 40px 40px", marginTop:"-10px", position:"relative", zIndex:3 }}>

        {/* ── STATS CARDS ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:"20px", marginBottom:"36px",
          animation:"fadeUp .7s ease both", opacity:0, animationFillMode:"forwards" }}>
          {GRAD_CARDS.map((c, i) => (
            <div key={i} className="stat-card"
              style={{ background:c.grad, borderRadius:"16px", padding:"26px 24px",
                boxShadow:`0 8px 28px ${c.shadow}`, animationDelay:`${i * 0.08}s` }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"14px" }}>
                <span style={{ fontSize:"30px" }}>{c.icon}</span>
                <div style={{ background:"rgba(255,255,255,.18)", borderRadius:"8px", padding:"4px 10px", fontSize:"11px", fontWeight:700, color:"#fff" }}>
                  {stats ? stats[c.key] ?? "—" : "…"}
                </div>
              </div>
              <div style={{ fontWeight:900, fontSize:"38px", color:"#fff", lineHeight:1, marginBottom:"4px" }}>
                {stats ? stats[c.key] ?? 0 : "—"}
              </div>
              <div style={{ fontSize:"13px", color:"rgba(255,255,255,.75)", fontWeight:500 }}>{c.label}</div>
            </div>
          ))}
        </div>

        {/* ── TWO COLUMN LAYOUT ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"24px", marginBottom:"28px",
          animation:"fadeUp .7s ease both .15s", opacity:0, animationFillMode:"forwards" }}>

          {/* Pending Approvals */}
          <div style={{ background:"#fff", borderRadius:"16px", boxShadow:"0 2px 16px rgba(0,0,0,.06)", overflow:"hidden" }}>
            <div style={{ padding:"20px 24px 16px", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <h2 style={{ fontWeight:700, fontSize:"16px", color:"#0f172a", marginBottom:"2px" }}>⚡ Quick Actions</h2>
                <p style={{ fontSize:"12px", color:"#94a3b8" }}>Pending teacher approvals</p>
              </div>
              <span style={{ background:"rgba(124,58,237,.10)", color:"#7c3aed", border:"1px solid rgba(124,58,237,.20)", borderRadius:"100px", padding:"3px 12px", fontSize:"12px", fontWeight:700 }}>
                {pending.length} pending
              </span>
            </div>

            {pending.length === 0 ? (
              <div style={{ padding:"36px 24px", textAlign:"center", color:"#94a3b8", fontSize:"14px" }}>
                <div style={{ fontSize:"36px", marginBottom:"10px" }}>✅</div>
                All teachers reviewed!
              </div>
            ) : (
              <div>
                {pending.slice(0, 4).map((t, i) => (
                  <div key={t.id} className="act-row"
                    style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 24px",
                      borderBottom: i < Math.min(pending.length,4)-1 ? "1px solid #f8fafc" : "none", gap:"12px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"10px", flex:1, minWidth:0 }}>
                      <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#2563eb)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px", flexShrink:0 }}>👨‍🏫</div>
                      <div style={{ minWidth:0 }}>
                        <div style={{ fontWeight:600, fontSize:"13px", color:"#0f172a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.name}</div>
                        <div style={{ fontSize:"11px", color:"#94a3b8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.email}</div>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:"6px", flexShrink:0 }}>
                      <button className="abtn" onClick={() => handleApprove(t.id)}
                        style={{ padding:"6px 12px", borderRadius:"7px", background:"linear-gradient(135deg,#10b981,#059669)", color:"#fff", border:"none", fontSize:"11px", fontWeight:700 }}>
                        ✓
                      </button>
                      <button className="abtn" onClick={() => handleReject(t.id)}
                        style={{ padding:"6px 12px", borderRadius:"7px", background:"linear-gradient(135deg,#ef4444,#dc2626)", color:"#fff", border:"none", fontSize:"11px", fontWeight:700 }}>
                        ✗
                      </button>
                    </div>
                  </div>
                ))}
                {pending.length > 4 && (
                  <div style={{ padding:"12px 24px", textAlign:"center" }}>
                    <button onClick={() => navigate("/principal/teachers")}
                      style={{ background:"none", border:"none", color:"#7c3aed", fontWeight:600, fontSize:"13px", cursor:"pointer", fontFamily:"inherit" }}>
                      View all {pending.length} pending →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div style={{ background:"#fff", borderRadius:"16px", boxShadow:"0 2px 16px rgba(0,0,0,.06)", overflow:"hidden" }}>
            <div style={{ padding:"20px 24px 16px", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <h2 style={{ fontWeight:700, fontSize:"16px", color:"#0f172a", marginBottom:"2px" }}>🕐 Recent Predictions</h2>
                <p style={{ fontSize:"12px", color:"#94a3b8" }}>Latest prediction results</p>
              </div>
              <button onClick={() => navigate("/principal/students")}
                style={{ background:"rgba(37,99,235,.08)", border:"1px solid rgba(37,99,235,.18)", color:"#2563eb", borderRadius:"8px", padding:"5px 12px", fontSize:"12px", fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                View All →
              </button>
            </div>

            {preds.length === 0 ? (
              <div style={{ padding:"36px 24px", textAlign:"center", color:"#94a3b8", fontSize:"14px" }}>
                <div style={{ fontSize:"36px", marginBottom:"10px" }}>📭</div>
                No predictions yet.
              </div>
            ) : (
              <div>
                {preds.map((p, i) => {
                  const isRisk = p.status === "R";
                  return (
                    <div key={p.id} className="act-row"
                      style={{ display:"flex", alignItems:"center", gap:"12px", padding:"13px 24px",
                        borderBottom: i < preds.length-1 ? "1px solid #f8fafc" : "none" }}>
                      <div style={{ width:"8px", height:"8px", borderRadius:"50%", flexShrink:0,
                        background: isRisk ? "#ef4444" : "#10b981",
                        boxShadow:`0 0 6px ${isRisk ? "#ef444480" : "#10b98180"}` }} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:600, fontSize:"13px", color:"#0f172a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {p.student?.name || "Student"}{" "}
                          <span style={{ fontWeight:400, color:"#64748b" }}>→</span>{" "}
                          <span style={{ fontWeight:700, color: isRisk ? "#ef4444" : "#10b981" }}>
                            {isRisk ? "At Risk ⚠️" : "Pass ✅"}
                          </span>
                        </div>
                        <div style={{ fontSize:"11px", color:"#94a3b8", marginTop:"2px" }}>
                          Teacher: {p.student?.teacher?.name || "—"}
                        </div>
                      </div>
                      <span style={{ flexShrink:0, background: isRisk ? "rgba(239,68,68,.10)" : "rgba(16,185,129,.10)",
                        color: isRisk ? "#ef4444" : "#10b981",
                        border:`1px solid ${isRisk ? "rgba(239,68,68,.25)" : "rgba(16,185,129,.25)"}`,
                        borderRadius:"100px", padding:"3px 10px", fontSize:"11px", fontWeight:700 }}>
                        {isRisk ? "AT RISK" : "PASS"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* ── MODEL METRICS STRIP (like LandingPage results section) ── */}
        <div style={{ background:"linear-gradient(135deg,#0f172a,#1e1b4b)", borderRadius:"20px",
          padding:"36px 40px", boxShadow:"0 8px 40px rgba(0,0,0,.20)",
          animation:"fadeUp .7s ease both .25s", opacity:0, animationFillMode:"forwards" }}>
          <div style={{ display:"inline-block", background:"rgba(255,255,255,.10)", border:"1px solid rgba(255,255,255,.18)", color:"#93c5fd", padding:"4px 14px", borderRadius:"100px", fontSize:"11px", fontWeight:700, letterSpacing:".6px", marginBottom:"16px", textTransform:"uppercase" }}>
            Model Performance
          </div>
          <h3 style={{ fontWeight:800, fontSize:"20px", color:"#fff", marginBottom:"24px", letterSpacing:"-0.3px" }}>
            Powered by IEEE Research · 93.8% Precision
          </h3>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:"16px" }}>
            {[
              { value:"93.8%", label:"Accuracy",        color:"#60a5fa" },
              { value:"98.4%", label:"Recall",           color:"#a78bfa" },
              { value:"96.1%", label:"F-Measure",        color:"#34d399" },
              { value:"180+",  label:"Association Rules", color:"#fb923c" },
              { value:"4",     label:"Risk Clusters",    color:"#f472b6" },
              { value:"J48",   label:"Algorithm",        color:"#38bdf8" },
            ].map((m, i) => (
              <div key={i} style={{ background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.09)", borderRadius:"12px", padding:"18px 16px", textAlign:"center" }}>
                <div style={{ fontWeight:900, fontSize:"28px", color:m.color, lineHeight:1, marginBottom:"6px" }}>{m.value}</div>
                <div style={{ fontSize:"12px", color:"rgba(255,255,255,.50)", fontWeight:500 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ FOOTER ═══════════════════════════════════════════ */}
      <footer style={{ background:"#060c1a", padding:"32px 40px", borderTop:"1px solid rgba(255,255,255,.05)", marginTop:"auto" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <div style={{ width:"28px", height:"28px", borderRadius:"7px", background:"linear-gradient(135deg,#2563eb,#7c3aed)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px" }}>⚡</div>
            <span style={{ fontWeight:800, fontSize:"15px", color:"#fff", letterSpacing:"-0.3px" }}>EduPredict</span>
          </div>
          <span style={{ fontSize:"12px", color:"#475569" }}>Decision Tree J48 · K-Means · Apriori Association Rules</span>
          <span style={{ fontSize:"12px", color:"#334155" }}>© 2025 EduPredict · IEEE Paper by Chicon et al.</span>
        </div>
      </footer>
    </div>
  );
}