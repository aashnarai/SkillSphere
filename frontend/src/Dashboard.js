import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const user     = JSON.parse(localStorage.getItem("user"));
  const token    = localStorage.getItem("token");
  const navigate = useNavigate();

  const [projectCount, setProjectCount]   = useState(0);
  const [proposalCount, setProposalCount] = useState(0);
  const [activeNav, setActiveNav]         = useState("dashboard");
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // ✅ GET ALL PROJECTS
      const projectsRes = await axios.get(
        "http://localhost:5000/api/projects/all",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ FIXED: correct endpoint — freelancer proposals by user id
      // For clients use /api/projects/my to count their posted projects
      let proposalData = [];
      if (user?.role === "freelancer") {
        const proposalsRes = await axios.get(
          `http://localhost:5000/api/proposals/freelancer/${user?.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        proposalData = proposalsRes.data || [];
      }

      setProjectCount(projectsRes.data?.length || 0);
      setProposalCount(proposalData.length);

    } catch (err) {
      console.log(err);
      if (err.response?.status === 401) {
        navigate("/");
      } else {
        setError("Failed to load dashboard data.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const navItems = [
    {
      id: "dashboard", label: "Dashboard", path: "/dashboard",
      icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".9"/><rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5"/><rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5"/><rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".3"/></svg>,
    },
    {
      id: "projects", label: "Projects", path: "/projects",
      icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M5 7h6M5 10h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
    },
    {
      id: "proposals", label: "Proposals", path: user?.role === "client" ? "/proposals" : "/freelancer-dashboard",
      icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1L10 5.5H15L11 8.5L12.5 13L8 10L3.5 13L5 8.5L1 5.5H6L8 1Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
    },
    {
      id: "chat", label: "Messages", path: "/chat",
      icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M14 10a2 2 0 01-2 2H5l-3 3V4a2 2 0 012-2h8a2 2 0 012 2v6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
    },
    {
      id: "notifications", label: "Notifications", path: "/notifications",
      icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1a5 5 0 00-5 5v3l-1.5 2H14.5L13 9V6a5 5 0 00-5-5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M6.5 13a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
    },
  ];

  const barHeights = [35, 55, 40, 75, 60, 88, 100];

  // ── LOADING ──
  if (loading) {
    return (
      <div className="db-shell">
        <div className="db-sidebar">
          <div className="db-logo">Skill<span>Sphere</span></div>
        </div>
        <div className="db-main" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", color: "#5A5E72" }}>
            <svg width="32" height="32" viewBox="0 0 16 16" fill="none"
              style={{ animation: "spin 0.8s linear infinite", marginBottom: 12 }}>
              <circle cx="8" cy="8" r="6" stroke="#6C63FF" strokeWidth="2" strokeDasharray="20 18"/>
            </svg>
            <div style={{ fontSize: 14 }}>Loading dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  // ── ERROR ──
  if (error) {
    return (
      <div className="db-shell">
        <div className="db-main" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{
            background: "rgba(255,101,132,0.08)", border: "1px solid rgba(255,101,132,0.22)",
            borderRadius: 12, padding: "20px 28px", color: "#FF6584", fontSize: 14,
          }}>
            {error} — <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={fetchStats}>Retry</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="db-shell">

      {/* ── SIDEBAR ── */}
      <div className="db-sidebar">
        <div className="db-logo">Skill<span>Sphere</span></div>
        <div className="db-logo-sub">Hyperlocal Freelance</div>

        <nav className="db-nav">
          {navItems.map((item) => (
            <div
              key={item.id}
              className={`db-nav-item ${activeNav === item.id ? "active" : ""}`}
              onClick={() => { setActiveNav(item.id); navigate(item.path); }}
            >
              <span className="db-nav-icon">{item.icon}</span>
              {item.label}
            </div>
          ))}

          {/* Client-only nav items */}
          {user?.role === "client" && (
            <div
              className={`db-nav-item ${activeNav === "post-project" ? "active" : ""}`}
              onClick={() => { setActiveNav("post-project"); navigate("/post-project"); }}
            >
              <span className="db-nav-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </span>
              Post Project
            </div>
          )}

          <div className="db-nav-section">Account</div>

          <div
            className={`db-nav-item ${activeNav === "settings" ? "active" : ""}`}
            onClick={() => { setActiveNav("settings"); navigate("/settings"); }}
          >
            <span className="db-nav-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </span>
            Settings
          </div>
        </nav>

        {/* User info */}
        <div className="db-sidebar-footer">
          <div className="db-avatar">{getInitials(user?.name)}</div>
          <div>
            <div className="db-user-name">{user?.name || "User"}</div>
            <div className={`db-role-badge ${user?.role}`}>{user?.role}</div>
          </div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div className="db-main">

        {/* Topbar */}
        <div className="db-topbar">
          <div className="db-topbar-title">Overview</div>
          <div className="db-topbar-actions">
            <button className="db-btn-ghost" onClick={() => navigate("/projects")}>
              Explore Gigs
            </button>
            {user?.role === "client" && (
              <button className="db-btn-primary" onClick={() => navigate("/post-project")}>
                Post a Project
              </button>
            )}
          </div>
        </div>

        <div className="db-content">

          {/* Hero Banner */}
          <div className="db-hero">
            <div>
              <div className="db-hero-title">
                Welcome back, <span>{user?.name || "there"}</span> 👋
              </div>
              <div className="db-hero-sub">
                Here's what's happening on your SkillSphere account today.
              </div>
              <div className="db-hero-actions">
                <Link to="/projects" className="db-btn-primary" style={{ textDecoration: "none" }}>
                  Browse Marketplace
                </Link>
                <Link to={user?.role === "freelancer" ? "/freelancer-dashboard" : "/proposals"}
                  className="db-btn-ghost" style={{ textDecoration: "none" }}>
                  {user?.role === "freelancer" ? "Freelancer Hub" : "View Proposals"}
                </Link>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="db-stats-grid">
            <div className="db-stat-card">
              <div className="db-stat-label">Total Projects</div>
              <div className="db-stat-val green">{projectCount}</div>
              <div className="db-stat-sub">Active on platform</div>
              <div className="db-progress-bar">
                <div className="db-progress-fill" style={{ width: `${Math.min(projectCount * 10, 100)}%` }}/>
              </div>
            </div>

            <div className="db-stat-card">
              <div className="db-stat-label">
                {user?.role === "freelancer" ? "My Proposals" : "Total Proposals"}
              </div>
              <div className="db-stat-val purple">{proposalCount}</div>
              <div className="db-stat-sub">
                {user?.role === "freelancer" ? "Submitted by you" : "Received"}
              </div>
              <div className="db-progress-bar">
                <div className="db-progress-fill purple" style={{ width: `${Math.min(proposalCount * 5, 100)}%` }}/>
              </div>
            </div>

            <div className="db-stat-card">
              <div className="db-stat-label">Role</div>
              <div className="db-stat-val amber" style={{ textTransform: "capitalize" }}>
                {user?.role || "—"}
              </div>
              <div className="db-badge-green">● Active</div>
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="db-bottom-grid">

            {/* Quick Actions */}
            <div className="db-card">
              <div className="db-card-title">Quick Actions</div>

              {[
                {
                  label: "Browse Projects",
                  sub: "Find your next gig",
                  path: "/projects",
                  color: "purple",
                  icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="2" stroke="#6C63FF" strokeWidth="1.5"/><path d="M5 7h6M5 10h4" stroke="#6C63FF" strokeWidth="1.3" strokeLinecap="round"/></svg>,
                },
                {
                  label: "Messages",
                  sub: "Chat with clients",
                  path: "/chat",
                  color: "teal",
                  icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M14 10a2 2 0 01-2 2H5l-3 3V4a2 2 0 012-2h8a2 2 0 012 2v6z" stroke="#43E8A0" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
                },
                {
                  label: user?.role === "client" ? "Post a Project" : "My Proposals",
                  sub: user?.role === "client" ? "Hire top freelancers" : "Track your applications",
                  path: user?.role === "client" ? "/post-project" : "/freelancer-dashboard",
                  color: "red",
                  icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 1L10 5.5H15L11 8.5L12.5 13L8 10L3.5 13L5 8.5L1 5.5H6L8 1Z" stroke="#FF6584" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
                },
              ].map((action) => (
                <div
                  key={action.label}
                  className="db-action-row"
                  onClick={() => navigate(action.path)}
                  style={{ cursor: "pointer" }}
                >
                  <div className={`db-action-icon ${action.color}`}>{action.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div className="db-action-title">{action.label}</div>
                    <div className="db-action-sub">{action.sub}</div>
                  </div>
                  <button className="db-btn-ghost" style={{ padding: "6px 14px", fontSize: 12 }}>Go</button>
                </div>
              ))}
            </div>

            {/* Platform Pulse */}
            <div className="db-card">
              <div className="db-card-title">Platform Pulse</div>

              {[
                { label: "Proposals submitted", value: "246", width: "82%",  color: "" },
                { label: "Gigs completed",       value: "189", width: "63%",  color: "teal" },
                { label: "Disputes resolved",    value: "98%", width: "98%",  color: "teal" },
              ].map((row) => (
                <div key={row.label} className="db-pulse-row">
                  <div className="db-pulse-header">
                    <span>{row.label}</span><span>{row.value}</span>
                  </div>
                  <div className="db-progress-bar">
                    <div className={`db-progress-fill ${row.color}`} style={{ width: row.width }}/>
                  </div>
                </div>
              ))}

              <div className="db-divider"/>
              <div className="db-chart-label">Weekly Activity</div>
              <div className="db-mini-chart">
                {barHeights.map((h, i) => (
                  <div
                    key={i}
                    className={`db-mini-bar ${i === barHeights.length - 1 ? "active" : ""}`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;