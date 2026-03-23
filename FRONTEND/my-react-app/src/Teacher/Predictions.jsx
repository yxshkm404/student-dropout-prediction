import { useEffect, useState, useCallback } from "react";

const PRED_STYLE = {
  A: { bg:"rgba(16,185,129,.10)", color:"#059669", border:"rgba(16,185,129,.25)", label:"PASS",    grad:"linear-gradient(135deg,#10b981,#059669)" },
  R: { bg:"rgba(239,68,68,.10)",  color:"#dc2626", border:"rgba(239,68,68,.25)",  label:"AT RISK", grad:"linear-gradient(135deg,#ef4444,#f97316)" },
};

export default function Predictions() {
  const teacherId = sessionStorage.getItem("id");
  const [students, setStudents] = useState([]);
  const [preds,    setPreds]    = useState([]);
  const [avgMap,   setAvgMap]   = useState({}); // { studentDbId: "7.40" }
  const [selected, setSelected] = useState(null);
  const [running,  setRunning]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [toast,    setToast]    = useState("");
  const [filter,   setFilter]   = useState("ALL");
  const [loading,  setLoading]  = useState(true);

  const showToast = (msg, err=false) => { setToast({msg,err}); setTimeout(()=>setToast(""),4000); };

  const buildAvgMap = async (list) => {
    const map = {};
    await Promise.all((list || []).map(async p => {
      const sid = p.student?.id;
      if (!sid) return;
      try {
        const r  = await fetch(`/api/student/scores/${sid}`);
        const sd = await r.json();
        if (sd.success) {
          map[sid] = ((sd.test1 + sd.test2 + sd.test3 + sd.test4 + sd.mainExam) / 5).toFixed(2);
        }
      } catch {}
    }));
    setAvgMap(map);
  };

  const loadPredictions = useCallback(async () => {
    try {
      const r = await fetch(`/api/teacher/predictions/${teacherId}`);
      const d = await r.json();
      if (d.success) {
        const list = d.predictions || [];
        setPreds(list);
        await buildAvgMap(list);
      }
    } catch {}
    finally { setLoading(false); }
  }, [teacherId]);

  useEffect(() => {
    fetch(`/api/teacher/students/${teacherId}`)
      .then(r=>r.json()).then(d=>{ if(d.success) setStudents((d.students||[]).filter(s=>s.status==="APPROVED")); })
      .catch(()=>{});
    loadPredictions();
  }, [teacherId]);

  const handlePredict = async () => {
    if (!selected) { showToast("Select a student first!", true); return; }
    setRunning(true); setResult(null);
    try {
      const res  = await fetch(`/api/teacher/predict/${selected.id}`, { method:"POST" });
      const data = await res.json();
      if (data.success) {
        setResult(data);
        showToast(`✅ Prediction complete for ${data.studentName}!`);
        await loadPredictions();
      } else { showToast(data.message || "Prediction failed!", true); }
    } catch { showToast("Make sure Flask is running on port 5000!", true); }
    finally { setRunning(false); }
  };

  const totals = {
    ALL:  preds.length,
    PASS: preds.filter(p=>p.status==="A").length,
    RISK: preds.filter(p=>p.status==="R").length,
  };
  const filtered = filter==="ALL" ? preds : preds.filter(p => filter==="PASS" ? p.status==="A" : p.status==="R");

  return (
    <div style={{ padding:"36px", minHeight:"100vh", background:"#f1f5f9", fontFamily:"'Outfit',sans-serif" }}>
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes toastIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.5} }
        .scard { cursor:pointer; transition:all .2s; }
        .scard:hover { transform:translateY(-2px); }
        .scard.sel { border:2px solid #7c3aed !important; box-shadow:0 0 0 4px rgba(124,58,237,.12) !important; }
        .trow { transition:background .18s; }
        .trow:hover { background:#f8fafc !important; }
        .fchip { cursor:pointer; transition:all .2s; border:none; font-family:inherit; }
      `}</style>

      {toast && (
        <div style={{ position:"fixed", bottom:"28px", right:"28px", zIndex:999,
          background:toast.err?"#ef4444":"#0f172a", color:"#fff",
          padding:"12px 22px", borderRadius:"10px", fontSize:"14px", fontWeight:600,
          boxShadow:"0 8px 30px rgba(0,0,0,.25)", animation:"toastIn .35s ease both" }}>
          {toast.msg}
        </div>
      )}

      <div style={{ marginBottom:"28px", animation:"fadeUp .6s ease both" }}>
        <h1 style={{ fontWeight:800, fontSize:"26px", color:"#0f172a", letterSpacing:"-0.5px", marginBottom:"4px" }}>🎯 Predictions</h1>
        <p style={{ fontSize:"14px", color:"#64748b" }}>Run ML predictions for your students and view all results</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:"16px", marginBottom:"28px",
        animation:"fadeUp .6s ease both .05s", opacity:0, animationFillMode:"forwards" }}>
        {[
          { label:"Total Predictions", val:totals.ALL,  grad:"linear-gradient(135deg,#7c3aed,#2563eb)", shadow:"rgba(124,58,237,.3)" },
          { label:"Pass",              val:totals.PASS, grad:"linear-gradient(135deg,#10b981,#059669)", shadow:"rgba(16,185,129,.3)" },
          { label:"At Risk",           val:totals.RISK, grad:"linear-gradient(135deg,#ef4444,#f97316)", shadow:"rgba(239,68,68,.3)"  },
        ].map((c,i) => (
          <div key={i} style={{ background:c.grad, borderRadius:"14px", padding:"20px", boxShadow:`0 6px 20px ${c.shadow}` }}>
            <div style={{ fontWeight:900, fontSize:"32px", color:"#fff", lineHeight:1 }}>{c.val}</div>
            <div style={{ fontSize:"12px", color:"rgba(255,255,255,.75)", fontWeight:500, marginTop:"4px" }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"320px 1fr", gap:"28px",
        animation:"fadeUp .6s ease both .1s", opacity:0, animationFillMode:"forwards" }}>

        {/* Run prediction panel */}
        <div>
          <h2 style={{ fontWeight:700, fontSize:"15px", color:"#0f172a", marginBottom:"14px" }}>Run New Prediction</h2>
          <div style={{ background:"#fff", borderRadius:"16px", padding:"20px", boxShadow:"0 2px 16px rgba(0,0,0,.06)", marginBottom:"16px" }}>
            <p style={{ fontSize:"12px", fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".4px", marginBottom:"12px" }}>Select Student</p>
            <div style={{ display:"flex", flexDirection:"column", gap:"8px", maxHeight:"280px", overflowY:"auto" }}>
              {students.length === 0 ? (
                <div style={{ textAlign:"center", color:"#94a3b8", fontSize:"13px", padding:"20px" }}>No approved students</div>
              ) : students.map(s => (
                <div key={s.id} className={"scard" + (selected?.id===s.id?" sel":"")}
                  onClick={() => { setSelected(s); setResult(null); }}
                  style={{ background:selected?.id===s.id?"rgba(124,58,237,.06)":"#f8fafc",
                    borderRadius:"10px", padding:"11px 14px",
                    border:"2px solid transparent", display:"flex", alignItems:"center", gap:"10px" }}>
                  <div style={{ width:"32px", height:"32px", borderRadius:"50%",
                    background:selected?.id===s.id?"linear-gradient(135deg,#7c3aed,#2563eb)":"#e2e8f0",
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", flexShrink:0 }}>
                    {selected?.id===s.id ? "✓" : "👨‍🎓"}
                  </div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:"13px", color:"#0f172a" }}>{s.name}</div>
                    <div style={{ fontSize:"11px", color:"#94a3b8" }}>{s.studentId}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={handlePredict} disabled={running || !selected}
            style={{ width:"100%", padding:"13px", borderRadius:"10px",
              background:running?"#94a3b8":"linear-gradient(135deg,#7c3aed,#2563eb)",
              color:"#fff", border:"none", fontSize:"15px", fontWeight:700,
              cursor:running||!selected?"not-allowed":"pointer", fontFamily:"inherit",
              boxShadow:running?"none":"0 4px 18px rgba(124,58,237,.4)", transition:"all .2s" }}>
            {running ? (
              <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" }}>
                <span style={{ animation:"pulse 1s infinite" }}>⚙️</span> Running ML Model…
              </span>
            ) : "🚀 Run Prediction"}
          </button>

          {result && (() => {
            const isRisk = result.status === "R";
            const ps = PRED_STYLE[result.status];
            return (
              <div style={{ background:isRisk?"rgba(239,68,68,.05)":"rgba(16,185,129,.05)",
                border:`1.5px solid ${isRisk?"rgba(239,68,68,.25)":"rgba(16,185,129,.25)"}`,
                borderRadius:"14px", padding:"20px", marginTop:"16px" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"14px" }}>
                  <span style={{ fontWeight:700, fontSize:"14px", color:"#0f172a" }}>{result.studentName}</span>
                  <span style={{ background:ps.grad, color:"#fff", borderRadius:"100px", padding:"4px 14px", fontSize:"12px", fontWeight:700 }}>{ps.label}</span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"12px" }}>
                  {[
                    { label:"Average", val: result.average },
                    { label:"Cluster", val: result.clusterGroup ?? "N/A" },
                    { label:"Pass %",  val: `${result.passProbability?.toFixed(1)}%` },
                    { label:"Risk %",  val: `${result.riskProbability?.toFixed(1)}%` },
                  ].map((m,i) => (
                    <div key={i} style={{ background:"rgba(255,255,255,.7)", borderRadius:"8px", padding:"10px 12px" }}>
                      <div style={{ fontSize:"11px", color:"#94a3b8", fontWeight:600 }}>{m.label}</div>
                      <div style={{ fontWeight:800, fontSize:"18px", color:isRisk?"#ef4444":"#10b981", marginTop:"2px" }}>{m.val}</div>
                    </div>
                  ))}
                </div>
                {result.weakTests?.length > 0 && (
                  <div style={{ background:"rgba(239,68,68,.06)", borderRadius:"8px", padding:"10px 12px" }}>
                    <div style={{ fontSize:"11px", color:"#94a3b8", fontWeight:700, marginBottom:"6px" }}>WEAK TESTS</div>
                    <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                      {result.weakTests.map((t,i) => (
                        <span key={i} style={{ background:"rgba(239,68,68,.12)", color:"#ef4444", borderRadius:"6px", padding:"3px 9px", fontSize:"11px", fontWeight:700 }}>{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* All predictions table */}
        <div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"14px" }}>
            <h2 style={{ fontWeight:700, fontSize:"15px", color:"#0f172a" }}>All Prediction Results</h2>
            <div style={{ display:"flex", gap:"8px" }}>
              {["ALL","PASS","RISK"].map(f => (
                <button key={f} className="fchip" onClick={() => setFilter(f)}
                  style={{ padding:"7px 16px", borderRadius:"100px", fontSize:"12px", fontWeight:600,
                    background:filter===f?(f==="PASS"?"#10b981":f==="RISK"?"#ef4444":"#7c3aed"):"#fff",
                    color:filter===f?"#fff":"#64748b",
                    border:filter===f?"none":"1.5px solid #e2e8f0" }}>
                  {f} ({totals[f] ?? preds.length})
                </button>
              ))}
            </div>
          </div>

          <div style={{ background:"#fff", borderRadius:"16px", boxShadow:"0 2px 16px rgba(0,0,0,.06)", overflow:"hidden" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr 1fr 1fr 1fr 1fr", gap:"12px",
              padding:"14px 24px", background:"#f8fafc", borderBottom:"1px solid #e2e8f0" }}>
              {["Student","Status","Average","Pass %","Risk %","Weak Tests"].map(h => (
                <div key={h} style={{ fontSize:"11px", fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".5px" }}>{h}</div>
              ))}
            </div>

            {loading ? (
              <div style={{ padding:"48px", textAlign:"center", color:"#94a3b8", fontSize:"14px" }}>Loading…</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding:"48px", textAlign:"center" }}>
                <div style={{ fontSize:"40px", marginBottom:"10px" }}>📭</div>
                <div style={{ fontSize:"14px", color:"#94a3b8" }}>No predictions yet.</div>
              </div>
            ) : filtered.map((p,i) => {
              const ps  = PRED_STYLE[p.status] || PRED_STYLE.A;
              const avg = avgMap[p.student?.id];
              return (
                <div key={p.id} className="trow"
                  style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr 1fr 1fr 1fr 1fr", gap:"12px",
                    padding:"14px 24px", borderBottom:i<filtered.length-1?"1px solid #f8fafc":"none", alignItems:"center" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                    <div style={{ width:"30px", height:"30px", borderRadius:"50%",
                      background:"linear-gradient(135deg,#7c3aed,#2563eb)",
                      display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px", flexShrink:0 }}>👨‍🎓</div>
                    <span style={{ fontWeight:600, fontSize:"13px", color:"#0f172a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {p.student?.name || "—"}
                    </span>
                  </div>
                  <div>
                    <span style={{ background:ps.bg, color:ps.color, border:`1px solid ${ps.border}`,
                      borderRadius:"100px", padding:"3px 10px", fontSize:"11px", fontWeight:700 }}>{ps.label}</span>
                  </div>
                  <div style={{ fontWeight:800, fontSize:"15px",
                    color: avg ? (Number(avg) >= 7 ? "#10b981" : "#ef4444") : "#94a3b8" }}>
                    {avg ?? "—"}
                  </div>
                  <div style={{ fontWeight:700, fontSize:"13px", color:"#10b981" }}>
                    {p.passProbability != null ? `${(p.passProbability*100).toFixed(1)}%` : "—"}
                  </div>
                  <div style={{ fontWeight:700, fontSize:"13px", color:"#ef4444" }}>
                    {p.riskProbability != null ? `${(p.riskProbability*100).toFixed(1)}%` : "—"}
                  </div>
                  <div style={{ fontSize:"11px", color:"#ef4444", fontWeight:600 }}>
                    {p.weakTests || "None"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <footer style={{ padding:"20px 0 0", borderTop:"1px solid #e2e8f0", marginTop:"40px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
            <div style={{ width:"24px", height:"24px", borderRadius:"6px", background:"linear-gradient(135deg,#7c3aed,#2563eb)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px" }}>⚡</div>
            <span style={{ fontWeight:700, fontSize:"13px", color:"#0f172a" }}>EduPredict</span>
          </div>
          <span style={{ fontSize:"12px", color:"#94a3b8" }}>© 2025 EduPredict · IEEE Research by Chicon et al.</span>
        </div>
      </footer>
    </div>
  );
}