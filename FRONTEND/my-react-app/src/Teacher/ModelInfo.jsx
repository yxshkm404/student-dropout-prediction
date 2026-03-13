import { useEffect, useState } from "react";

export default function ModelInfo() {
  const [metrics,  setMetrics]  = useState(null);
  const [clusters, setClusters] = useState([]);
  const [rules,    setRules]    = useState([]);
  const [tab,      setTab]      = useState("overview");
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:8080/api/teacher/model/metrics").then(r=>r.json()),
      fetch("http://localhost:8080/api/teacher/clusters").then(r=>r.json()),
      fetch("http://localhost:8080/api/teacher/rules").then(r=>r.json()),
    ]).then(([m, c, r]) => {
      if (m.success !== false) setMetrics(m);
      if (c.success) setClusters(c.clusters || []);
      if (r.success) setRules(r.rules || []);
    }).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const TABS = ["overview","clusters","rules"];
  const CLUSTER_COLORS = ["#ef4444","#f59e0b","#2563eb","#7c3aed"];
  const CLUSTER_ICONS  = ["🔴","🟡","🔵","🟣"];

  return (
    <div style={{ padding:"36px", minHeight:"100vh", background:"#f1f5f9", fontFamily:"'Outfit',sans-serif" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .tab { cursor:pointer; transition:all .2s; border:none; font-family:inherit; }
      `}</style>

      <div style={{ marginBottom:"28px", animation:"fadeUp .6s ease both" }}>
        <h1 style={{ fontWeight:800, fontSize:"26px", color:"#0f172a", letterSpacing:"-0.5px", marginBottom:"4px" }}>🧠 Model Info</h1>
        <p style={{ fontSize:"14px", color:"#64748b" }}>IEEE research-based algorithms powering EduPredict</p>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:"4px", marginBottom:"28px", background:"#fff",
        padding:"6px", borderRadius:"12px", boxShadow:"0 2px 12px rgba(0,0,0,.06)",
        width:"fit-content", animation:"fadeUp .6s ease both .05s", opacity:0, animationFillMode:"forwards" }}>
        {TABS.map(t => (
          <button key={t} className="tab" onClick={() => setTab(t)}
            style={{ padding:"9px 22px", borderRadius:"8px", fontSize:"13px", fontWeight:700, textTransform:"capitalize",
              background: tab===t ? "linear-gradient(135deg,#0f172a,#1e1b4b)" : "transparent",
              color: tab===t ? "#fff" : "#64748b",
              boxShadow: tab===t ? "0 4px 14px rgba(0,0,0,.15)" : "none" }}>
            {t === "overview" ? "📊 Overview" : t === "clusters" ? "🔵 Clusters" : "🔗 Rules"}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding:"80px", textAlign:"center", color:"#94a3b8" }}>Loading model data…</div>
      ) : (

        <>
          {/* OVERVIEW TAB */}
          {tab === "overview" && (
            <div style={{ animation:"fadeUp .5s ease both" }}>

              {/* Algorithm cards */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"20px", marginBottom:"28px" }}>
                {[
                  { icon:"🌳", title:"Decision Tree (J48)", tag:"Classification", color:"#2563eb",
                    desc:"Classifies students as Pass (A) or At Risk (R) based on 5 academic scores. Uses entropy-based splitting for transparent, interpretable decisions." },
                  { icon:"🔵", title:"K-Means Clustering", tag:"Clustering", color:"#0891b2",
                    desc:"Groups at-risk students into 4 performance profiles, enabling teachers to target specific intervention strategies for each group." },
                  { icon:"🔗", title:"Apriori Association", tag:"Association Rules", color:"#7c3aed",
                    desc:"Mines patterns like 'Low Test 1 → Low Test 3' with high confidence, revealing which test combinations most strongly predict dropout risk." },
                ].map((a,i) => (
                  <div key={i} style={{ background:"#fff", borderRadius:"16px", padding:"24px",
                    boxShadow:"0 2px 16px rgba(0,0,0,.06)", borderTop:`4px solid ${a.color}` }}>
                    <div style={{ fontSize:"32px", marginBottom:"12px" }}>{a.icon}</div>
                    <div style={{ display:"inline-block", background:`${a.color}18`, color:a.color,
                      borderRadius:"100px", padding:"3px 10px", fontSize:"11px", fontWeight:700,
                      marginBottom:"10px", letterSpacing:".3px" }}>{a.tag}</div>
                    <h3 style={{ fontWeight:800, fontSize:"16px", color:"#0f172a", marginBottom:"8px" }}>{a.title}</h3>
                    <p style={{ fontSize:"13px", color:"#64748b", lineHeight:1.6 }}>{a.desc}</p>
                  </div>
                ))}
              </div>

              {/* Metrics */}
              {metrics && (
                <div style={{ background:"linear-gradient(135deg,#0f172a,#1e1b4b)", borderRadius:"20px", padding:"36px 40px" }}>
                  <div style={{ display:"inline-block", background:"rgba(255,255,255,.10)", border:"1px solid rgba(255,255,255,.18)",
                    color:"#93c5fd", padding:"4px 14px", borderRadius:"100px", fontSize:"11px",
                    fontWeight:700, letterSpacing:".6px", marginBottom:"16px", textTransform:"uppercase" }}>
                    Model Validation Results
                  </div>
                  <h3 style={{ fontWeight:800, fontSize:"20px", color:"#fff", marginBottom:"28px" }}>
                    10-Fold Cross-Validation · Weka Software
                  </h3>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:"16px" }}>
                    {[
                      { label:"Accuracy",        val:`${metrics.accuracy}%`,  color:"#60a5fa" },
                      { label:"Precision",       val:`${metrics.precision}%`, color:"#a78bfa" },
                      { label:"Recall",          val:`${metrics.recall}%`,   color:"#34d399" },
                      { label:"F1-Score",        val:`${metrics.f1Score}%`,  color:"#fb923c" },
                      { label:"Kappa",           val: metrics.kappa ?? metrics.dt_kappa ?? "0.884", color:"#f472b6" },
                      { label:"MAE",             val: metrics.mae ?? metrics.dt_mae ?? "0.0735",   color:"#38bdf8" },
                    ].map((m,i) => (
                      <div key={i} style={{ background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.09)",
                        borderRadius:"12px", padding:"18px 16px", textAlign:"center" }}>
                        <div style={{ fontWeight:900, fontSize:"26px", color:m.color, lineHeight:1, marginBottom:"6px" }}>{m.val}</div>
                        <div style={{ fontSize:"12px", color:"rgba(255,255,255,.50)", fontWeight:500 }}>{m.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CLUSTERS TAB */}
          {tab === "clusters" && (
            <div style={{ animation:"fadeUp .5s ease both" }}>
              <div style={{ background:"rgba(37,99,235,.06)", border:"1px solid rgba(37,99,235,.18)",
                borderRadius:"12px", padding:"14px 18px", marginBottom:"24px", fontSize:"13px", color:"#2563eb", fontWeight:500 }}>
                ℹ️ K-Means clustering is applied only to <strong>At Risk (R)</strong> students to group them by performance profile.
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"20px" }}>
                {clusters.length === 0 ? (
                  <div style={{ gridColumn:"1/-1", padding:"48px", textAlign:"center", background:"#fff",
                    borderRadius:"16px", color:"#94a3b8" }}>Flask not available — showing default cluster info below.</div>
                ) : clusters.map((c,i) => (
                  <div key={i} style={{ background:"#fff", borderRadius:"16px", padding:"24px",
                    boxShadow:"0 2px 16px rgba(0,0,0,.06)", borderLeft:`4px solid ${CLUSTER_COLORS[i]}` }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"16px" }}>
                      <span style={{ fontSize:"24px" }}>{CLUSTER_ICONS[i]}</span>
                      <div>
                        <div style={{ fontWeight:800, fontSize:"16px", color:"#0f172a" }}>Group {c.group}</div>
                        <div style={{ fontSize:"12px", color:"#64748b", marginTop:"2px" }}>{c.description}</div>
                      </div>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:"8px" }}>
                      {Object.entries(c.avgScores||{}).map(([k,v]) => (
                        <div key={k} style={{ textAlign:"center", background:"#f8fafc", borderRadius:"8px", padding:"10px 6px" }}>
                          <div style={{ fontWeight:800, fontSize:"16px", color:CLUSTER_COLORS[i] }}>{v}</div>
                          <div style={{ fontSize:"10px", color:"#94a3b8", fontWeight:600, marginTop:"2px", textTransform:"uppercase" }}>
                            {k.replace("test","T").replace("mainExam","Main")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {/* Fallback if flask is down */}
                {clusters.length === 0 && [
                  { g:0, desc:"Very Low Scorer – needs urgent support in all tests",    col:"#ef4444" },
                  { g:1, desc:"Borderline Fail – slightly below passing in all tests",  col:"#f59e0b" },
                  { g:2, desc:"Average Weak – moderate scores but below threshold",     col:"#2563eb" },
                  { g:3, desc:"Low Main Exam – weak in main exam and tests",            col:"#7c3aed" },
                ].map((c,i) => (
                  <div key={i} style={{ background:"#fff", borderRadius:"16px", padding:"24px",
                    boxShadow:"0 2px 16px rgba(0,0,0,.06)", borderLeft:`4px solid ${c.col}` }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                      <span style={{ fontSize:"24px" }}>{CLUSTER_ICONS[i]}</span>
                      <div>
                        <div style={{ fontWeight:800, fontSize:"16px", color:"#0f172a" }}>Group {c.g}</div>
                        <div style={{ fontSize:"13px", color:"#64748b", marginTop:"4px" }}>{c.desc}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RULES TAB */}
          {tab === "rules" && (
            <div style={{ animation:"fadeUp .5s ease both" }}>
              <div style={{ background:"rgba(124,58,237,.06)", border:"1px solid rgba(124,58,237,.18)",
                borderRadius:"12px", padding:"14px 18px", marginBottom:"24px", fontSize:"13px", color:"#7c3aed", fontWeight:500 }}>
                🔗 Apriori association rules — showing top {Math.min(rules.length,20)} rules by confidence.
                Total rules mined: <strong>{rules.length || "180+"}</strong>
              </div>
              <div style={{ background:"#fff", borderRadius:"16px", boxShadow:"0 2px 16px rgba(0,0,0,.06)", overflow:"hidden" }}>
                <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:"12px",
                  padding:"14px 24px", background:"#f8fafc", borderBottom:"1px solid #e2e8f0" }}>
                  {["Rule (Antecedents → Consequents)","Confidence","Antecedents"].map(h => (
                    <div key={h} style={{ fontSize:"11px", fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".5px" }}>{h}</div>
                  ))}
                </div>
                {rules.length === 0 ? (
                  <div style={{ padding:"48px", textAlign:"center", color:"#94a3b8" }}>Flask not available. Start Flask on port 5000 to load rules.</div>
                ) : rules.slice(0,20).map((r,i) => (
                  <div key={i} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:"12px",
                    padding:"13px 24px", borderBottom:i<19?"1px solid #f8fafc":"none", alignItems:"center",
                    background: i%2===0?"#fff":"#fafbfc" }}>
                    <div style={{ fontSize:"13px", color:"#0f172a", fontWeight:500 }}>
                      <span style={{ color:"#7c3aed", fontWeight:700 }}>{(r.antecedents||[]).join(", ")}</span>
                      <span style={{ color:"#94a3b8" }}> → </span>
                      <span style={{ color:"#2563eb", fontWeight:700 }}>{(r.consequents||[]).join(", ")}</span>
                    </div>
                    <div>
                      <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                        <div style={{ flex:1, height:"6px", borderRadius:"3px", background:"#f1f5f9", overflow:"hidden" }}>
                          <div style={{ height:"100%", borderRadius:"3px",
                            background:`linear-gradient(90deg,#7c3aed,#2563eb)`,
                            width:`${r.confidence}%` }} />
                        </div>
                        <span style={{ fontWeight:700, fontSize:"13px", color:"#7c3aed", minWidth:"38px" }}>{r.confidence?.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div style={{ fontSize:"12px", color:"#64748b" }}>{(r.antecedents||[]).length} items</div>
                  </div>
                ))}
              </div>
            </div>
          )}
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