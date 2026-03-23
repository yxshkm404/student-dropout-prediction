import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const SLIDES = [
  { url: "https://static.vecteezy.com/system/resources/previews/001/937/784/large_2x/online-education-application-learning-worldwide-on-computer-mobile-website-background-social-distance-concept-with-books-lecture-pencil-the-classroom-training-course-library-illustration-flat-vector.jpg", caption: "Empowering educators with data-driven insights" },
  { url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1800&q=80", caption: "Predict dropout risk before it's too late" },
  { url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1800&q=80", caption: "Three powerful algorithms. One clear outcome." },
  { url: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1800&q=80", caption: "93.8% precision · Based on IEEE research" },
];

const NAV_LINKS = [
  { label: "Home",    href: "#home"    },
  { label: "Models",  href: "#models"  },
  { label: "Roles",   href: "#roles"   },
  { label: "Results", href: "#results" },
  { label: "About",   href: "#about"   },
];

function NavLink({ href, label, isActive, scrolled }) {
  const [hov, setHov] = useState(false);
  const lit = isActive || hov;
  return (
    <a href={href}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "relative", padding: "8px 12px", textDecoration: "none",
        fontSize: "13px", fontWeight: 500, whiteSpace: "nowrap", fontFamily: "'IBM Plex Sans', sans-serif",
        color: scrolled ? (lit ? "#9a3412" : "#44403c") : (lit ? "#fef3c7" : "rgba(255,255,255,0.78)"),
        transition: "color 0.2s ease"
      }}>
      {label}
      <span style={{
        position: "absolute", bottom: "0", left: "12px", height: "2px",
        display: "block",
        width: lit ? "calc(100% - 24px)" : "0%",
        background: scrolled ? "#9a3412" : "#fcd34d",
        transition: "width 0.25s ease"
      }} />
    </a>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [current,   setCurrent]   = useState(0);
  const [prev,      setPrev]      = useState(null);
  const [trans,     setTrans]     = useState(false);
  const [loaded,    setLoaded]    = useState(false);
  const [scrollY,   setScrollY]   = useState(0);
  const [activeNav, setActiveNav] = useState("home");
  const timer = useRef(null);

  // Preload first image
  useEffect(() => {
    const img = new Image();
    img.src = SLIDES[0].url;
    img.onload  = () => setLoaded(true);
    img.onerror = () => setLoaded(true);
  }, []);

  const goTo = (idx) => {
    if (idx === current || trans) return;
    setPrev(current); setTrans(true); setCurrent(idx);
    clearInterval(timer.current);
    setTimeout(() => { setPrev(null); setTrans(false); kick(); }, 1000);
  };

  const kick = () => {
    clearInterval(timer.current);
    timer.current = setInterval(() => {
      setCurrent(c => {
        const n = (c + 1) % SLIDES.length;
        setPrev(c); setTrans(true);
        setTimeout(() => { setPrev(null); setTrans(false); }, 1000);
        return n;
      });
    }, 5000);
  };

  useEffect(() => { kick(); return () => clearInterval(timer.current); }, []);

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Intersection observer — HOME section is #home, default active is "home"
  useEffect(() => {
    const ids = ["home", "models", "roles", "results", "about"];
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActiveNav(e.target.id); }),
      { threshold: 0.35 }
    );
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  const ns = scrollY > 80;

  const models = [
    { icon: "🌳", title: "Decision Tree (J48)",  tag: "Classification", color: "#9a3412", desc: "Classifies students as Pass or At Risk with 93.8% precision using entropy-based splitting — producing a transparent, interpretable decision tree educators can follow." },
    { icon: "🔵", title: "K-Means Clustering",   tag: "Clustering",     color: "#0f766e", desc: "Groups at-risk students into 4 distinct performance profiles, enabling targeted and personalised academic interventions for each cluster type." },
    { icon: "🔗", title: "Apriori Association",  tag: "Association",    color: "#57534e", desc: "Mines 180+ association rules revealing which test combinations most strongly predict dropout risk across subjects and semesters." },
  ];

  const stats = [
    { value: "93.8%", label: "Model Precision",      color: "#9a3412" },
    { value: "98.4%", label: "Recall",                color: "#0f766e" },
    { value: "180+",  label: "Association Rules",     color: "#44403c" },
    { value: "4",     label: "Student Risk Clusters", color: "#b45309" },
  ];

  return (
    <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", background: "#f5f5f4", color: "#1c1917", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;0,6..72,700;1,6..72,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        @keyframes fadeUpIn  { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        @keyframes captionIn { from { opacity:0 } to { opacity:1 } }
        @keyframes countUp   { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        .mcard:hover { transform:translateY(-4px)!important; box-shadow:0 12px 28px rgba(28,25,23,.08)!important; }
        .rcard:hover { transform:translateY(-3px)!important; box-shadow:0 10px 24px rgba(28,25,23,.07)!important; }
        .fbub:hover  { transform:translateY(-2px); }
        .role-btn:hover { filter:brightness(0.95)!important; }
        .stat-item { animation: countUp 0.55s ease both; }
        .section-kicker { font-family:'IBM Plex Sans',sans-serif; font-size:11px; font-weight:600; letter-spacing:0.12em; text-transform:uppercase; color:#78716c; margin-bottom:10px; border-left:3px solid #9a3412; padding-left:12px; }
      `}</style>

      {/* ══ NAVBAR ══════════════════════════════════════════ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 300, height: "64px",
        background: ns ? "#fafaf9" : "transparent",
        backdropFilter: ns ? "blur(12px)" : "none",
        boxShadow: ns ? "0 1px 0 rgba(28,25,23,.08)" : "none",
        borderBottom: ns ? "none" : "1px solid transparent",
        transition: "background .35s ease, box-shadow .35s ease"
      }}>
        <div style={{ maxWidth: "1120px", margin: "0 auto", padding: "0 28px", height: "100%", display: "flex", alignItems: "center", gap: "20px" }}>
          <a href="#home" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", flexShrink: 0 }}>
            <div style={{
              width: "38px", height: "38px", borderRadius: "2px",
              background: ns ? "#9a3412" : "rgba(255,255,255,0.12)",
              border: ns ? "none" : "1px solid rgba(255,255,255,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Newsreader', serif", fontSize: "15px", fontWeight: 700, color: "#fff"
            }}>E</div>
            <span style={{
              fontFamily: "'Newsreader', serif", fontWeight: 700, fontSize: "20px",
              letterSpacing: "-0.02em", color: ns ? "#1c1917" : "#fff", transition: "color .35s"
            }}>EduPredict</span>
          </a>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {NAV_LINKS.map(({ label, href }) => (
              <NavLink key={label} href={href} label={label} isActive={activeNav === href.replace("#", "")} scrolled={ns} />
            ))}
          </div>
          <button
            style={{
              background: ns ? "#1c1917" : "rgba(255,255,255,0.12)",
              color: "#fafaf9", border: ns ? "none" : "1px solid rgba(255,255,255,0.45)",
              padding: "9px 20px", borderRadius: "2px", fontSize: "13px", fontWeight: 600,
              cursor: "pointer", transition: "background .2s, transform .2s", flexShrink: 0,
              fontFamily: "'IBM Plex Sans', sans-serif"
            }}
            onClick={() => navigate("/login")}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}>
            Login
          </button>
        </div>
      </nav>

      {/* ══ HERO — pure slideshow ══════════ */}
      <section id="home" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden" }}>

        <div style={{ position: "absolute", inset: 0, zIndex: 0, background: "#1c1917" }} />

        {prev !== null && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 1,
            backgroundImage: `url(${SLIDES[prev].url})`, backgroundSize: "cover", backgroundPosition: "center",
            opacity: trans ? 0 : 1, transition: "opacity 1s ease"
          }} />
        )}

        <div style={{
          position: "absolute", inset: 0, zIndex: 2,
          backgroundImage: `url(${SLIDES[current].url})`, backgroundSize: "cover", backgroundPosition: "center",
          opacity: loaded ? 1 : 0, transition: "opacity 1s ease"
        }} />

        <div style={{
          position: "absolute", inset: 0, zIndex: 3,
          background: "linear-gradient(105deg, rgba(28,25,23,0.82) 0%, rgba(28,25,23,0.55) 48%, rgba(67,20,7,0.72) 100%)"
        }} />

        <div style={{
          position: "absolute", inset: 0, zIndex: 4, pointerEvents: "none",
          opacity: 0.35,
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,.03) 2px, rgba(0,0,0,.03) 3px)"
        }} />

        <div style={{ position: "relative", zIndex: 5, maxWidth: "1120px", margin: "0 auto", padding: "0 36px", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "48px" }}>
          <div style={{ maxWidth: "600px", animation: "fadeUpIn .85s ease both" }}>
            <p style={{
              fontFamily: "'IBM Plex Sans', sans-serif", fontSize: "12px", fontWeight: 600,
              letterSpacing: "0.14em", textTransform: "uppercase", color: "#fcd34d",
              marginBottom: "20px"
            }}>
              IEEE · Chicon et al. 2025
            </p>
            <h1 style={{
              fontFamily: "'Newsreader', serif", fontWeight: 700,
              fontSize: "clamp(2.25rem, 5vw, 3.5rem)", color: "#fafaf9", lineHeight: 1.12,
              letterSpacing: "-0.03em", marginBottom: "22px"
            }}>
              Early detection of{" "}
              <span style={{ fontStyle: "italic", color: "#fde68a" }}>student dropout</span>
            </h1>
            <p key={current} style={{
              fontSize: "17px", color: "rgba(250,250,249,0.78)", lineHeight: 1.7, maxWidth: "480px",
              marginBottom: "32px", fontFamily: "'Newsreader', serif", fontStyle: "italic",
              animation: "captionIn .5s ease both"
            }}>
              {SLIDES[current].caption}
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "36px" }}>
              <button
                style={{
                  background: "#ea580c", color: "#fff", border: "none", padding: "14px 28px",
                  borderRadius: "2px", fontSize: "14px", fontWeight: 600, cursor: "pointer",
                  transition: "background .2s, transform .2s", fontFamily: "'IBM Plex Sans', sans-serif"
                }}
                onClick={() => navigate("/login")}
                onMouseEnter={e => { e.currentTarget.style.background = "#c2410c"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#ea580c"; e.currentTarget.style.transform = "translateY(0)"; }}>
                Get started
              </button>
              <a href="#models"
                style={{
                  display: "inline-flex", alignItems: "center", background: "transparent",
                  border: "1px solid rgba(250,250,249,0.45)", color: "#fafaf9",
                  padding: "14px 28px", borderRadius: "2px", fontSize: "14px", fontWeight: 500,
                  textDecoration: "none", transition: "border-color .2s, background .2s",
                  fontFamily: "'IBM Plex Sans', sans-serif"
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(250,250,249,0.85)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(250,250,249,0.45)"; e.currentTarget.style.background = "transparent"; }}>
                How it works
              </a>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {SLIDES.map((_, i) => (
                <button key={i} onClick={() => goTo(i)} style={{
                  height: "6px", borderRadius: "1px", border: "none", cursor: "pointer", padding: 0,
                  transition: "width .3s ease, background .3s",
                  background: i === current ? "#fde68a" : "rgba(250,250,249,0.28)",
                  width: i === current ? "32px" : "6px"
                }} />
              ))}
            </div>
          </div>

          <div style={{
            display: "flex", flexDirection: "column", gap: "0", flexShrink: 0,
            border: "1px solid rgba(250,250,249,0.2)", background: "rgba(28,25,23,0.35)"
          }}>
            {[
              { label: "Precision", val: "93.8%", c: "#fde68a" },
              { label: "Recall",    val: "98.4%", c: "#fcd34d" },
              { label: "F-Measure", val: "96.1%", c: "#fdba74" },
              { label: "Kappa",     val: "0.884", c: "#fed7aa" },
            ].map((p, i) => (
              <div key={i} style={{
                padding: "18px 26px", textAlign: "left", minWidth: "132px",
                borderBottom: i < 3 ? "1px solid rgba(250,250,249,0.12)" : "none"
              }}>
                <span style={{ display: "block", fontFamily: "'Newsreader', serif", fontWeight: 700, fontSize: "26px", color: p.c }}>{p.val}</span>
                <span style={{ fontSize: "11px", color: "rgba(250,250,249,0.55)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>{p.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ MODELS ══════════════════════════════════════════ */}
      <section id="models" style={{ padding: "88px 24px", background: "#fafaf9", borderTop: "1px solid #e7e5e4" }}>
        <div style={{ maxWidth: "1040px", margin: "0 auto" }}>
          <div className="section-kicker">Three core models</div>
          <h2 style={{ fontFamily: "'Newsreader', serif", fontWeight: 700, fontSize: "clamp(1.75rem, 3vw, 2.25rem)", color: "#1c1917", marginBottom: "14px", letterSpacing: "-0.02em" }}>How the prediction works</h2>
          <p style={{ fontSize: "15px", color: "#57534e", lineHeight: 1.75, maxWidth: "540px", marginBottom: "44px" }}>Based on the IEEE paper by Chicon et al. (2025), our system combines three machine learning models to identify dropout risk early and accurately.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "20px" }}>
            {models.map((m, i) => (
              <div key={i} className="mcard" style={{
                background: "#fff", borderRadius: "2px", padding: "28px",
                boxShadow: "0 1px 0 rgba(28,25,23,.06)", border: "1px solid #e7e5e4",
                borderLeft: `4px solid ${m.color}`, transition: "all .25s", cursor: "default"
              }}>
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>{m.icon}</div>
                <span style={{
                  display: "inline-block", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
                  marginBottom: "10px", color: m.color
                }}>{m.tag}</span>
                <h3 style={{ fontFamily: "'Newsreader', serif", fontWeight: 700, fontSize: "1.15rem", color: "#1c1917", marginBottom: "10px" }}>{m.title}</h3>
                <p style={{ fontSize: "14px", color: "#57534e", lineHeight: 1.75 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PREDICTION FLOW ═════════════════════════════════ */}
      <section style={{ padding: "88px 24px", background: "#fff", borderTop: "1px solid #e7e5e4" }}>
        <div style={{ maxWidth: "1040px", margin: "0 auto" }}>
          <div className="section-kicker">Prediction pipeline</div>
          <h2 style={{ fontFamily: "'Newsreader', serif", fontWeight: 700, fontSize: "clamp(1.75rem, 3vw, 2.25rem)", color: "#1c1917", marginBottom: "40px", letterSpacing: "-0.02em" }}>From score entry to early action</h2>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "stretch", gap: "0" }}>
            {[
              { n: "01", t: "Enter Scores",   d: "Test 1–4 + Main Exam",      c: "#9a3412" },
              { n: "02", t: "Classify",        d: "Pass or At Risk via J48",   c: "#0f766e" },
              { n: "03", t: "Cluster",         d: "Assign to risk profile",    c: "#44403c" },
              { n: "04", t: "Analyze Rules",   d: "Apriori failure patterns",  c: "#b45309" },
              { n: "05", t: "Intervene Early", d: "Act before dropout occurs", c: "#15803d" },
            ].map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center" }}>
                <div className="fbub" style={{
                  borderRadius: "2px", padding: "18px 16px", minWidth: "140px", textAlign: "left",
                  background: "#fafaf9", border: `1px solid ${f.c}40`, borderTop: `3px solid ${f.c}`,
                  color: "#1c1917", transition: "transform .2s", cursor: "default"
                }}>
                  <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 700, fontSize: "10px", letterSpacing: "0.08em", color: f.c, marginBottom: "6px" }}>{f.n}</div>
                  <div style={{ fontFamily: "'Newsreader', serif", fontWeight: 700, fontSize: "15px", marginBottom: "6px" }}>{f.t}</div>
                  <div style={{ fontSize: "12px", color: "#57534e", lineHeight: 1.45 }}>{f.d}</div>
                </div>
                {i < 4 && <div style={{ width: "20px", flexShrink: 0, alignSelf: "center", height: "1px", background: "#d6d3d1" }} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ROLES — with Register + Login buttons ═══════════ */}
      <section id="roles" style={{ padding: "88px 24px", background: "#f5f5f4", borderTop: "1px solid #e7e5e4" }}>
        <div style={{ maxWidth: "1040px", margin: "0 auto" }}>
          <div className="section-kicker">Three user roles</div>
          <h2 style={{ fontFamily: "'Newsreader', serif", fontWeight: 700, fontSize: "clamp(1.75rem, 3vw, 2.25rem)", color: "#1c1917", marginBottom: "40px", letterSpacing: "-0.02em" }}>Who uses EduPredict?</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "20px" }}>

            <div className="rcard" style={{ background: "#fff", borderRadius: "2px", padding: "28px", boxShadow: "0 1px 0 rgba(28,25,23,.06)", border: "1px solid #e7e5e4", borderTop: "3px solid #57534e", transition: "all .25s" }}>
              <div style={{ fontSize: "36px", marginBottom: "10px" }}>🏫</div>
              <h3 style={{ fontFamily: "'Newsreader', serif", fontWeight: 700, fontSize: "1.35rem", color: "#1c1917", marginBottom: "6px" }}>Principal</h3>
              <p style={{ fontSize: "13px", color: "#78716c", marginBottom: "16px" }}>Pre-configured account — no registration needed</p>
              <ul style={{ listStyle: "none", marginBottom: "24px" }}>
                {["Approve / reject teachers", "Monitor all students", "View dropout statistics", "Track school-wide trends"].map((f, j) => (
                  <li key={j} style={{ fontSize: "14px", color: "#44403c", padding: "8px 0", borderBottom: "1px solid #f5f5f4", display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    <span style={{ color: "#9a3412", fontWeight: 700, marginTop: "1px" }}>—</span>{f}
                  </li>
                ))}
              </ul>
              <button
                className="role-btn"
                style={{ width: "100%", color: "#fafaf9", background: "#44403c", border: "none", padding: "12px", borderRadius: "2px", fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "all .2s", fontFamily: "'IBM Plex Sans', sans-serif" }}
                onClick={() => navigate("/login", { state: { role: "PRINCIPAL" } })}>
                Login as Principal
              </button>
            </div>

            <div className="rcard" style={{ background: "#fff", borderRadius: "2px", padding: "28px", boxShadow: "0 1px 0 rgba(28,25,23,.06)", border: "1px solid #e7e5e4", borderTop: "3px solid #9a3412", transition: "all .25s" }}>
              <div style={{ fontSize: "36px", marginBottom: "10px" }}>👨‍🏫</div>
              <h3 style={{ fontFamily: "'Newsreader', serif", fontWeight: 700, fontSize: "1.35rem", color: "#1c1917", marginBottom: "6px" }}>Teacher</h3>
              <p style={{ fontSize: "13px", color: "#78716c", marginBottom: "16px" }}>Register & await Principal approval to access</p>
              <ul style={{ listStyle: "none", marginBottom: "24px" }}>
                {["Add & manage students", "Enter test scores (0–10)", "Run dropout prediction", "View clusters & rules"].map((f, j) => (
                  <li key={j} style={{ fontSize: "14px", color: "#44403c", padding: "8px 0", borderBottom: "1px solid #f5f5f4", display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    <span style={{ color: "#9a3412", fontWeight: 700, marginTop: "1px" }}>—</span>{f}
                  </li>
                ))}
              </ul>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className="role-btn"
                  style={{ flex: 1, color: "#9a3412", background: "transparent", border: "1px solid #9a3412", padding: "11px", borderRadius: "2px", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all .2s", fontFamily: "'IBM Plex Sans', sans-serif" }}
                  onClick={() => navigate("/register", { state: { role: "TEACHER" } })}
                  onMouseEnter={e => { e.currentTarget.style.background = "#fff7ed"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                  Register
                </button>
                <button
                  className="role-btn"
                  style={{ flex: 1, color: "#fafaf9", background: "#9a3412", border: "none", padding: "11px", borderRadius: "2px", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all .2s", fontFamily: "'IBM Plex Sans', sans-serif" }}
                  onClick={() => navigate("/login", { state: { role: "TEACHER" } })}>
                  Login
                </button>
              </div>
            </div>

            <div className="rcard" style={{ background: "#fff", borderRadius: "2px", padding: "28px", boxShadow: "0 1px 0 rgba(28,25,23,.06)", border: "1px solid #e7e5e4", borderTop: "3px solid #0f766e", transition: "all .25s" }}>
              <div style={{ fontSize: "36px", marginBottom: "10px" }}>👨‍🎓</div>
              <h3 style={{ fontFamily: "'Newsreader', serif", fontWeight: 700, fontSize: "1.35rem", color: "#1c1917", marginBottom: "6px" }}>Student</h3>
              <p style={{ fontSize: "13px", color: "#78716c", marginBottom: "16px" }}>Register & await Teacher approval to access</p>
              <ul style={{ listStyle: "none", marginBottom: "24px" }}>
                {["View personal scores", "See Pass / At Risk status", "Know which tests to improve", "Track academic progress"].map((f, j) => (
                  <li key={j} style={{ fontSize: "14px", color: "#44403c", padding: "8px 0", borderBottom: "1px solid #f5f5f4", display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    <span style={{ color: "#0f766e", fontWeight: 700, marginTop: "1px" }}>—</span>{f}
                  </li>
                ))}
              </ul>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className="role-btn"
                  style={{ flex: 1, color: "#0f766e", background: "transparent", border: "1px solid #0f766e", padding: "11px", borderRadius: "2px", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all .2s", fontFamily: "'IBM Plex Sans', sans-serif" }}
                  onClick={() => navigate("/register", { state: { role: "STUDENT" } })}
                  onMouseEnter={e => { e.currentTarget.style.background = "#f0fdfa"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                  Register
                </button>
                <button
                  className="role-btn"
                  style={{ flex: 1, color: "#fafaf9", background: "#0f766e", border: "none", padding: "11px", borderRadius: "2px", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all .2s", fontFamily: "'IBM Plex Sans', sans-serif" }}
                  onClick={() => navigate("/login", { state: { role: "STUDENT" } })}>
                  Login
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══ RESULTS — model performance stats ═══════════════ */}
      <section id="results" style={{ background: "#fafaf9", padding: "88px 24px", borderTop: "1px solid #e7e5e4" }}>
        <div style={{ maxWidth: "1040px", margin: "0 auto" }}>
          <div className="section-kicker">Model performance</div>
          <h2 style={{ fontFamily: "'Newsreader', serif", fontWeight: 700, fontSize: "clamp(1.75rem, 3vw, 2.25rem)", color: "#1c1917", marginBottom: "12px", letterSpacing: "-0.02em" }}>Proven results</h2>
          <p style={{ fontSize: "15px", color: "#57534e", lineHeight: 1.75, maxWidth: "540px", marginBottom: "44px" }}>Validated using 10-fold cross-validation on 96 student records, the model consistently outperforms existing classification-only approaches.</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "16px", marginBottom: "44px" }}>
            {stats.map((st, i) => (
              <div key={i} className="stat-item" style={{
                background: "#fff", border: "1px solid #e7e5e4", borderRadius: "2px", padding: "28px 18px", textAlign: "left",
                animationDelay: `${i * 0.1}s`, borderLeft: `3px solid ${st.color}`
              }}>
                <div style={{ fontFamily: "'Newsreader', serif", fontWeight: 700, fontSize: "2.5rem", lineHeight: 1, color: st.color, marginBottom: "6px" }}>{st.value}</div>
                <div style={{ fontSize: "12px", color: "#57534e", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>{st.label}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "#fff", borderRadius: "2px", padding: "28px", border: "1px solid #e7e5e4" }}>
            <h3 style={{ fontFamily: "'Newsreader', serif", fontWeight: 700, fontSize: "1.05rem", color: "#1c1917", marginBottom: "18px" }}>Full validation metrics (Weka · 10-fold cross-validation)</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "14px" }}>
              {[
                { label: "Accuracy",           value: "93.8%",  bar: 0.938, color: "#9a3412" },
                { label: "Precision",          value: "93.8%",  bar: 0.938, color: "#0f766e" },
                { label: "Recall",             value: "98.4%",  bar: 0.984, color: "#44403c" },
                { label: "F-Measure",          value: "96.1%",  bar: 0.961, color: "#b45309" },
                { label: "Kappa Statistic",    value: "0.884",  bar: 0.884, color: "#15803d" },
                { label: "Mean Abs. Error",    value: "0.0735", bar: 0.073, color: "#991b1b" },
              ].map((m, i) => (
                <div key={i} style={{ padding: "12px 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", gap: "8px" }}>
                    <span style={{ fontSize: "13px", color: "#57534e", fontWeight: 500 }}>{m.label}</span>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: m.color, fontFamily: "'IBM Plex Sans', sans-serif" }}>{m.value}</span>
                  </div>
                  <div style={{ height: "4px", borderRadius: "1px", background: "#e7e5e4", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: "1px", background: m.color, width: `${m.bar * 100}%`, transition: "width 1s ease" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ ABOUT — research context ════════════════════════ */}
      <section id="about" style={{ background: "#1c1917", padding: "88px 24px", borderTop: "1px solid #292524" }}>
        <div style={{ maxWidth: "1040px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "start" }}>

            <div>
              <div className="section-kicker" style={{ color: "#a8a29e", borderLeftColor: "#ea580c" }}>About this project</div>
              <h2 style={{ fontFamily: "'Newsreader', serif", fontWeight: 700, fontSize: "clamp(1.65rem, 3vw, 2rem)", color: "#fafaf9", marginBottom: "18px", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                Built on peer-reviewed{" "}
                <span style={{ fontStyle: "italic", color: "#fdba74" }}>IEEE research</span>
              </h2>
              <p style={{ fontSize: "15px", color: "#a8a29e", lineHeight: 1.8, marginBottom: "16px" }}>
                EduPredict is a full-stack web application built on the published research: <em style={{ color: "#e7e5e4", fontStyle: "italic" }}>"A Predictive Model for the Early Identification of Student Dropout Using Data Classification, Clustering, and Association Methods"</em> — Chicon et al., IEEE RITA 2025.
              </p>
              <p style={{ fontSize: "15px", color: "#78716c", lineHeight: 1.8, marginBottom: "28px" }}>
                The system uses Spring Boot (Java) as the backend, React as the frontend, and a Flask Python microservice to host the ML models — all communicating via REST APIs.
              </p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {["Spring Boot", "React JS", "Flask · Python", "MySQL", "Weka · J48"].map((t, i) => (
                  <span key={i} style={{
                    background: "transparent", border: "1px solid #44403c", color: "#d6d3d1",
                    padding: "6px 12px", borderRadius: "2px", fontSize: "11px", fontWeight: 600,
                    letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: "'IBM Plex Sans', sans-serif"
                  }}>{t}</span>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { icon: "📊", title: "96 Student Records",       desc: "Training dataset across Computer Science, Law & Agronomy programs" },
                { icon: "🎯", title: "5 Academic Activities",    desc: "Test 1–4 + Main Exam — scores 0 to 10, validated by Weka" },
                { icon: "👥", title: "4 Risk Clusters",          desc: "K-Means groups at-risk students: Very Low, Borderline, Average Weak, Low Exam" },
                { icon: "🔗", title: "180+ Association Rules",   desc: "Apriori mines patterns like 'Low Test 1 → Low Test 3' with 71–83% confidence" },
              ].map((f, i) => (
                <div key={i} style={{
                  display: "flex", gap: "14px", alignItems: "flex-start",
                  background: "#292524", border: "1px solid #44403c", borderRadius: "2px", padding: "16px 18px"
                }}>
                  <span style={{ fontSize: "22px", flexShrink: 0, marginTop: "2px", opacity: 0.9 }}>{f.icon}</span>
                  <div>
                    <div style={{ fontFamily: "'Newsreader', serif", fontWeight: 700, fontSize: "15px", color: "#fafaf9", marginBottom: "4px" }}>{f.title}</div>
                    <div style={{ fontSize: "13px", color: "#a8a29e", lineHeight: 1.55 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ══ FOOTER ══════════════════════════════════════════ */}
      <footer style={{ background: "#0c0a09", padding: "40px 24px", borderTop: "1px solid #292524" }}>
        <div style={{ maxWidth: "1040px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "12px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "2px", background: "#9a3412",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Newsreader', serif", fontSize: "15px", fontWeight: 700, color: "#fff"
            }}>E</div>
            <span style={{ fontFamily: "'Newsreader', serif", fontWeight: 700, fontSize: "18px", color: "#fafaf9", letterSpacing: "-0.02em" }}>EduPredict</span>
          </div>
          <p style={{ color: "#78716c", fontSize: "13px", marginBottom: "6px" }}>Decision Tree J48 · K-Means Clustering · Apriori Association Rules</p>
          <p style={{ color: "#57534e", fontSize: "12px" }}>© 2025 EduPredict · Based on IEEE Paper by Chicon et al. · Spring Boot · React · Flask</p>
        </div>
      </footer>
    </div>
  );
}
