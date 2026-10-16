import React, { useEffect, useState } from "react";
import axios from "axios";

function FreelancerHub() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  const [proposals, setProposals] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (user?._id && token) {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [projectsRes, proposalsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/projects/all", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(
          `http://localhost:5000/api/proposals/freelancer/${user._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
      ]);

      setProjects(projectsRes.data || []);
      setProposals(proposalsRes.data || []);

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const statusStyle = (status) => {
    const map = {
      pending: {
        bg: "rgba(246,173,85,0.12)",
        color: "#F6AD55",
        border: "rgba(246,173,85,0.25)",
      },
      accepted: {
        bg: "rgba(67,232,160,0.1)",
        color: "#43E8A0",
        border: "rgba(67,232,160,0.25)",
      },
      rejected: {
        bg: "rgba(255,101,132,0.1)",
        color: "#FF6584",
        border: "rgba(255,101,132,0.25)",
      },
    };
    return map[status] || map.pending;
  };

  const tabs = ["overview", "proposals", "projects", "profile"];

  const stats = [
    {
      label: "Applied Gigs",
      value: proposals.length,
      color: "#6C63FF",
      sub: "Total applications",
    },
    {
      label: "Accepted",
      value: proposals.filter((p) => p.status === "accepted").length,
      color: "#43E8A0",
      sub: "Won proposals",
    },
    {
      label: "Pending",
      value: proposals.filter((p) => p.status === "pending").length,
      color: "#F6AD55",
      sub: "Awaiting response",
    },
    {
      label: "Available Gigs",
      value: projects.length,
      color: "#A09BFF",
      sub: "On marketplace",
    },
  ];

  const skills =
    user?.skills || [
      "React.js",
      "Node.js",
      "MongoDB",
      "Tailwind CSS",
      "Express",
    ];

  const barHeights = [35, 55, 40, 75, 60, 88, 100];

  return (
    <>
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;700&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .fh-tab {
          padding: 8px 18px;
          border-radius: 8px;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid transparent;
          color: #8B8FA8;
          background: none;
          transition: all 0.15s;
          text-transform: capitalize;
        }
        .fh-tab:hover { background: #1A1D27; color: #F0F2FF; }
        .fh-tab.active {
          background: rgba(108,99,255,0.12);
          color: #A09BFF;
          border-color: rgba(108,99,255,0.25);
        }

        .fh-card {
          background: #1A1D27;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 22px;
        }

        .fh-stat-card {
          background: #1A1D27;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 20px;
          transition: border-color 0.2s;
        }
        .fh-stat-card:hover { border-color: rgba(255,255,255,0.15); }

        .fh-proposal-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 12px;
          padding: 13px 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          align-items: center;
          font-size: 13px;
        }
        .fh-proposal-row:last-child { border-bottom: none; }

        .fh-table-header {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 12px;
          padding: 8px 0 12px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #5A5E72;
        }

        .fh-project-card {
          background: #1A1D27;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 18px;
          transition: all 0.2s;
          cursor: pointer;
        }
        .fh-project-card:hover {
          border-color: rgba(255,255,255,0.16);
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        .btn-apply {
          padding: 7px 14px;
          border-radius: 8px;
          font-size: 12px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          cursor: pointer;
          border: none;
          background: #6C63FF;
          color: #fff;
          transition: all 0.15s;
        }
        .btn-apply:hover { background: #7B74FF; transform: translateY(-1px); }

        .btn-ghost-sm {
          padding: 7px 14px;
          border-radius: 8px;
          font-size: 12px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          cursor: pointer;
          background: #20232F;
          color: #8B8FA8;
          border: 1px solid rgba(255,255,255,0.08);
          transition: all 0.15s;
        }
        .btn-ghost-sm:hover { background: #272A38; color: #F0F2FF; }

        .skill-tag {
          display: inline-block;
          background: rgba(108,99,255,0.12);
          color: #A09BFF;
          border: 1px solid rgba(108,99,255,0.22);
          border-radius: 20px;
          padding: 5px 13px;
          font-size: 12px;
          font-family: 'DM Sans', sans-serif;
        }

        .progress-bar {
          height: 5px;
          background: rgba(255,255,255,0.07);
          border-radius: 3px;
          overflow: hidden;
          margin-top: 6px;
        }
        .progress-fill {
          height: 100%;
          border-radius: 3px;
          background: linear-gradient(90deg, #6C63FF, #FF6584);
        }

        .mini-bar {
          border-radius: 3px 3px 0 0;
          flex: 1;
          background: #6C63FF;
          opacity: 0.35;
          transition: opacity 0.2s;
          min-width: 12px;
        }
        .mini-bar.active { opacity: 1; }
        .mini-bar:hover  { opacity: 0.8; }

        .availability-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          background: rgba(67,232,160,0.1);
          color: #43E8A0;
          border: 1px solid rgba(67,232,160,0.2);
        }
        .avail-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #43E8A0;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.25s ease forwards; }

        .divider { height: 1px; background: rgba(255,255,255,0.07); margin: 16px 0; }

        .section-title {
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          margin-bottom: 18px;
          color: #F0F2FF;
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "#0A0B0F",
        color: "#F0F2FF",
        fontFamily: "'DM Sans', sans-serif",
      }}>

        {/* ── TOPBAR ── */}
        <div style={{
          padding: "18px 30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          position: "sticky",
          top: 0,
          background: "#0A0B0F",
          zIndex: 10,
        }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700 }}>
            Freelancer Hub
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className="availability-badge">
              <div className="avail-dot" />
              Available for work
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div style={{
          padding: "12px 30px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          gap: 4,
          background: "#0A0B0F",
          position: "sticky",
          top: 61,
          zIndex: 9,
        }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`fh-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ padding: "26px 30px 60px" }}>

          {/* ══ OVERVIEW TAB ══ */}
          {activeTab === "overview" && (
            <div className="fade-up">

              {/* Welcome banner */}
              <div style={{
                background: "linear-gradient(135deg, rgba(108,99,255,0.12) 0%, rgba(255,101,132,0.05) 60%, rgba(67,232,160,0.05) 100%)",
                border: "1px solid rgba(108,99,255,0.18)",
                borderRadius: 18,
                padding: "28px 30px",
                marginBottom: 22,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
                    Hey, <span style={{ color: "#6C63FF" }}>{user?.name || "Freelancer"}</span> 👋
                  </div>
                  <div style={{ fontSize: 14, color: "#8B8FA8", maxWidth: 380, lineHeight: 1.6 }}>
                    You have <span style={{ color: "#F6AD55" }}>{proposals.filter(p => p.status === "pending").length} pending proposals</span> and{" "}
                    <span style={{ color: "#43E8A0" }}>{projects.length} available gigs</span> on the marketplace.
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button className="btn-ghost-sm" onClick={() => setActiveTab("projects")}>Browse Gigs</button>
                  <button className="btn-apply" onClick={() => setActiveTab("proposals")}>My Proposals</button>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
                {stats.map((s) => (
                  <div key={s.label} className="fh-stat-card">
                    <div style={{ fontSize: 11, color: "#8B8FA8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
                      {s.label}
                    </div>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 700, color: s.color }}>
                      {loading ? "—" : s.value}
                    </div>
                    <div style={{ fontSize: 12, color: "#5A5E72", marginTop: 6 }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* Bottom grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>

                {/* Recent proposals */}
                <div className="fh-card">
                  <div className="section-title">Recent Proposals</div>
                  {proposals.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "30px 0", color: "#5A5E72", fontSize: 13 }}>
                      No proposals yet. Start applying to gigs!
                    </div>
                  ) : (
                    proposals.slice(0, 4).map((p, i) => {
                      const st = statusStyle(p.status);
                      return (
                        <div key={p._id || i} style={{
                          display: "flex", alignItems: "center",
                          justifyContent: "space-between",
                          padding: "11px 0",
                          borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none",
                        }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500 }}>
                              {p.projectId?.title || "Project"}
                            </div>
                            <div style={{ fontSize: 11, color: "#5A5E72", marginTop: 2 }}>
                              Bid: ₹{p.bidAmount?.toLocaleString()}
                            </div>
                          </div>
                          <span style={{
                            padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500,
                            background: st.bg, color: st.color,
                            border: `1px solid ${st.border}`,
                            textTransform: "capitalize",
                          }}>
                            {p.status || "pending"}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Activity chart */}
                <div className="fh-card">
                  <div className="section-title">Weekly Activity</div>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                      <span style={{ color: "#8B8FA8" }}>Profile views</span><span>128</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: "72%" }} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                      <span style={{ color: "#8B8FA8" }}>Proposals sent</span><span>{proposals.length}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: "48%", background: "linear-gradient(90deg,#43E8A0,#6C63FF)" }} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                      <span style={{ color: "#8B8FA8" }}>Acceptance rate</span>
                      <span>{proposals.length > 0
                        ? Math.round((proposals.filter(p => p.status === "accepted").length / proposals.length) * 100)
                        : 0}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${proposals.length > 0 ? Math.round((proposals.filter(p => p.status === "accepted").length / proposals.length) * 100) : 0}%`, background: "linear-gradient(90deg,#F6AD55,#FF6584)" }} />
                    </div>
                  </div>
                  <div className="divider" />
                  <div style={{ fontSize: 12, color: "#8B8FA8", marginBottom: 10 }}>Gig applications this week</div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 48 }}>
                    {barHeights.map((h, i) => (
                      <div key={i} className={`mini-bar ${i === 6 ? "active" : ""}`} style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ══ PROPOSALS TAB ══ */}
          {activeTab === "proposals" && (
            <div className="fade-up">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700 }}>My Proposals</div>
                <span style={{
                  fontSize: 12, color: "#A09BFF",
                  background: "rgba(108,99,255,0.1)",
                  border: "1px solid rgba(108,99,255,0.2)",
                  padding: "4px 12px", borderRadius: 20,
                }}>
                  {proposals.length} total
                </span>
              </div>

              {proposals.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px 20px", color: "#5A5E72" }}>
                  <div style={{ fontSize: 40, marginBottom: 14 }}>📋</div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: "#8B8FA8", marginBottom: 6 }}>
                    No proposals yet
                  </div>
                  <div style={{ fontSize: 14, marginBottom: 20 }}>Browse the marketplace and apply to gigs.</div>
                  <button className="btn-apply" onClick={() => setActiveTab("projects")}>
                    Browse Gigs
                  </button>
                </div>
              ) : (
                <div className="fh-card">
                  <div className="fh-table-header">
                    <span>Project</span>
                    <span>Bid Amount</span>
                    <span>Status</span>
                    <span>Date</span>
                  </div>
                  {proposals.map((p, i) => {
                    const st = statusStyle(p.status);
                    return (
                      <div key={p._id || i} className="fh-proposal-row">
                        <div>
                          <div style={{ fontWeight: 500 }}>{p.projectId?.title || "Project"}</div>
                          <div style={{ fontSize: 11, color: "#5A5E72", marginTop: 2 }}>
                            {p.message?.slice(0, 50)}{p.message?.length > 50 ? "..." : ""}
                          </div>
                        </div>
                        <span style={{ color: "#43E8A0", fontWeight: 600 }}>
                          ₹{p.bidAmount?.toLocaleString()}
                        </span>
                        <span style={{
                          display: "inline-flex", padding: "4px 10px",
                          borderRadius: 20, fontSize: 11, fontWeight: 500,
                          background: st.bg, color: st.color,
                          border: `1px solid ${st.border}`,
                          textTransform: "capitalize",
                        }}>
                          {p.status || "pending"}
                        </span>
                        <span style={{ fontSize: 12, color: "#5A5E72" }}>
                          {p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══ PROJECTS TAB ══ */}
          {activeTab === "projects" && (
            <div className="fade-up">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700 }}>Available Gigs</div>
                <span style={{
                  fontSize: 12, color: "#43E8A0",
                  background: "rgba(67,232,160,0.08)",
                  border: "1px solid rgba(67,232,160,0.2)",
                  padding: "4px 12px", borderRadius: 20,
                }}>
                  {projects.length} open
                </span>
              </div>

              {loading ? (
                <div style={{ textAlign: "center", padding: "60px", color: "#5A5E72" }}>Loading gigs...</div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
                  {projects.map((project, i) => (
                    <div key={project._id} className="fh-project-card">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <span style={{
                          padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500,
                          background: "rgba(108,99,255,0.12)", color: "#A09BFF",
                          border: "1px solid rgba(108,99,255,0.2)",
                        }}>
                          Project
                        </span>
                        <span style={{ fontSize: 14, color: "#43E8A0", fontWeight: 700 }}>
                          ₹{project.budget?.toLocaleString()}
                        </span>
                      </div>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 7 }}>
                        {project.title}
                      </div>
                      <div style={{ fontSize: 12, color: "#8B8FA8", lineHeight: 1.65, marginBottom: 14,
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                      }}>
                        {project.description}
                      </div>
                      {project.skills?.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
                          {project.skills.slice(0, 3).map((sk, j) => (
                            <span key={j} style={{
                              background: "rgba(108,99,255,0.1)", color: "#A09BFF",
                              border: "1px solid rgba(108,99,255,0.18)",
                              borderRadius: 20, padding: "2px 9px", fontSize: 11,
                            }}>
                              {sk}
                            </span>
                          ))}
                        </div>
                      )}
                      <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 14 }} />
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{
                            width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                            background: "linear-gradient(135deg,#6C63FF,#FF6584)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 9, fontWeight: 700, color: "#fff",
                          }}>
                            {getInitials(project.clientId?.name)}
                          </div>
                          <span style={{ fontSize: 12, color: "#8B8FA8" }}>
                            {project.clientId?.name || "Client"}
                          </span>
                        </div>
                        <button className="btn-apply">Apply Now</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ PROFILE TAB ══ */}
          {activeTab === "profile" && (
            <div className="fade-up" style={{ maxWidth: 680 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 22 }}>
                My Profile
              </div>

              {/* Profile card */}
              <div className="fh-card" style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 20 }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: "50%",
                    background: "linear-gradient(135deg,#6C63FF,#FF6584)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, fontWeight: 700, color: "#fff",
                    fontFamily: "'Syne', sans-serif", flexShrink: 0,
                  }}>
                    {getInitials(user?.name)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
                      {user?.name || "Freelancer"}
                    </div>
                    <div style={{ fontSize: 13, color: "#8B8FA8" }}>{user?.email}</div>
                    <div style={{ marginTop: 8 }}>
                      <div className="availability-badge" style={{ display: "inline-flex" }}>
                        <div className="avail-dot" />
                        Available for work
                      </div>
                    </div>
                  </div>
                  <button className="btn-ghost-sm">Edit Profile</button>
                </div>

                <div className="divider" />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                  {[
                    { label: "Proposals", value: proposals.length },
                    { label: "Accepted",  value: proposals.filter(p => p.status === "accepted").length },
                    { label: "Success Rate", value: `${proposals.length > 0 ? Math.round((proposals.filter(p => p.status === "accepted").length / proposals.length) * 100) : 0}%` },
                  ].map((s) => (
                    <div key={s.label} style={{ textAlign: "center", padding: "14px", background: "#20232F", borderRadius: 10 }}>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, color: "#6C63FF" }}>
                        {s.value}
                      </div>
                      <div style={{ fontSize: 11, color: "#8B8FA8", marginTop: 4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="fh-card" style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div className="section-title" style={{ marginBottom: 0 }}>Skills</div>
                  <button className="btn-ghost-sm">+ Add Skill</button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {skills.map((sk, i) => (
                    <span key={i} className="skill-tag">{sk}</span>
                  ))}
                </div>
              </div>

              {/* Account info */}
              <div className="fh-card">
                <div className="section-title">Account Info</div>
                {[
                  { label: "Full Name",  value: user?.name  || "—" },
                  { label: "Email",      value: user?.email || "—" },
                  { label: "Role",       value: "Freelancer"        },
                  { label: "Member Since", value: "2024"            },
                ].map((row) => (
                  <div key={row.label} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,0.05)",
                  }}>
                    <span style={{ fontSize: 13, color: "#8B8FA8" }}>{row.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{row.value}</span>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>
      </div>

    </>
  );
}

export default FreelancerHub;