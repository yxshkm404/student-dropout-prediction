import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const BG_IMAGES = [
  "https://static.vecteezy.com/system/resources/previews/001/937/784/large_2x/online-education-application-learning-worldwide-on-computer-mobile-website-background-social-distance-concept-with-books-lecture-pencil-the-classroom-training-course-library-illustration-flat-vector.jpg",
  "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1800&q=80",
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1800&q=80",
  "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1800&q=80",
];

const ROLES = [
  { value: "PRINCIPAL", label: "Principal", icon: "🏫", color: "#7c3aed", desc: "School administrator" },
  { value: "TEACHER",   label: "Teacher",   icon: "👨‍🏫", color: "#2563eb", desc: "Manage & predict"    },
  { value: "STUDENT",   label: "Student",   icon: "👨‍🎓", color: "#0891b2", desc: "View performance"    },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const preRole  = location.state?.role || "TEACHER";

  const [role,     setRole]     = useState(preRole);
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [focused,  setFocused]  = useState("");
  const [current,  setCurrent]  = useState(0);
  const [prev,     setPrev]     = useState(null);
  const [trans,    setTrans]    = useState(false);
  const [loaded,   setLoaded]   = useState(false);
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
    }, 5000);
  };
  useEffect(() => { kick(); return () => clearInterval(timer.current); }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem("role", data.role);
        sessionStorage.setItem("name", data.name);
        sessionStorage.setItem("id",   data.id || "");
        if (data.studentId) sessionStorage.setItem("studentId", data.studentId);
        if (data.role === "PRINCIPAL") navigate("/principal/dashboard");
        else if (data.role === "TEACHER") navigate("/teacher/dashboard");
        else navigate("/student/dashboard");
      } else {
        setError(data.message || "Login failed. Please try again.");
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
        @keyframes fadeUp   { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeLeft { from{opacity:0;transform:translateX(22px)} to{opacity:1;transform:translateX(0)} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        @keyframes dotPulse { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(255,255,255,.5)} 50%{opacity:.6;box-shadow:0 0 0 6px rgba(255,255,255,0)} }
        .ifield { width:100%; padding:13px 16px 13px 44px; background:rgba(255,255,255,.07); border:1.5px solid rgba(255,255,255,.14); border-radius:10px; color:#fff; font-size:15px; font-family:inherit; outline:none; transition:all .25s; backdrop-filter:blur(4px); }
        .ifield::placeholder { color:rgba(255,255,255,.32); }
        .ifield:focus { background:rgba(255,255,255,.12); border-color:rgba(255,255,255,.50); }
        .rchip { cursor:pointer; transition:all .22s; border:none; font-family:inherit; }
        .rchip:hover { transform:translateY(-3px); }
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
      {/* Overlay */}
      <div style={{ position:"fixed", inset:0, zIndex:3,
        background:"linear-gradient(135deg, rgba(4,8,30,0.80) 0%, rgba(6,12,46,0.75) 50%, rgba(18,5,38,0.80) 100%)" }} />
      {/* Grid texture */}
      <div style={{ position:"fixed", inset:0, zIndex:4, pointerEvents:"none",
        backgroundImage:"linear-gradient(rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px)",
        backgroundSize:"52px 52px" }} />

      {/* ── LAYOUT ── */}
      <div style={{ position:"relative", zIndex:5, width:"100%", minHeight:"100vh", display:"flex", alignItems:"stretch" }}>

        {/* LEFT — branding panel */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"space-between", padding:"48px 60px", animation:"fadeUp .8s ease both" }}>

          {/* Logo */}
          <a href="/" style={{ display:"inline-flex", alignItems:"center", gap:"12px", textDecoration:"none", width:"fit-content" }}>
            <div style={{ width:"40px", height:"40px", borderRadius:"10px", background:"linear-gradient(135deg,#2563eb,#7c3aed)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px", boxShadow:"0 6px 20px rgba(37,99,235,.45)" }}>⚡</div>
            <span style={{ fontWeight:800, fontSize:"20px", color:"#fff", letterSpacing:"-0.5px" }}>EduPredict</span>
          </a>

          {/* Hero text */}
          <div>
            <div style={{ display:"inline-flex", alignItems:"center", gap:"8px", background:"rgba(255,255,255,.10)", border:"1px solid rgba(255,255,255,.20)", color:"rgba(255,255,255,.85)", padding:"5px 14px", borderRadius:"100px", fontSize:"11px", fontWeight:600, letterSpacing:".5px", marginBottom:"24px", backdropFilter:"blur(8px)" }}>
              <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#60a5fa", display:"inline-block", animation:"dotPulse 2s infinite" }} />
              IEEE Research · Chicon et al. 2025
            </div>
            <h1 style={{ fontWeight:900, fontSize:"clamp(36px,4.5vw,62px)", color:"#fff", lineHeight:1.08, letterSpacing:"-2px", marginBottom:"18px" }}>
              Predict Dropout.<br />
              <span style={{ background:"linear-gradient(90deg,#60a5fa,#a78bfa)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                Act Early.
              </span>
            </h1>
            <p style={{ fontSize:"15px", color:"rgba(255,255,255,.52)", lineHeight:1.8, maxWidth:"380px", marginBottom:"40px" }}>
              AI-powered early identification of student dropout risk using J48 Decision Trees, K-Means Clustering &amp; Apriori Association Rules.
            </p>

            {/* Metric pills */}
            <div style={{ display:"flex", gap:"12px", flexWrap:"wrap" }}>
              {[
                { val:"93.8%", label:"Precision", c:"#60a5fa" },
                { val:"98.4%", label:"Recall",    c:"#a78bfa" },
                { val:"96.1%", label:"F-Measure", c:"#34d399" },
                { val:"0.884", label:"Kappa",      c:"#fb923c" },
              ].map((p, i) => (
                <div key={i} style={{ background:"rgba(255,255,255,.08)", backdropFilter:"blur(12px)", border:"1px solid rgba(255,255,255,.14)", borderRadius:"12px", padding:"12px 16px", textAlign:"center" }}>
                  <div style={{ fontWeight:800, fontSize:"19px", color:p.c }}>{p.val}</div>
                  <div style={{ fontSize:"10px", color:"rgba(255,255,255,.45)", fontWeight:500, marginTop:"2px" }}>{p.label}</div>
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

        {/* RIGHT — glass card */}
        <div style={{ width:"460px", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", padding:"36px 36px" }}>
          <div style={{ width:"100%", background:"rgba(15,20,50,0.55)", backdropFilter:"blur(32px)", WebkitBackdropFilter:"blur(32px)", border:"1px solid rgba(255,255,255,.13)", borderRadius:"24px", padding:"40px 36px", boxShadow:"0 32px 80px rgba(0,0,0,.55)", animation:"fadeLeft .7s ease both .1s", opacity:0, animationFillMode:"forwards" }}>

            <h2 style={{ fontWeight:800, fontSize:"26px", color:"#fff", marginBottom:"5px" }}>Welcome Back</h2>
            <p style={{ fontSize:"14px", color:"rgba(255,255,255,.38)", marginBottom:"28px" }}>
              No account?{" "}
              <span style={{ color:ac, fontWeight:600, cursor:"pointer", transition:"color .25s" }}
                onClick={() => navigate("/register", { state:{ role } })}>
                Register here
              </span>
            </p>

            {/* Role chips */}
            <div style={{ marginBottom:"24px" }}>
              <label style={{ fontSize:"11px", fontWeight:700, color:"rgba(255,255,255,.38)", letterSpacing:".6px", textTransform:"uppercase", display:"block", marginBottom:"10px" }}>Sign in as</label>
              <div style={{ display:"flex", gap:"8px" }}>
                {ROLES.map(r => (
                  <button key={r.value} className="rchip"
                    onClick={() => { setRole(r.value); setError(""); }}
                    style={{ flex:1, padding:"11px 6px", borderRadius:"10px",
                      border: role===r.value ? `2px solid ${r.color}` : "1.5px solid rgba(255,255,255,.10)",
                      background: role===r.value ? `${r.color}22` : "rgba(255,255,255,.04)",
                      color: role===r.value ? r.color : "rgba(255,255,255,.40)", textAlign:"center" }}>
                    <div style={{ fontSize:"20px", marginBottom:"3px" }}>{r.icon}</div>
                    <div style={{ fontWeight:700, fontSize:"11px" }}>{r.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} style={{ display:"flex", flexDirection:"column", gap:"14px" }}>

              {/* Email */}
              <div>
                <label style={{ fontSize:"11px", fontWeight:700, color:"rgba(255,255,255,.38)", letterSpacing:".6px", textTransform:"uppercase", display:"block", marginBottom:"7px" }}>Email</label>
                <div style={{ position:"relative" }}>
                  <span style={{ position:"absolute", left:"14px", top:"50%", transform:"translateY(-50%)", fontSize:"14px", pointerEvents:"none" }}>✉️</span>
                  <input className="ifield" type="email" placeholder="you@school.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                    style={{ borderColor: focused==="email" ? "rgba(255,255,255,.50)" : "rgba(255,255,255,.14)" }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ fontSize:"11px", fontWeight:700, color:"rgba(255,255,255,.38)", letterSpacing:".6px", textTransform:"uppercase", display:"block", marginBottom:"7px" }}>Password</label>
                <div style={{ position:"relative" }}>
                  <span style={{ position:"absolute", left:"14px", top:"50%", transform:"translateY(-50%)", fontSize:"14px", pointerEvents:"none" }}>🔒</span>
                  <input className="ifield"
                    type={showPass ? "text" : "password"} placeholder="Enter your password"
                    value={password} onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocused("pass")} onBlur={() => setFocused("")}
                    style={{ borderColor: focused==="pass" ? "rgba(255,255,255,.50)" : "rgba(255,255,255,.14)", paddingRight:"46px" }}
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    style={{ position:"absolute", right:"13px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:"15px", color:"rgba(255,255,255,.35)", padding:0 }}>
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Principal hint */}
              {role === "PRINCIPAL" && (
                <div style={{ background:"rgba(124,58,237,.15)", border:"1px solid rgba(124,58,237,.28)", borderRadius:"9px", padding:"10px 14px", fontSize:"12px", color:"rgba(255,255,255,.55)", lineHeight:1.6 }}>
                  💡 Default: <strong style={{ color:"#c4b5fd" }}>principal@school.com</strong> / <strong style={{ color:"#c4b5fd" }}>principal123</strong>
                </div>
              )}

              {/* Error */}
              {error && (
                <div style={{ background:"rgba(220,38,38,.14)", border:"1px solid rgba(220,38,38,.30)", borderRadius:"9px", padding:"10px 14px", fontSize:"13px", color:"#fca5a5" }}>
                  ⚠️ {error}
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={loading} className="sbtn"
                style={{ marginTop:"4px", padding:"14px", borderRadius:"10px",
                  background: loading ? "rgba(255,255,255,.10)" : `linear-gradient(135deg,${ac},#7c3aed)`,
                  color:"#fff", border:"none", fontWeight:700, fontSize:"15px",
                  cursor: loading ? "not-allowed" : "pointer", fontFamily:"inherit",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:"10px",
                  boxShadow: loading ? "none" : "0 6px 24px rgba(0,0,0,.40)" }}>
                {loading ? (
                  <>
                    <span style={{ width:"17px", height:"17px", border:"2px solid rgba(255,255,255,.3)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin .8s linear infinite" }} />
                    Signing in…
                  </>
                ) : `Sign In as ${activeRole.label} →`}
              </button>
            </form>

            {role !== "PRINCIPAL" && (
              <p style={{ textAlign:"center", fontSize:"13px", color:"rgba(255,255,255,.25)", marginTop:"18px" }}>
                New {activeRole.label}?{" "}
                <span style={{ color:ac, fontWeight:600, cursor:"pointer" }}
                  onClick={() => navigate("/register", { state:{ role } })}>
                  Create account
                </span>
              </p>
            )}

            <p style={{ textAlign:"center", fontSize:"12px", color:"rgba(255,255,255,.18)", marginTop:"12px", cursor:"pointer" }}
              onClick={() => navigate("/")}>← Back to Home</p>
          </div>
        </div>
      </div>
    </div>
  );
}