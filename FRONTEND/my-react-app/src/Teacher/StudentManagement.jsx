import { useEffect, useState } from "react";

const STATUS_STYLE = {
  APPROVED: { bg:"rgba(16,185,129,.10)", color:"#059669", border:"rgba(16,185,129,.25)" },
  PENDING:  { bg:"rgba(245,158,11,.10)", color:"#d97706", border:"rgba(245,158,11,.25)" },
  REJECTED: { bg:"rgba(239,68,68,.10)",  color:"#dc2626", border:"rgba(239,68,68,.25)"  },
};

export default function StudentManagement() {
  const teacherId = sessionStorage.getItem("id");
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("ALL");
  const [search,   setSearch]   = useState("");
  const [toast,    setToast]    = useState("");
  const [showAdd,  setShowAdd]  = useState(false);
  const [form,     setForm]     = useState({ name:"", email:"", password:"", studentId:"" });
  const [saving,   setSaving]   = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  const fetchStudents = () => {
    setLoading(true);
    fetch(`http://localhost:8080/api/teacher/students/${teacherId}`)
      .then(r=>r.json()).then(d=>{ if(d.success) setStudents(d.students||[]); })
      .catch(()=>{}).finally(()=>setLoading(false));
  };
  useEffect(() => { fetchStudents(); }, [teacherId]);

  const showToast = (msg, err=false) => { setToast({msg,err}); setTimeout(()=>setToast(""), 3500); };

  const filtered = students.filter(s => {
    const mf = filter==="ALL" || s.status===filter;
    const ms = !search || s.name?.toLowerCase().includes(search.toLowerCase()) ||
               s.email?.toLowerCase().includes(search.toLowerCase()) ||
               s.studentId?.toLowerCase().includes(search.toLowerCase());
    return mf && ms;
  });

  const counts = {
    ALL:      students.length,
    APPROVED: students.filter(s=>s.status==="APPROVED").length,
    PENDING:  students.filter(s=>s.status==="PENDING").length,
    REJECTED: students.filter(s=>s.status==="REJECTED").length,
  };

  // ── Checkbox logic ──
  const allFilteredIds = filtered.map(s => s.id);
  const allChecked     = allFilteredIds.length > 0 && allFilteredIds.every(id => selected.has(id));
  const someChecked    = allFilteredIds.some(id => selected.has(id));

  const toggleOne = (id) => {
    setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
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
    await fetch(`http://localhost:8080/api/teacher/students/approve/${id}`, { method:"PUT" });
    setStudents(ss => ss.map(s => s.id===id ? { ...s, status:"APPROVED" } : s));
    setSelected(prev => { const next = new Set(prev); next.delete(id); return next; });
    showToast(`✅ ${name} approved!`);
  };
  const handleReject = async (id, name) => {
    await fetch(`http://localhost:8080/api/teacher/students/reject/${id}`, { method:"PUT" });
    setStudents(ss => ss.map(s => s.id===id ? { ...s, status:"REJECTED" } : s));
    setSelected(prev => { const next = new Set(prev); next.delete(id); return next; });
    showToast(`❌ ${name} rejected.`);
  };

  // ── Bulk actions ──
  const bulkAction = async (action) => {
    const ids = [...selected].filter(id => filtered.find(s => s.id === id));
    if (!ids.length) return;
    setBulkBusy(true);
    try {
      await Promise.all(ids.map(id =>
        fetch(`http://localhost:8080/api/teacher/students/${action}/${id}`, { method:"PUT" })
      ));
      setStudents(ss => ss.map(s =>
        ids.includes(s.id) ? { ...s, status: action==="approve" ? "APPROVED" : "REJECTED" } : s
      ));
      setSelected(new Set());
      showToast(`${action==="approve"?"✅":"❌"} ${ids.length} student(s) ${action==="approve"?"approved":"rejected"}!`);
    } catch { showToast("Something went wrong!", true); }
    finally { setBulkBusy(false); }
  };

  // ── Add student ──
  const handleAdd = async () => {
    if (!form.name || !form.email || !form.password || !form.studentId) {
      showToast("All fields are required!", true); return;
    }
    setSaving(true);
    try {
      const res  = await fetch("http://localhost:8080/api/teacher/students", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ ...form, teacherId }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("✅ Student added! Approve them to let them login.");
        setShowAdd(false); setForm({ name:"", email:"", password:"", studentId:"" });
        fetchStudents();
      } else { showToast(data.message || "Failed!", true); }
    } catch { showToast("Network error!", true); }
    finally { setSaving(false); }
  };

  const selectedInView = [...selected].filter(id => filtered.find(s => s.id === id)).length;

  return (
    <div style={{ padding:"36px", minHeight:"100vh", background:"#f1f5f9", fontFamily:"'Outfit',sans-serif" }}>
      <style>{`
        @keyframes fadeUp    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes toastIn   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes modalIn   { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        .fchip { cursor:pointer; transition:all .2s; border:none; font-family:inherit; }
        .fchip:hover { transform:translateY(-1px); }
        .trow { transition:background .18s; }
        .trow:hover { background:#f8fafc !important; }
        .tbtn { transition:all .2s; cursor:pointer; font-family:inherit; }
        .tbtn:hover { opacity:.85; transform:translateY(-1px); }
        .srch:focus  { outline:none; border-color:#10b981 !important; box-shadow:0 0 0 3px rgba(16,185,129,.12); }
        .finput:focus{ outline:none; border-color:#10b981 !important; box-shadow:0 0 0 3px rgba(16,185,129,.10); }
        .chk { width:16px; height:16px; cursor:pointer; accent-color:#10b981; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", bottom:"28px", right:"28px", zIndex:999,
          background:toast.err?"#ef4444":"#0f172a", color:"#fff",
          padding:"12px 22px", borderRadius:"10px", fontSize:"14px", fontWeight:600,
          boxShadow:"0 8px 30px rgba(0,0,0,.25)", animation:"toastIn .35s ease both" }}>
          {toast.msg}
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div style={{ position:"fixed", inset:0, zIndex:500, background:"rgba(0,0,0,.5)",
          display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(4px)" }}>
          <div style={{ background:"#fff", borderRadius:"20px", padding:"36px", width:"460px",
            boxShadow:"0 24px 60px rgba(0,0,0,.25)", animation:"modalIn .3s ease both" }}>
            <h2 style={{ fontWeight:800, fontSize:"20px", color:"#0f172a", marginBottom:"6px" }}>➕ Add New Student</h2>
            <p style={{ fontSize:"13px", color:"#94a3b8", marginBottom:"24px" }}>Student will be PENDING until you approve them.</p>
            {[
              { key:"studentId", label:"Student ID", placeholder:"e.g. STU001" },
              { key:"name",      label:"Full Name",  placeholder:"John Doe" },
              { key:"email",     label:"Email",      placeholder:"john@school.com" },
              { key:"password",  label:"Password",   placeholder:"Set a password" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom:"16px" }}>
                <label style={{ fontSize:"12px", fontWeight:700, color:"#475569", display:"block", marginBottom:"6px", textTransform:"uppercase", letterSpacing:".4px" }}>{f.label}</label>
                <input className="finput" type={f.key==="password"?"password":"text"}
                  value={form[f.key]} onChange={e=>setForm(v=>({...v,[f.key]:e.target.value}))}
                  placeholder={f.placeholder}
                  style={{ width:"100%", padding:"10px 14px", borderRadius:"9px",
                    border:"1.5px solid #e2e8f0", fontSize:"14px", fontFamily:"'Outfit',sans-serif",
                    color:"#0f172a", transition:"border-color .2s, box-shadow .2s" }} />
              </div>
            ))}
            <div style={{ display:"flex", gap:"10px", marginTop:"8px" }}>
              <button onClick={() => { setShowAdd(false); setForm({ name:"", email:"", password:"", studentId:"" }); }}
                style={{ flex:1, padding:"11px", borderRadius:"9px", background:"#f1f5f9", color:"#64748b", border:"none", fontSize:"14px", fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                Cancel
              </button>
              <button onClick={handleAdd} disabled={saving}
                style={{ flex:2, padding:"11px", borderRadius:"9px",
                  background:"linear-gradient(135deg,#10b981,#059669)", color:"#fff", border:"none",
                  fontSize:"14px", fontWeight:700, cursor:"pointer", fontFamily:"inherit", opacity:saving?.7:1 }}>
                {saving ? "Adding…" : "✓ Add Student"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom:"28px", display:"flex", alignItems:"flex-start", justifyContent:"space-between",
        animation:"fadeUp .6s ease both" }}>
        <div>
          <h1 style={{ fontWeight:800, fontSize:"26px", color:"#0f172a", letterSpacing:"-0.5px", marginBottom:"4px" }}>👥 My Students</h1>
          <p style={{ fontSize:"14px", color:"#64748b" }}>Manage and approve your students</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          style={{ background:"linear-gradient(135deg,#10b981,#059669)", color:"#fff", border:"none",
            padding:"11px 22px", borderRadius:"10px", fontSize:"14px", fontWeight:700,
            cursor:"pointer", fontFamily:"inherit", boxShadow:"0 4px 16px rgba(16,185,129,.35)", transition:"all .2s" }}
          onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";}}
          onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";}}>
          ➕ Add Student
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:"16px", marginBottom:"28px",
        animation:"fadeUp .6s ease both .05s", opacity:0, animationFillMode:"forwards" }}>
        {[
          { label:"Total",    val:counts.ALL,      grad:"linear-gradient(135deg,#7c3aed,#2563eb)", shadow:"rgba(124,58,237,.3)" },
          { label:"Approved", val:counts.APPROVED, grad:"linear-gradient(135deg,#10b981,#059669)", shadow:"rgba(16,185,129,.3)" },
          { label:"Pending",  val:counts.PENDING,  grad:"linear-gradient(135deg,#f59e0b,#fb923c)", shadow:"rgba(245,158,11,.3)" },
          { label:"Rejected", val:counts.REJECTED, grad:"linear-gradient(135deg,#ef4444,#f97316)", shadow:"rgba(239,68,68,.3)"  },
        ].map((c,i) => (
          <div key={i} style={{ background:c.grad, borderRadius:"14px", padding:"18px 20px", boxShadow:`0 6px 20px ${c.shadow}` }}>
            <div style={{ fontWeight:900, fontSize:"30px", color:"#fff", lineHeight:1 }}>{c.val}</div>
            <div style={{ fontSize:"12px", color:"rgba(255,255,255,.75)", fontWeight:500, marginTop:"4px" }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Filter + Search */}
      <div style={{ display:"flex", gap:"10px", marginBottom:"20px", flexWrap:"wrap", alignItems:"center",
        animation:"fadeUp .6s ease both .1s", opacity:0, animationFillMode:"forwards" }}>
        {["ALL","APPROVED","PENDING","REJECTED"].map(f => (
          <button key={f} className="fchip" onClick={() => { setFilter(f); setSelected(new Set()); }}
            style={{ padding:"8px 18px", borderRadius:"100px", fontSize:"13px", fontWeight:600,
              background: filter===f ? (f==="APPROVED"?"#10b981":f==="PENDING"?"#f59e0b":f==="REJECTED"?"#ef4444":"#7c3aed") : "#fff",
              color: filter===f?"#fff":"#64748b",
              border: filter===f?"none":"1.5px solid #e2e8f0",
              boxShadow: filter===f?"0 4px 14px rgba(0,0,0,.15)":"none" }}>
            {f} ({counts[f]})
          </button>
        ))}
        <input className="srch" value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="🔍 Search by name, ID or email…"
          style={{ marginLeft:"auto", padding:"9px 16px", borderRadius:"100px", border:"1.5px solid #e2e8f0",
            fontSize:"13px", fontFamily:"'Outfit',sans-serif", background:"#fff", color:"#0f172a",
            minWidth:"240px", transition:"border-color .2s, box-shadow .2s" }} />
      </div>

      {/* Bulk action bar */}
      {selectedInView > 0 && (
        <div style={{ background:"linear-gradient(135deg,#0f172a,#1e1b4b)", borderRadius:"12px",
          padding:"14px 20px", marginBottom:"16px", display:"flex", alignItems:"center", gap:"16px",
          animation:"slideDown .3s ease both", boxShadow:"0 4px 20px rgba(0,0,0,.20)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"8px", flex:1 }}>
            <div style={{ width:"28px", height:"28px", borderRadius:"50%",
              background:"linear-gradient(135deg,#10b981,#059669)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px" }}>✓</div>
            <span style={{ fontWeight:700, fontSize:"14px", color:"#fff" }}>
              {selectedInView} student{selectedInView>1?"s":""} selected
            </span>
          </div>
          <button onClick={() => bulkAction("approve")} disabled={bulkBusy}
            style={{ padding:"9px 20px", borderRadius:"8px",
              background:"linear-gradient(135deg,#10b981,#059669)", color:"#fff",
              border:"none", fontSize:"13px", fontWeight:700, cursor:"pointer",
              fontFamily:"inherit", opacity:bulkBusy?.6:1,
              boxShadow:"0 4px 14px rgba(16,185,129,.4)" }}>
            {bulkBusy?"…":`✓ Approve All (${selectedInView})`}
          </button>
          <button onClick={() => bulkAction("reject")} disabled={bulkBusy}
            style={{ padding:"9px 20px", borderRadius:"8px",
              background:"linear-gradient(135deg,#ef4444,#dc2626)", color:"#fff",
              border:"none", fontSize:"13px", fontWeight:700, cursor:"pointer",
              fontFamily:"inherit", opacity:bulkBusy?.6:1,
              boxShadow:"0 4px 14px rgba(239,68,68,.4)" }}>
            {bulkBusy?"…":`✗ Reject All (${selectedInView})`}
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
        animation:"fadeUp .6s ease both .15s", opacity:0, animationFillMode:"forwards" }}>
        <div style={{ display:"grid", gridTemplateColumns:"40px 1.2fr 1fr 1.5fr 1fr 1fr", gap:"12px",
          padding:"14px 24px", background:"#f8fafc", borderBottom:"1px solid #e2e8f0", alignItems:"center" }}>
          <input type="checkbox" className="chk"
            checked={allChecked} ref={el => { if(el) el.indeterminate = someChecked && !allChecked; }}
            onChange={toggleAll} />
          {["Student","Student ID","Email","Status","Actions"].map(h => (
            <div key={h} style={{ fontSize:"11px", fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".5px" }}>{h}</div>
          ))}
        </div>

        {loading ? (
          <div style={{ padding:"48px", textAlign:"center", color:"#94a3b8", fontSize:"14px" }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:"48px", textAlign:"center" }}>
            <div style={{ fontSize:"40px", marginBottom:"10px" }}>🔍</div>
            <div style={{ fontSize:"14px", color:"#94a3b8" }}>No students found.</div>
          </div>
        ) : filtered.map((s,i) => {
          const st = STATUS_STYLE[s.status] || STATUS_STYLE.PENDING;
          const isSelected = selected.has(s.id);
          return (
            <div key={s.id} className="trow"
              style={{ display:"grid", gridTemplateColumns:"40px 1.2fr 1fr 1.5fr 1fr 1fr", gap:"12px",
                padding:"15px 24px", borderBottom:i<filtered.length-1?"1px solid #f8fafc":"none",
                alignItems:"center",
                background: isSelected ? "rgba(16,185,129,.04)" : "#fff" }}>
              <input type="checkbox" className="chk"
                checked={isSelected} onChange={() => toggleOne(s.id)} />
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <div style={{ width:"34px", height:"34px", borderRadius:"50%",
                  background: isSelected
                    ? "linear-gradient(135deg,#10b981,#059669)"
                    : "linear-gradient(135deg,#94a3b8,#64748b)",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", flexShrink:0 }}>👨‍🎓</div>
                <span style={{ fontWeight:600, fontSize:"13px", color:"#0f172a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.name}</span>
              </div>
              <div style={{ fontSize:"12px", color:"#64748b", fontWeight:600 }}>{s.studentId}</div>
              <div style={{ fontSize:"12px", color:"#64748b", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.email}</div>
              <div>
                <span style={{ background:st.bg, color:st.color, border:`1px solid ${st.border}`,
                  borderRadius:"100px", padding:"3px 10px", fontSize:"11px", fontWeight:700 }}>
                  {s.status}
                </span>
              </div>
              <div style={{ display:"flex", gap:"6px" }}>
                {s.status==="PENDING" && (<>
                  <button className="tbtn" onClick={() => handleApprove(s.id, s.name)}
                    style={{ padding:"6px 12px", borderRadius:"7px", background:"linear-gradient(135deg,#10b981,#059669)", color:"#fff", border:"none", fontSize:"11px", fontWeight:700 }}>✓</button>
                  <button className="tbtn" onClick={() => handleReject(s.id, s.name)}
                    style={{ padding:"6px 12px", borderRadius:"7px", background:"linear-gradient(135deg,#ef4444,#dc2626)", color:"#fff", border:"none", fontSize:"11px", fontWeight:700 }}>✗</button>
                </>)}
                {s.status==="APPROVED" && (
                  <button className="tbtn" onClick={() => handleReject(s.id, s.name)}
                    style={{ padding:"6px 12px", borderRadius:"7px", background:"rgba(239,68,68,.08)", color:"#ef4444", border:"1px solid rgba(239,68,68,.22)", fontSize:"11px", fontWeight:700 }}>✗ Reject</button>
                )}
                {s.status==="REJECTED" && (
                  <button className="tbtn" onClick={() => handleApprove(s.id, s.name)}
                    style={{ padding:"6px 12px", borderRadius:"7px", background:"rgba(16,185,129,.08)", color:"#059669", border:"1px solid rgba(16,185,129,.22)", fontSize:"11px", fontWeight:700 }}>✓ Approve</button>
                )}
              </div>
            </div>
          );
        })}
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