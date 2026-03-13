import { useEffect, useState } from "react";

export default function MyPrediction() {
  const studentId = sessionStorage.getItem("id");
  const [pred,    setPred]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:8080/api/student/prediction/${studentId}`)
      .then(r=>r.json()).then(d=>{ if(d.success) setPred(d); })
      .catch(()=>{}).finally(()=>setLoading(false));
  }, [studentId]);

  const isRisk = pred?.status === "R";

  return (
    <div style={{ padding:"36px", minHeight:"100vh", background:"#f1f5f9", fontFamily:"'Outfit',sans-serif" }}>
      <style>{`@keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }`}</style>

      <div style={{ marginBottom:"28px", animation:"fadeUp .6s ease both" }}>
        <h1 style={{ fontWeight:800, fontSize:"26px", color:"#0f172a", letterSpacing:"-0.5px", marginBottom:"4px" }}>🎯 My Prediction</h1>
        <p style={{ fontSize:"14px", color:"#64748b" }}>Your AI-powered dropout risk prediction result</p>
      </div>

      {loading ? (
        <div style={{ padding:"80px", textAlign:"center", color:"#94a3b8" }}>Loading…</div>
      ) : !pred ? (
        <div style={{ background:"#fff", borderRadius:"20px", padding:"60px", textAlign:"center", boxShadow:"0 2px 16px rgba(0,0,0,.06)" }}>
          <div style={{ fontSize:"56px", marginBottom:"16px" }}>🔮</div>
          <h2 style={{ fontWeight:700, fontSize:"20px", color:"#0f172a", marginBottom:"8px" }}>No Prediction Yet</h2>
          <p style={{ fontSize:"14px", color:"#94a3b8" }}>Your teacher hasn't run the ML prediction for you yet. Please check back later.</p>
        </div>
      ) : (
        <div style={{ animation:"fadeUp .6s ease both .05s", opacity:0, animationFillMode:"forwards" }}>

          {/* Main result hero */}
          <div style={{ background: isRisk ? "linear-gradient(135deg,#1a0505,#2d0a0a,#1a0505)" : "linear-gradient(135deg,#041a0e,#082d18,#041a0e)",
            borderRadius:"24px", padding:"48px 40px", marginBottom:"24px",
            boxShadow: isRisk ? "0 16px 48px rgba(239,68,68,.4)" : "0 16px 48px rgba(16,185,129,.4)" }}>

            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"32px" }}>
              <div>
                <div style={{ fontSize:"12px", fontWeight:700, color:"rgba(255,255,255,.4)",
                  textTransform:"uppercase", letterSpacing:".6px", marginBottom:"8px" }}>Prediction Result</div>
                <h2 style={{ fontWeight:900, fontSize:"42px", color:"#fff", letterSpacing:"-1px", lineHeight:1 }}>
                  {isRisk ? "At Risk ⚠️" : "Pass ✅"}
                </h2>
                <p style={{ fontSize:"14px", color:"rgba(255,255,255,.5)", marginTop:"8px" }}>
                  {isRisk ? "You are at risk of dropout. See recommendations below." : "Great performance! Keep it up."}
                </p>
              </div>
              <div style={{ width:"100px", height:"100px", borderRadius:"50%",
                background: isRisk ? "rgba(239,68,68,.2)" : "rgba(16,185,129,.2)",
                border:`3px solid ${isRisk?"rgba(239,68,68,.5)":"rgba(16,185,129,.5)"}`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:"44px" }}>
                {isRisk ? "⚠️" : "✅"}
              </div>
            </div>

            {/* Probability bars */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px" }}>
              {[
                { label:"Pass Probability",   val: pred.passProbability, color:"#10b981" },
                { label:"Risk Probability",   val: pred.riskProbability, color:"#ef4444" },
              ].map((p,i) => (
                <div key={i}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"8px" }}>
                    <span style={{ fontSize:"13px", color:"rgba(255,255,255,.6)", fontWeight:600 }}>{p.label}</span>
                    <span style={{ fontSize:"16px", fontWeight:900, color:p.color }}>{p.val?.toFixed(1)}%</span>
                  </div>
                  <div style={{ height:"10px", borderRadius:"100px", background:"rgba(255,255,255,.08)" }}>
                    <div style={{ height:"100%", borderRadius:"100px", background:p.color,
                      width:`${p.val}%`, transition:"width 1.2s ease" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detail cards */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px", marginBottom:"24px" }}>

            {/* Cluster info */}
            <div style={{ background:"#fff", borderRadius:"16px", padding:"24px", boxShadow:"0 2px 16px rgba(0,0,0,.06)" }}>
              <h3 style={{ fontWeight:700, fontSize:"15px", color:"#0f172a", marginBottom:"14px" }}>🔵 Cluster Group</h3>
              {pred.clusterGroup != null ? (
                <>
                  <div style={{ fontWeight:900, fontSize:"48px", color:"#7c3aed", lineHeight:1, marginBottom:"8px" }}>
                    Group {pred.clusterGroup}
                  </div>
                  <p style={{ fontSize:"13px", color:"#64748b", lineHeight:1.6 }}>
                    K-Means grouped you with students who have similar performance profiles. Your teacher can use this to design targeted help.
                  </p>
                </>
              ) : (
                <p style={{ fontSize:"13px", color:"#94a3b8" }}>No cluster assigned (only assigned for at-risk students).</p>
              )}
            </div>

            {/* Weak tests */}
            <div style={{ background:"#fff", borderRadius:"16px", padding:"24px", boxShadow:"0 2px 16px rgba(0,0,0,.06)" }}>
              <h3 style={{ fontWeight:700, fontSize:"15px", color:"#0f172a", marginBottom:"14px" }}>⚠️ Areas to Improve</h3>
              {pred.weakTests && pred.weakTests !== "" ? (
                <>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"8px", marginBottom:"14px" }}>
                    {pred.weakTests.split(",").map((t,i) => (
                      <span key={i} style={{ background:"rgba(239,68,68,.10)", color:"#dc2626",
                        border:"1px solid rgba(239,68,68,.25)", borderRadius:"8px",
                        padding:"6px 14px", fontSize:"13px", fontWeight:700 }}>{t.trim()}</span>
                    ))}
                  </div>
                  <p style={{ fontSize:"13px", color:"#64748b" }}>
                    These tests scored below 7.0. Focus on improving these areas to reduce dropout risk.
                  </p>
                </>
              ) : (
                <div style={{ display:"flex", alignItems:"center", gap:"8px", color:"#10b981" }}>
                  <span style={{ fontSize:"24px" }}>🎉</span>
                  <span style={{ fontWeight:600, fontSize:"14px" }}>No weak tests — all scores above 7.0!</span>
                </div>
              )}
            </div>
          </div>

          {/* Recommendation */}
          <div style={{ background: isRisk ? "rgba(239,68,68,.05)" : "rgba(16,185,129,.05)",
            border:`1.5px solid ${isRisk?"rgba(239,68,68,.20)":"rgba(16,185,129,.20)"}`,
            borderRadius:"16px", padding:"24px" }}>
            <h3 style={{ fontWeight:700, fontSize:"15px", color:"#0f172a", marginBottom:"10px" }}>
              💬 Recommendation
            </h3>
            <p style={{ fontSize:"14px", color:"#475569", lineHeight:1.7 }}>
              {pred.message || (isRisk
                ? "You are at risk. Please talk to your teacher and focus on weak subjects. Consistent effort can significantly improve your outcome."
                : "Great job! Your performance looks good. Keep studying consistently to maintain your pass status."
              )}
            </p>
          </div>

          {/* Algorithm note */}
          <div style={{ background:"linear-gradient(135deg,#0f172a,#1e1b4b)", borderRadius:"16px",
            padding:"24px 28px", marginTop:"24px" }}>
            <div style={{ fontSize:"11px", fontWeight:700, color:"#93c5fd",
              textTransform:"uppercase", letterSpacing:".5px", marginBottom:"8px" }}>Powered by IEEE Research</div>
            <p style={{ fontSize:"13px", color:"rgba(255,255,255,.5)", lineHeight:1.6 }}>
              This prediction was generated by a <strong style={{ color:"rgba(255,255,255,.75)" }}>J48 Decision Tree</strong> classifier
              trained on 96 student records with <strong style={{ color:"rgba(255,255,255,.75)" }}>93.8% precision</strong>.
              Clustering is performed by <strong style={{ color:"rgba(255,255,255,.75)" }}>K-Means</strong> and
              patterns are mined using <strong style={{ color:"rgba(255,255,255,.75)" }}>Apriori association rules</strong>.
            </p>
          </div>
        </div>
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