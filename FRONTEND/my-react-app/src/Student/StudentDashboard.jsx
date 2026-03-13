import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const SLIDES = [
  "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1800&q=80",
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1800&q=80",
  "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1800&q=80",
];

export default function StudentDashboard() {
  const navigate   = useNavigate();
  const studentId  = sessionStorage.getItem("id");
  const name       = sessionStorage.getItem("name") || "Student";

  const [scores,   setScores]   = useState(null);
  const [pred,     setPred]     = useState(null);
  const [profile,  setProfile]  = useState(null);
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
    if (!studentId) return;
    fetch(`http://localhost:8080/api/student/profile/${studentId}`)
      .then(r=>r.json()).then(d=>{ if(d.success) setProfile(d); }).catch(()=>{});
    fetch(`http://localhost:8080/api/student/scores/${studentId}`)
      .then(r=>r.json()).then(d=>{ if(d.success) setScores(d); }).catch(()=>{});
    fetch(`http://localhost:8080/api/student/prediction/${studentId}`)
      .then(r=>r.json()).then(d=>{ if(d.success) setPred(d); }).catch(()=>{});
  }, [studentId]);

  const isRisk = pred?.status === "R";

  return (
    <div style={{ background:"#f1f5f9", minHeight:"100vh", display:"flex", flexDirection:"column", fontFamily:"'Outfit',sans-serif" }}>
      <style>{`
        @keyframes fadeUpIn { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes floatOrb { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-20px) scale(1.05)} }
        .ncard:hover { transform:translateY(-4px) !important; box-shadow:0 12px 32px rgba(0,0,0,.12) !important; }
      `}</style>

      {/* HERO */}
      <section style={{ position:"relative", height:"440px", overflow:"hidden", flexShrink:0 }}>
        <div style={{ position:"absolute", inset:0, zIndex:0, background:"#060c2e" }} />
        {prev !== null && (
          <div style={{ position:"absolute", inset:0, zIndex:1,
            backgroundImage:`url(${SLIDES[prev]})`, backgroundSize:"cover", backgroundPosition:"center",
            opacity: trans?0:1, transition:"opacity 1s ease" }} />
        )}
        <div style={{ position:"absolute", inset:0, zIndex:2,
          backgroundImage:`url(${SLIDES[current]})`, backgroundSize:"cover", backgroundPosition:"center",
          opacity: loaded?1:0, transition:"opacity 1s ease" }} />
        <div style={{ position:"absolute", inset:0, zIndex:3,
          background:"linear-gradient(120deg,rgba(4,10,40,0.82) 0%,rgba(8,20,60,0.72) 50%,rgba(4,10,40,0.82) 100%)" }} />
        <div style={{ position:"absolute", inset:0, zIndex:4, pointerEvents:"none",
          backgroundImage:"linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)",
          backgroundSize:"60px 60px" }} />
        <div style={{ position:"absolute", top:"-60px", right:"10%", zIndex:4, width:"380px", height:"380px", borderRadius:"50%",
          background:"radial-gradient(circle,rgba(8,145,178,0.18) 0%,transparent 70%)",
          animation:"floatOrb 8s ease-in-out infinite", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"160px", zIndex:5,
          background:"linear-gradient(to bottom,transparent 0%,#f1f5f9 100%)" }} />
        <div style={{ position:"absolute", bottom:"68px", left:"50%", transform:"translateX(-50%)", zIndex:6, display:"flex", gap:"8px" }}>
          {SLIDES.map((_,i) => (
            <button key={i} onClick={() => { if(i===current||trans)return; setPrev(current);setTrans(true);setCurrent(i); clearInterval(timer.current); setTimeout(()=>{setPrev(null);setTrans(false);kick();},1000); }}
              style={{ width:i===current?"24px":"8px", height:"8px", borderRadius:"100px",
                background:i===current?"#fff":"rgba(255,255,255,0.35)", border:"none", cursor:"pointer", padding:0, transition:"all .4s" }} />
          ))}
        </div>

        <div style={{ position:"relative", zIndex:6, height:"100%", display:"flex", flexDirection:"column", justifyContent:"center", padding:"0 48px", paddingBottom:"60px" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:"8px",
            background:"rgba(255,255,255,.10)", border:"1px solid rgba(255,255,255,.20)",
            borderRadius:"100px", padding:"5px 16px", fontSize:"11px", fontWeight:600,
            color:"rgba(255,255,255,.85)", letterSpacing:".5px", marginBottom:"20px",
            width:"fit-content", backdropFilter:"blur(8px)", animation:"fadeUpIn .6s ease both" }}>
            <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#38bdf8", display:"inline-block" }} />
            {today}
          </div>
          <h1 style={{ fontWeight:900, fontSize:"clamp(28px,4vw,52px)", color:"#fff",
            letterSpacing:"-1.5px", lineHeight:1.1, marginBottom:"14px", animation:"fadeUpIn .7s ease both .1s" }}>
            Hello,{" "}
            <span style={{ background:"linear-gradient(90deg,#38bdf8,#a78bfa)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              {name}
            </span>{" "}👋
          </h1>
          <p style={{ fontSize:"16px", color:"rgba(255,255,255,.55)", marginBottom:"28px", animation:"fadeUpIn .7s ease both .2s" }}>
            {profile ? `Class of ${profile.teacherName} · Track your performance and prediction` : "Track your scores and dropout risk prediction"}
          </p>
          <div style={{ display:"flex", gap:"12px", animation:"fadeUpIn .7s ease both .3s" }}>
            <button onClick={() => navigate("/student/prediction")}
              style={{ background:"linear-gradient(135deg,#0891b2,#38bdf8)", color:"#fff", border:"none",
                padding:"10px 22px", borderRadius:"8px", fontSize:"13px", fontWeight:700,
                cursor:"pointer", fontFamily:"inherit", boxShadow:"0 4px 18px rgba(8,145,178,.4)", transition:"all .25s" }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";}}>
              🎯 My Prediction →
            </button>
            <button onClick={() => navigate("/student/scores")}
              style={{ background:"rgba(255,255,255,0.12)", color:"#fff", border:"1.5px solid rgba(255,255,255,.30)",
                padding:"10px 22px", borderRadius:"8px", fontSize:"13px", fontWeight:600,
                cursor:"pointer", fontFamily:"inherit", backdropFilter:"blur(8px)", transition:"all .25s" }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.20)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.12)";}}>
              📊 My Scores →
            </button>
          </div>
        </div>
      </section>

      {/* BODY */}
      <div style={{ flex:1, padding:"0 40px 40px", marginTop:"-10px", position:"relative", zIndex:3 }}>

        {/* Score summary cards */}
        {scores ? (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr) 1.2fr", gap:"16px", marginBottom:"28px",
            animation:"fadeUp .7s ease both", opacity:0, animationFillMode:"forwards" }}>
            {[
              { label:"Test 1",   val:scores.test1,   col:"#2563eb" },
              { label:"Test 2",   val:scores.test2,   col:"#7c3aed" },
              { label:"Test 3",   val:scores.test3,   col:"#0891b2" },
              { label:"Test 4",   val:scores.test4,   col:"#10b981" },
              { label:"Main Exam",val:scores.mainExam,col:"#f59e0b" },
            ].map((s,i) => (
              <div key={i} style={{ background:"#fff", borderRadius:"14px", padding:"18px 16px",
                boxShadow:"0 2px 16px rgba(0,0,0,.06)", borderTop:`3px solid ${s.col}`, textAlign:"center" }}>
                <div style={{ fontWeight:900, fontSize:"28px", color:s.col }}>{s.val}</div>
                <div style={{ fontSize:"12px", color:"#64748b", fontWeight:600, marginTop:"4px" }}>{s.label}</div>
                {s.val < 7 && <div style={{ fontSize:"10px", color:"#ef4444", fontWeight:700, marginTop:"4px" }}>⚠️ Below 7.0</div>}
              </div>
            ))}
            <div style={{ background: scores.average >= 7 ? "linear-gradient(135deg,#10b981,#059669)" : "linear-gradient(135deg,#ef4444,#f97316)",
              borderRadius:"14px", padding:"18px 16px",
              boxShadow: scores.average >= 7 ? "0 6px 20px rgba(16,185,129,.35)" : "0 6px 20px rgba(239,68,68,.35)",
              textAlign:"center" }}>
              <div style={{ fontWeight:900, fontSize:"28px", color:"#fff" }}>{scores.average}</div>
              <div style={{ fontSize:"12px", color:"rgba(255,255,255,.75)", fontWeight:600, marginTop:"4px" }}>Average</div>
              <div style={{ fontSize:"11px", color:"rgba(255,255,255,.85)", fontWeight:700, marginTop:"4px" }}>
                {scores.average >= 7 ? "✅ Good" : "⚠️ At Risk"}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background:"#fff", borderRadius:"14px", padding:"24px", marginBottom:"28px",
            boxShadow:"0 2px 16px rgba(0,0,0,.06)", textAlign:"center", color:"#94a3b8",
            animation:"fadeUp .7s ease both", opacity:0, animationFillMode:"forwards" }}>
            📭 Scores not entered yet. Ask your teacher to enter your scores.
          </div>
        )}

        {/* Prediction + Nav grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:"24px",
          animation:"fadeUp .7s ease both .15s", opacity:0, animationFillMode:"forwards" }}>

          {/* Prediction card */}
          <div style={{ background: pred ? (isRisk ? "linear-gradient(135deg,#1a0a0a,#2d0f0f)" : "linear-gradient(135deg,#0a1a14,#0f2d1e)") : "#fff",
            borderRadius:"20px", padding:"28px",
            boxShadow: pred ? (isRisk ? "0 8px 36px rgba(239,68,68,.3)" : "0 8px 36px rgba(16,185,129,.3)") : "0 2px 16px rgba(0,0,0,.06)" }}>
            {!pred ? (
              <div style={{ textAlign:"center", padding:"24px", color:"#94a3b8" }}>
                <div style={{ fontSize:"48px", marginBottom:"12px" }}>🎯</div>
                <div style={{ fontWeight:700, fontSize:"16px", color:"#0f172a", marginBottom:"6px" }}>No Prediction Yet</div>
                <div style={{ fontSize:"13px" }}>Ask your teacher to run the ML prediction for you.</div>
              </div>
            ) : (
              <>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px" }}>
                  <span style={{ fontSize:"12px", fontWeight:700, color: isRisk ? "rgba(239,68,68,.7)" : "rgba(16,185,129,.7)",
                    textTransform:"uppercase", letterSpacing:".5px" }}>Your Prediction Result</span>
                  <span style={{ background: isRisk ? "rgba(239,68,68,.2)" : "rgba(16,185,129,.2)",
                    color: isRisk ? "#ef4444" : "#10b981",
                    border:`1px solid ${isRisk?"rgba(239,68,68,.4)":"rgba(16,185,129,.4)"}`,
                    borderRadius:"100px", padding:"4px 14px", fontSize:"13px", fontWeight:800 }}>
                    {isRisk ? "AT RISK ⚠️" : "PASS ✅"}
                  </span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"16px" }}>
                  {[
                    { label:"Pass Probability",   val:`${pred.passProbability?.toFixed(1)}%`, col: isRisk?"#ef4444":"#10b981" },
                    { label:"Risk Probability",   val:`${pred.riskProbability?.toFixed(1)}%`, col:"#f59e0b" },
                    { label:"Cluster Group",      val: pred.clusterGroup ?? "N/A",             col:"#7c3aed" },
                    { label:"Status",             val: isRisk ? "At Risk" : "Pass",            col: isRisk?"#ef4444":"#10b981" },
                  ].map((m,i) => (
                    <div key={i} style={{ background:"rgba(255,255,255,.06)", borderRadius:"10px", padding:"12px 14px" }}>
                      <div style={{ fontSize:"11px", color:"rgba(255,255,255,.4)", fontWeight:600, marginBottom:"4px" }}>{m.label}</div>
                      <div style={{ fontWeight:900, fontSize:"20px", color:m.col }}>{m.val}</div>
                    </div>
                  ))}
                </div>
                {pred.weakTests && pred.weakTests !== "" && (
                  <div style={{ background:"rgba(239,68,68,.10)", borderRadius:"10px", padding:"12px 14px" }}>
                    <div style={{ fontSize:"11px", color:"rgba(239,68,68,.7)", fontWeight:700, marginBottom:"8px" }}>WEAK AREAS TO IMPROVE</div>
                    <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                      {pred.weakTests.split(",").map((t,i) => (
                        <span key={i} style={{ background:"rgba(239,68,68,.15)", color:"#ef4444",
                          borderRadius:"6px", padding:"4px 10px", fontSize:"12px", fontWeight:700 }}>{t.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}
                <p style={{ fontSize:"13px", color:"rgba(255,255,255,.45)", marginTop:"14px", fontStyle:"italic" }}>
                  {pred.message}
                </p>
              </>
            )}
          </div>

          {/* Quick nav cards */}
          <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
            {[
              { icon:"📊", title:"My Scores",   desc:"View all your test scores",      to:"/student/scores",     col:"#2563eb" },
              { icon:"🎯", title:"Prediction",  desc:"View your dropout risk result",   to:"/student/prediction", col: isRisk?"#ef4444":"#10b981" },
              { icon:"👤", title:"My Profile",  desc:"Your account details & teacher",  to:"/student/profile",    col:"#7c3aed" },
            ].map((c,i) => (
              <div key={i} className="ncard" onClick={() => navigate(c.to)}
                style={{ background:"#fff", borderRadius:"14px", padding:"18px 20px",
                  boxShadow:"0 2px 16px rgba(0,0,0,.06)", cursor:"pointer",
                  borderLeft:`4px solid ${c.col}`, display:"flex", alignItems:"center", gap:"14px",
                  transition:"transform .2s, box-shadow .2s" }}>
                <span style={{ fontSize:"26px" }}>{c.icon}</span>
                <div>
                  <div style={{ fontWeight:700, fontSize:"14px", color:"#0f172a" }}>{c.title}</div>
                  <div style={{ fontSize:"12px", color:"#94a3b8", marginTop:"2px" }}>{c.desc}</div>
                </div>
                <span style={{ marginLeft:"auto", color:"#94a3b8", fontSize:"18px" }}>→</span>
              </div>
            ))}
          </div>
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