import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const SLIDES = [
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1800&q=80",
  "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1800&q=80",
  "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1800&q=80",
];

const STAT_CARDS = [
  { key:"count",    label:"Total Students",    icon:"👨‍🎓", grad:"linear-gradient(135deg,#2563eb,#38bdf8)", shadow:"rgba(37,99,235,.35)"   },
  { key:"approved", label:"Approved Students", icon:"✅",   grad:"linear-gradient(135deg,#10b981,#059669)", shadow:"rgba(16,185,129,.35)"  },
  { key:"pending",  label:"Pending Approval",  icon:"⏳",   grad:"linear-gradient(135deg,#f59e0b,#fb923c)", shadow:"rgba(245,158,11,.35)"  },
  { key:"atRisk",   label:"At Risk Students",  icon:"⚠️",   grad:"linear-gradient(135deg,#ef4444,#f97316)", shadow:"rgba(239,68,68,.35)"   },
];

export default function TeacherDashboard() {
  const navigate   = useNavigate();
  const teacherId  = sessionStorage.getItem("id");
  const name       = sessionStorage.getItem("name") || "Teacher";

  const [stats,    setStats]    = useState(null);
  const [pending,  setPending]  = useState([]);
  const [preds,    setPreds]    = useState([]);
  const [current,  setCurrent]  = useState(0);
  const [prev,     setPrev]     = useState(null);
  const [trans,    setTrans]    = useState(false);
  const [loaded,   setLoaded]   = useState(false);
  const timer = useRef(null);

  const today = new Date().toLocaleDateString("en-US", { weekday:"long", year:"numeric", month:"long", day:"numeric" });

  useEffect(() => {
    const img = new Image(); img.src = SLIDES[0];
    img.onload = img.onerror = () => setLoaded(true);
  }, []);

  const kick = () => {
    clearInterval(timer.current);
    timer.current = setInterval(() => {
      setCurrent(c => { const n=(c+1)%SLIDES.length; setPrev(c); setTrans(true); setTimeout(()=>{setPrev(null);setTrans(false);},1000); return n; });
    }, 5000);
  };
  useEffect(() => { kick(); return () => clearInterval(timer.current); }, []);

  useEffect(() => {
    if (!teacherId) return;
    fetch(`http://localhost:8080/api/teacher/students/${teacherId}`)
      .then(r=>r.json()).then(d => {
        if (d.success) {
          setStats({ count: d.count, approved: d.approved, pending: d.pending, atRisk: 0 });
          setPending((d.students||[]).filter(s=>s.status==="PENDING").slice(0,4));
        }
      }).catch(()=>{});
    fetch(`http://localhost:8080/api/teacher/predictions/${teacherId}`)
      .then(r=>r.json()).then(d => {
        if (d.success) {
          setPreds((d.predictions||[]).slice(0,5));
          setStats(s => s ? { ...s, atRisk: d.totalAtRisk||0 } : s);
        }
      }).catch(()=>{});
  }, [teacherId]);

  const handleApprove = async (id) => {
    await fetch(`http://localhost:8080/api/teacher/students/approve/${id}`, { method:"PUT" });
    setPending(p => p.filter(s=>s.id!==id));
    setStats(s => s ? { ...s, pending: s.pending-1, approved: s.approved+1 } : s);
  };
  const handleReject = async (id) => {
    await fetch(`http://localhost:8080/api/teacher/students/reject/${id}`, { method:"PUT" });
    setPending(p => p.filter(s=>s.id!==id));
    setStats(s => s ? { ...s, pending: s.pending-1 } : s);
  };

  return (
    <div style={{ background:"#f1f5f9", minHeight:"100vh", display:"flex", flexDirection:"column", fontFamily:"'Outfit',sans-serif" }}>
      <style>{`
        @keyframes fadeUpIn { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes floatOrb { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-20px) scale(1.05)} }
        .scard:hover { transform:translateY(-5px) !important; }
        .arow:hover  { background:#f8fafc !important; }
        .abtn { transition:all .2s; cursor:pointer; font-family:inherit; }
        .abtn:hover { opacity:.85; transform:translateY(-1px); }
      `}</style>

      {/* HERO */}
      <section style={{ position:"relative", height:"440px", overflow:"hidden", flexShrink:0 }}>
        <div style={{ position:"absolute", inset:0, zIndex:0, background:"#060c2e" }} />
        {prev !== null && (
          <div style={{ position:"absolute", inset:0, zIndex:1,
            backgroundImage:`url(${SLIDES[prev]})`, backgroundSize:"cover", backgroundPosition:"center",
            opacity: trans ? 0 : 1, transition:"opacity 1s ease" }} />
        )}
        <div style={{ position:"absolute", inset:0, zIndex:2,
          backgroundImage:`url(${SLIDES[current]})`, backgroundSize:"cover", backgroundPosition:"center",
          opacity: loaded ? 1 : 0, transition:"opacity 1s ease" }} />
        <div style={{ position:"absolute", inset:0, zIndex:3,
          background:"linear-gradient(120deg,rgba(6,12,46,0.80) 0%,rgba(4,30,18,0.72) 50%,rgba(6,12,46,0.80) 100%)" }} />
        <div style={{ position:"absolute", inset:0, zIndex:4, pointerEvents:"none",
          backgroundImage:"linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)",
          backgroundSize:"60px 60px" }} />
        <div style={{ position:"absolute", top:"-60px", left:"8%", zIndex:4, width:"380px", height:"380px", borderRadius:"50%",
          background:"radial-gradient(circle,rgba(16,185,129,0.15) 0%,transparent 70%)",
          animation:"floatOrb 8s ease-in-out infinite", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"-40px", right:"10%", zIndex:4, width:"340px", height:"340px", borderRadius:"50%",
          background:"radial-gradient(circle,rgba(37,99,235,0.14) 0%,transparent 70%)",
          animation:"floatOrb 10s ease-in-out infinite 2s", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"160px", zIndex:5,
          background:"linear-gradient(to bottom,transparent 0%,#f1f5f9 100%)" }} />

        {/* Slide dots */}
        <div style={{ position:"absolute", bottom:"68px", left:"50%", transform:"translateX(-50%)", zIndex:6, display:"flex", gap:"8px" }}>
          {SLIDES.map((_,i) => (
            <button key={i} onClick={() => { if(i===current||trans)return; setPrev(current);setTrans(true);setCurrent(i); clearInterval(timer.current); setTimeout(()=>{setPrev(null);setTrans(false);kick();},1000); }}
              style={{ width:i===current?"24px":"8px", height:"8px", borderRadius:"100px",
                background:i===current?"#fff":"rgba(255,255,255,0.35)", border:"none", cursor:"pointer", padding:0, transition:"all .4s cubic-bezier(.4,0,.2,1)" }} />
          ))}
        </div>

        <div style={{ position:"relative", zIndex:6, height:"100%", display:"flex", flexDirection:"column", justifyContent:"center", padding:"0 48px", paddingBottom:"60px" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:"8px",
            background:"rgba(255,255,255,.10)", border:"1px solid rgba(255,255,255,.20)",
            borderRadius:"100px", padding:"5px 16px", fontSize:"11px", fontWeight:600,
            color:"rgba(255,255,255,.85)", letterSpacing:".5px", marginBottom:"20px",
            width:"fit-content", backdropFilter:"blur(8px)", animation:"fadeUpIn .6s ease both" }}>
            <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#34d399", display:"inline-block" }} />
            {today}
          </div>
          <h1 style={{ fontWeight:900, fontSize:"clamp(28px,4vw,52px)", color:"#fff",
            letterSpacing:"-1.5px", lineHeight:1.1, marginBottom:"14px", animation:"fadeUpIn .7s ease both .1s" }}>
            Welcome,{" "}
            <span style={{ background:"linear-gradient(90deg,#34d399,#60a5fa)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              {name}
            </span>{" "}👋
          </h1>
          <p style={{ fontSize:"16px", color:"rgba(255,255,255,.55)", marginBottom:"28px", animation:"fadeUpIn .7s ease both .2s" }}>
            Manage your students, enter scores and run predictions
          </p>
          <div style={{ display:"flex", gap:"12px", flexWrap:"wrap", animation:"fadeUpIn .7s ease both .3s" }}>
            <button onClick={() => navigate("/teacher/students")}
              style={{ background:"linear-gradient(135deg,#10b981,#059669)", color:"#fff", border:"none",
                padding:"10px 22px", borderRadius:"8px", fontSize:"13px", fontWeight:700,
                cursor:"pointer", fontFamily:"inherit", boxShadow:"0 4px 18px rgba(16,185,129,.4)", transition:"all .25s" }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";}}>
              👥 My Students →
            </button>
            <button onClick={() => navigate("/teacher/scores")}
              style={{ background:"rgba(255,255,255,0.12)", color:"#fff", border:"1.5px solid rgba(255,255,255,.30)",
                padding:"10px 22px", borderRadius:"8px", fontSize:"13px", fontWeight:600,
                cursor:"pointer", fontFamily:"inherit", backdropFilter:"blur(8px)", transition:"all .25s" }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.20)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.12)";}}>
              📝 Enter Scores →
            </button>
          </div>
        </div>
      </section>

      {/* BODY */}
      <div style={{ flex:1, padding:"0 40px 40px", marginTop:"-10px", position:"relative", zIndex:3 }}>

        {/* Stat cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:"20px", marginBottom:"32px",
          animation:"fadeUp .7s ease both", opacity:0, animationFillMode:"forwards" }}>
          {STAT_CARDS.map((c,i) => (
            <div key={i} className="scard"
              style={{ background:c.grad, borderRadius:"16px", padding:"26px 24px",
                boxShadow:`0 8px 28px ${c.shadow}`, transition:"transform .25s, box-shadow .25s" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"14px" }}>
                <span style={{ fontSize:"30px" }}>{c.icon}</span>
                <div style={{ background:"rgba(255,255,255,.18)", borderRadius:"8px", padding:"4px 10px", fontSize:"11px", fontWeight:700, color:"#fff" }}>
                  {stats ? stats[c.key] ?? 0 : "…"}
                </div>
              </div>
              <div style={{ fontWeight:900, fontSize:"38px", color:"#fff", lineHeight:1, marginBottom:"4px" }}>
                {stats ? stats[c.key] ?? 0 : "—"}
              </div>
              <div style={{ fontSize:"13px", color:"rgba(255,255,255,.75)", fontWeight:500 }}>{c.label}</div>
            </div>
          ))}
        </div>

        {/* Two columns */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"24px", marginBottom:"28px",
          animation:"fadeUp .7s ease both .15s", opacity:0, animationFillMode:"forwards" }}>

          {/* Pending students */}
          <div style={{ background:"#fff", borderRadius:"16px", boxShadow:"0 2px 16px rgba(0,0,0,.06)", overflow:"hidden" }}>
            <div style={{ padding:"20px 24px 16px", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <h2 style={{ fontWeight:700, fontSize:"16px", color:"#0f172a", marginBottom:"2px" }}>⚡ Pending Approvals</h2>
                <p style={{ fontSize:"12px", color:"#94a3b8" }}>Students waiting for your approval</p>
              </div>
              <span style={{ background:"rgba(245,158,11,.10)", color:"#d97706", border:"1px solid rgba(245,158,11,.22)", borderRadius:"100px", padding:"3px 12px", fontSize:"12px", fontWeight:700 }}>
                {pending.length} pending
              </span>
            </div>
            {pending.length === 0 ? (
              <div style={{ padding:"36px 24px", textAlign:"center", color:"#94a3b8", fontSize:"14px" }}>
                <div style={{ fontSize:"36px", marginBottom:"10px" }}>✅</div>
                No pending approvals!
              </div>
            ) : pending.map((s,i) => (
              <div key={s.id} className="arow"
                style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                  padding:"13px 24px", borderBottom: i<pending.length-1?"1px solid #f8fafc":"none", gap:"12px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"10px", flex:1, minWidth:0 }}>
                  <div style={{ width:"34px", height:"34px", borderRadius:"50%",
                    background:"linear-gradient(135deg,#10b981,#059669)", display:"flex",
                    alignItems:"center", justifyContent:"center", fontSize:"13px", flexShrink:0 }}>👨‍🎓</div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontWeight:600, fontSize:"13px", color:"#0f172a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.name}</div>
                    <div style={{ fontSize:"11px", color:"#94a3b8" }}>{s.studentId}</div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:"6px", flexShrink:0 }}>
                  <button className="abtn" onClick={()=>handleApprove(s.id)}
                    style={{ padding:"6px 12px", borderRadius:"7px", background:"linear-gradient(135deg,#10b981,#059669)", color:"#fff", border:"none", fontSize:"11px", fontWeight:700 }}>✓</button>
                  <button className="abtn" onClick={()=>handleReject(s.id)}
                    style={{ padding:"6px 12px", borderRadius:"7px", background:"linear-gradient(135deg,#ef4444,#dc2626)", color:"#fff", border:"none", fontSize:"11px", fontWeight:700 }}>✗</button>
                </div>
              </div>
            ))}
          </div>

          {/* Recent predictions */}
          <div style={{ background:"#fff", borderRadius:"16px", boxShadow:"0 2px 16px rgba(0,0,0,.06)", overflow:"hidden" }}>
            <div style={{ padding:"20px 24px 16px", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <h2 style={{ fontWeight:700, fontSize:"16px", color:"#0f172a", marginBottom:"2px" }}>🎯 Recent Predictions</h2>
                <p style={{ fontSize:"12px", color:"#94a3b8" }}>Latest ML prediction results</p>
              </div>
              <button onClick={() => navigate("/teacher/predictions")}
                style={{ background:"rgba(37,99,235,.08)", border:"1px solid rgba(37,99,235,.18)", color:"#2563eb", borderRadius:"8px", padding:"5px 12px", fontSize:"12px", fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                View All →
              </button>
            </div>
            {preds.length === 0 ? (
              <div style={{ padding:"36px 24px", textAlign:"center", color:"#94a3b8", fontSize:"14px" }}>
                <div style={{ fontSize:"36px", marginBottom:"10px" }}>📭</div>
                No predictions yet. Enter scores first!
              </div>
            ) : preds.map((p,i) => {
              const risk = p.status === "R";
              return (
                <div key={p.id} className="arow"
                  style={{ display:"flex", alignItems:"center", gap:"12px", padding:"13px 24px",
                    borderBottom:i<preds.length-1?"1px solid #f8fafc":"none" }}>
                  <div style={{ width:"8px", height:"8px", borderRadius:"50%", flexShrink:0,
                    background: risk ? "#ef4444" : "#10b981",
                    boxShadow:`0 0 6px ${risk?"#ef444480":"#10b98180"}` }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:600, fontSize:"13px", color:"#0f172a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {p.student?.name || "Student"} →{" "}
                      <span style={{ color: risk?"#ef4444":"#10b981" }}>{risk?"At Risk ⚠️":"Pass ✅"}</span>
                    </div>
                    <div style={{ fontSize:"11px", color:"#94a3b8" }}>Cluster: {p.clusterGroup ?? "N/A"}</div>
                  </div>
                  <span style={{ background: risk?"rgba(239,68,68,.10)":"rgba(16,185,129,.10)",
                    color: risk?"#ef4444":"#10b981", border:`1px solid ${risk?"rgba(239,68,68,.25)":"rgba(16,185,129,.25)"}`,
                    borderRadius:"100px", padding:"3px 10px", fontSize:"11px", fontWeight:700 }}>
                    {risk?"AT RISK":"PASS"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick nav cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:"16px",
          animation:"fadeUp .7s ease both .25s", opacity:0, animationFillMode:"forwards" }}>
          {[
            { icon:"👥", title:"My Students",  desc:"View, approve & manage students", to:"/teacher/students",   col:"#2563eb" },
            { icon:"📝", title:"Enter Scores", desc:"Add or update student test scores", to:"/teacher/scores",    col:"#10b981" },
            { icon:"🎯", title:"Predictions",  desc:"Run ML predictions & view results", to:"/teacher/predictions",col:"#7c3aed" },
            { icon:"🧠", title:"Model Info",   desc:"Explore algorithms & association rules", to:"/teacher/models",  col:"#f59e0b" },
          ].map((c,i) => (
            <div key={i} onClick={() => navigate(c.to)}
              style={{ background:"#fff", borderRadius:"14px", padding:"22px 20px",
                boxShadow:"0 2px 16px rgba(0,0,0,.06)", cursor:"pointer",
                borderLeft:`4px solid ${c.col}`, transition:"transform .2s, box-shadow .2s" }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 10px 30px rgba(0,0,0,.10)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 2px 16px rgba(0,0,0,.06)";}}>
              <div style={{ fontSize:"28px", marginBottom:"10px" }}>{c.icon}</div>
              <div style={{ fontWeight:700, fontSize:"15px", color:"#0f172a", marginBottom:"4px" }}>{c.title}</div>
              <div style={{ fontSize:"12px", color:"#94a3b8" }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <footer style={{ background:"#060c1a", padding:"28px 40px", borderTop:"1px solid rgba(255,255,255,.05)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <div style={{ width:"28px", height:"28px", borderRadius:"7px", background:"linear-gradient(135deg,#2563eb,#7c3aed)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px" }}>⚡</div>
            <span style={{ fontWeight:800, fontSize:"15px", color:"#fff" }}>EduPredict</span>
          </div>
          <span style={{ fontSize:"12px", color:"#334155" }}>© 2025 EduPredict · IEEE Paper by Chicon et al.</span>
        </div>
      </footer>
    </div>
  );
}