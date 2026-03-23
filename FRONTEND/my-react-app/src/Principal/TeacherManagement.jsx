import { useEffect, useState } from "react";

const STATUS_STYLE = {
  APPROVED: { bg:"rgba(16,185,129,.10)",  color:"#059669", border:"rgba(16,185,129,.25)",  label:"APPROVED"  },
  PENDING:  { bg:"rgba(245,158,11,.10)",  color:"#d97706", border:"rgba(245,158,11,.25)",  label:"PENDING"   },
  REJECTED: { bg:"rgba(239,68,68,.10)",   color:"#dc2626", border:"rgba(239,68,68,.25)",   label:"REJECTED"  },
};

export default function TeacherManagement() {
  const [teachers,  setTeachers]  = useState([]);
  const [filter,    setFilter]    = useState("ALL");
  const [loading,   setLoading]   = useState(true);
  const [toast,     setToast]     = useState("");
  const [selected,  setSelected]  = useState(new Set());
  const [bulkBusy,  setBulkBusy]  = useState(false);

  const fetchTeachers = () => {
    setLoading(true);
    fetch("/api/principal/teachers")
      .then(r => r.json())
      .then(d => { if (d.success) setTeachers(d.teachers || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetchTeachers(); }, []);

  const showToast = (msg, err=false) => { setToast({msg,err}); setTimeout(() => setToast(""), 3500); };

  const filtered = filter === "ALL" ? teachers : teachers.filter(t => t.status === filter);

  const counts = {
    ALL:      teachers.length,
    APPROVED: teachers.filter(t => t.status === "APPROVED").length,
    PENDING:  teachers.filter(t => t.status === "PENDING").length,
    REJECTED: teachers.filter(t => t.status === "REJECTED").length,
  };

  // ── Checkbox logic ──
  const allFilteredIds  = filtered.map(t => t.id);
  const allChecked      = allFilteredIds.length > 0 && allFilteredIds.every(id => selected.has(id));
  const someChecked     = allFilteredIds.some(id => selected.has(id));

  const toggleOne = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allChecked) {
      setSelected(prev => { const next = new Set(prev); allFilteredIds.forEach(id => next.delete(id)); return next; });
    } else {
      setSelected(prev => { const next = new Set(prev); allFilteredIds.forEach(id => next.add(id)); return next; });
    }
  };

  // ── Single actions ──
  const handleApprove = async (id, name) => {
    await fetch(`/api/principal/teachers/approve/${id}`, { method:"PUT" });
    setTeachers(ts => ts.map(t => t.id === id ? { ...t, status:"APPROVED" } : t));
    setSelected(prev => { const next = new Set(prev); next.delete(id); return next; });
    showToast(`✅ ${name} approved!`);
  };
  const handleReject = async (id, name) => {
    await fetch(`/api/principal/teachers/reject/${id}`, { method:"PUT" });
    setTeachers(ts => ts.map(t => t.id === id ? { ...t, status:"REJECTED" } : t));
    setSelected(prev => { const next = new Set(prev); next.delete(id); return next; });
    showToast(`❌ ${name} rejected.`);
  };

  // ── Bulk actions ──
  const bulkAction = async (action) => {
    const ids = [...selected].filter(id => filtered.find(t => t.id === id));
    if (!ids.length) return;
    setBulkBusy(true);
    try {
      await Promise.all(ids.map(id =>
        fetch(`/api/principal/teachers/${action}/${id}`, { method:"PUT" })
      ));
      setTeachers(ts => ts.map(t =>
        ids.includes(t.id) ? { ...t, status: action === "approve" ? "APPROVED" : "REJECTED" } : t
      ));
      setSelected(new Set());
      showToast(`${action === "approve" ? "✅" : "❌"} ${ids.length} teacher(s) ${action === "approve" ? "approved" : "rejected"}!`);
    } catch { showToast("Something went wrong!", true); }
    finally { setBulkBusy(false); }
  };

  const selectedInView = [...selected].filter(id => filtered.find(t => t.id === id)).length;

  return (
    <div style={{ padding:"36px", minHeight:"100vh", background:"#f1f5f9", fontFamily:"'Outfit',sans-serif", display:"flex", flexDirection:"column" }}>
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes toastIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        .fchip { cursor:pointer; transition:all .2s; border:none; font-family:inherit; }
        .fchip:hover { transform:translateY(-1px); }
        .tbtn { transition:all .2s; cursor:pointer; font-family:inherit; }
        .tbtn:hover { opacity:.85; transform:translateY(-1px); }
        .trow { transition:background .18s; }
        .trow:hover { background:#f8fafc !important; }
        .chk { width:16px; height:16px; cursor:pointer; accent-color:#7c3aed; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", bottom:"28px", right:"28px", zIndex:999,
          background: toast.err ? "#ef4444" : "#0f172a", color:"#fff",
          padding:"12px 22px", borderRadius:"10px", fontSize:"14px", fontWeight:600,
          boxShadow:"0 8px 30px rgba(0,0,0,.25)", animation:"toastIn .35s ease both" }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ flex:1 }}>
      <div style={{ marginBottom:"28px", animation:"fadeUp .6s ease both" }}>
        <h1 style={{ fontWeight:800, fontSize:"26px", color:"#0f172a", letterSpacing:"-0.5px", marginBottom:"4px" }}>👨‍🏫 Manage Teachers</h1>
        <p style={{ fontSize:"14px", color:"#64748b" }}>Approve or reject teacher registrations for your school</p>
      </div>

      {/* Filter chips */}
      <div style={{ display:"flex", gap:"10px", marginBottom:"24px", flexWrap:"wrap",
        animation:"fadeUp .6s ease both .05s", opacity:0, animationFillMode:"forwards" }}>
        {["ALL","PENDING","APPROVED","REJECTED"].map(f => (
          <button key={f} className="fchip" onClick={() => { setFilter(f); setSelected(new Set()); }}
            style={{ padding:"8px 18px", borderRadius:"100px", fontSize:"13px", fontWeight:600,
              background: filter===f ? (f==="PENDING"?"#f59e0b":f==="APPROVED"?"#10b981":f==="REJECTED"?"#ef4444":"#7c3aed") : "#fff",
              color: filter===f?"#fff":"#64748b",
              border: filter===f?"none":"1.5px solid #e2e8f0",
              boxShadow: filter===f?"0 4px 14px rgba(0,0,0,.15)":"none" }}>
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      {/* Bulk action bar — appears when something is selected */}
      {selectedInView > 0 && (
        <div style={{ background:"linear-gradient(135deg,#0f172a,#1e1b4b)", borderRadius:"12px",
          padding:"14px 20px", marginBottom:"16px", display:"flex", alignItems:"center", gap:"16px",
          animation:"slideDown .3s ease both", boxShadow:"0 4px 20px rgba(0,0,0,.20)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"8px", flex:1 }}>
            <div style={{ width:"28px", height:"28px", borderRadius:"50%",
              background:"linear-gradient(135deg,#7c3aed,#2563eb)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px" }}>✓</div>
            <span style={{ fontWeight:700, fontSize:"14px", color:"#fff" }}>
              {selectedInView} teacher{selectedInView > 1 ? "s" : ""} selected
            </span>
          </div>
          <button onClick={() => bulkAction("approve")} disabled={bulkBusy}
            style={{ padding:"9px 20px", borderRadius:"8px",
              background:"linear-gradient(135deg,#10b981,#059669)", color:"#fff",
              border:"none", fontSize:"13px", fontWeight:700, cursor:"pointer",
              fontFamily:"inherit", opacity:bulkBusy?.6:1,
              boxShadow:"0 4px 14px rgba(16,185,129,.4)" }}>
            {bulkBusy ? "…" : `✓ Approve All (${selectedInView})`}
          </button>
          <button onClick={() => bulkAction("reject")} disabled={bulkBusy}
            style={{ padding:"9px 20px", borderRadius:"8px",
              background:"linear-gradient(135deg,#ef4444,#dc2626)", color:"#fff",
              border:"none", fontSize:"13px", fontWeight:700, cursor:"pointer",
              fontFamily:"inherit", opacity:bulkBusy?.6:1,
              boxShadow:"0 4px 14px rgba(239,68,68,.4)" }}>
            {bulkBusy ? "…" : `✗ Reject All (${selectedInView})`}
          </button>
          <button onClick={() => setSelected(new Set())}
            style={{ padding:"9px 16px", borderRadius:"8px", background:"rgba(255,255,255,.10)",
              color:"rgba(255,255,255,.7)", border:"1px solid rgba(255,255,255,.15)",
              fontSize:"13px", fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
            Cancel
          </button>
        </div>
      )}

      {/* Table */}
      <div style={{ background:"#fff", borderRadius:"16px", boxShadow:"0 2px 16px rgba(0,0,0,.06)", overflow:"hidden",
        animation:"fadeUp .6s ease both .1s", opacity:0, animationFillMode:"forwards" }}>

        {/* Table header */}
        <div style={{ display:"grid", gridTemplateColumns:"40px 1fr 1.5fr 1fr 1fr", gap:"16px",
          padding:"14px 24px", background:"#f8fafc", borderBottom:"1px solid #e2e8f0", alignItems:"center" }}>
          <input type="checkbox" className="chk"
            checked={allChecked} ref={el => { if(el) el.indeterminate = someChecked && !allChecked; }}
            onChange={toggleAll} />
          {["Teacher","Email","Status","Actions"].map(h => (
            <div key={h} style={{ fontSize:"11px", fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".5px" }}>{h}</div>
          ))}
        </div>

        {loading ? (
          <div style={{ padding:"48px", textAlign:"center", color:"#94a3b8", fontSize:"14px" }}>Loading teachers…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:"48px", textAlign:"center" }}>
            <div style={{ fontSize:"40px", marginBottom:"10px" }}>🔍</div>
            <div style={{ fontSize:"14px", color:"#94a3b8" }}>No teachers found for this filter.</div>
          </div>
        ) : filtered.map((t, i) => {
          const st = STATUS_STYLE[t.status] || STATUS_STYLE.PENDING;
          const isSelected = selected.has(t.id);
          return (
            <div key={t.id} className="trow"
              style={{ display:"grid", gridTemplateColumns:"40px 1fr 1.5fr 1fr 1fr", gap:"16px",
                padding:"16px 24px", borderBottom:i<filtered.length-1?"1px solid #f8fafc":"none",
                alignItems:"center",
                background: isSelected ? "rgba(124,58,237,.04)" : "#fff" }}>
              <input type="checkbox" className="chk"
                checked={isSelected} onChange={() => toggleOne(t.id)} />
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <div style={{ width:"36px", height:"36px", borderRadius:"50%",
                  background: isSelected
                    ? "linear-gradient(135deg,#7c3aed,#2563eb)"
                    : "linear-gradient(135deg,#94a3b8,#64748b)",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px", flexShrink:0 }}>
                  👨‍🏫
                </div>
                <span style={{ fontWeight:600, fontSize:"14px", color:"#0f172a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.name}</span>
              </div>
              <div style={{ fontSize:"13px", color:"#64748b", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.email}</div>
              <div>
                <span style={{ background:st.bg, color:st.color, border:`1px solid ${st.border}`,
                  borderRadius:"100px", padding:"4px 12px", fontSize:"11px", fontWeight:700 }}>
                  {st.label}
                </span>
              </div>
              <div style={{ display:"flex", gap:"8px" }}>
                {t.status === "PENDING" && (<>
                  <button className="tbtn" onClick={() => handleApprove(t.id, t.name)}
                    style={{ padding:"6px 14px", borderRadius:"7px", background:"linear-gradient(135deg,#10b981,#059669)", color:"#fff", border:"none", fontSize:"12px", fontWeight:700 }}>✓ Approve</button>
                  <button className="tbtn" onClick={() => handleReject(t.id, t.name)}
                    style={{ padding:"6px 14px", borderRadius:"7px", background:"linear-gradient(135deg,#ef4444,#dc2626)", color:"#fff", border:"none", fontSize:"12px", fontWeight:700 }}>✗ Reject</button>
                </>)}
                {t.status === "APPROVED" && (
                  <button className="tbtn" onClick={() => handleReject(t.id, t.name)}
                    style={{ padding:"6px 14px", borderRadius:"7px", background:"rgba(239,68,68,.08)", color:"#ef4444", border:"1px solid rgba(239,68,68,.22)", fontSize:"12px", fontWeight:700 }}>✗ Reject</button>
                )}
                {t.status === "REJECTED" && (
                  <button className="tbtn" onClick={() => handleApprove(t.id, t.name)}
                    style={{ padding:"6px 14px", borderRadius:"7px", background:"rgba(16,185,129,.08)", color:"#059669", border:"1px solid rgba(16,185,129,.22)", fontSize:"12px", fontWeight:700 }}>✓ Approve</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      </div>{/* end flex:1 content wrapper */}

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