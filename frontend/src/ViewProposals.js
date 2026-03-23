import React, { useEffect, useState } from "react";
import axios from "axios";

function ViewProposals() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [projects, setProjects]     = useState([]);
  const [proposals, setProposals]   = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [actionLoading, setActionLoading]     = useState(null); // proposalId
  const [error, setError]           = useState("");
  const [searched, setSearched]     = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const avatarGradients = [
    "linear-gradient(135deg, #6C63FF, #FF6584)",
    "linear-gradient(135deg, #43E8A0, #6C63FF)",
    "linear-gradient(135deg, #FF6584, #F6AD55)",
    "linear-gradient(135deg, #F6AD55, #43E8A0)",
    "linear-gradient(135deg, #6C63FF, #43E8A0)",
  ];

  // ── FETCH CLIENT'S PROJECTS ──
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
        const res = await axios.get("http://localhost:5000/api/projects/all");
        // Filter only this client's projects
        const myProjects = res.data.filter(
          (p) => p.clientId?._id === user?.id || p.clientId === user?.id
        );
        setProjects(myProjects);
      } catch (err) {
        console.log(err);
        setError("Failed to load your projects.");
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  // ── FETCH PROPOSALS FOR SELECTED PROJECT ──
  const fetchProposals = async (projectId) => {
    try {
      setLoadingProposals(true);
      setError("");
      setSearched(true);
      const res = await axios.get(
        `http://localhost:5000/api/proposals/project/${projectId}`
      );
      setProposals(res.data);
    } catch (err) {
      console.log(err);
      setError("Could not fetch proposals for this project.");
      setProposals([]);
    } finally {
      setLoadingProposals(false);
    }
  };

  const handleSelectProject = (project) => {
    setSelectedProject(project);
    setDropdownOpen(false);
    fetchProposals(project._id);
  };

  // ── ACCEPT PROPOSAL ──
  const handleAccept = async (proposalId) => {
    try {
      setActionLoading(proposalId + "_accept");
      await axios.put(
        `http://localhost:5000/api/proposals/accept/${proposalId}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setProposals((prev) =>
        prev.map((p) =>
          p._id === proposalId ? { ...p, status: "accepted" } : p
        )
      );
    } catch (err) {
      console.log(err);
      alert("Failed to accept proposal.");
    } finally {
      setActionLoading(null);
    }
  };

  // ── REJECT PROPOSAL ──
  const handleReject = async (proposalId) => {
    try {
      setActionLoading(proposalId + "_reject");
      await axios.put(
        `http://localhost:5000/api/proposals/reject/${proposalId}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setProposals((prev) =>
        prev.map((p) =>
          p._id === proposalId ? { ...p, status: "rejected" } : p
        )
      );
    } catch (err) {
      console.log(err);
      alert("Failed to reject proposal.");
    } finally {
      setActionLoading(null);
    }
  };

  const getInitials = (name) => {
    if (!name) return "F";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const statusStyle = (status) => {
    const map = {
      accepted: { bg: "rgba(67,232,160,0.1)",  color: "#43E8A0", border: "rgba(67,232,160,0.25)"  },
      rejected: { bg: "rgba(255,101,132,0.1)", color: "#FF6584", border: "rgba(255,101,132,0.25)" },
      pending:  { bg: "rgba(246,173,85,0.1)",  color: "#F6AD55", border: "rgba(246,173,85,0.25)"  },
    };
    return map[status] || map.pending;
  };

  const acceptedCount = proposals.filter((p) => p.status === "accepted").length;
  const pendingCount  = proposals.filter((p) => p.status === "pending").length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;700&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .proposal-card {
          background: #1A1D27;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 22px;
          transition: border-color 0.2s, transform 0.2s;
        }
        .proposal-card:hover {
          border-color: rgba(255,255,255,0.15);
          transform: translateY(-2px);
          box-shadow: 0 10px 36px rgba(0,0,0,0.35);
        }

        .btn-accept {
          padding: 8px 18px;
          border-radius: 8px;
          font-size: 12px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          cursor: pointer;
          background: rgba(67,232,160,0.12);
          color: #43E8A0;
          border: 1px solid rgba(67,232,160,0.25);
          transition: all 0.15s;
          display: flex; align-items: center; gap: 6px;
        }
        .btn-accept:hover:not(:disabled) { background: rgba(67,232,160,0.22); transform: translateY(-1px); }
        .btn-accept:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-reject {
          padding: 8px 18px;
          border-radius: 8px;
          font-size: 12px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          cursor: pointer;
          background: rgba(255,101,132,0.08);
          color: #FF6584;
          border: 1px solid rgba(255,101,132,0.2);
          transition: all 0.15s;
          display: flex; align-items: center; gap: 6px;
        }
        .btn-reject:hover:not(:disabled) { background: rgba(255,101,132,0.16); transform: translateY(-1px); }
        .btn-reject:disabled { opacity: 0.5; cursor: not-allowed; }

        .dropdown-option {
          padding: 11px 16px;
          cursor: pointer;
          font-size: 13px;
          color: #8B8FA8;
          transition: all 0.12s;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .dropdown-option:hover { background: rgba(255,255,255,0.04); color: #F0F2FF; }
        .dropdown-option.selected { color: #A09BFF; background: rgba(108,99,255,0.08); }

        .error-box {
          display: flex; align-items: center; gap: 9px;
          background: rgba(255,101,132,0.08);
          border: 1px solid rgba(255,101,132,0.22);
          border-radius: 10px; padding: 12px 16px;
          font-size: 13px; color: #FF6584;
          margin-bottom: 20px;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .card-anim { animation: slideUp 0.22s ease forwards; }

        .status-tag {
          display: inline-flex; align-items: center;
          padding: 4px 11px; border-radius: 20px;
          font-size: 11px; font-weight: 600;
          text-transform: capitalize;
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
          padding: "20px 30px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          position: "sticky", top: 0, background: "#0A0B0F", zIndex: 10,
        }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700 }}>
            View Proposals
          </div>
          {proposals.length > 0 && (
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{
                fontSize: 12, color: "#43E8A0",
                background: "rgba(67,232,160,0.1)",
                border: "1px solid rgba(67,232,160,0.2)",
                padding: "4px 12px", borderRadius: 20,
              }}>
                {acceptedCount} accepted
              </span>
              <span style={{
                fontSize: 12, color: "#F6AD55",
                background: "rgba(246,173,85,0.1)",
                border: "1px solid rgba(246,173,85,0.2)",
                padding: "4px 12px", borderRadius: 20,
              }}>
                {pendingCount} pending
              </span>
            </div>
          )}
        </div>

        <div style={{ padding: "26px 30px 60px", maxWidth: 820, margin: "0 auto" }}>

          {/* ── PROJECT SELECTOR ── */}
          <div style={{
            background: "#13151C",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16, padding: 24, marginBottom: 24,
          }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 5 }}>
              Select a Project
            </div>
            <div style={{ fontSize: 13, color: "#5A5E72", marginBottom: 16 }}>
              Choose one of your posted projects to view its proposals.
            </div>

            {loadingProjects ? (
              <div style={{ fontSize: 13, color: "#5A5E72", display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
                  style={{ animation: "spin 0.8s linear infinite" }}>
                  <circle cx="8" cy="8" r="6" stroke="#5A5E72" strokeWidth="2" strokeDasharray="20 18" />
                </svg>
                Loading your projects...
              </div>
            ) : projects.length === 0 ? (
              <div style={{
                padding: "16px", background: "#1A1D27",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 10, fontSize: 13, color: "#5A5E72",
              }}>
                You haven't posted any projects yet.
              </div>
            ) : (
              <div style={{ position: "relative" }}>
                {/* Dropdown trigger */}
                <div
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    padding: "12px 16px",
                    background: "#1A1D27",
                    border: `1px solid ${dropdownOpen ? "rgba(108,99,255,0.45)" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 10,
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    transition: "border-color 0.15s",
                    boxShadow: dropdownOpen ? "0 0 0 3px rgba(108,99,255,0.1)" : "none",
                  }}
                >
                  <span style={{ fontSize: 14, color: selectedProject ? "#F0F2FF" : "#5A5E72" }}>
                    {selectedProject ? selectedProject.title : "Choose a project..."}
                  </span>
                  <svg
                    width="14" height="14" viewBox="0 0 16 16" fill="none"
                    style={{ color: "#5A5E72", transform: dropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
                  >
                    <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
                    background: "#1A1D27",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12, padding: 6,
                    zIndex: 50,
                    boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
                    animation: "fadeIn 0.15s ease",
                  }}>
                    {projects.map((project) => (
                      <div
                        key={project._id}
                        className={`dropdown-option ${selectedProject?._id === project._id ? "selected" : ""}`}
                        onClick={() => handleSelectProject(project)}
                      >
                        <div>
                          <div style={{ fontWeight: 500, marginBottom: 2 }}>{project.title}</div>
                          <div style={{ fontSize: 11, color: "#5A5E72" }}>
                            Budget: ₹{project.budget?.toLocaleString()}
                          </div>
                        </div>
                        {selectedProject?._id === project._id && (
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8l4 4 6-6" stroke="#A09BFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── SELECTED PROJECT INFO ── */}
          {selectedProject && (
            <div style={{
              background: "linear-gradient(135deg, rgba(108,99,255,0.08), rgba(67,232,160,0.04))",
              border: "1px solid rgba(108,99,255,0.15)",
              borderRadius: 12, padding: "14px 18px",
              marginBottom: 22,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, marginBottom: 3 }}>
                  {selectedProject.title}
                </div>
                <div style={{ fontSize: 12, color: "#8B8FA8" }}>
                  Budget: <span style={{ color: "#43E8A0" }}>₹{selectedProject.budget?.toLocaleString()}</span>
                  {selectedProject.skills?.length > 0 && (
                    <span style={{ marginLeft: 12, color: "#5A5E72" }}>
                      Skills: {selectedProject.skills.join(", ")}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, color: "#A09BFF" }}>
                  {proposals.length}
                </div>
                <div style={{ fontSize: 11, color: "#5A5E72" }}>proposals</div>
              </div>
            </div>
          )}

          {/* ── ERROR ── */}
          {error && (
            <div className="error-box">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#FF6584" strokeWidth="1.5" />
                <path d="M8 5v3.5M8 10.5v.5" stroke="#FF6584" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {error}
            </div>
          )}

          {/* ── LOADING PROPOSALS ── */}
          {loadingProposals && (
            <div style={{ textAlign: "center", padding: "50px 0", color: "#5A5E72" }}>
              <svg width="28" height="28" viewBox="0 0 16 16" fill="none"
                style={{ animation: "spin 0.8s linear infinite", marginBottom: 12 }}>
                <circle cx="8" cy="8" r="6" stroke="#6C63FF" strokeWidth="2" strokeDasharray="20 18" />
              </svg>
              <div style={{ fontSize: 14 }}>Loading proposals...</div>
            </div>
          )}

          {/* ── EMPTY STATE ── */}
          {searched && !loadingProposals && proposals.length === 0 && !error && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#5A5E72" }}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>📭</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: "#8B8FA8", marginBottom: 6 }}>
                No proposals yet
              </div>
              <div style={{ fontSize: 14 }}>No freelancers have applied to this project yet.</div>
            </div>
          )}

          {/* ── PROPOSALS LIST ── */}
          {!loadingProposals && proposals.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {proposals.map((proposal, i) => {
                const st = statusStyle(proposal.status || "pending");
                const isAccepted = proposal.status === "accepted";
                const isRejected = proposal.status === "rejected";
                const isPending  = !isAccepted && !isRejected;

                return (
                  <div
                    key={proposal._id}
                    className="proposal-card card-anim"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 42, height: 42, borderRadius: "50%",
                          background: avatarGradients[i % avatarGradients.length],
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 13, fontWeight: 700, color: "#fff",
                          fontFamily: "'Syne', sans-serif", flexShrink: 0,
                        }}>
                          {getInitials(proposal.freelancerId?.name)}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>
                            {proposal.freelancerId?.name || "Freelancer"}
                          </div>
                          <div style={{ fontSize: 12, color: "#8B8FA8", marginTop: 2 }}>
                            {proposal.freelancerId?.email || "—"}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {/* Status badge */}
                        <span className="status-tag" style={{
                          background: st.bg, color: st.color, border: `1px solid ${st.border}`,
                        }}>
                          {proposal.status || "pending"}
                        </span>
                        {/* Bid */}
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 11, color: "#5A5E72", marginBottom: 2 }}>Bid</div>
                          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: "#43E8A0" }}>
                            ₹{proposal.bidAmount?.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 14 }} />

                    {/* Message */}
                    <div style={{ marginBottom: 18 }}>
                      <div style={{ fontSize: 11, color: "#5A5E72", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>
                        Cover Message
                      </div>
                      <div style={{
                        fontSize: 13, color: "#8B8FA8", lineHeight: 1.7,
                        background: "#20232F",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 10, padding: "12px 14px",
                      }}>
                        {proposal.message || "No message provided."}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      {isPending && (
                        <>
                          <button
                            className="btn-reject"
                            onClick={() => handleReject(proposal._id)}
                            disabled={actionLoading !== null}
                          >
                            {actionLoading === proposal._id + "_reject" ? (
                              <svg width="12" height="12" viewBox="0 0 16 16" fill="none"
                                style={{ animation: "spin 0.8s linear infinite" }}>
                                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="20 18" />
                              </svg>
                            ) : (
                              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                              </svg>
                            )}
                            Reject
                          </button>
                          <button
                            className="btn-accept"
                            onClick={() => handleAccept(proposal._id)}
                            disabled={actionLoading !== null}
                          >
                            {actionLoading === proposal._id + "_accept" ? (
                              <svg width="12" height="12" viewBox="0 0 16 16" fill="none"
                                style={{ animation: "spin 0.8s linear infinite" }}>
                                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="20 18" />
                              </svg>
                            ) : (
                              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                                <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                            Accept Proposal
                          </button>
                        </>
                      )}

                      {isAccepted && (
                        <div style={{ fontSize: 13, color: "#43E8A0", display: "flex", alignItems: "center", gap: 6 }}>
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="7" stroke="#43E8A0" strokeWidth="1.5" />
                            <path d="M5 8l2 2 4-4" stroke="#43E8A0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Proposal accepted
                        </div>
                      )}

                      {isRejected && (
                        <div style={{ fontSize: 13, color: "#FF6584", display: "flex", alignItems: "center", gap: 6 }}>
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="7" stroke="#FF6584" strokeWidth="1.5" />
                            <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="#FF6584" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                          Proposal rejected
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export default ViewProposals;