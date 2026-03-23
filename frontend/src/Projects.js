import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const styles = {
  shell: {
    minHeight: "100vh",
    background: "#0A0B0F",
    color: "#F0F2FF",
    fontFamily: "'DM Sans', sans-serif",
  },
  topbar: {
    padding: "22px 30px 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    position: "sticky",
    top: 0,
    background: "#0A0B0F",
    zIndex: 10,
  },
  topbarTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 20,
    fontWeight: 700,
  },
  topbarActions: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  content: {
    padding: "26px 30px 50px",
  },
  searchWrapper: {
    position: "relative",
    marginBottom: 24,
    maxWidth: 400,
  },
  searchInput: {
    width: "100%",
    padding: "11px 16px 11px 40px",
    background: "#1A1D27",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    color: "#F0F2FF",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.15s",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 16,
  },
  card: {
    background: "#1A1D27",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 22,
    transition: "border-color 0.2s, transform 0.2s",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 500,
    background: "rgba(108,99,255,0.15)",
    color: "#A09BFF",
  },
  budget: {
    fontSize: 14,
    color: "#43E8A0",
    fontWeight: 600,
  },
  title: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 8,
    color: "#F0F2FF",
    textDecoration: "none",
    display: "block",
    transition: "color 0.15s",
  },
  description: {
    fontSize: 13,
    color: "#8B8FA8",
    lineHeight: 1.65,
    marginBottom: 12,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  skillTag: {
    display: "inline-block",
    background: "rgba(108,99,255,0.1)",
    color: "#A09BFF",
    border: "1px solid rgba(108,99,255,0.2)",
    borderRadius: 20,
    padding: "3px 10px",
    fontSize: 11,
    margin: "2px",
  },
  divider: {
    height: 1,
    background: "rgba(255,255,255,0.08)",
    margin: "14px 0",
  },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  clientRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6C63FF, #FF6584)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 10,
    fontWeight: 700,
    color: "#fff",
    flexShrink: 0,
    fontFamily: "'Syne', sans-serif",
  },
  clientName: {
    fontSize: 12,
    color: "#8B8FA8",
  },
};

function Projects() {
  const user     = JSON.parse(localStorage.getItem("user"));
  const token    = localStorage.getItem("token");
  const navigate = useNavigate();

  const [projects, setProjects]   = useState([]);
  const [search, setSearch]       = useState("");
  const [applying, setApplying]   = useState(null);
  const [applied, setApplied]     = useState([]); // track already-applied IDs
  const [loading, setLoading]     = useState(true);
  const [toast, setToast]         = useState(null); // { msg, type: "success"|"error" }

  useEffect(() => {
    fetchProjects();
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/projects/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(res.data || []);
    } catch (error) {
      console.log(error);
      if (error.response?.status === 401) navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const applyToProject = async (projectId) => {
    if (!user || !token) { navigate("/"); return; }

    try {
      setApplying(projectId);

      await axios.post(
        "http://localhost:5000/api/proposals/apply",
        {
          projectId,
          message:   "I am interested in this project and can deliver quality work.",
          bidAmount: 4000,
          // ✅ NO freelancerId — backend reads it from JWT token
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setApplied((prev) => [...prev, projectId]); // mark as applied
      showToast("Applied successfully! The client will be notified.", "success");

    } catch (error) {
      console.log(error);
      const msg = error.response?.data?.message || "Failed to apply.";
      showToast(msg, "error");
    } finally {
      setApplying(null);
    }
  };

  const getInitials = (name) => {
    if (!name) return "C";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const filtered = projects.filter(
    (p) =>
      (p.title       || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.skills      || []).some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  const isFreelancer = user?.role === "freelancer";
  const isClient     = user?.role === "client";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;700&family=DM+Sans:wght@300;400;500&display=swap');

        .project-card:hover {
          border-color: rgba(255,255,255,0.18) !important;
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.4);
        }
        .project-title:hover { color: #A09BFF !important; }

        .btn-apply {
          padding: 7px 16px;
          border-radius: 8px;
          font-size: 12px;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          border: none;
          background: #6C63FF;
          color: #fff;
          font-weight: 500;
          transition: all 0.15s;
        }
        .btn-apply:hover:not(:disabled) {
          background: #7B74FF;
          transform: translateY(-1px);
        }
        .btn-apply:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

        .btn-applied {
          padding: 7px 16px;
          border-radius: 8px;
          font-size: 12px;
          font-family: 'DM Sans', sans-serif;
          background: rgba(67,232,160,0.1);
          color: #43E8A0;
          border: 1px solid rgba(67,232,160,0.25);
          font-weight: 500;
          cursor: default;
          display: flex; align-items: center; gap: 5px;
        }

        .btn-view {
          padding: 7px 16px;
          border-radius: 8px;
          font-size: 12px;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          background: rgba(108,99,255,0.1);
          color: #A09BFF;
          border: 1px solid rgba(108,99,255,0.2);
          font-weight: 500;
          text-decoration: none;
          transition: all 0.15s;
        }
        .btn-view:hover { background: rgba(108,99,255,0.18); }

        .search-input:focus {
          border-color: rgba(108,99,255,0.5) !important;
          box-shadow: 0 0 0 3px rgba(108,99,255,0.1);
        }
        ::placeholder { color: #5A5E72; }

        .toast {
          position: fixed;
          bottom: 28px; right: 28px;
          padding: 14px 18px;
          border-radius: 12px;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          display: flex; align-items: center; gap: 10px;
          z-index: 9999;
          box-shadow: 0 12px 40px rgba(0,0,0,0.5);
          animation: toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
          max-width: 340px;
        }
        .toast.success {
          background: #13151C;
          border: 1px solid rgba(67,232,160,0.25);
          color: #43E8A0;
        }
        .toast.error {
          background: #13151C;
          border: 1px solid rgba(255,101,132,0.25);
          color: #FF6584;
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(16px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .skeleton {
          background: linear-gradient(90deg, #1A1D27 25%, #20232F 50%, #1A1D27 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 8px;
        }
        @keyframes shimmer {
          from { background-position: 200% 0; }
          to   { background-position: -200% 0; }
        }
      `}</style>

      <div style={styles.shell}>

        {/* ── TOPBAR ── */}
        <div style={styles.topbar}>
          <div style={styles.topbarTitle}>Gig Marketplace</div>
          <div style={styles.topbarActions}>
            {!loading && (
              <span style={{ fontSize: 13, color: "#8B8FA8" }}>
                {filtered.length} project{filtered.length !== 1 ? "s" : ""}
              </span>
            )}
            {isClient && (
              <Link
                to="/post-project"
                style={{
                  padding: "8px 16px", borderRadius: 9,
                  fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                  background: "#6C63FF", color: "#fff",
                  textDecoration: "none", fontWeight: 500,
                }}
              >
                + Post Project
              </Link>
            )}
          </div>
        </div>

        <div style={styles.content}>

          {/* ── SEARCH ── */}
          <div style={styles.searchWrapper}>
            <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", opacity: 0.35, pointerEvents: "none" }}
              width="15" height="15" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="4.5" stroke="#F0F2FF" strokeWidth="1.5"/>
              <path d="M10.5 10.5L14 14" stroke="#F0F2FF" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              className="search-input"
              type="text"
              placeholder="Search by title, description or skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {/* ── LOADING SKELETONS ── */}
          {loading && (
            <div style={styles.grid}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} style={{ ...styles.card, cursor: "default" }}>
                  <div className="skeleton" style={{ height: 20, width: "40%", marginBottom: 12 }} />
                  <div className="skeleton" style={{ height: 18, width: "80%", marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 14, width: "95%", marginBottom: 6 }} />
                  <div className="skeleton" style={{ height: 14, width: "70%", marginBottom: 18 }} />
                  <div className="skeleton" style={{ height: 1, marginBottom: 14 }} />
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div className="skeleton" style={{ height: 26, width: 100 }} />
                    <div className="skeleton" style={{ height: 30, width: 70, borderRadius: 8 }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── EMPTY STATE ── */}
          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#5A5E72" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: "#8B8FA8", marginBottom: 6 }}>
                No projects found
              </div>
              <div style={{ fontSize: 14 }}>Try a different search term or check back later.</div>
            </div>
          )}

          {/* ── PROJECT CARDS ── */}
          {!loading && (
            <div style={styles.grid}>
              {filtered.map((project) => {
                const hasApplied = applied.includes(project._id);
                const isOwner    = project.clientId?._id === user?.id ||
                                   project.clientId === user?.id;

                return (
                  <div key={project._id} className="project-card" style={styles.card}>

                    {/* Top row */}
                    <div style={styles.cardTop}>
                      <span style={styles.badge}>Project</span>
                      <span style={styles.budget}>₹{project.budget?.toLocaleString()}</span>
                    </div>

                    {/* Title */}
                    <Link
                      to={`/project/${project._id}`}
                      className="project-title"
                      style={styles.title}
                    >
                      {project.title}
                    </Link>

                    {/* Description */}
                    {project.description && (
                      <p style={styles.description}>{project.description}</p>
                    )}

                    {/* Skill tags */}
                    {project.skills?.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        {project.skills.slice(0, 4).map((skill, i) => (
                          <span key={i} style={styles.skillTag}>{skill}</span>
                        ))}
                        {project.skills.length > 4 && (
                          <span style={{ ...styles.skillTag, background: "rgba(255,255,255,0.05)", color: "#5A5E72" }}>
                            +{project.skills.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    <div style={styles.divider} />

                    {/* Footer */}
                    <div style={styles.cardFooter}>
                      <div style={styles.clientRow}>
                        <div style={styles.avatar}>
                          {getInitials(project.clientId?.name)}
                        </div>
                        <span style={styles.clientName}>
                          {project.clientId?.name || "Client"}
                        </span>
                      </div>

                      {/* ── ROLE-BASED BUTTON ── */}

                      {/* Freelancer — can apply */}
                      {isFreelancer && (
                        hasApplied ? (
                          <div className="btn-applied">
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                              <path d="M3 8l4 4 6-6" stroke="#43E8A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Applied
                          </div>
                        ) : (
                          <button
                            className="btn-apply"
                            onClick={() => applyToProject(project._id)}
                            disabled={applying === project._id}
                          >
                            {applying === project._id ? "Applying..." : "Apply"}
                          </button>
                        )
                      )}

                      {/* Client — view project details */}
                      {isClient && (
                        <Link to={`/project/${project._id}`} className="btn-view">
                          View
                        </Link>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── TOAST ── */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === "success" ? (
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="#43E8A0" strokeWidth="1.5"/>
              <path d="M5 8l2 2 4-4" stroke="#43E8A0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="#FF6584" strokeWidth="1.5"/>
              <path d="M8 5v3.5M8 10.5v.5" stroke="#FF6584" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          )}
          {toast.msg}
        </div>
      )}
    </>
  );
}

export default Projects;