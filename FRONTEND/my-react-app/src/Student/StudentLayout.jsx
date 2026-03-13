import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

const NAV = [
  { label: "Dashboard",  to: "/student/dashboard"  },
  { label: "My Scores",  to: "/student/scores"     },
  { label: "Prediction", to: "/student/prediction" },
  { label: "My Profile", to: "/student/profile"    },
];

function TopNavLink({ to, label }) {
  const [hov, setHov] = useState(false);
  const location = useLocation();
  const isActive = location.pathname === to;
  const lit = isActive || hov;
  return (
    <NavLink to={to}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ position:"relative", padding:"8px 14px", textDecoration:"none",
        fontSize:"14px", fontWeight: isActive ? 700 : 500, whiteSpace:"nowrap",
        color: lit ? "#fff" : "rgba(255,255,255,0.72)", transition:"color 0.3s" }}>
      {label}
      <span style={{ position:"absolute", bottom:"2px", left:"14px", height:"2px",
        borderRadius:"2px", display:"block",
        width: lit ? "calc(100% - 28px)" : "0%",
        background:"linear-gradient(90deg,#fff,rgba(167,139,250,0.9))",
        boxShadow: lit ? "0 0 10px rgba(255,255,255,0.55)" : "none",
        transition:"width 0.38s cubic-bezier(.4,0,.2,1), box-shadow 0.38s" }} />
    </NavLink>
  );
}

export default function StudentLayout() {
  const navigate = useNavigate();
  const name = sessionStorage.getItem("name") || "Student";
  const [hovLog, setHovLog] = useState(false);
  const handleLogout = () => { sessionStorage.clear(); navigate("/login"); };

  return (
    <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh", fontFamily:"'Outfit',sans-serif", background:"#f1f5f9" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
      `}</style>

      <nav style={{ position:"sticky", top:0, zIndex:300, height:"66px",
        background:"#0a0f2e", backdropFilter:"blur(20px)",
        boxShadow:"0 2px 24px rgba(0,0,0,.25)",
        borderBottom:"1px solid rgba(255,255,255,0.07)", flexShrink:0 }}>
        <div style={{ maxWidth:"1400px", margin:"0 auto", padding:"0 32px",
          height:"100%", display:"flex", alignItems:"center", gap:"24px" }}>

          <div style={{ display:"flex", alignItems:"center", gap:"10px", flexShrink:0 }}>
            <div style={{ width:"36px", height:"36px", borderRadius:"9px",
              background:"linear-gradient(135deg,#2563eb,#7c3aed)", display:"flex",
              alignItems:"center", justifyContent:"center", fontSize:"17px",
              boxShadow:"0 4px 14px rgba(37,99,235,.35)" }}>⚡</div>
            <span style={{ fontWeight:800, fontSize:"18px", letterSpacing:"-0.3px", color:"#fff" }}>EduPredict</span>
          </div>

          <div style={{ flex:1 }} />

          <div style={{ display:"flex", alignItems:"center", gap:"2px" }}>
            {NAV.map(item => <TopNavLink key={item.to} to={item.to} label={item.label} />)}
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:"14px", flexShrink:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:"8px",
              background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.13)",
              borderRadius:"100px", padding:"5px 14px 5px 7px" }}>
              <div style={{ width:"28px", height:"28px", borderRadius:"50%",
                background:"linear-gradient(135deg,#0891b2,#38bdf8)", display:"flex",
                alignItems:"center", justifyContent:"center", fontSize:"13px" }}>👨‍🎓</div>
              <div>
                <div style={{ fontSize:"10px", fontWeight:700, color:"#38bdf8",
                  textTransform:"uppercase", letterSpacing:".4px", lineHeight:1 }}>Student</div>
                <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.85)", fontWeight:600, marginTop:"2px" }}>{name}</div>
              </div>
            </div>
            <button
              onMouseEnter={() => setHovLog(true)} onMouseLeave={() => setHovLog(false)}
              onClick={handleLogout}
              style={{ background: hovLog ? "linear-gradient(135deg,#ef4444,#dc2626)" : "rgba(255,255,255,0.10)",
                color:"#fff", border:"1.5px solid rgba(255,255,255,.25)",
                padding:"9px 22px", borderRadius:"8px", fontSize:"14px", fontWeight:600,
                cursor:"pointer", fontFamily:"inherit", transition:"all .3s",
                transform: hovLog ? "translateY(-1px)" : "translateY(0)",
                boxShadow: hovLog ? "0 6px 20px rgba(239,68,68,.35)" : "none" }}>
              Logout →
            </button>
          </div>
        </div>
      </nav>

      <main style={{ flex:1, minWidth:0 }}>
        <Outlet />
      </main>
    </div>
  );
}