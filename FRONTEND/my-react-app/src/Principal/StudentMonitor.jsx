import { useEffect, useState } from "react";

const STATUS_STYLE = {
  APPROVED: { bg:"rgba(16,185,129,.10)",  color:"#059669", border:"rgba(16,185,129,.25)" },
  PENDING:  { bg:"rgba(245,158,11,.10)",  color:"#d97706", border:"rgba(245,158,11,.25)" },
  REJECTED: { bg:"rgba(239,68,68,.10)",   color:"#dc2626", border:"rgba(239,68,68,.25)"  },
};

export default function StudentMonitor() {
  const [predictions, setPredictions] = useState([]);
  const [counts,      setCounts]      = useState({ total:0, pass:0, risk:0, pending:0, approved:0, rejected:0 });
  const [avgMap,      setAvgMap]      = useState({});
  const [loading,     setLoading]     = useState(true);
  const [view,        setView]        = useState("RISK"); // "RISK" | "PASS" | "ALL"
  const [search,      setSearch]      = useState("");

  const buildAvgMap = async (list) => {
    const map = {};
    await Promise.all((list||[]).map(async p => {
      const sid = p.student?.id;
      if (!sid) return;
      try {
        const r  = await fetch(`/api/student/scores/${sid}`);
        const sd = await r.json();
        if (sd.success)
          map[sid] = ((sd.test1+sd.test2+sd.test3+sd.test4+sd.mainExam)/5).toFixed(2);
      } catch {}
    }));
    setAvgMap(map);
  };

  useEffect(() => {
    fetch("/api/principal/monitor")
      .then(r => r.json())
      .then(async d => {
        if (d.success) {
          const list = d.predictions || [];
          setPredictions(list);
          setCounts({
            total:    d.totalStudents    || 0,
            pass:     d.totalPass        || 0,
            risk:     d.totalAtRisk      || 0,
            pending:  d.pendingStudents  || 0,
            approved: d.approvedStudents || 0,
            rejected: d.rejectedStudents || 0,
          });
          await buildAvgMap(list);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const riskList = predictions.filter(p => p.status === "R");
  const passList = predictions.filter(p => p.status === "A");

  const applySearch = (list) => {
    if (!search) return list;
    return list.filter(p => {
      const s = p.student || {};
      return s.name?.toLowerCase().includes(search.toLowerCase()) ||
             s.email?.toLowerCase().includes(search.toLowerCase()) ||
             s.studentId?.toLowerCase().includes(search.toLowerCase()) ||
             s.teacher?.name?.toLowerCase().includes(search.toLowerCase());
    });
  };

  const displayList = applySearch(
    view === "RISK" ? riskList :
    view === "PASS" ? passList :
    predictions
  );

  return (
    <div style={{ padding:"36px", minHeight:"100vh", background:"#f1f5f9", fontFamily:"'Outfit',sans-serif" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .trow { transition:background .18s; }
        .trow:hover { background:#fafafa !important; }
        .srch:focus { outline:none; border-color:#ef4444 !important; box-shadow:0 0 0 3px rgba(239,68,68,.10); }
        .vtab { cursor:pointer; transition:all .25s; border:none; font-family:inherit; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom:"28px", animation:"fadeUp .6s ease both" }}>
        <h1 style={{ fontWeight:800, fontSize:"26px", color:"#0f172a", letterSpacing:"-0.5px", marginBottom:"4px" }}>
          👥 Monitor Students
        </h1>
        <p style={{ fontSize:"14px", color:"#64748b" }}>
          Track at-risk students, intervene early and monitor overall performance
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:"16px", marginBottom:"32px",
        animation:"fadeUp .6s ease both .05s", opacity:0, animationFillMode:"forwards" }}>
        {[
          { label:"Total Students", val:counts.total,    grad:"linear-gradient(135deg,#7c3aed,#2563eb)", shadow:"rgba(124,58,237,.3)" },
          { label:"Approved",       val:counts.approved, grad:"linear-gradient(135deg,#10b981,#059669)", shadow:"rgba(16,185,129,.3)" },
          { label:"Pending",        val:counts.pending,  grad:"linear-gradient(135deg,#f59e0b,#fb923c)", shadow:"rgba(245,158,11,.3)" },
          { label:"Passing",        val:counts.pass,     grad:"linear-gradient(135deg,#0891b2,#38bdf8)", shadow:"rgba(8,145,178,.3)"  },
          { label:"At Risk ⚠️",     val:counts.risk,     grad:"linear-gradient(135deg,#ef4444,#f97316)", shadow:"rgba(239,68,68,.4)"  },
        ].map((c,i) => (
          <div key={i} style={{ background:c.grad, borderRadius:"14px", padding:"18px 20px",
            boxShadow:`0 6px 20px ${c.shadow}`,
            transform: i===4 ? "scale(1.03)" : "scale(1)",
            outline: i===4 ? "2px solid rgba(239,68,68,.4)" : "none" }}>
            <div style={{ fontWeight:900, fontSize:"32px", color:"#fff", lineHeight:1 }}>{c.val}</div>
            <div style={{ fontSize:"13px", color:"rgba(255,255,255,.80)", fontWeight:600, marginTop:"4px" }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* View switcher — the main focus toggle */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"16px", marginBottom:"28px",
        animation:"fadeUp .6s ease both .1s", opacity:0, animationFillMode:"forwards" }}>

        {/* AT RISK tab */}
        <button className="vtab" onClick={() => setView("RISK")}
          style={{ padding:"20px 24px", borderRadius:"16px", textAlign:"left",
            background: view==="RISK"
              ? "linear-gradient(135deg,#ef4444,#f97316)"
              : "#fff",
            boxShadow: view==="RISK"
              ? "0 8px 28px rgba(239,68,68,.40)"
              : "0 2px 16px rgba(0,0,0,.06)",
            border: view==="RISK" ? "none" : "2px solid #fee2e2",
            transform: view==="RISK" ? "translateY(-3px)" : "translateY(0)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"10px" }}>
            <span style={{ fontSize:"28px" }}>⚠️</span>
            <span style={{ fontWeight:800, fontSize:"22px", color: view==="RISK"?"#fff":"#ef4444" }}>
              {counts.risk}
            </span>
          </div>
          <div style={{ fontWeight:700, fontSize:"15px", color: view==="RISK"?"#fff":"#0f172a", marginBottom:"4px" }}>
            At Risk Students
          </div>
          <div style={{ fontSize:"12px", color: view==="RISK"?"rgba(255,255,255,.75)":"#94a3b8" }}>
            Need immediate attention & intervention
          </div>
          {view==="RISK" && (
            <div style={{ marginTop:"10px", background:"rgba(255,255,255,.20)", borderRadius:"8px",
              padding:"6px 12px", fontSize:"11px", color:"#fff", fontWeight:700, width:"fit-content" }}>
              ● Currently viewing
            </div>
          )}
        </button>

        {/* PASS tab */}
        <button className="vtab" onClick={() => setView("PASS")}
          style={{ padding:"20px 24px", borderRadius:"16px", textAlign:"left",
            background: view==="PASS"
              ? "linear-gradient(135deg,#10b981,#059669)"
              : "#fff",
            boxShadow: view==="PASS"
              ? "0 8px 28px rgba(16,185,129,.40)"
              : "0 2px 16px rgba(0,0,0,.06)",
            border: view==="PASS" ? "none" : "2px solid #d1fae5",
            transform: view==="PASS" ? "translateY(-3px)" : "translateY(0)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"10px" }}>
            <span style={{ fontSize:"28px" }}>✅</span>
            <span style={{ fontWeight:800, fontSize:"22px", color: view==="PASS"?"#fff":"#10b981" }}>
              {counts.pass}
            </span>
          </div>
          <div style={{ fontWeight:700, fontSize:"15px", color: view==="PASS"?"#fff":"#0f172a", marginBottom:"4px" }}>
            Passing Students
          </div>
          <div style={{ fontSize:"12px", color: view==="PASS"?"rgba(255,255,255,.75)":"#94a3b8" }}>
            On track — performing above threshold
          </div>
          {view==="PASS" && (
            <div style={{ marginTop:"10px", background:"rgba(255,255,255,.20)", borderRadius:"8px",
              padding:"6px 12px", fontSize:"11px", color:"#fff", fontWeight:700, width:"fit-content" }}>
              ● Currently viewing
            </div>
          )}
        </button>

        {/* ALL tab */}
        <button className="vtab" onClick={() => setView("ALL")}
          style={{ padding:"20px 24px", borderRadius:"16px", textAlign:"left",
            background: view==="ALL"
              ? "linear-gradient(135deg,#7c3aed,#2563eb)"
              : "#fff",
            boxShadow: view==="ALL"
              ? "0 8px 28px rgba(124,58,237,.35)"
              : "0 2px 16px rgba(0,0,0,.06)",
            border: view==="ALL" ? "none" : "2px solid #ede9fe",
            transform: view==="ALL" ? "translateY(-3px)" : "translateY(0)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"10px" }}>
            <span style={{ fontSize:"28px" }}>📋</span>
            <span style={{ fontWeight:800, fontSize:"22px", color: view==="ALL"?"#fff":"#7c3aed" }}>
              {predictions.length}
            </span>
          </div>
          <div style={{ fontWeight:700, fontSize:"15px", color: view==="ALL"?"#fff":"#0f172a", marginBottom:"4px" }}>
            All Predictions
          </div>
          <div style={{ fontSize:"12px", color: view==="ALL"?"rgba(255,255,255,.75)":"#94a3b8" }}>
            Full overview of every prediction run
          </div>
          {view==="ALL" && (
            <div style={{ marginTop:"10px", background:"rgba(255,255,255,.20)", borderRadius:"8px",
              padding:"6px 12px", fontSize:"11px", color:"#fff", fontWeight:700, width:"fit-content" }}>
              ● Currently viewing
            </div>
          )}
        </button>
      </div>

      {/* Section header + search */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"16px",
        animation:"fadeUp .5s ease both .15s", opacity:0, animationFillMode:"forwards" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <div style={{ width:"4px", height:"28px", borderRadius:"2px",
            background: view==="RISK"?"linear-gradient(#ef4444,#f97316)":
                        view==="PASS"?"linear-gradient(#10b981,#059669)":
                        "linear-gradient(#7c3aed,#2563eb)" }} />
          <div>
            <h2 style={{ fontWeight:800, fontSize:"17px", color:"#0f172a", margin:0 }}>
              {view==="RISK" ? "⚠️ At Risk Students" :
               view==="PASS" ? "✅ Passing Students" : "📋 All Predictions"}
            </h2>
            <p style={{ fontSize:"12px", color:"#94a3b8", margin:0, marginTop:"2px" }}>
              {view==="RISK"
                ? `${displayList.length} student${displayList.length!==1?"s":""} need your attention`
                : view==="PASS"
                ? `${displayList.length} student${displayList.length!==1?"s":""} performing well`
                : `${displayList.length} total prediction${displayList.length!==1?"s":""}`}
            </p>
          </div>
        </div>
        <input className="srch" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search name, ID, email, teacher…"
          style={{ padding:"9px 16px", borderRadius:"100px", border:"1.5px solid #e2e8f0",
            fontSize:"13px", fontFamily:"'Outfit',sans-serif", background:"#fff", color:"#0f172a",
            minWidth:"260px", transition:"border-color .2s, box-shadow .2s" }} />
      </div>

      {/* At Risk attention banner */}
      {view === "RISK" && !loading && riskList.length > 0 && (
        <div style={{ background:"linear-gradient(135deg,rgba(239,68,68,.08),rgba(249,115,22,.06))",
          border:"1.5px solid rgba(239,68,68,.25)", borderRadius:"12px", padding:"14px 20px",
          marginBottom:"16px", display:"flex", alignItems:"center", gap:"14px",
          animation:"fadeIn .5s ease both" }}>
          <span style={{ fontSize:"24px" }}>🚨</span>
          <div>
            <div style={{ fontWeight:700, fontSize:"14px", color:"#dc2626" }}>
              {riskList.length} student{riskList.length!==1?"s are":" is"} at risk of dropout
            </div>
            <div style={{ fontSize:"12px", color:"#94a3b8", marginTop:"2px" }}>
              Review their weak tests and cluster groups below. Contact their teachers to arrange targeted support.
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ background:"#fff", borderRadius:"16px", boxShadow:"0 2px 16px rgba(0,0,0,.06)", overflow:"hidden",
        animation:"fadeUp .6s ease both .2s", opacity:0, animationFillMode:"forwards",
        border: view==="RISK" ? "1.5px solid rgba(239,68,68,.15)" :
                view==="PASS" ? "1.5px solid rgba(16,185,129,.15)" : "1.5px solid transparent" }}>

        {/* Table header */}
        <div style={{ display:"grid",
          gridTemplateColumns: view==="RISK" ? "1.2fr 1fr 1.4fr 1fr 1fr 1fr 1fr 1fr" : "1.2fr 1fr 1.4fr 1fr 1fr 1fr 1fr",
          gap:"10px", padding:"13px 24px",
          background: view==="RISK" ? "linear-gradient(135deg,rgba(239,68,68,.06),rgba(249,115,22,.04))" :
                      view==="PASS" ? "linear-gradient(135deg,rgba(16,185,129,.06),rgba(5,150,105,.04))" :
                      "#f8fafc",
          borderBottom:"1px solid #e2e8f0" }}>
          {[
            "Student", "ID", "Email", "Teacher",
            "Average", "Pass %", "Risk %",
            ...(view==="RISK" ? ["Weak Tests"] : [])
          ].map(h => (
            <div key={h} style={{ fontSize:"11px", fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".5px" }}>{h}</div>
          ))}
        </div>

        {loading ? (
          <div style={{ padding:"56px", textAlign:"center", color:"#94a3b8", fontSize:"14px" }}>
            Loading students…
          </div>
        ) : displayList.length === 0 ? (
          <div style={{ padding:"56px", textAlign:"center" }}>
            <div style={{ fontSize:"48px", marginBottom:"12px" }}>
              {view==="RISK" ? "🎉" : view==="PASS" ? "📭" : "🔍"}
            </div>
            <div style={{ fontWeight:700, fontSize:"16px", color:"#0f172a", marginBottom:"6px" }}>
              {view==="RISK" ? "No at-risk students!" :
               view==="PASS" ? "No passing students yet." :
               search ? "No students match your search." : "No predictions run yet."}
            </div>
            <div style={{ fontSize:"13px", color:"#94a3b8" }}>
              {view==="RISK" ? "All predicted students are currently passing." :
               view==="PASS" ? "Teachers need to run predictions first." :
               "Teachers must enter scores and run ML predictions."}
            </div>
          </div>
        ) : displayList.map((p, i) => {
          const s   = p.student || {};
          const st  = STATUS_STYLE[s.status] || STATUS_STYLE.PENDING;
          const avg = avgMap[s.id];
          const isRisk = p.status === "R";
          return (
            <div key={p.id} className="trow"
              style={{ display:"grid",
                gridTemplateColumns: view==="RISK" ? "1.2fr 1fr 1.4fr 1fr 1fr 1fr 1fr 1fr" : "1.2fr 1fr 1.4fr 1fr 1fr 1fr 1fr",
                gap:"10px", padding:"14px 24px",
                borderBottom: i<displayList.length-1 ? "1px solid #f8fafc" : "none",
                alignItems:"center",
                background: isRisk && view==="RISK" ? "rgba(254,242,242,.4)" : "#fff" }}>

              {/* Student name */}
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <div style={{ width:"34px", height:"34px", borderRadius:"50%", flexShrink:0,
                  background: isRisk
                    ? "linear-gradient(135deg,#ef4444,#f97316)"
                    : "linear-gradient(135deg,#10b981,#059669)",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px" }}>
                  {isRisk ? "⚠️" : "✅"}
                </div>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:"13px", color:"#0f172a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {s.name || "—"}
                  </div>
                  <div>
                    <span style={{ background:st.bg, color:st.color, border:`1px solid ${st.border}`,
                      borderRadius:"100px", padding:"1px 7px", fontSize:"10px", fontWeight:700 }}>
                      {s.status || "—"}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ fontSize:"12px", color:"#64748b", fontWeight:600 }}>{s.studentId || "—"}</div>
              <div style={{ fontSize:"12px", color:"#64748b", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.email || "—"}</div>
              <div style={{ fontSize:"12px", color:"#64748b", fontWeight:500 }}>{s.teacher?.name || "—"}</div>

              {/* Average */}
              <div style={{ fontWeight:800, fontSize:"15px",
                color: avg ? (Number(avg)>=7 ? "#10b981" : "#ef4444") : "#94a3b8" }}>
                {avg ?? "—"}
              </div>

              {/* Pass % */}
              <div>
                <div style={{ fontWeight:700, fontSize:"13px", color:"#10b981", marginBottom:"3px" }}>
                  {p.passProbability != null ? `${(p.passProbability*100).toFixed(1)}%` : "—"}
                </div>
                {p.passProbability != null && (
                  <div style={{ height:"4px", borderRadius:"2px", background:"#f1f5f9", width:"60px" }}>
                    <div style={{ height:"100%", borderRadius:"2px", background:"#10b981",
                      width:`${Math.min(p.passProbability*100,100)}%` }} />
                  </div>
                )}
              </div>

              {/* Risk % */}
              <div>
                <div style={{ fontWeight:700, fontSize:"13px", color:"#ef4444", marginBottom:"3px" }}>
                  {p.riskProbability != null ? `${(p.riskProbability*100).toFixed(1)}%` : "—"}
                </div>
                {p.riskProbability != null && (
                  <div style={{ height:"4px", borderRadius:"2px", background:"#f1f5f9", width:"60px" }}>
                    <div style={{ height:"100%", borderRadius:"2px", background:"#ef4444",
                      width:`${Math.min(p.riskProbability*100,100)}%` }} />
                  </div>
                )}
              </div>

              {/* Weak Tests — only shown in RISK view */}
              {view==="RISK" && (
                <div style={{ display:"flex", flexWrap:"wrap", gap:"4px" }}>
                  {p.weakTests
                    ? p.weakTests.split(",").map((t,j) => (
                        <span key={j} style={{ background:"rgba(239,68,68,.10)", color:"#dc2626",
                          border:"1px solid rgba(239,68,68,.22)", borderRadius:"6px",
                          padding:"2px 7px", fontSize:"10px", fontWeight:700 }}>
                          {t.trim()}
                        </span>
                      ))
                    : <span style={{ fontSize:"11px", color:"#94a3b8" }}>None</span>
                  }
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      {!loading && counts.total > predictions.length && (
        <div style={{ marginTop:"14px", background:"rgba(245,158,11,.08)", border:"1px solid rgba(245,158,11,.22)",
          borderRadius:"10px", padding:"12px 18px", fontSize:"13px", color:"#d97706", fontWeight:500 }}>
          ℹ️ {counts.total - predictions.length} student(s) have no prediction run yet — not shown here.
          Teachers must enter scores and run predictions first.
        </div>
      )}

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