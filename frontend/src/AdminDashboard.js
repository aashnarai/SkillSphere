import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API   = "http://localhost:5000/api/admin";
const token = () => localStorage.getItem("token");
const headers = () => ({ Authorization: `Bearer ${token()}` });

function AdminDashboard() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem("user"));

  const [activeTab, setActiveTab]   = useState("overview");
  const [stats, setStats]           = useState(null);
  const [users, setUsers]           = useState([]);
  const [projects, setProjects]     = useState([]);
  const [proposals, setProposals]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [actionId, setActionId]     = useState(null);
  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [toast, setToast]           = useState(null);

  // Redirect if not admin
  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    fetchAll();
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, projectsRes, proposalsRes] = await Promise.all([
        axios.get(`${API}/stats`,     { headers: headers() }),
        axios.get(`${API}/users`,     { headers: headers() }),
        axios.get(`${API}/projects`,  { headers: headers() }),
        axios.get(`${API}/proposals`, { headers: headers() }),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users       || []);
      setProjects(projectsRes.data.projects || []);
      setProposals(proposalsRes.data      || []);
    } catch (err) {
      console.log(err);
      if (err.response?.status === 403) navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  // ── USER ACTIONS ──
  const suspendUser = async (id, isSuspended) => {
    try {
      setActionId(id);
      const action = isSuspended ? "unsuspend" : "suspend";
      await axios.put(`${API}/users/${id}/${action}`, {}, { headers: headers() });
      setUsers((prev) =>
        prev.map((u) => u._id === id ? { ...u, isSuspended: !isSuspended } : u)
      );
      showToast(`User ${isSuspended ? "unsuspended" : "suspended"} successfully`);
    } catch (err) {
      showToast(err.response?.data?.message || "Action failed", "error");
    } finally {
      setActionId(null);
    }
  };

  const verifyUser = async (id) => {
    try {
      setActionId(id);
      await axios.put(`${API}/users/${id}/verify`, {}, { headers: headers() });
      setUsers((prev) =>
        prev.map((u) => u._id === id ? { ...u, isVerified: true } : u)
      );
      showToast("User verified successfully");
    } catch (err) {
      showToast("Verification failed", "error");
    } finally {
      setActionId(null);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user permanently?")) return;
    try {
      setActionId(id);
      await axios.delete(`${API}/users/${id}`, { headers: headers() });
      setUsers((prev) => prev.filter((u) => u._id !== id));
      showToast("User deleted");
    } catch (err) {
      showToast("Delete failed", "error");
    } finally {
      setActionId(null);
    }
  };

  // ── PROJECT ACTIONS ──
  const updateProjectStatus = async (id, status) => {
    try {
      setActionId(id);
      await axios.put(`${API}/projects/${id}/status`, { status }, { headers: headers() });
      setProjects((prev) =>
        prev.map((p) => p._id === id ? { ...p, status } : p)
      );
      showToast(`Project marked as ${status}`);
    } catch (err) {
      showToast("Update failed", "error");
    } finally {
      setActionId(null);
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm("Delete this project permanently?")) return;
    try {
      setActionId(id);
      await axios.delete(`${API}/projects/${id}`, { headers: headers() });
      setProjects((prev) => prev.filter((p) => p._id !== id));
      showToast("Project deleted");
    } catch (err) {
      showToast("Delete failed", "error");
    } finally {
      setActionId(null);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const tabs = ["overview", "users", "projects", "proposals"];

  const statusColor = (status) => {
    const map = {
      open:        { color: "#43E8A0", bg: "rgba(67,232,160,0.1)",  border: "rgba(67,232,160,0.2)"  },
      "in-progress":{ color: "#A09BFF", bg: "rgba(108,99,255,0.1)", border: "rgba(108,99,255,0.2)"  },
      completed:   { color: "#F6AD55", bg: "rgba(246,173,85,0.1)",  border: "rgba(246,173,85,0.2)"  },
      closed:      { color: "#FF6584", bg: "rgba(255,101,132,0.1)", border: "rgba(255,101,132,0.2)" },
      pending:     { color: "#F6AD55", bg: "rgba(246,173,85,0.1)",  border: "rgba(246,173,85,0.2)"  },
      accepted:    { color: "#43E8A0", bg: "rgba(67,232,160,0.1)",  border: "rgba(67,232,160,0.2)"  },
      rejected:    { color: "#FF6584", bg: "rgba(255,101,132,0.1)", border: "rgba(255,101,132,0.2)" },
    };
    return map[status] || map.open;
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0A0B0F", display: "flex", alignItems: "center", justifyContent: "center", color: "#5A5E72", fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <svg width="32" height="32" viewBox="0 0 16 16" fill="none" style={{ animation: "spin 0.8s linear infinite", marginBottom: 12 }}>
          <circle cx="8" cy="8" r="6" stroke="#6C63FF" strokeWidth="2" strokeDasharray="20 18"/>
        </svg>
        <div>Loading admin dashboard...</div>
      </div>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;700&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .adm-tab {
          padding: 8px 18px; border-radius: 8px;
          font-size: 13px; font-family: 'DM Sans', sans-serif;
          font-weight: 500; cursor: pointer;
          border: 1px solid transparent;
          color: #8B8FA8; background: none;
          transition: all 0.15s; text-transform: capitalize;
        }
        .adm-tab:hover { background: #1A1D27; color: #F0F2FF; }
        .adm-tab.active {
          background: rgba(108,99,255,0.12);
          color: #A09BFF;
          border-color: rgba(108,99,255,0.25);
        }

        .adm-card {
          background: #1A1D27;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px; padding: 20px;
          transition: border-color 0.2s;
        }

        .adm-stat {
          background: #13151C;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px; padding: 20px;
        }

        .adm-input {
          padding: 10px 14px;
          background: #1A1D27;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 9px;
          color: #F0F2FF;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; outline: none;
          transition: border-color 0.15s;
        }
        .adm-input::placeholder { color: #5A5E72; }
        .adm-input:focus { border-color: rgba(108,99,255,0.45); }

        .adm-select {
          padding: 10px 14px;
          background: #1A1D27;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 9px;
          color: #8B8FA8;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; outline: none; cursor: pointer;
        }

        .adm-table-row {
          display: grid;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          align-items: center;
          font-size: 13px;
          gap: 10px;
        }
        .adm-table-row:last-child { border-bottom: none; }

        .adm-table-header {
          padding: 8px 0 12px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          font-size: 11px; text-transform: uppercase;
          letter-spacing: 1px; color: #5A5E72;
          display: grid; gap: 10px;
        }

        .btn-sm-red {
          padding: 5px 12px; border-radius: 7px;
          font-size: 11px; font-family: 'DM Sans', sans-serif;
          font-weight: 500; cursor: pointer;
          background: rgba(255,101,132,0.08);
          color: #FF6584;
          border: 1px solid rgba(255,101,132,0.2);
          transition: all 0.15s; white-space: nowrap;
        }
        .btn-sm-red:hover { background: rgba(255,101,132,0.16); }
        .btn-sm-red:disabled { opacity: 0.4; cursor: not-allowed; }

        .btn-sm-green {
          padding: 5px 12px; border-radius: 7px;
          font-size: 11px; font-family: 'DM Sans', sans-serif;
          font-weight: 500; cursor: pointer;
          background: rgba(67,232,160,0.08);
          color: #43E8A0;
          border: 1px solid rgba(67,232,160,0.2);
          transition: all 0.15s; white-space: nowrap;
        }
        .btn-sm-green:hover { background: rgba(67,232,160,0.16); }
        .btn-sm-green:disabled { opacity: 0.4; cursor: not-allowed; }

        .btn-sm-purple {
          padding: 5px 12px; border-radius: 7px;
          font-size: 11px; font-family: 'DM Sans', sans-serif;
          font-weight: 500; cursor: pointer;
          background: rgba(108,99,255,0.1);
          color: #A09BFF;
          border: 1px solid rgba(108,99,255,0.2);
          transition: all 0.15s; white-space: nowrap;
        }
        .btn-sm-purple:hover { background: rgba(108,99,255,0.18); }
        .btn-sm-purple:disabled { opacity: 0.4; cursor: not-allowed; }

        .status-pill {
          display: inline-flex; align-items: center;
          padding: 3px 10px; border-radius: 20px;
          font-size: 11px; font-weight: 500;
          text-transform: capitalize;
        }

        .toast {
          position: fixed; bottom: 28px; right: 28px;
          padding: 13px 18px; border-radius: 12px;
          font-size: 13px; font-family: 'DM Sans', sans-serif;
          display: flex; align-items: center; gap: 9px;
          z-index: 9999; max-width: 320px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.5);
          animation: toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .toast.success { background: #13151C; border: 1px solid rgba(67,232,160,0.25); color: #43E8A0; }
        .toast.error   { background: #13151C; border: 1px solid rgba(255,101,132,0.25); color: #FF6584; }

        @keyframes toastIn {
          from { opacity: 0; transform: translateY(14px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.2s ease forwards; }

        .adm-main::-webkit-scrollbar { width: 4px; }
        .adm-main::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#0A0B0F", color: "#F0F2FF", fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── TOPBAR ── */}
        <div style={{
          padding: "18px 30px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          position: "sticky", top: 0, background: "#0A0B0F", zIndex: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700 }}>
              Admin Dashboard
            </div>
            <span style={{
              padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
              background: "rgba(108,99,255,0.15)", color: "#A09BFF",
              border: "1px solid rgba(108,99,255,0.25)",
            }}>
              Admin Panel
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 13, color: "#8B8FA8" }}>{user?.name}</div>
            <button
              onClick={fetchAll}
              style={{
                padding: "7px 14px", borderRadius: 8,
                background: "#1A1D27", color: "#8B8FA8",
                border: "1px solid rgba(255,255,255,0.08)",
                fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M1 8a7 7 0 107-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                <path d="M1 4v4h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* ── TABS ── */}
        <div style={{
          padding: "12px 30px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", gap: 4,
          position: "sticky", top: 61, background: "#0A0B0F", zIndex: 9,
        }}>
          {tabs.map((tab) => (
            <button key={tab} className={`adm-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </div>

        <div className="adm-main" style={{ padding: "26px 30px 60px", overflowY: "auto" }}>

          {/* ══ OVERVIEW ══ */}
          {activeTab === "overview" && stats && (
            <div className="fade-up">

              {/* Stat cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
                {[
                  { label: "Total Users",     value: stats.users.total,         color: "#A09BFF", sub: `+${stats.users.recentSignups} this week` },
                  { label: "Total Projects",  value: stats.projects.total,      color: "#43E8A0", sub: `${stats.projects.open} open` },
                  { label: "Total Proposals", value: stats.proposals.total,     color: "#6C63FF", sub: `${stats.proposals.successRate}% success rate` },
                  { label: "Total Reviews",   value: stats.reviews.total,       color: "#F6AD55", sub: "Platform reviews" },
                ].map((s) => (
                  <div key={s.label} className="adm-stat">
                    <div style={{ fontSize: 11, color: "#8B8FA8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>{s.label}</div>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 30, fontWeight: 700, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: "#5A5E72", marginTop: 6 }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>

                {/* Users breakdown */}
                <div className="adm-card">
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, marginBottom: 16 }}>User Breakdown</div>
                  {[
                    { label: "Clients",     value: stats.users.clients,     color: "#F6AD55", width: `${Math.round((stats.users.clients / stats.users.total) * 100)}%` },
                    { label: "Freelancers", value: stats.users.freelancers, color: "#43E8A0", width: `${Math.round((stats.users.freelancers / stats.users.total) * 100)}%` },
                    { label: "Suspended",   value: stats.users.suspended,   color: "#FF6584", width: `${Math.round((stats.users.suspended / stats.users.total) * 100)}%` },
                  ].map((row) => (
                    <div key={row.label} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                        <span style={{ color: "#8B8FA8" }}>{row.label}</span>
                        <span style={{ color: row.color, fontWeight: 600 }}>{row.value}</span>
                      </div>
                      <div style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", background: row.color, borderRadius: 3, width: row.width, opacity: 0.7 }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Project status */}
                <div className="adm-card">
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Project Status</div>
                  {[
                    { label: "Open",        value: stats.projects.open,      color: "#43E8A0" },
                    { label: "Completed",   value: stats.projects.completed, color: "#F6AD55" },
                    { label: "In Progress", value: stats.projects.total - stats.projects.open - stats.projects.completed, color: "#A09BFF" },
                  ].map((row) => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <span style={{ fontSize: 13, color: "#8B8FA8" }}>{row.label}</span>
                      <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: row.color }}>{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Top skills */}
                <div className="adm-card">
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Top Skills</div>
                  {stats.topSkills.map((s, i) => (
                    <div key={s.skill} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <span style={{ fontSize: 11, color: "#5A5E72", width: 16 }}>{i + 1}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                          <span>{s.skill}</span>
                          <span style={{ color: "#A09BFF" }}>{s.count}</span>
                        </div>
                        <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ height: "100%", background: "linear-gradient(90deg,#6C63FF,#A09BFF)", borderRadius: 2, width: `${Math.round((s.count / (stats.topSkills[0]?.count || 1)) * 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick summary row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
                {[
                  { label: "Proposals Accepted", value: stats.proposals.accepted, total: stats.proposals.total, color: "#43E8A0" },
                  { label: "New Signups (7d)",    value: stats.users.recentSignups, total: stats.users.total, color: "#6C63FF" },
                  { label: "Success Rate",        value: `${stats.proposals.successRate}%`, total: null, color: "#F6AD55" },
                ].map((s) => (
                  <div key={s.label} className="adm-stat" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: 11, color: "#8B8FA8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{s.label}</div>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
                    </div>
                    {s.total && (
                      <div style={{ fontSize: 12, color: "#5A5E72" }}>of {s.total}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ USERS TAB ══ */}
          {activeTab === "users" && (
            <div className="fade-up">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700 }}>
                  All Users <span style={{ color: "#5A5E72", fontSize: 14 }}>({filteredUsers.length})</span>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    className="adm-input"
                    type="text"
                    placeholder="Search name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ width: 220 }}
                  />
                  <select className="adm-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                    <option value="">All roles</option>
                    <option value="client">Client</option>
                    <option value="freelancer">Freelancer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div style={{ background: "#13151C", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "4px 20px 10px" }}>
                <div className="adm-table-header" style={{ gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1.5fr" }}>
                  <span>Name</span><span>Email</span><span>Role</span><span>Verified</span><span>Status</span><span>Actions</span>
                </div>
                {filteredUsers.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "#5A5E72", fontSize: 13 }}>No users found</div>
                ) : (
                  filteredUsers.map((u) => (
                    <div key={u._id} className="adm-table-row" style={{ gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1.5fr" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: "50%",
                          background: "linear-gradient(135deg,#6C63FF,#FF6584)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0,
                        }}>
                          {getInitials(u.name)}
                        </div>
                        <span style={{ fontWeight: 500 }}>{u.name}</span>
                      </div>
                      <span style={{ color: "#8B8FA8", fontSize: 12 }}>{u.email}</span>
                      <span>
                        <span className="status-pill" style={{
                          background: u.role === "client" ? "rgba(246,173,85,0.1)" : u.role === "admin" ? "rgba(108,99,255,0.1)" : "rgba(67,232,160,0.1)",
                          color:      u.role === "client" ? "#F6AD55"              : u.role === "admin" ? "#A09BFF"               : "#43E8A0",
                          border:     `1px solid ${u.role === "client" ? "rgba(246,173,85,0.2)" : u.role === "admin" ? "rgba(108,99,255,0.2)" : "rgba(67,232,160,0.2)"}`,
                        }}>
                          {u.role}
                        </span>
                      </span>
                      <span style={{ color: u.isVerified ? "#43E8A0" : "#5A5E72", fontSize: 12 }}>
                        {u.isVerified ? "✓ Yes" : "No"}
                      </span>
                      <span>
                        <span className="status-pill" style={{
                          background: u.isSuspended ? "rgba(255,101,132,0.1)" : "rgba(67,232,160,0.08)",
                          color:      u.isSuspended ? "#FF6584"                : "#43E8A0",
                          border:     `1px solid ${u.isSuspended ? "rgba(255,101,132,0.2)" : "rgba(67,232,160,0.15)"}`,
                        }}>
                          {u.isSuspended ? "Suspended" : "Active"}
                        </span>
                      </span>
                      <div style={{ display: "flex", gap: 5 }}>
                        {!u.isVerified && (
                          <button className="btn-sm-purple" disabled={actionId === u._id}
                            onClick={() => verifyUser(u._id)}>
                            Verify
                          </button>
                        )}
                        <button
                          className={u.isSuspended ? "btn-sm-green" : "btn-sm-red"}
                          disabled={actionId === u._id}
                          onClick={() => suspendUser(u._id, u.isSuspended)}
                        >
                          {u.isSuspended ? "Unsuspend" : "Suspend"}
                        </button>
                        <button className="btn-sm-red" disabled={actionId === u._id}
                          onClick={() => deleteUser(u._id)}
                          style={{ background: "rgba(255,101,132,0.15)" }}>
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ══ PROJECTS TAB ══ */}
          {activeTab === "projects" && (
            <div className="fade-up">
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
                All Projects <span style={{ color: "#5A5E72", fontSize: 14 }}>({projects.length})</span>
              </div>

              <div style={{ background: "#13151C", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "4px 20px 10px" }}>
                <div className="adm-table-header" style={{ gridTemplateColumns: "2.5fr 1.5fr 1fr 1fr 1fr 1.5fr" }}>
                  <span>Title</span><span>Client</span><span>Budget</span><span>Skills</span><span>Status</span><span>Actions</span>
                </div>
                {projects.map((p) => {
                  const sc = statusColor(p.status);
                  return (
                    <div key={p._id} className="adm-table-row" style={{ gridTemplateColumns: "2.5fr 1.5fr 1fr 1fr 1fr 1.5fr" }}>
                      <span style={{ fontWeight: 500 }}>{p.title}</span>
                      <span style={{ fontSize: 12, color: "#8B8FA8" }}>{p.clientId?.name || "—"}</span>
                      <span style={{ color: "#43E8A0", fontWeight: 600 }}>₹{p.budget?.toLocaleString()}</span>
                      <span style={{ fontSize: 11, color: "#A09BFF" }}>
                        {(p.skills || []).slice(0, 2).join(", ")}{p.skills?.length > 2 ? "..." : ""}
                      </span>
                      <span>
                        <span className="status-pill" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                          {p.status}
                        </span>
                      </span>
                      <div style={{ display: "flex", gap: 5 }}>
                        {p.status !== "closed" && (
                          <button className="btn-sm-red" disabled={actionId === p._id}
                            onClick={() => updateProjectStatus(p._id, "closed")}>
                            Close
                          </button>
                        )}
                        {p.status === "closed" && (
                          <button className="btn-sm-green" disabled={actionId === p._id}
                            onClick={() => updateProjectStatus(p._id, "open")}>
                            Reopen
                          </button>
                        )}
                        <button className="btn-sm-red" disabled={actionId === p._id}
                          onClick={() => deleteProject(p._id)}
                          style={{ background: "rgba(255,101,132,0.15)" }}>
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══ PROPOSALS TAB ══ */}
          {activeTab === "proposals" && (
            <div className="fade-up">
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
                Recent Proposals <span style={{ color: "#5A5E72", fontSize: 14 }}>({proposals.length})</span>
              </div>

              <div style={{ background: "#13151C", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "4px 20px 10px" }}>
                <div className="adm-table-header" style={{ gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr" }}>
                  <span>Project</span><span>Freelancer</span><span>Bid</span><span>Status</span><span>Date</span>
                </div>
                {proposals.map((p) => {
                  const sc = statusColor(p.status);
                  return (
                    <div key={p._id} className="adm-table-row" style={{ gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr" }}>
                      <span style={{ fontWeight: 500 }}>{p.projectId?.title || "—"}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <div style={{
                          width: 24, height: 24, borderRadius: "50%",
                          background: "linear-gradient(135deg,#43E8A0,#6C63FF)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 9, fontWeight: 700, color: "#fff",
                        }}>
                          {getInitials(p.freelancerId?.name)}
                        </div>
                        <span style={{ fontSize: 12 }}>{p.freelancerId?.name || "—"}</span>
                      </div>
                      <span style={{ color: "#43E8A0", fontWeight: 600 }}>₹{p.bidAmount?.toLocaleString()}</span>
                      <span>
                        <span className="status-pill" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                          {p.status}
                        </span>
                      </span>
                      <span style={{ fontSize: 12, color: "#5A5E72" }}>
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── TOAST ── */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === "success"
            ? <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#43E8A0" strokeWidth="1.5"/><path d="M5 8l2 2 4-4" stroke="#43E8A0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            : <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#FF6584" strokeWidth="1.5"/><path d="M8 5v3.5M8 10.5v.5" stroke="#FF6584" strokeWidth="1.5" strokeLinecap="round"/></svg>
          }
          {toast.msg}
        </div>
      )}
    </>
  );
}

export default AdminDashboard;