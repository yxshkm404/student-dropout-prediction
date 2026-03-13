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
        position: "relative", padding: "8px 14px", textDecoration: "none",
        fontSize: "14px", fontWeight: 500, whiteSpace: "nowrap",
        color: scrolled ? (lit ? "#2563eb" : "#374151") : (lit ? "#fff" : "rgba(255,255,255,0.82)"),
        transition: "color 0.3s"
      }}>
      {label}
      <span style={{
        position: "absolute", bottom: "2px", left: "14px", height: "2px",
        borderRadius: "2px", display: "block",
        width: lit ? "calc(100% - 28px)" : "0%",
        background: scrolled ? "linear-gradient(90deg,#2563eb,#7c3aed)" : "linear-gradient(90deg,#fff,rgba(167,139,250,0.9))",
        boxShadow: lit ? (scrolled ? "0 0 8px rgba(37,99,235,0.55)" : "0 0 10px rgba(255,255,255,0.55)") : "none",
        transition: "width 0.38s cubic-bezier(.4,0,.2,1), box-shadow 0.38s"
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
    { icon: "🌳", title: "Decision Tree (J48)",  tag: "Classification", color: "#2563eb", desc: "Classifies students as Pass or At Risk with 93.8% precision using entropy-based splitting — producing a transparent, interpretable decision tree educators can follow." },
    { icon: "🔵", title: "K-Means Clustering",   tag: "Clustering",     color: "#0891b2", desc: "Groups at-risk students into 4 distinct performance profiles, enabling targeted and personalised academic interventions for each cluster type." },
    { icon: "🔗", title: "Apriori Association",  tag: "Association",    color: "#7c3aed", desc: "Mines 180+ association rules revealing which test combinations most strongly predict dropout risk across subjects and semesters." },
  ];

  const stats = [
    { value: "93.8%", label: "Model Precision",      color: "#2563eb" },
    { value: "98.4%", label: "Recall",                color: "#0891b2" },
    { value: "180+",  label: "Association Rules",     color: "#7c3aed" },
    { value: "4",     label: "Student Risk Clusters", color: "#059669" },
  ];

  return (
    <div style={{ fontFamily: "'Outfit',sans-serif", background: "#f1f5f9", color: "#1e293b", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        @keyframes fadeUpIn  { from { opacity:0; transform:translateY(28px) } to { opacity:1; transform:translateY(0) } }
        @keyframes captionIn { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        @keyframes floatOrb  { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-20px) scale(1.05)} }
        @keyframes floatPill { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes dotPulse  { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(96,165,250,.6)} 50%{opacity:.6;box-shadow:0 0 0 6px rgba(96,165,250,0)} }
        @keyframes countUp   { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        .mcard:hover { transform:translateY(-8px)!important; box-shadow:0 24px 50px rgba(0,0,0,.14)!important; }
        .rcard:hover { transform:translateY(-6px)!important; box-shadow:0 20px 44px rgba(0,0,0,.12)!important; }
        .fbub:hover  { transform:scale(1.05); }
        .role-btn:hover { opacity:.88!important; transform:scale(1.02)!important; }
        .stat-item { animation: countUp 0.6s ease both; }
      `}</style>

      {/* ══ NAVBAR ══════════════════════════════════════════ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 300, height: "66px",
        background: ns ? "rgba(255,255,255,0.96)" : "transparent",
        backdropFilter: ns ? "blur(20px)" : "none",
        boxShadow: ns ? "0 2px 24px rgba(0,0,0,.10)" : "none",
        borderBottom: ns ? "1px solid rgba(0,0,0,.07)" : "1px solid transparent",
        transition: "background .45s ease, box-shadow .45s ease, border-color .45s ease"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px", height: "100%", display: "flex", alignItems: "center", gap: "24px" }}>
          <a href="#home" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", flexShrink: 0 }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "9px", background: "linear-gradient(135deg,#2563eb,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px", boxShadow: "0 4px 14px rgba(37,99,235,.35)" }}>⚡</div>
            <span style={{ fontWeight: 800, fontSize: "18px", letterSpacing: "-0.3px", color: ns ? "#0f172a" : "#fff", transition: "color .4s" }}>EduPredict</span>
          </a>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            {NAV_LINKS.map(({ label, href }) => (
              <NavLink key={label} href={href} label={label} isActive={activeNav === href.replace("#", "")} scrolled={ns} />
            ))}
          </div>
          <button
            style={{ background: ns ? "linear-gradient(135deg,#2563eb,#7c3aed)" : "rgba(255,255,255,0.15)", color: "#fff", border: ns ? "none" : "1.5px solid rgba(255,255,255,.55)", padding: "9px 22px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "all .3s", flexShrink: 0 }}
            onClick={() => navigate("/login")}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(37,99,235,.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
            Login →
          </button>
        </div>
      </nav>

      {/* ══ HERO — pure slideshow, NO blue blocks ══════════ */}
      <section id="home" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden" }}>

        {/* Solid dark fallback bg */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0, background: "#060c2e" }} />

        {/* Previous slide fading out */}
        {prev !== null && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 1,
            backgroundImage: `url(${SLIDES[prev].url})`, backgroundSize: "cover", backgroundPosition: "center",
            opacity: trans ? 0 : 1, transition: "opacity 1s ease"
          }} />
        )}

        {/* Current slide */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 2,
          backgroundImage: `url(${SLIDES[current].url})`, backgroundSize: "cover", backgroundPosition: "center",
          opacity: loaded ? 1 : 0, transition: "opacity 1s ease"
        }} />

        {/* Subtle dark overlay — just enough for text readability, NOT a blue block */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 3,
          background: "linear-gradient(120deg, rgba(6,12,46,0.72) 0%, rgba(10,18,68,0.65) 45%, rgba(28,8,56,0.72) 100%)"
        }} />

        {/* Faint grid texture */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 4, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)",
          backgroundSize: "60px 60px"
        }} />

        {/* Soft glow orbs (no opaque colour blocks) */}
        <div style={{ position: "absolute", zIndex: 4, top: "15%", right: "16%", width: "360px", height: "360px", borderRadius: "50%", filter: "blur(100px)", background: "radial-gradient(circle,rgba(37,99,235,.18),transparent 70%)", animation: "floatOrb 12s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", zIndex: 4, bottom: "18%", left: "6%", width: "280px", height: "280px", borderRadius: "50%", filter: "blur(90px)", background: "radial-gradient(circle,rgba(124,58,237,.15),transparent 70%)", animation: "floatOrb 16s ease-in-out infinite reverse", pointerEvents: "none" }} />

        {/* Hero content */}
        <div style={{ position: "relative", zIndex: 5, maxWidth: "1200px", margin: "0 auto", padding: "0 40px", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "60px" }}>
          <div style={{ maxWidth: "620px", animation: "fadeUpIn .9s ease both" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(37,99,235,.18)", border: "1px solid rgba(37,99,235,.40)", color: "#93c5fd", padding: "6px 16px", borderRadius: "100px", fontSize: "12px", fontWeight: 600, letterSpacing: ".5px", marginBottom: "28px" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#60a5fa", display: "inline-block", animation: "dotPulse 2s infinite" }} />
              IEEE Research · Chicon et al. 2025
            </div>
            <h1 style={{ fontWeight: 900, fontSize: "clamp(40px,5.5vw,72px)", color: "#fff", lineHeight: 1.08, letterSpacing: "-2px", marginBottom: "20px" }}>
              Early Detection of<br />
              <span style={{ background: "linear-gradient(90deg,#60a5fa 0%,#a78bfa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Student Dropout</span>
            </h1>
            <p key={current} style={{ fontSize: "17px", color: "rgba(255,255,255,.75)", lineHeight: 1.75, maxWidth: "500px", marginBottom: "36px", fontStyle: "italic", animation: "captionIn .6s ease both" }}>
              {SLIDES[current].caption}
            </p>
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "40px" }}>
              <button
                style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "#fff", border: "none", padding: "14px 32px", borderRadius: "9px", fontSize: "15px", fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 24px rgba(37,99,235,.45)", transition: "all .25s" }}
                onClick={() => navigate("/login")}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(37,99,235,.55)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(37,99,235,.45)"; }}>
                Get Started →
              </button>
              <a href="#models"
                style={{ display: "inline-block", background: "rgba(255,255,255,.10)", border: "1.5px solid rgba(255,255,255,.35)", color: "#fff", padding: "14px 32px", borderRadius: "9px", fontSize: "15px", fontWeight: 500, textDecoration: "none", transition: "all .25s", backdropFilter: "blur(8px)" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.20)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.10)"}>
                Learn More ↓
              </a>
            </div>
            {/* Slide dots */}
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {SLIDES.map((_, i) => (
                <button key={i} onClick={() => goTo(i)} style={{
                  height: "8px", borderRadius: "4px", border: "none", cursor: "pointer", padding: 0,
                  transition: "all .35s ease",
                  background: i === current ? "#fff" : "rgba(255,255,255,.35)",
                  width: i === current ? "28px" : "8px",
                  boxShadow: i === current ? "0 0 8px rgba(255,255,255,.5)" : "none"
                }} />
              ))}
            </div>
          </div>

          {/* Floating metric pills */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", flexShrink: 0 }}>
            {[
              { label: "Precision", val: "93.8%", c: "#60a5fa", delay: "0s"  },
              { label: "Recall",    val: "98.4%", c: "#a78bfa", delay: ".2s" },
              { label: "F-Measure", val: "96.1%", c: "#34d399", delay: ".4s" },
              { label: "Kappa",     val: "0.884", c: "#fb923c", delay: ".6s" },
            ].map((p, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,.10)", backdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,.18)", borderRadius: "14px", padding: "16px 22px", textAlign: "center", minWidth: "120px", boxShadow: "0 8px 24px rgba(0,0,0,.25)", animation: "floatPill 3.5s ease-in-out infinite", animationDelay: p.delay }}>
                <span style={{ display: "block", fontWeight: 800, fontSize: "24px", color: p.c }}>{p.val}</span>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,.65)", fontWeight: 500, marginTop: "3px", display: "block" }}>{p.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ MODELS ══════════════════════════════════════════ */}
      <section id="models" style={{ padding: "96px 24px", background: "#f1f5f9" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "inline-block", background: "rgba(37,99,235,.10)", border: "1px solid rgba(37,99,235,.22)", color: "#2563eb", padding: "4px 14px", borderRadius: "100px", fontSize: "11px", fontWeight: 700, letterSpacing: ".6px", marginBottom: "14px", textTransform: "uppercase" }}>Three Core Models</div>
          <h2 style={{ fontWeight: 800, fontSize: "clamp(26px,3.5vw,42px)", color: "#0f172a", marginBottom: "12px", letterSpacing: "-0.5px" }}>How the Prediction Works</h2>
          <p style={{ fontSize: "15px", color: "#64748b", lineHeight: 1.7, maxWidth: "560px", marginBottom: "52px" }}>Based on the IEEE paper by Chicon et al. (2025), our system combines three machine learning models to identify dropout risk early and accurately.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "24px" }}>
            {models.map((m, i) => (
              <div key={i} className="mcard" style={{ background: "#fff", borderRadius: "16px", padding: "30px", boxShadow: "0 2px 20px rgba(0,0,0,.07)", borderTop: `3px solid ${m.color}`, transition: "all .3s", cursor: "default" }}>
                <div style={{ fontSize: "38px", marginBottom: "14px" }}>{m.icon}</div>
                <span style={{ display: "inline-block", padding: "3px 11px", borderRadius: "100px", fontSize: "11px", fontWeight: 700, letterSpacing: ".4px", marginBottom: "12px", color: m.color, background: m.color + "18", border: `1px solid ${m.color}30` }}>{m.tag}</span>
                <h3 style={{ fontWeight: 700, fontSize: "18px", color: m.color, marginBottom: "10px" }}>{m.title}</h3>
                <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.75 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PREDICTION FLOW ═════════════════════════════════ */}
      <section style={{ padding: "96px 24px", background: "#fff" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "inline-block", background: "rgba(37,99,235,.10)", border: "1px solid rgba(37,99,235,.22)", color: "#2563eb", padding: "4px 14px", borderRadius: "100px", fontSize: "11px", fontWeight: 700, letterSpacing: ".6px", marginBottom: "14px", textTransform: "uppercase" }}>Prediction Pipeline</div>
          <h2 style={{ fontWeight: 800, fontSize: "clamp(26px,3.5vw,42px)", color: "#0f172a", marginBottom: "52px", letterSpacing: "-0.5px" }}>From Score Entry to Early Action</h2>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0" }}>
            {[
              { n: "01", t: "Enter Scores",   d: "Test 1–4 + Main Exam",      c: "#2563eb" },
              { n: "02", t: "Classify",        d: "Pass or At Risk via J48",   c: "#0891b2" },
              { n: "03", t: "Cluster",         d: "Assign to risk profile",    c: "#7c3aed" },
              { n: "04", t: "Analyze Rules",   d: "Apriori failure patterns",  c: "#d97706" },
              { n: "05", t: "Intervene Early", d: "Act before dropout occurs", c: "#059669" },
            ].map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center" }}>
                <div className="fbub" style={{ borderRadius: "14px", padding: "20px 18px", minWidth: "148px", textAlign: "center", background: f.c + "16", border: `2px solid ${f.c}35`, color: f.c, transition: "transform .25s", cursor: "default" }}>
                  <div style={{ fontWeight: 800, fontSize: "11px", opacity: .65, marginBottom: "5px" }}>{f.n}</div>
                  <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "5px" }}>{f.t}</div>
                  <div style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.4 }}>{f.d}</div>
                </div>
                {i < 4 && <div style={{ height: "2px", width: "28px", flexShrink: 0, borderRadius: "2px", background: f.c + "45" }} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ROLES — with Register + Login buttons ═══════════ */}
      <section id="roles" style={{ padding: "96px 24px", background: "#f1f5f9" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "inline-block", background: "rgba(37,99,235,.10)", border: "1px solid rgba(37,99,235,.22)", color: "#2563eb", padding: "4px 14px", borderRadius: "100px", fontSize: "11px", fontWeight: 700, letterSpacing: ".6px", marginBottom: "14px", textTransform: "uppercase" }}>Three User Roles</div>
          <h2 style={{ fontWeight: 800, fontSize: "clamp(26px,3.5vw,42px)", color: "#0f172a", marginBottom: "52px", letterSpacing: "-0.5px" }}>Who Uses EduPredict?</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "24px" }}>

            {/* ── PRINCIPAL ── login only (no self-register) */}
            <div className="rcard" style={{ background: "#fff", borderRadius: "16px", padding: "30px", boxShadow: "0 2px 20px rgba(0,0,0,.07)", borderLeft: "4px solid #7c3aed", transition: "all .3s" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>🏫</div>
              <h3 style={{ fontWeight: 800, fontSize: "22px", color: "#7c3aed", marginBottom: "6px" }}>Principal</h3>
              <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "18px" }}>Pre-configured account — no registration needed</p>
              <ul style={{ listStyle: "none", marginBottom: "28px" }}>
                {["Approve / reject teachers", "Monitor all students", "View dropout statistics", "Track school-wide trends"].map((f, j) => (
                  <li key={j} style={{ fontSize: "14px", color: "#475569", padding: "7px 0", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#7c3aed", fontWeight: 700 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              {/* Login only */}
              <button
                className="role-btn"
                style={{ width: "100%", color: "#fff", background: "#7c3aed", border: "none", padding: "12px", borderRadius: "9px", fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "all .2s" }}
                onClick={() => navigate("/login", { state: { role: "PRINCIPAL" } })}>
                Login as Principal
              </button>
            </div>

            {/* ── TEACHER ── register + login */}
            <div className="rcard" style={{ background: "#fff", borderRadius: "16px", padding: "30px", boxShadow: "0 2px 20px rgba(0,0,0,.07)", borderLeft: "4px solid #2563eb", transition: "all .3s" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>👨‍🏫</div>
              <h3 style={{ fontWeight: 800, fontSize: "22px", color: "#2563eb", marginBottom: "6px" }}>Teacher</h3>
              <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "18px" }}>Register & await Principal approval to access</p>
              <ul style={{ listStyle: "none", marginBottom: "28px" }}>
                {["Add & manage students", "Enter test scores (0–10)", "Run dropout prediction", "View clusters & rules"].map((f, j) => (
                  <li key={j} style={{ fontSize: "14px", color: "#475569", padding: "7px 0", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#2563eb", fontWeight: 700 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              {/* Register + Login */}
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className="role-btn"
                  style={{ flex: 1, color: "#2563eb", background: "transparent", border: "2px solid #2563eb", padding: "11px", borderRadius: "9px", fontSize: "13px", fontWeight: 700, cursor: "pointer", transition: "all .2s" }}
                  onClick={() => navigate("/register", { state: { role: "TEACHER" } })}
                  onMouseEnter={e => { e.currentTarget.style.background = "#2563eb"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#2563eb"; }}>
                  Register
                </button>
                <button
                  className="role-btn"
                  style={{ flex: 1, color: "#fff", background: "#2563eb", border: "none", padding: "11px", borderRadius: "9px", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all .2s" }}
                  onClick={() => navigate("/login", { state: { role: "TEACHER" } })}>
                  Login
                </button>
              </div>
            </div>

            {/* ── STUDENT ── register + login */}
            <div className="rcard" style={{ background: "#fff", borderRadius: "16px", padding: "30px", boxShadow: "0 2px 20px rgba(0,0,0,.07)", borderLeft: "4px solid #0891b2", transition: "all .3s" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>👨‍🎓</div>
              <h3 style={{ fontWeight: 800, fontSize: "22px", color: "#0891b2", marginBottom: "6px" }}>Student</h3>
              <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "18px" }}>Register & await Teacher approval to access</p>
              <ul style={{ listStyle: "none", marginBottom: "28px" }}>
                {["View personal scores", "See Pass / At Risk status", "Know which tests to improve", "Track academic progress"].map((f, j) => (
                  <li key={j} style={{ fontSize: "14px", color: "#475569", padding: "7px 0", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#0891b2", fontWeight: 700 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              {/* Register + Login */}
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className="role-btn"
                  style={{ flex: 1, color: "#0891b2", background: "transparent", border: "2px solid #0891b2", padding: "11px", borderRadius: "9px", fontSize: "13px", fontWeight: 700, cursor: "pointer", transition: "all .2s" }}
                  onClick={() => navigate("/register", { state: { role: "STUDENT" } })}
                  onMouseEnter={e => { e.currentTarget.style.background = "#0891b2"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#0891b2"; }}>
                  Register
                </button>
                <button
                  className="role-btn"
                  style={{ flex: 1, color: "#fff", background: "#0891b2", border: "none", padding: "11px", borderRadius: "9px", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all .2s" }}
                  onClick={() => navigate("/login", { state: { role: "STUDENT" } })}>
                  Login
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══ RESULTS — model performance stats ═══════════════ */}
      <section id="results" style={{ background: "#fff", padding: "96px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "inline-block", background: "rgba(37,99,235,.10)", border: "1px solid rgba(37,99,235,.22)", color: "#2563eb", padding: "4px 14px", borderRadius: "100px", fontSize: "11px", fontWeight: 700, letterSpacing: ".6px", marginBottom: "14px", textTransform: "uppercase" }}>Model Performance</div>
          <h2 style={{ fontWeight: 800, fontSize: "clamp(26px,3.5vw,42px)", color: "#0f172a", marginBottom: "12px", letterSpacing: "-0.5px" }}>Proven Results</h2>
          <p style={{ fontSize: "15px", color: "#64748b", lineHeight: 1.7, maxWidth: "560px", marginBottom: "52px" }}>Validated using 10-fold cross-validation on 96 student records, the model consistently outperforms existing classification-only approaches.</p>

          {/* Big stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "20px", marginBottom: "52px" }}>
            {stats.map((st, i) => (
              <div key={i} className="stat-item" style={{ background: "#f8fafc", border: `2px solid ${st.color}22`, borderRadius: "16px", padding: "32px 20px", textAlign: "center", animationDelay: `${i * 0.12}s` }}>
                <div style={{ fontWeight: 900, fontSize: "48px", lineHeight: 1, color: st.color, marginBottom: "8px" }}>{st.value}</div>
                <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 600 }}>{st.label}</div>
              </div>
            ))}
          </div>

          {/* Metrics detail table */}
          <div style={{ background: "#f8fafc", borderRadius: "16px", padding: "32px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ fontWeight: 700, fontSize: "16px", color: "#0f172a", marginBottom: "20px" }}>Full Validation Metrics (Weka · 10-Fold Cross-Validation)</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "16px" }}>
              {[
                { label: "Accuracy",           value: "93.8%",  bar: 0.938, color: "#2563eb" },
                { label: "Precision",          value: "93.8%",  bar: 0.938, color: "#0891b2" },
                { label: "Recall",             value: "98.4%",  bar: 0.984, color: "#7c3aed" },
                { label: "F-Measure",          value: "96.1%",  bar: 0.961, color: "#059669" },
                { label: "Kappa Statistic",    value: "0.884",  bar: 0.884, color: "#d97706" },
                { label: "Mean Abs. Error",    value: "0.0735", bar: 0.073, color: "#dc2626" },
              ].map((m, i) => (
                <div key={i} style={{ padding: "14px 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 500 }}>{m.label}</span>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: m.color }}>{m.value}</span>
                  </div>
                  <div style={{ height: "6px", borderRadius: "3px", background: "#e2e8f0", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: "3px", background: m.color, width: `${m.bar * 100}%`, transition: "width 1s ease" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ ABOUT — research context ════════════════════════ */}
      <section id="about" style={{ background: "#0f172a", padding: "96px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "center" }}>

            {/* Left: About text */}
            <div>
              <div style={{ display: "inline-block", background: "rgba(255,255,255,.10)", border: "1px solid rgba(255,255,255,.18)", color: "#93c5fd", padding: "4px 14px", borderRadius: "100px", fontSize: "11px", fontWeight: 700, letterSpacing: ".6px", marginBottom: "20px", textTransform: "uppercase" }}>About This Project</div>
              <h2 style={{ fontWeight: 900, fontSize: "clamp(26px,3.5vw,40px)", color: "#fff", marginBottom: "20px", letterSpacing: "-0.5px", lineHeight: 1.15 }}>
                Built on Peer-Reviewed<br />
                <span style={{ background: "linear-gradient(90deg,#60a5fa,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>IEEE Research</span>
              </h2>
              <p style={{ fontSize: "15px", color: "rgba(255,255,255,.65)", lineHeight: 1.8, marginBottom: "20px" }}>
                EduPredict is a full-stack web application built on the published research: <em style={{ color: "rgba(255,255,255,.85)" }}>"A Predictive Model for the Early Identification of Student Dropout Using Data Classification, Clustering, and Association Methods"</em> — Chicon et al., IEEE RITA 2025.
              </p>
              <p style={{ fontSize: "15px", color: "rgba(255,255,255,.55)", lineHeight: 1.8, marginBottom: "32px" }}>
                The system uses Spring Boot (Java) as the backend, React as the frontend, and a Flask Python microservice to host the ML models — all communicating via REST APIs.
              </p>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {["Spring Boot", "React JS", "Flask · Python", "MySQL", "Weka · J48"].map((t, i) => (
                  <span key={i} style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.15)", color: "rgba(255,255,255,.75)", padding: "6px 14px", borderRadius: "100px", fontSize: "12px", fontWeight: 600 }}>{t}</span>
                ))}
              </div>
            </div>

            {/* Right: Key facts */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                { icon: "📊", title: "96 Student Records",       desc: "Training dataset across Computer Science, Law & Agronomy programs" },
                { icon: "🎯", title: "5 Academic Activities",    desc: "Test 1–4 + Main Exam — scores 0 to 10, validated by Weka" },
                { icon: "👥", title: "4 Risk Clusters",          desc: "K-Means groups at-risk students: Very Low, Borderline, Average Weak, Low Exam" },
                { icon: "🔗", title: "180+ Association Rules",   desc: "Apriori mines patterns like 'Low Test 1 → Low Test 3' with 71–83% confidence" },
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", gap: "16px", alignItems: "flex-start", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", borderRadius: "12px", padding: "18px 20px" }}>
                  <span style={{ fontSize: "26px", flexShrink: 0, marginTop: "2px" }}>{f.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "15px", color: "#fff", marginBottom: "4px" }}>{f.title}</div>
                    <div style={{ fontSize: "13px", color: "rgba(255,255,255,.50)", lineHeight: 1.5 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          
        </div>
      </section>

      {/* ══ FOOTER ══════════════════════════════════════════ */}
      <footer style={{ background: "#060c1a", padding: "44px 24px", borderTop: "1px solid rgba(255,255,255,.05)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "14px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "linear-gradient(135deg,#2563eb,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>⚡</div>
            <span style={{ fontWeight: 800, fontSize: "18px", color: "#fff", letterSpacing: "-0.3px" }}>EduPredict</span>
          </div>
          <p style={{ color: "#475569", fontSize: "13px", marginBottom: "6px" }}>Decision Tree J48 · K-Means Clustering · Apriori Association Rules</p>
          <p style={{ color: "#334155", fontSize: "12px" }}>© 2025 EduPredict · Based on IEEE Paper by Chicon et al. · Spring Boot · React · Flask</p>
        </div>
      </footer>
    </div>
  );
}