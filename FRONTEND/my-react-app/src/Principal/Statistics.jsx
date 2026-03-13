import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

const COLORS_TEACHER  = ["#7c3aed","#10b981","#ef4444","#f59e0b"];
const COLORS_STUDENT  = ["#2563eb","#10b981","#ef4444","#f59e0b"];
const COLORS_PRED     = ["#10b981","#ef4444"];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background:"#0f172a", color:"#fff", padding:"10px 14px", borderRadius:"10px", fontSize:"13px", fontWeight:600, boxShadow:"0 8px 24px rgba(0,0,0,.3)" }}>
        {payload[0].name}: <span style={{ color:payload[0].fill || "#a78bfa" }}>{payload[0].value}</span>
      </div>
    );
  }
  return null;
};

export default function Statistics() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8080/api/principal/statistics")
      .then(r => r.json())
      .then(d => { if (d.success) setStats(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ padding:"80px", textAlign:"center", fontFamily:"'Outfit',sans-serif", color:"#94a3b8", fontSize:"15px" }}>
      Loading statistics…
    </div>
  );

  if (!stats) return (
    <div style={{ padding:"80px", textAlign:"center", fontFamily:"'Outfit',sans-serif", color:"#ef4444", fontSize:"15px" }}>
      Failed to load statistics.
    </div>
  );

  const teacherData = [
    { name:"Approved", value: stats.approvedTeachers  || 0 },
    { name:"Pending",  value: stats.pendingTeachers   || 0 },
    { name:"Rejected", value: stats.rejectedTeachers  || 0 },
  ].filter(d => d.value > 0);

  const studentData = [
    { name:"Approved", value: stats.approvedStudents  || 0 },
    { name:"Pending",  value: stats.pendingStudents   || 0 },
    { name:"Rejected", value: stats.rejectedStudents  || 0 },
  ].filter(d => d.value > 0);

  const predData = [
    { name:"Pass",    value: stats.passStudents    || 0 },
    { name:"At Risk", value: stats.atRiskStudents  || 0 },
  ];

  const barData = [
    { name:"Total Teachers",    value: stats.totalTeachers   || 0, fill:"#7c3aed" },
    { name:"Approved Teachers", value: stats.approvedTeachers|| 0, fill:"#10b981" },
    { name:"Pending Teachers",  value: stats.pendingTeachers || 0, fill:"#f59e0b" },
    { name:"Total Students",    value: stats.totalStudents   || 0, fill:"#2563eb" },
    { name:"Pass",              value: stats.passStudents    || 0, fill:"#34d399" },
    { name:"At Risk",           value: stats.atRiskStudents  || 0, fill:"#ef4444" },
  ];

  const BIG_CARDS = [
    { label:"Total Teachers",   val:stats.totalTeachers,   icon:"👨‍🏫", grad:"linear-gradient(135deg,#7c3aed,#a855f7)", shadow:"rgba(124,58,237,.35)"  },
    { label:"Pending Teachers", val:stats.pendingTeachers, icon:"⏳",   grad:"linear-gradient(135deg,#f59e0b,#fb923c)", shadow:"rgba(245,158,11,.35)"  },
    { label:"Total Students",   val:stats.totalStudents,   icon:"👨‍🎓", grad:"linear-gradient(135deg,#2563eb,#38bdf8)", shadow:"rgba(37,99,235,.35)"   },
    { label:"At Risk Students", val:stats.atRiskStudents,  icon:"⚠️",   grad:"linear-gradient(135deg,#ef4444,#f97316)", shadow:"rgba(239,68,68,.35)"   },
  ];

  return (
    <div style={{ padding:"36px", minHeight:"100vh", background:"#f1f5f9", fontFamily:"'Outfit',sans-serif" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .scard { transition:transform .25s, box-shadow .25s; }
        .scard:hover { transform:translateY(-4px); }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom:"28px", animation:"fadeUp .6s ease both" }}>
        <h1 style={{ fontWeight:800, fontSize:"26px", color:"#0f172a", letterSpacing:"-0.5px", marginBottom:"4px" }}>📊 Statistics</h1>
        <p style={{ fontSize:"14px", color:"#64748b" }}>School-wide overview of teachers, students and prediction outcomes</p>
      </div>

      {/* Big stat cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))", gap:"20px", marginBottom:"36px", animation:"fadeUp .6s ease both .05s", opacity:0, animationFillMode:"forwards" }}>
        {BIG_CARDS.map((c,i) => (
          <div key={i} className="scard"
            style={{ background:c.grad, borderRadius:"16px", padding:"24px 22px", boxShadow:`0 8px 28px ${c.shadow}` }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"14px" }}>
              <span style={{ fontSize:"26px" }}>{c.icon}</span>
            </div>
            <div style={{ fontWeight:900, fontSize:"38px", color:"#fff", lineHeight:1, marginBottom:"4px" }}>{c.val ?? "—"}</div>
            <div style={{ fontSize:"13px", color:"rgba(255,255,255,.75)", fontWeight:500 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"20px", marginBottom:"28px", animation:"fadeUp .6s ease both .1s", opacity:0, animationFillMode:"forwards" }}>

        {/* Teacher distribution */}
        <div style={{ background:"#fff", borderRadius:"16px", boxShadow:"0 2px 16px rgba(0,0,0,.06)", padding:"24px" }}>
          <h3 style={{ fontWeight:700, fontSize:"15px", color:"#0f172a", marginBottom:"4px" }}>👨‍🏫 Teacher Status</h3>
          <p style={{ fontSize:"12px", color:"#94a3b8", marginBottom:"20px" }}>Approval distribution</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={teacherData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {teacherData.map((_, i) => <Cell key={i} fill={COLORS_TEACHER[i]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:"12px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Student distribution */}
        <div style={{ background:"#fff", borderRadius:"16px", boxShadow:"0 2px 16px rgba(0,0,0,.06)", padding:"24px" }}>
          <h3 style={{ fontWeight:700, fontSize:"15px", color:"#0f172a", marginBottom:"4px" }}>👨‍🎓 Student Status</h3>
          <p style={{ fontSize:"12px", color:"#94a3b8", marginBottom:"20px" }}>Approval distribution</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={studentData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {studentData.map((_, i) => <Cell key={i} fill={COLORS_STUDENT[i]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:"12px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Prediction distribution */}
        <div style={{ background:"#fff", borderRadius:"16px", boxShadow:"0 2px 16px rgba(0,0,0,.06)", padding:"24px" }}>
          <h3 style={{ fontWeight:700, fontSize:"15px", color:"#0f172a", marginBottom:"4px" }}>🎯 Prediction Results</h3>
          <p style={{ fontSize:"12px", color:"#94a3b8", marginBottom:"20px" }}>Pass vs At Risk</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={predData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {predData.map((_, i) => <Cell key={i} fill={COLORS_PRED[i]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:"12px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Full bar chart */}
      <div style={{ background:"#fff", borderRadius:"16px", boxShadow:"0 2px 16px rgba(0,0,0,.06)", padding:"28px", animation:"fadeUp .6s ease both .15s", opacity:0, animationFillMode:"forwards" }}>
        <h3 style={{ fontWeight:700, fontSize:"15px", color:"#0f172a", marginBottom:"4px" }}>📈 School Overview</h3>
        <p style={{ fontSize:"12px", color:"#94a3b8", marginBottom:"24px" }}>All key metrics at a glance</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={barData} barSize={36} margin={{ top:0, right:0, left:-10, bottom:0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize:11, fill:"#94a3b8", fontFamily:"'Outfit',sans-serif" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize:11, fill:"#94a3b8", fontFamily:"'Outfit',sans-serif" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill:"rgba(124,58,237,.05)" }} />
            <Bar dataKey="value" radius={[6,6,0,0]}>
              {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
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