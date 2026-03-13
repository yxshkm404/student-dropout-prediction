import { useEffect, useState } from "react";

export default function ScoreEntry() {
  const teacherId = sessionStorage.getItem("id");
  const [students,  setStudents]  = useState([]);
  const [selected,  setSelected]  = useState(null);
  const [scores,    setScores]    = useState({ test1:"", test2:"", test3:"", test4:"", mainExam:"" });
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState("");
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    fetch(`http://localhost:8080/api/teacher/students/${teacherId}`)
      .then(r=>r.json()).then(d=>{
        if(d.success) setStudents((d.students||[]).filter(s=>s.status==="APPROVED"));
      }).catch(()=>{}).finally(()=>setLoading(false));
  }, [teacherId]);

  const showToast = (msg, err=false) => { setToast({msg,err}); setTimeout(()=>setToast(""),3500); };

  const handleSave = async () => {
    const vals = Object.values(scores);
    if (vals.some(v => v === "")) { showToast("Please fill all score fields!", true); return; }
    if (vals.some(v => isNaN(v) || Number(v)<0 || Number(v)>10)) {
      showToast("All scores must be between 0.0 and 10.0!", true); return;
    }
    setSaving(true);
    try {
      const res = await fetch("http://localhost:8080/api/teacher/scores", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ studentId: selected.id, ...scores }),
      });
      const data = await res.json();
      if (data.success) { showToast("✅ Scores saved successfully!"); }
      else { showToast(data.message || "Failed to save!", true); }
    } catch { showToast("Network error!", true); }
    finally { setSaving(false); }
  };

  const avg = Object.values(scores).every(v=>v!==""&&!isNaN(v))
    ? (Object.values(scores).reduce((a,b)=>a+Number(b),0)/5).toFixed(2) : null;

  const scoreFields = [
    { key:"test1",   label:"Test 1",    color:"#2563eb" },
    { key:"test2",   label:"Test 2",    color:"#7c3aed" },
    { key:"test3",   label:"Test 3",    color:"#0891b2" },
    { key:"test4",   label:"Test 4",    color:"#10b981" },
    { key:"mainExam",label:"Main Exam", color:"#f59e0b" },
  ];

  return (
    <div style={{ padding:"36px", minHeight:"100vh", background:"#f1f5f9", fontFamily:"'Outfit',sans-serif" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes toastIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .sinput:focus { outline:none; border-color:#10b981 !important; box-shadow:0 0 0 3px rgba(16,185,129,.12); }
        .scard { cursor:pointer; transition:all .2s; }
        .scard:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,.10) !important; }
        .scard.sel { border:2px solid #10b981 !important; box-shadow:0 0 0 4px rgba(16,185,129,.15) !important; }
      `}</style>

      {toast && (
        <div style={{ position:"fixed", bottom:"28px", right:"28px", zIndex:999,
          background: toast.err?"#ef4444":"#0f172a", color:"#fff",
          padding:"12px 22px", borderRadius:"10px", fontSize:"14px", fontWeight:600,
          boxShadow:"0 8px 30px rgba(0,0,0,.25)", animation:"toastIn .35s ease both" }}>
          {toast.msg}
        </div>
      )}

      <div style={{ marginBottom:"28px", animation:"fadeUp .6s ease both" }}>
        <h1 style={{ fontWeight:800, fontSize:"26px", color:"#0f172a", letterSpacing:"-0.5px", marginBottom:"4px" }}>📝 Enter Scores</h1>
        <p style={{ fontSize:"14px", color:"#64748b" }}>Select an approved student and enter their test scores (0.0 – 10.0)</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1.4fr", gap:"28px", animation:"fadeUp .6s ease both .05s", opacity:0, animationFillMode:"forwards" }}>

        {/* Student picker */}
        <div>
          <h2 style={{ fontWeight:700, fontSize:"15px", color:"#0f172a", marginBottom:"14px" }}>1. Select Student</h2>
          {loading ? (
            <div style={{ padding:"32px", textAlign:"center", color:"#94a3b8" }}>Loading students…</div>
          ) : students.length === 0 ? (
            <div style={{ background:"#fff", borderRadius:"14px", padding:"32px", textAlign:"center", color:"#94a3b8", boxShadow:"0 2px 16px rgba(0,0,0,.06)" }}>
              <div style={{ fontSize:"36px", marginBottom:"10px" }}>😔</div>
              No approved students yet. Approve students first!
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:"10px", maxHeight:"500px", overflowY:"auto", paddingRight:"4px" }}>
              {students.map(s => (
                <div key={s.id} className={"scard" + (selected?.id===s.id?" sel":"")}
                  onClick={() => { setSelected(s); setScores({ test1:"", test2:"", test3:"", test4:"", mainExam:"" }); }}
                  style={{ background:"#fff", borderRadius:"12px", padding:"14px 18px",
                    boxShadow:"0 2px 12px rgba(0,0,0,.06)", border:"2px solid transparent",
                    display:"flex", alignItems:"center", gap:"12px" }}>
                  <div style={{ width:"38px", height:"38px", borderRadius:"50%",
                    background: selected?.id===s.id ? "linear-gradient(135deg,#10b981,#059669)" : "linear-gradient(135deg,#e2e8f0,#cbd5e1)",
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:"15px", flexShrink:0, transition:"background .2s" }}>
                    {selected?.id===s.id ? "✓" : "👨‍🎓"}
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:"14px", color:"#0f172a" }}>{s.name}</div>
                    <div style={{ fontSize:"12px", color:"#94a3b8" }}>{s.studentId} · {s.email}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Score form */}
        <div>
          <h2 style={{ fontWeight:700, fontSize:"15px", color:"#0f172a", marginBottom:"14px" }}>2. Enter Scores</h2>
          <div style={{ background:"#fff", borderRadius:"16px", padding:"28px", boxShadow:"0 2px 16px rgba(0,0,0,.06)" }}>
            {!selected ? (
              <div style={{ textAlign:"center", padding:"48px 20px", color:"#94a3b8" }}>
                <div style={{ fontSize:"48px", marginBottom:"12px" }}>👈</div>
                <div style={{ fontSize:"14px" }}>Select a student first</div>
              </div>
            ) : (
              <>
                {/* Selected student badge */}
                <div style={{ display:"flex", alignItems:"center", gap:"12px", background:"rgba(16,185,129,.07)",
                  border:"1px solid rgba(16,185,129,.20)", borderRadius:"12px", padding:"12px 16px", marginBottom:"24px" }}>
                  <div style={{ width:"38px", height:"38px", borderRadius:"50%",
                    background:"linear-gradient(135deg,#10b981,#059669)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"15px" }}>👨‍🎓</div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:"14px", color:"#0f172a" }}>{selected.name}</div>
                    <div style={{ fontSize:"12px", color:"#64748b" }}>{selected.studentId} · {selected.email}</div>
                  </div>
                  <span style={{ marginLeft:"auto", background:"rgba(16,185,129,.15)", color:"#059669",
                    borderRadius:"100px", padding:"3px 10px", fontSize:"11px", fontWeight:700 }}>APPROVED</span>
                </div>

                {/* Score inputs */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px", marginBottom:"20px" }}>
                  {scoreFields.map(f => (
                    <div key={f.key} style={{ gridColumn: f.key==="mainExam" ? "1 / -1" : "auto" }}>
                      <label style={{ fontSize:"12px", fontWeight:700, color:"#475569", display:"flex", alignItems:"center", gap:"6px", marginBottom:"8px", textTransform:"uppercase", letterSpacing:".4px" }}>
                        <span style={{ width:"10px", height:"10px", borderRadius:"50%", background:f.color, display:"inline-block" }} />
                        {f.label}
                        <span style={{ color:"#94a3b8", fontWeight:400, textTransform:"none", letterSpacing:0 }}>(0.0 – 10.0)</span>
                      </label>
                      <input className="sinput" type="number" min="0" max="10" step="0.1"
                        value={scores[f.key]}
                        onChange={e => setScores(v=>({...v,[f.key]:e.target.value}))}
                        placeholder="0.0 – 10.0"
                        style={{ width:"100%", padding:"11px 14px", borderRadius:"9px",
                          border:`1.5px solid ${scores[f.key]!==""&&!isNaN(scores[f.key])?"#10b981":"#e2e8f0"}`,
                          fontSize:"15px", fontFamily:"'Outfit',sans-serif", fontWeight:700,
                          color:"#0f172a", transition:"border-color .2s, box-shadow .2s" }} />
                    </div>
                  ))}
                </div>

                {/* Average preview */}
                {avg && (
                  <div style={{ background: Number(avg)>=7 ? "rgba(16,185,129,.08)" : "rgba(239,68,68,.08)",
                    border:`1px solid ${Number(avg)>=7?"rgba(16,185,129,.25)":"rgba(239,68,68,.25)"}`,
                    borderRadius:"10px", padding:"12px 16px", marginBottom:"20px",
                    display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <span style={{ fontSize:"13px", fontWeight:600, color:"#64748b" }}>Preview Average</span>
                    <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                      <span style={{ fontWeight:900, fontSize:"22px", color: Number(avg)>=7?"#10b981":"#ef4444" }}>{avg}</span>
                      <span style={{ fontSize:"12px", fontWeight:700, color: Number(avg)>=7?"#10b981":"#ef4444" }}>
                        {Number(avg)>=7 ? "✅ Likely PASS" : "⚠️ Likely AT RISK"}
                      </span>
                    </div>
                  </div>
                )}

                <button onClick={handleSave} disabled={saving}
                  style={{ width:"100%", padding:"13px", borderRadius:"10px",
                    background:"linear-gradient(135deg,#10b981,#059669)", color:"#fff", border:"none",
                    fontSize:"15px", fontWeight:700, cursor:"pointer", fontFamily:"inherit",
                    boxShadow:"0 4px 18px rgba(16,185,129,.35)", transition:"all .2s",
                    opacity: saving ? .7 : 1 }}>
                  {saving ? "Saving…" : "💾 Save Scores"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

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