import { useEffect, useState } from "react";

export default function MyScores() {
  const studentId = sessionStorage.getItem("id");
  const [scores,  setScores]  = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:8080/api/student/scores/${studentId}`)
      .then(r=>r.json()).then(d=>{ if(d.success) setScores(d); })
      .catch(()=>{}).finally(()=>setLoading(false));
  }, [studentId]);

  const FIELDS = [
    { key:"test1",   label:"Test 1",   icon:"📝", color:"#2563eb" },
    { key:"test2",   label:"Test 2",   icon:"📝", color:"#7c3aed" },
    { key:"test3",   label:"Test 3",   icon:"📝", color:"#0891b2" },
    { key:"test4",   label:"Test 4",   icon:"📝", color:"#10b981" },
    { key:"mainExam",label:"Main Exam",icon:"📋", color:"#f59e0b" },
  ];

  return (
    <div style={{ padding:"36px", minHeight:"100vh", background:"#f1f5f9", fontFamily:"'Outfit',sans-serif" }}>
      <style>{`@keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }`}</style>

      <div style={{ marginBottom:"28px", animation:"fadeUp .6s ease both" }}>
        <h1 style={{ fontWeight:800, fontSize:"26px", color:"#0f172a", letterSpacing:"-0.5px", marginBottom:"4px" }}>📊 My Scores</h1>
        <p style={{ fontSize:"14px", color:"#64748b" }}>Your academic test results (scale: 0.0 – 10.0)</p>
      </div>

      {loading ? (
        <div style={{ padding:"80px", textAlign:"center", color:"#94a3b8" }}>Loading…</div>
      ) : !scores ? (
        <div style={{ background:"#fff", borderRadius:"20px", padding:"60px", textAlign:"center",
          boxShadow:"0 2px 16px rgba(0,0,0,.06)" }}>
          <div style={{ fontSize:"56px", marginBottom:"16px" }}>📭</div>
          <h2 style={{ fontWeight:700, fontSize:"20px", color:"#0f172a", marginBottom:"8px" }}>No Scores Yet</h2>
          <p style={{ fontSize:"14px", color:"#94a3b8" }}>Your teacher hasn't entered your scores yet. Please check back later.</p>
        </div>
      ) : (
        <>
          {/* Big score cards */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:"20px", marginBottom:"32px",
            animation:"fadeUp .6s ease both .05s", opacity:0, animationFillMode:"forwards" }}>
            {FIELDS.map((f,i) => {
              const val = scores[f.key];
              const pass = val >= 7;
              return (
                <div key={i} style={{ background:"#fff", borderRadius:"16px", padding:"24px 20px",
                  boxShadow:"0 2px 16px rgba(0,0,0,.06)", textAlign:"center",
                  borderTop:`4px solid ${pass ? f.color : "#ef4444"}` }}>
                  <div style={{ fontSize:"24px", marginBottom:"8px" }}>{f.icon}</div>
                  <div style={{ fontWeight:900, fontSize:"44px", color: pass ? f.color : "#ef4444", lineHeight:1 }}>{val}</div>
                  <div style={{ fontWeight:600, fontSize:"13px", color:"#64748b", marginTop:"8px" }}>{f.label}</div>
                  <div style={{ marginTop:"8px" }}>
                    <span style={{ background: pass ? "rgba(16,185,129,.10)" : "rgba(239,68,68,.10)",
                      color: pass ? "#059669" : "#dc2626",
                      border:`1px solid ${pass?"rgba(16,185,129,.25)":"rgba(239,68,68,.25)"}`,
                      borderRadius:"100px", padding:"3px 10px", fontSize:"11px", fontWeight:700 }}>
                      {pass ? "✅ Pass" : "⚠️ Below 7.0"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Average + bar chart */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:"24px",
            animation:"fadeUp .6s ease both .1s", opacity:0, animationFillMode:"forwards" }}>

            {/* Average */}
            <div style={{ background: scores.average >= 7 ? "linear-gradient(135deg,#10b981,#059669)" : "linear-gradient(135deg,#ef4444,#f97316)",
              borderRadius:"20px", padding:"36px 28px", textAlign:"center",
              boxShadow: scores.average >= 7 ? "0 8px 32px rgba(16,185,129,.4)" : "0 8px 32px rgba(239,68,68,.4)" }}>
              <div style={{ fontSize:"14px", color:"rgba(255,255,255,.7)", fontWeight:600, marginBottom:"10px", textTransform:"uppercase", letterSpacing:".5px" }}>Your Average</div>
              <div style={{ fontWeight:900, fontSize:"72px", color:"#fff", lineHeight:1, marginBottom:"8px" }}>{scores.average}</div>
              <div style={{ fontSize:"16px", color:"rgba(255,255,255,.85)", fontWeight:700 }}>
                {scores.average >= 7 ? "🎉 You're on track to Pass!" : "⚠️ You may be at risk of dropout"}
              </div>
              <div style={{ fontSize:"13px", color:"rgba(255,255,255,.55)", marginTop:"8px" }}>Threshold: 7.0</div>
            </div>

            {/* Score bars */}
            <div style={{ background:"#fff", borderRadius:"20px", padding:"28px", boxShadow:"0 2px 16px rgba(0,0,0,.06)" }}>
              <h3 style={{ fontWeight:700, fontSize:"16px", color:"#0f172a", marginBottom:"20px" }}>Score Breakdown</h3>
              {FIELDS.map((f,i) => {
                const val = scores[f.key];
                const pct = (val / 10) * 100;
                return (
                  <div key={i} style={{ marginBottom:"16px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
                      <span style={{ fontSize:"13px", fontWeight:600, color:"#475569" }}>{f.label}</span>
                      <span style={{ fontSize:"13px", fontWeight:800, color: val>=7 ? f.color : "#ef4444" }}>{val} / 10</span>
                    </div>
                    <div style={{ height:"10px", borderRadius:"100px", background:"#f1f5f9", overflow:"hidden" }}>
                      <div style={{ height:"100%", borderRadius:"100px",
                        background: val>=7 ? f.color : "linear-gradient(90deg,#ef4444,#f97316)",
                        width:`${pct}%`, transition:"width 1s ease" }} />
                    </div>
                  </div>
                );
              })}
              {/* Threshold line indicator */}
              <div style={{ marginTop:"16px", padding:"10px 14px", background:"rgba(37,99,235,.06)",
                border:"1px solid rgba(37,99,235,.15)", borderRadius:"8px", fontSize:"12px", color:"#2563eb", fontWeight:500 }}>
                ℹ️ Pass threshold is <strong>7.0</strong> — scores below this are flagged as weak.
              </div>
            </div>
          </div>
        </>
      )}

      <footer style={{ padding:"20px 0 0", borderTop:"1px solid #e2e8f0", marginTop:"40px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
            <div style={{ width:"24px", height:"24px", borderRadius:"6px", background:"linear-gradient(135deg,#7c3aed,#2563eb)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px" }}>⚡</div>
            <span style={{ fontWeight:700, fontSize:"13px", color:"#0f172a" }}>EduPredict</span>
          </div>
          <span style={{ fontSize:"12px", color:"#94a3b8" }}>© 2025 EduPredict · IEEE Research by Chicon et al.</span>
        </div>
      </footer>
    </div>
  );
}