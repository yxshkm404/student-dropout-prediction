import { useEffect, useState } from "react";

export default function MyProfile() {
  const studentId = sessionStorage.getItem("id");

  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [form,     setForm]     = useState({ name:"", email:"", password:"", confirmPassword:"" });
  const [saving,   setSaving]   = useState(false);
  const [toast,    setToast]    = useState("");

  const showToast = (msg, err=false) => {
    setToast({ msg, err }); setTimeout(() => setToast(""), 3500);
  };

  const fetchProfile = () => {
    setLoading(true);
    fetch(`/api/student/profile/${studentId}`)
      .then(r => r.json())
      .then(d => { if (d.success) setProfile(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProfile(); }, [studentId]);

  const openEdit = () => {
    setForm({ name: profile?.name || "", email: profile?.email || "", password:"", confirmPassword:"" });
    setShowEdit(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      showToast("Name and email are required!", true); return;
    }
    if (form.password && form.password !== form.confirmPassword) {
      showToast("Passwords do not match!", true); return;
    }
    if (form.password && form.password.length < 6) {
      showToast("Password must be at least 6 characters!", true); return;
    }
    setSaving(true);
    try {
      const body = { name: form.name.trim(), email: form.email.trim() };
      if (form.password) body.password = form.password;

      const res  = await fetch(`/api/student/profile/${studentId}`, {
        method:"PUT", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem("name", data.name);
        showToast("✅ Profile updated successfully!");
        setShowEdit(false);
        fetchProfile();
      } else {
        showToast(data.message || "Update failed!", true);
      }
    } catch { showToast("Network error!", true); }
    finally { setSaving(false); }
  };

  const infoCards = profile ? [
    { icon:"🎓", label:"Student ID",  value: profile.studentId,  color:"#7c3aed" },
    { icon:"✉️",  label:"Email",       value: profile.email,       color:"#2563eb" },
    { icon:"👨‍🏫", label:"Teacher",     value: profile.teacherName, color:"#0891b2" },
    { icon:"🔖",  label:"Status",      value: profile.status,      color: profile.status==="APPROVED"?"#059669":"#d97706" },
  ] : [];

  return (
    <div style={{ padding:"36px", minHeight:"100vh", background:"#f1f5f9",
      fontFamily:"'Outfit',sans-serif", display:"flex", flexDirection:"column" }}>
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes toastIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes modalIn { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
        .finput:focus { outline:none; border-color:#7c3aed !important; box-shadow:0 0 0 3px rgba(124,58,237,.10); }
        .edit-btn:hover { transform:translateY(-2px) !important; box-shadow:0 8px 24px rgba(124,58,237,.45) !important; }
      `}</style>

      {toast && (
        <div style={{ position:"fixed", bottom:"28px", right:"28px", zIndex:999,
          background: toast.err?"#ef4444":"#0f172a", color:"#fff",
          padding:"12px 22px", borderRadius:"10px", fontSize:"14px", fontWeight:600,
          boxShadow:"0 8px 30px rgba(0,0,0,.25)", animation:"toastIn .35s ease both" }}>
          {toast.msg}
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div style={{ position:"fixed", inset:0, zIndex:500, background:"rgba(0,0,0,.55)",
          display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(5px)" }}>
          <div style={{ background:"#fff", borderRadius:"20px", padding:"36px", width:"460px",
            boxShadow:"0 24px 60px rgba(0,0,0,.25)", animation:"modalIn .3s ease both" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"6px" }}>
              <div style={{ width:"40px", height:"40px", borderRadius:"50%",
                background:"linear-gradient(135deg,#7c3aed,#2563eb)",
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px" }}>✏️</div>
              <h2 style={{ fontWeight:800, fontSize:"20px", color:"#0f172a", margin:0 }}>Edit Profile</h2>
            </div>
            <p style={{ fontSize:"13px", color:"#94a3b8", marginBottom:"24px", marginLeft:"52px" }}>
              Leave password blank to keep it unchanged.
            </p>
            {[
              { key:"name",            label:"Full Name",        type:"text",     placeholder:"Your full name" },
              { key:"email",           label:"Email Address",    type:"email",    placeholder:"your@email.com" },
              { key:"password",        label:"New Password",     type:"password", placeholder:"Leave blank to keep current" },
              { key:"confirmPassword", label:"Confirm Password", type:"password", placeholder:"Repeat new password" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom:"16px" }}>
                <label style={{ fontSize:"11px", fontWeight:700, color:"#475569",
                  display:"block", marginBottom:"6px", textTransform:"uppercase", letterSpacing:".4px" }}>
                  {f.label}
                </label>
                <input className="finput" type={f.type}
                  value={form[f.key]} onChange={e => setForm(v => ({ ...v, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={{ width:"100%", padding:"10px 14px", borderRadius:"9px",
                    border:"1.5px solid #e2e8f0", fontSize:"14px", fontFamily:"'Outfit',sans-serif",
                    color:"#0f172a", transition:"border-color .2s, box-shadow .2s", boxSizing:"border-box" }} />
              </div>
            ))}
            <div style={{ display:"flex", gap:"10px", marginTop:"8px" }}>
              <button onClick={() => setShowEdit(false)}
                style={{ flex:1, padding:"11px", borderRadius:"9px", background:"#f1f5f9",
                  color:"#64748b", border:"none", fontSize:"14px", fontWeight:600,
                  cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
              <button onClick={handleSave} disabled={saving}
                style={{ flex:2, padding:"11px", borderRadius:"9px",
                  background:"linear-gradient(135deg,#7c3aed,#2563eb)", color:"#fff", border:"none",
                  fontSize:"14px", fontWeight:700, cursor:"pointer", fontFamily:"inherit",
                  opacity: saving ? .7 : 1 }}>
                {saving ? "Saving…" : "💾 Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ flex:1 }}>
        {/* Header */}
        <div style={{ marginBottom:"28px", animation:"fadeUp .6s ease both" }}>
          <h1 style={{ fontWeight:800, fontSize:"26px", color:"#0f172a", letterSpacing:"-0.5px", marginBottom:"4px" }}>👤 My Profile</h1>
          <p style={{ fontSize:"14px", color:"#64748b" }}>View and update your account information</p>
        </div>

        {loading ? (
          <div style={{ textAlign:"center", padding:"80px", color:"#94a3b8", fontSize:"14px" }}>Loading profile…</div>
        ) : !profile ? (
          <div style={{ textAlign:"center", padding:"80px" }}>
            <div style={{ fontSize:"48px", marginBottom:"12px" }}>😕</div>
            <div style={{ fontSize:"14px", color:"#94a3b8" }}>Could not load profile.</div>
          </div>
        ) : (
          <>
            {/* Hero card */}
            <div style={{ background:"linear-gradient(135deg,#0a0f2e,#1e1b4b,#2d1b69)",
              borderRadius:"20px", padding:"36px", marginBottom:"24px",
              display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"20px",
              boxShadow:"0 8px 32px rgba(124,58,237,.25)",
              animation:"fadeUp .6s ease both .05s", opacity:0, animationFillMode:"forwards" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"20px" }}>
                <div style={{ width:"80px", height:"80px", borderRadius:"50%",
                  background:"linear-gradient(135deg,#7c3aed,#2563eb)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"36px", boxShadow:"0 0 0 4px rgba(255,255,255,.15)", flexShrink:0 }}>🎓</div>
                <div>
                  <div style={{ fontWeight:900, fontSize:"26px", color:"#fff", lineHeight:1.1 }}>{profile.name}</div>
                  <div style={{ fontSize:"14px", color:"rgba(255,255,255,.60)", marginTop:"4px" }}>{profile.email}</div>
                  <div style={{ marginTop:"10px" }}>
                    <span style={{
                      background: profile.status==="APPROVED" ? "rgba(16,185,129,.25)" : "rgba(245,158,11,.25)",
                      color:      profile.status==="APPROVED" ? "#6ee7b7" : "#fde68a",
                      border:`1px solid ${profile.status==="APPROVED"?"rgba(16,185,129,.4)":"rgba(245,158,11,.4)"}`,
                      borderRadius:"100px", padding:"4px 14px", fontSize:"12px", fontWeight:700 }}>
                      {profile.status}
                    </span>
                  </div>
                </div>
              </div>
              <button className="edit-btn" onClick={openEdit}
                style={{ background:"linear-gradient(135deg,#7c3aed,#2563eb)", color:"#fff",
                  border:"none", padding:"12px 24px", borderRadius:"12px",
                  fontSize:"14px", fontWeight:700, cursor:"pointer", fontFamily:"inherit",
                  boxShadow:"0 4px 16px rgba(124,58,237,.35)", transition:"all .25s" }}>
                ✏️ Edit Profile
              </button>
            </div>

            {/* Info cards */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
              gap:"16px", animation:"fadeUp .6s ease both .1s", opacity:0, animationFillMode:"forwards" }}>
              {infoCards.map((c, i) => (
                <div key={i} style={{ background:"#fff", borderRadius:"16px", padding:"22px",
                  boxShadow:"0 2px 16px rgba(0,0,0,.06)", borderTop:`3px solid ${c.color}` }}>
                  <div style={{ fontSize:"24px", marginBottom:"10px" }}>{c.icon}</div>
                  <div style={{ fontSize:"11px", fontWeight:700, color:"#94a3b8",
                    textTransform:"uppercase", letterSpacing:".5px", marginBottom:"6px" }}>{c.label}</div>
                  <div style={{ fontWeight:700, fontSize:"15px", color:"#0f172a",
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.value || "—"}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop:"20px", background:"rgba(124,58,237,.06)",
              border:"1px solid rgba(124,58,237,.18)", borderRadius:"12px",
              padding:"14px 20px", fontSize:"13px", color:"#7c3aed", fontWeight:500,
              animation:"fadeUp .6s ease both .15s", opacity:0, animationFillMode:"forwards" }}>
              🔒 You can update your name, email and password. Your Student ID cannot be changed.
            </div>
          </>
        )}
      </div>

      <footer style={{ padding:"20px 0 0", borderTop:"1px solid #e2e8f0", marginTop:"40px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
            <div style={{ width:"24px", height:"24px", borderRadius:"6px",
              background:"linear-gradient(135deg,#7c3aed,#2563eb)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px" }}>⚡</div>
            <span style={{ fontWeight:700, fontSize:"13px", color:"#0f172a" }}>EduPredict</span>
          </div>
          <span style={{ fontSize:"12px", color:"#94a3b8" }}>© 2025 EduPredict · IEEE Research by Chicon et al.</span>
        </div>
      </footer>
    </div>
  );
}