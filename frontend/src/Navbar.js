import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { NotificationBell } from "./Notifications";

function Navbar() {
  const user         = JSON.parse(localStorage.getItem("user"));
  const location     = useLocation();
  const navigate     = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [unread]     = useState(3);

  const hideOn = ["/", "/register"];
  if (hideOn.includes(location.pathname)) return null;

  const handleLogout = () => {
    setLoggingOut(true);
    setTimeout(() => {
      localStorage.clear();
      window.location.href = "/";
    }, 300);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;700&family=DM+Sans:wght@300;400;500&display=swap');

        .navbar-link {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 7px 13px;
          border-radius: 8px;
          font-size: 13.5px;
          font-family: 'DM Sans', sans-serif;
          color: #8B8FA8;
          text-decoration: none;
          transition: all 0.15s;
          font-weight: 400;
          border: 1px solid transparent;
          white-space: nowrap;
        }
        .navbar-link:hover {
          background: #1A1D27;
          color: #F0F2FF;
        }
        .navbar-link.active {
          background: linear-gradient(135deg, rgba(108,99,255,0.15), rgba(108,99,255,0.07));
          color: #A09BFF;
          border-color: rgba(108,99,255,0.25);
        }
        .btn-logout {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 7px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          background: rgba(255,101,132,0.08);
          color: #FF6584;
          border: 1px solid rgba(255,101,132,0.2);
          font-weight: 500;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .btn-logout:hover {
          background: rgba(255,101,132,0.15);
          border-color: rgba(255,101,132,0.35);
        }
        .role-badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 9px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 500;
          text-transform: capitalize;
          letter-spacing: 0.3px;
        }
        .role-badge.client {
          background: rgba(246,173,85,0.12);
          color: #F6AD55;
          border: 1px solid rgba(246,173,85,0.2);
        }
        .role-badge.freelancer {
          background: rgba(67,232,160,0.1);
          color: #43E8A0;
          border: 1px solid rgba(67,232,160,0.2);
        }
        .role-badge.admin {
          background: rgba(108,99,255,0.15);
          color: #A09BFF;
          border: 1px solid rgba(108,99,255,0.25);
        }
        .navbar-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6C63FF, #FF6584);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          font-family: 'Syne', sans-serif;
          color: #fff;
          flex-shrink: 0;
        }
        .navbar-divider {
          width: 1px;
          height: 20px;
          background: rgba(255,255,255,0.08);
          margin: 0 4px;
          flex-shrink: 0;
        }
      `}</style>

      <nav style={{
        background: "#13151C",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 56,
        position: "sticky",
        top: 0,
        zIndex: 100,
        fontFamily: "'DM Sans', sans-serif",
        gap: 12,
      }}>

        {/* LEFT — Logo */}
        <Link
          to="/dashboard"
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 18,
            fontWeight: 700,
            color: "#F0F2FF",
            textDecoration: "none",
            letterSpacing: -0.5,
            flexShrink: 0,
          }}
        >
          Skill<span style={{ color: "#6C63FF" }}>Sphere</span>
        </Link>

        {/* CENTER — Nav Links */}
        <div style={{ display: "flex", alignItems: "center", gap: 2, flex: 1, justifyContent: "center" }}>

          {/* Dashboard */}
          <Link to="/dashboard" className={`navbar-link ${isActive("/dashboard") ? "active" : ""}`}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".9" />
              <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5" />
              <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5" />
              <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".3" />
            </svg>
            Dashboard
          </Link>

          {/* Projects — all users */}
          {user && (
            <Link to="/projects" className={`navbar-link ${isActive("/projects") ? "active" : ""}`}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M5 7h6M5 10h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              Projects
            </Link>
          )}

          {/* CLIENT ONLY */}
          {user?.role === "client" && (
            <>
              <Link to="/post-project" className={`navbar-link ${isActive("/post-project") ? "active" : ""}`}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Post Project
              </Link>

              <Link to="/proposals" className={`navbar-link ${isActive("/proposals") ? "active" : ""}`}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1L10 5.5H15L11 8.5L12.5 13L8 10L3.5 13L5 8.5L1 5.5H6L8 1Z"
                    stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                </svg>
                Proposals
              </Link>
            </>
          )}

          {/* FREELANCER ONLY */}
          {user?.role === "freelancer" && (
            <Link to="/freelancer-dashboard" className={`navbar-link ${isActive("/freelancer-dashboard") ? "active" : ""}`}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L10 5.5H15L11 8.5L12.5 13L8 10L3.5 13L5 8.5L1 5.5H6L8 1Z"
                  stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
              </svg>
              Freelancer Hub
            </Link>
          )}

          {/* Messages — all users */}
          {user && (
            <Link to="/chat" className={`navbar-link ${isActive("/chat") ? "active" : ""}`}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M14 10a2 2 0 01-2 2H5l-3 3V4a2 2 0 012-2h8a2 2 0 012 2v6z"
                  stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
              Messages
            </Link>
          )}

          {/* ✅ Reviews — all users */}
          {user && (
            <Link to="/reviews" className={`navbar-link ${isActive("/reviews") ? "active" : ""}`}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.4l-3.7 1.9.7-4.1-3-2.9 4.2-.7z"
                  stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
              </svg>
              Reviews
            </Link>
          )}

        </div>

        {/* RIGHT — Bell + User + Logout */}
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>

            <NotificationBell
              count={unread}
              onClick={() => navigate("/notifications")}
            />

            <div className="navbar-divider" />

            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div className="navbar-avatar">{getInitials(user?.name)}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#F0F2FF", lineHeight: 1 }}>
                  {user?.name}
                </span>
                <span className={`role-badge ${user?.role}`}>
                  {user?.role}
                </span>
              </div>
            </div>

            <div className="navbar-divider" />

            <button className="btn-logout" onClick={handleLogout} disabled={loggingOut}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <Link to="/" className="navbar-link">Login</Link>
            <Link
              to="/register"
              style={{
                padding: "7px 16px",
                borderRadius: 8,
                fontSize: 13,
                fontFamily: "'DM Sans', sans-serif",
                background: "#6C63FF",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Register
            </Link>
          </div>
        )}

      </nav>
    </>
  );
}

export default Navbar;