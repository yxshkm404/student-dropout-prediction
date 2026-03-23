import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const BG_IMAGES = [
  "https://static.vecteezy.com/system/resources/previews/001/937/784/large_2x/online-education-application-learning-worldwide-on-computer-mobile-website-background-social-distance-concept-with-books-lecture-pencil-the-classroom-training-course-library-illustration-flat-vector.jpg",
  "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1800&q=80",
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1800&q=80",
];

const ROLES = [
  { value: "TEACHER", label: "Teacher", icon: "👨‍🏫", color: "#2563eb", desc: "Approved by Principal" },
  { value: "STUDENT", label: "Student", icon: "👨‍🎓", color: "#0891b2", desc: "Approved by Teacher"  },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const preRole  = location.state?.role === "PRINCIPAL" ? "TEACHER" : (location.state?.role || "TEACHER");

  const [role,      setRole]      = useState(preRole);
  const [name,      setName]      = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [studentId, setStudentId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [teachers,  setTeachers]  = useState([]);
  const [showPass,  setShowPass]  = useState(false);
  const [showConf,  setShowConf]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState("");
  const [error,     setError]     = useState("");
  const [focused,   setFocused]   = useState("");
  const [current,   setCurrent]   = useState(0);
  const [prev,      setPrev]      = useState(null);
  const [trans,     setTrans]     = useState(false);
  const [loaded,    setLoaded]    = useState(false);
  const timer = useRef(null);

  const activeRole = ROLES.find(r => r.value === role);
  const ac = activeRole.color;

  // Preload first image
  useEffect(() => {
    const img = new Image();
    img.src = BG_IMAGES[0];
    img.onload  = () => setLoaded(true);
    img.onerror = () => setLoaded(true);
  }, []);

  const kick = () => {
    clearInterval(timer.current);
    timer.current = setInterval(() => {
      setCurrent(c => {
        const n = (c + 1) % BG_IMAGES.length;
        setPrev(c); setTrans(true);
        setTimeout(() => { setPrev(null); setTrans(false); }, 1000);
        return n;
      });
    }, 5500);
  };
  useEffect(() => { kick(); return () => clearInterval(timer.current); }, []);

  // Fetch approved teachers when role is STUDENT
  useEffect(() => {
    if (role === "STUDENT") {
      fetch("/api/principal/teachers")
        .then(r => r.json())
        .then(d => { if (d.success) setTeachers(d.teachers.filter(t => t.status === "APPROVED")); })
        .catch(() => {});
    }
  }, [role]);

  const pwStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const pwColors   = ["transparent", "#ef4444", "#f59e0b", "#10b981"];
  const pwLabels   = ["", "Weak", "Medium", "Strong"];

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!name || !email || !password || !confirm) { setError("Please fill in all fields."); return; }
    if (password !== confirm) { setError("Passwords do not match!"); return; }
    if (password.length < 6)  { setError("Password must be at least 6 characters."); return; }
    if (role === "STUDENT" && !studentId) { setError("Please enter your Student ID."); return; }
    if (role === "STUDENT" && !teacherId) { setError("Please select your Teacher."); return; }
    setLoading(true);
    try {
      const url  = role === "TEACHER"
        ? "/api/auth/teacher/register"
        : "/api/teacher/students";
      const body = role === "TEACHER"
        ? { name, email, password }
        : { name, email, password, studentId, teacherId: teacherId.toString() };

      const res  = await fetch(url, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) {
        setSuccess(data.message || "Registration successful!");
        setTimeout(() => navigate("/login", { state:{ role } }), 3200);
      } else {
        setError(data.message || "Registration failed.");
      }
    } catch {
      setError("Cannot connect to server. Make sure Spring Boot is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", fontFamily:"'Outfit',sans-serif", overflow:"hidden", position:"relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeLeft  { from{opacity:0;transform:translateX(22px)} to{opacity:1;transform:translateX(0)} }
        @keyframes spin      { to{transform:rotate(360deg)} }
        @keyframes dotPulse  { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(255,255,255,.5)} 50%{opacity:.6;box-shadow:0 0 0 6px rgba(255,255,255,0)} }
        @keyframes popIn     { 0%{transform:scale(.7);opacity:0} 70%{transform:scale(1.06)} 100%{transform:scale(1);opacity:1} }
        .ifield { width:100%; padding:12px 16px 12px 42px; background:rgba(255,255,255,.07); border:1.5px solid rgba(255,255,255,.13); border-radius:10px; color:#fff; font-size:14px; font-family:inherit; outline:none; transition:all .25s; }
        .ifield::placeholder { color:rgba(255,255,255,.30); }
        .ifield:focus { background:rgba(255,255,255,.12); border-color:rgba(255,255,255,.48); }
        select.ifield option { background:#1a2040; color:#fff; }
        .rchip  { cursor:pointer; transition:all .22s; border:none; font-family:inherit; }
        .rchip:hover  { transform:translateY(-3px); }
        .sbtn { transition:all .25s; }
        .sbtn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 14px 36px rgba(0,0,0,.50) !important; }
      `}</style>

      {/* ── FULL BACKGROUND SLIDESHOW ── */}
      <div style={{ position:"fixed", inset:0, zIndex:0, background:"#060c1a" }} />
      {prev !== null && (
        <div style={{ position:"fixed", inset:0, zIndex:1,
          backgroundImage:`url(${BG_IMAGES[prev]})`, backgroundSize:"cover", backgroundPosition:"center",
          opacity: trans ? 0 : 1, transition:"opacity 1s ease" }} />
      )}
      <div style={{ position:"fixed", inset:0, zIndex:2,
        backgroundImage:`url(${BG_IMAGES[current]})`, backgroundSize:"cover", backgroundPosition:"center",
        opacity: loaded ? 1 : 0, transition:"opacity 1s ease" }} />
      <div style={{ position:"fixed", inset:0, zIndex:3,
        background:"linear-gradient(135deg, rgba(4,8,30,0.80) 0%, rgba(6,12,46,0.75) 50%, rgba(18,5,38,0.80) 100%)" }} />
      <div style={{ position:"fixed", inset:0, zIndex:4, pointerEvents:"none",
        backgroundImage:"linear-gradient(rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px)",
        backgroundSize:"52px 52px" }} />

      {/* ── LAYOUT ── */}
      <div style={{ position:"relative", zIndex:5, width:"100%", minHeight:"100vh", display:"flex", alignItems:"stretch" }}>

        {/* LEFT — branding */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"space-between", padding:"48px 60px", animation:"fadeUp .8s ease both" }}>

          {/* Logo */}
          <a href="/" style={{ display:"inline-flex", alignItems:"center", gap:"12px", textDecoration:"none", width:"fit-content" }}>
            <div style={{ width:"40px", height:"40px", borderRadius:"10px", background:"linear-gradient(135deg,#2563eb,#7c3aed)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px", boxShadow:"0 6px 20px rgba(37,99,235,.45)" }}>⚡</div>
            <span style={{ fontWeight:800, fontSize:"20px", color:"#fff", letterSpacing:"-0.5px" }}>EduPredict</span>
          </a>

          {/* Hero text */}
          <div>
            <div style={{ display:"inline-flex", alignItems:"center", gap:"8px", background:"rgba(255,255,255,.10)", border:"1px solid rgba(255,255,255,.18)", color:"rgba(255,255,255,.85)", padding:"5px 14px", borderRadius:"100px", fontSize:"11px", fontWeight:600, letterSpacing:".5px", marginBottom:"24px", backdropFilter:"blur(8px)" }}>
              <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#34d399", display:"inline-block", animation:"dotPulse 2s infinite" }} />
              Create Your Account Today
            </div>
            <h1 style={{ fontWeight:900, fontSize:"clamp(34px,4.2vw,58px)", color:"#fff", lineHeight:1.08, letterSpacing:"-2px", marginBottom:"18px" }}>
              Join the Fight<br />
              <span style={{ background:"linear-gradient(90deg,#34d399,#60a5fa)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                Against Dropout.
              </span>
            </h1>
            <p style={{ fontSize:"15px", color:"rgba(255,255,255,.50)", lineHeight:1.8, maxWidth:"380px", marginBottom:"40px" }}>
              Register as a Teacher or Student and start benefiting from AI-powered early dropout prediction.
            </p>

            {/* Approval flow steps */}
            <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
              <div style={{ fontSize:"11px", fontWeight:700, color:"rgba(255,255,255,.30)", letterSpacing:".6px", textTransform:"uppercase", marginBottom:"4px" }}>How It Works</div>
              {[
                { n:"01", t:"Teacher registers",    d:"Principal approves account", c:"#2563eb" },
                { n:"02", t:"Student registers",    d:"Teacher approves account",   c:"#0891b2" },
                { n:"03", t:"Teacher enters scores",d:"System predicts dropout risk",c:"#7c3aed" },
              ].map((s, i) => (
                <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:"14px" }}>
                  <div style={{ width:"28px", height:"28px", borderRadius:"8px", background:`${s.c}25`, border:`1px solid ${s.c}45`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <span style={{ fontSize:"10px", fontWeight:800, color:s.c }}>{s.n}</span>
                  </div>
                  <div>
                    <div style={{ fontSize:"13px", fontWeight:600, color:"rgba(255,255,255,.75)" }}>{s.t}</div>
                    <div style={{ fontSize:"12px", color:"rgba(255,255,255,.38)" }}>{s.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Slide indicators */}
          <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
            {BG_IMAGES.map((_, i) => (
              <div key={i} style={{ height:"5px", borderRadius:"3px",
                background: i===current ? "#fff" : "rgba(255,255,255,.28)",
                width: i===current ? "22px" : "5px",
                transition:"all .35s ease", boxShadow: i===current ? "0 0 6px rgba(255,255,255,.4)" : "none" }} />
            ))}
          </div>
        </div>

        {/* RIGHT — glass form card */}
        <div style={{ width:"480px", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", padding:"32px 36px", overflowY:"auto" }}>
          <div style={{ width:"100%", background:"rgba(15,20,50,0.55)", backdropFilter:"blur(32px)", WebkitBackdropFilter:"blur(32px)", border:"1px solid rgba(255,255,255,.13)", borderRadius:"24px", padding:"36px 32px", boxShadow:"0 32px 80px rgba(0,0,0,.55)", animation:"fadeLeft .7s ease both .1s", opacity:0, animationFillMode:"forwards", my:"20px" }}>

            {/* ── SUCCESS STATE ── */}
            {success ? (
              <div style={{ textAlign:"center", padding:"20px 0", animation:"popIn .5s ease both" }}>
                <div style={{ fontSize:"58px", marginBottom:"16px" }}>🎉</div>
                <h2 style={{ fontWeight:800, fontSize:"22px", color:"#fff", marginBottom:"12px" }}>You're Registered!</h2>
                <div style={{ background:"rgba(16,185,129,.13)", border:"1px solid rgba(16,185,129,.28)", borderRadius:"10px", padding:"14px", fontSize:"13px", color:"#6ee7b7", lineHeight:1.65, marginBottom:"20px" }}>
                  {success}
                </div>
                <p style={{ fontSize:"12px", color:"rgba(255,255,255,.30)", marginBottom:"16px" }}>Redirecting to login in 3 seconds…</p>
                <button style={{ padding:"11px 28px", borderRadius:"9px", background:ac, color:"#fff", border:"none", fontWeight:700, fontSize:"14px", cursor:"pointer", fontFamily:"inherit" }}
                  onClick={() => navigate("/login", { state:{ role } })}>
                  Go to Login →
                </button>
              </div>
            ) : (
              <>
                <h2 style={{ fontWeight:800, fontSize:"24px", color:"#fff", marginBottom:"5px" }}>Create Account</h2>
                <p style={{ fontSize:"13px", color:"rgba(255,255,255,.36)", marginBottom:"24px" }}>
                  Already registered?{" "}
                  <span style={{ color:ac, fontWeight:600, cursor:"pointer" }}
                    onClick={() => navigate("/login", { state:{ role } })}>
                    Sign in
                  </span>
                </p>

                {/* Role chips */}
                <div style={{ marginBottom:"20px" }}>
                  <label style={{ fontSize:"11px", fontWeight:700, color:"rgba(255,255,255,.36)", letterSpacing:".6px", textTransform:"uppercase", display:"block", marginBottom:"9px" }}>Register as</label>
                  <div style={{ display:"flex", gap:"10px" }}>
                    {ROLES.map(r => (
                      <button key={r.value} className="rchip"
                        onClick={() => { setRole(r.value); setError(""); setStudentId(""); setTeacherId(""); }}
                        style={{ flex:1, padding:"13px 8px", borderRadius:"10px",
                          border: role===r.value ? `2px solid ${r.color}` : "1.5px solid rgba(255,255,255,.10)",
                          background: role===r.value ? `${r.color}22` : "rgba(255,255,255,.04)",
                          color: role===r.value ? r.color : "rgba(255,255,255,.38)", textAlign:"center" }}>
                        <div style={{ fontSize:"22px", marginBottom:"4px" }}>{r.icon}</div>
                        <div style={{ fontWeight:700, fontSize:"12px" }}>{r.label}</div>
                        <div style={{ fontSize:"10px", opacity:.7, marginTop:"2px" }}>{r.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleRegister} style={{ display:"flex", flexDirection:"column", gap:"12px" }}>

                  {/* Full Name */}
                  <div>
                    <label style={{ fontSize:"11px", fontWeight:700, color:"rgba(255,255,255,.36)", letterSpacing:".6px", textTransform:"uppercase", display:"block", marginBottom:"6px" }}>Full Name</label>
                    <div style={{ position:"relative" }}>
                      <span style={{ position:"absolute", left:"13px", top:"50%", transform:"translateY(-50%)", fontSize:"13px", pointerEvents:"none" }}>👤</span>
                      <input className="ifield" type="text" placeholder="Your full name"
                        value={name} onChange={e => setName(e.target.value)}
                        onFocus={() => setFocused("name")} onBlur={() => setFocused("")}
                        style={{ borderColor: focused==="name" ? "rgba(255,255,255,.48)" : "rgba(255,255,255,.13)" }}
                      />
                    </div>
                  </div>

                  {/* Student ID — student only */}
                  {role === "STUDENT" && (
                    <div>
                      <label style={{ fontSize:"11px", fontWeight:700, color:"rgba(255,255,255,.36)", letterSpacing:".6px", textTransform:"uppercase", display:"block", marginBottom:"6px" }}>Student ID</label>
                      <div style={{ position:"relative" }}>
                        <span style={{ position:"absolute", left:"13px", top:"50%", transform:"translateY(-50%)", fontSize:"13px", pointerEvents:"none" }}>🪪</span>
                        <input className="ifield" type="text" placeholder="e.g. STU001"
                          value={studentId} onChange={e => setStudentId(e.target.value)}
                          onFocus={() => setFocused("sid")} onBlur={() => setFocused("")}
                          style={{ borderColor: focused==="sid" ? "rgba(255,255,255,.48)" : "rgba(255,255,255,.13)" }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label style={{ fontSize:"11px", fontWeight:700, color:"rgba(255,255,255,.36)", letterSpacing:".6px", textTransform:"uppercase", display:"block", marginBottom:"6px" }}>Email Address</label>
                    <div style={{ position:"relative" }}>
                      <span style={{ position:"absolute", left:"13px", top:"50%", transform:"translateY(-50%)", fontSize:"13px", pointerEvents:"none" }}>✉️</span>
                      <input className="ifield" type="email" placeholder="you@school.com"
                        value={email} onChange={e => setEmail(e.target.value)}
                        onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                        style={{ borderColor: focused==="email" ? "rgba(255,255,255,.48)" : "rgba(255,255,255,.13)" }}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label style={{ fontSize:"11px", fontWeight:700, color:"rgba(255,255,255,.36)", letterSpacing:".6px", textTransform:"uppercase", display:"block", marginBottom:"6px" }}>Password</label>
                    <div style={{ position:"relative" }}>
                      <span style={{ position:"absolute", left:"13px", top:"50%", transform:"translateY(-50%)", fontSize:"13px", pointerEvents:"none" }}>🔒</span>
                      <input className="ifield"
                        type={showPass ? "text" : "password"} placeholder="Min. 6 characters"
                        value={password} onChange={e => setPassword(e.target.value)}
                        onFocus={() => setFocused("pass")} onBlur={() => setFocused("")}
                        style={{ borderColor: focused==="pass" ? "rgba(255,255,255,.48)" : "rgba(255,255,255,.13)", paddingRight:"44px" }}
                      />
                      <button type="button" onClick={() => setShowPass(s => !s)}
                        style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:"14px", color:"rgba(255,255,255,.33)", padding:0 }}>
                        {showPass ? "🙈" : "👁️"}
                      </button>
                    </div>
                    {/* Strength bar */}
                    {password.length > 0 && (
                      <div style={{ marginTop:"7px", display:"flex", alignItems:"center", gap:"8px" }}>
                        <div style={{ flex:1, height:"4px", borderRadius:"2px", background:"rgba(255,255,255,.10)", overflow:"hidden" }}>
                          <div style={{ height:"100%", borderRadius:"2px", background:pwColors[pwStrength], width:`${(pwStrength/3)*100}%`, transition:"width .3s, background .3s" }} />
                        </div>
                        <span style={{ fontSize:"10px", color:pwColors[pwStrength], fontWeight:700, minWidth:"44px" }}>{pwLabels[pwStrength]}</span>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label style={{ fontSize:"11px", fontWeight:700, color:"rgba(255,255,255,.36)", letterSpacing:".6px", textTransform:"uppercase", display:"block", marginBottom:"6px" }}>Confirm Password</label>
                    <div style={{ position:"relative" }}>
                      <span style={{ position:"absolute", left:"13px", top:"50%", transform:"translateY(-50%)", fontSize:"13px", pointerEvents:"none" }}>🔑</span>
                      <input className="ifield"
                        type={showConf ? "text" : "password"} placeholder="Re-enter password"
                        value={confirm} onChange={e => setConfirm(e.target.value)}
                        onFocus={() => setFocused("conf")} onBlur={() => setFocused("")}
                        style={{ borderColor: confirm.length > 0 ? (confirm===password ? "#10b981" : "#ef4444") : focused==="conf" ? "rgba(255,255,255,.48)" : "rgba(255,255,255,.13)", paddingRight:"44px" }}
                      />
                      <button type="button" onClick={() => setShowConf(s => !s)}
                        style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:"14px", color:"rgba(255,255,255,.33)", padding:0 }}>
                        {showConf ? "🙈" : "👁️"}
                      </button>
                    </div>
                    {confirm.length > 0 && (
                      <p style={{ fontSize:"11px", marginTop:"5px", color: confirm===password ? "#10b981" : "#ef4444" }}>
                        {confirm===password ? "✓ Passwords match" : "✗ Passwords do not match"}
                      </p>
                    )}
                  </div>

                  {/* Teacher dropdown — student only */}
                  {role === "STUDENT" && (
                    <div>
                      <label style={{ fontSize:"11px", fontWeight:700, color:"rgba(255,255,255,.36)", letterSpacing:".6px", textTransform:"uppercase", display:"block", marginBottom:"6px" }}>Select Your Teacher</label>
                      <div style={{ position:"relative" }}>
                        <span style={{ position:"absolute", left:"13px", top:"50%", transform:"translateY(-50%)", fontSize:"13px", pointerEvents:"none", zIndex:1 }}>👨‍🏫</span>
                        <select className="ifield"
                          value={teacherId} onChange={e => setTeacherId(e.target.value)}
                          onFocus={() => setFocused("teacher")} onBlur={() => setFocused("")}
                          style={{ borderColor: focused==="teacher" ? "rgba(255,255,255,.48)" : "rgba(255,255,255,.13)", appearance:"none", cursor:"pointer" }}>
                          <option value="">-- Select your teacher --</option>
                          {teachers.map(t => (
                            <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                          ))}
                        </select>
                      </div>
                      {teachers.length === 0 && (
                        <p style={{ fontSize:"11px", color:"rgba(255,255,255,.28)", marginTop:"5px" }}>
                          No approved teachers yet. Ask Principal to approve a teacher first.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Approval notice */}
                  <div style={{ background:`${ac}13`, border:`1px solid ${ac}28`, borderRadius:"9px", padding:"10px 13px", fontSize:"12px", color:"rgba(255,255,255,.48)", lineHeight:1.55, transition:"all .3s" }}>
                    {role === "TEACHER"
                      ? "⏳ After registering, the Principal must approve your account before you can log in."
                      : "⏳ After registering, your Teacher must approve your account before you can log in."}
                  </div>

                  {/* Error */}
                  {error && (
                    <div style={{ background:"rgba(220,38,38,.13)", border:"1px solid rgba(220,38,38,.28)", borderRadius:"9px", padding:"10px 13px", fontSize:"13px", color:"#fca5a5" }}>
                      ⚠️ {error}
                    </div>
                  )}

                  {/* Submit */}
                  <button type="submit" disabled={loading} className="sbtn"
                    style={{ marginTop:"4px", padding:"13px", borderRadius:"10px",
                      background: loading ? "rgba(255,255,255,.10)" : `linear-gradient(135deg,${ac},#7c3aed)`,
                      color:"#fff", border:"none", fontWeight:700, fontSize:"15px",
                      cursor: loading ? "not-allowed" : "pointer", fontFamily:"inherit",
                      display:"flex", alignItems:"center", justifyContent:"center", gap:"10px",
                      boxShadow: loading ? "none" : "0 6px 24px rgba(0,0,0,.40)" }}>
                    {loading ? (
                      <>
                        <span style={{ width:"17px", height:"17px", border:"2px solid rgba(255,255,255,.3)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin .8s linear infinite" }} />
                        Registering…
                      </>
                    ) : `Register as ${activeRole.label} →`}
                  </button>
                </form>

                <p style={{ textAlign:"center", fontSize:"12px", color:"rgba(255,255,255,.18)", marginTop:"16px", cursor:"pointer" }}
                  onClick={() => navigate("/")}>← Back to Home</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}