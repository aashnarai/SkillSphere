import React, { useEffect, useState } from "react";
import axios from "axios";

// ─────────────────────────────────────────────
// STAR COMPONENT — reusable interactive stars
// ─────────────────────────────────────────────
function StarRating({ value, onChange, readonly = false, size = 24 }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hovered || value);
        return (
          <svg
            key={star}
            width={size} height={size}
            viewBox="0 0 24 24" fill="none"
            style={{ cursor: readonly ? "default" : "pointer", transition: "transform 0.1s" }}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            onClick={() => !readonly && onChange && onChange(star)}
          >
            <path
              d="M12 2l2.9 6 6.6.9-4.8 4.6 1.1 6.5L12 17l-5.8 3 1.1-6.5L2.5 9 9.1 8z"
              fill={filled ? "#F6AD55" : "none"}
              stroke={filled ? "#F6AD55" : "#5A5E72"}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN REVIEWS PAGE
// ─────────────────────────────────────────────
function Reviews() {
  const user  = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // Form state
  const [freelancerId, setFreelancerId] = useState("");
  const [projectId,    setProjectId]    = useState("");
  const [rating,       setRating]       = useState(0);
  const [comment,      setComment]      = useState("");
  const [submitting,   setSubmitting]   = useState(false);
  const [formSuccess,  setFormSuccess]  = useState("");
  const [formError,    setFormError]    = useState("");

  // Display state
  const [reviews,      setReviews]      = useState([]);
  const [stats,        setStats]        = useState(null);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [searchId,     setSearchId]     = useState("");
  const [inputId,      setInputId]      = useState("");

  // ── FETCH REVIEWS FOR A FREELANCER ──
  const fetchReviews = async (id) => {
    if (!id.trim()) return;
    try {
      setLoadingReviews(true);
      const res = await axios.get(
        `http://localhost:5000/api/reviews/freelancer/${id.trim()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviews(res.data.reviews     || []);
      setStats({
        avg:          res.data.avg,
        total:        res.data.total,
        distribution: res.data.distribution,
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingReviews(false);
    }
  };

  // ── SUBMIT REVIEW ──
  const handleSubmit = async () => {
    if (!freelancerId || !projectId) {
      setFormError("Please enter Freelancer ID and Project ID.");
      return;
    }
    if (rating === 0) {
      setFormError("Please select a star rating.");
      return;
    }
    if (!comment.trim()) {
      setFormError("Please write a review comment.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");

      await axios.post(
        "http://localhost:5000/api/reviews/create",
        { freelancerId, projectId, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFormSuccess("Review submitted! The freelancer has been notified.");
      setRating(0);
      setComment("");

      // Refresh reviews if viewing the same freelancer
      if (searchId === freelancerId) fetchReviews(freelancerId);

      setTimeout(() => setFormSuccess(""), 4000);

    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingLabel = (r) => {
    const map = { 1: "Poor", 2: "Fair", 3: "Good", 4: "Very Good", 5: "Excellent" };
    return map[r] || "";
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const avatarColors = [
    "linear-gradient(135deg,#6C63FF,#FF6584)",
    "linear-gradient(135deg,#43E8A0,#6C63FF)",
    "linear-gradient(135deg,#FF6584,#F6AD55)",
    "linear-gradient(135deg,#F6AD55,#43E8A0)",
  ];

  const isClient     = user?.role === "client";
  const isFreelancer = user?.role === "freelancer";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;700&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .rv-input, .rv-textarea {
          width: 100%;
          padding: 12px 16px;
          background: #1A1D27;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: #F0F2FF;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          resize: none;
        }
        .rv-input::placeholder, .rv-textarea::placeholder { color: #5A5E72; }
        .rv-input:focus, .rv-textarea:focus {
          border-color: rgba(108,99,255,0.5);
          box-shadow: 0 0 0 3px rgba(108,99,255,0.1);
        }
        .rv-input:hover, .rv-textarea:hover {
          border-color: rgba(255,255,255,0.13);
        }

        .btn-submit {
          width: 100%;
          padding: 13px;
          border-radius: 10px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          cursor: pointer;
          border: none;
          background: #6C63FF;
          color: #fff;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .btn-submit:hover:not(:disabled) {
          background: #7B74FF;
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(108,99,255,0.35);
        }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn-search {
          padding: 12px 22px;
          border-radius: 10px;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          cursor: pointer;
          border: none;
          background: #6C63FF;
          color: #fff;
          transition: all 0.15s;
          white-space: nowrap;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .btn-search:hover { background: #7B74FF; transform: translateY(-1px); }

        .rv-card {
          background: #1A1D27;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 22px;
          transition: border-color 0.2s;
        }
        .rv-card:hover { border-color: rgba(255,255,255,0.14); }

        .success-box {
          display: flex; align-items: center; gap: 9px;
          background: rgba(67,232,160,0.08);
          border: 1px solid rgba(67,232,160,0.22);
          border-radius: 10px; padding: 12px 16px;
          font-size: 13px; color: #43E8A0;
          animation: fadeIn 0.2s ease;
        }
        .error-box {
          display: flex; align-items: center; gap: 9px;
          background: rgba(255,101,132,0.08);
          border: 1px solid rgba(255,101,132,0.22);
          border-radius: 10px; padding: 12px 16px;
          font-size: 13px; color: #FF6584;
          animation: fadeIn 0.2s ease;
        }

        .dist-bar-bg {
          flex: 1;
          height: 6px;
          background: rgba(255,255,255,0.07);
          border-radius: 3px;
          overflow: hidden;
        }
        .dist-bar-fill {
          height: 100%;
          border-radius: 3px;
          background: linear-gradient(90deg, #F6AD55, #6C63FF);
          transition: width 0.6s ease;
        }

        .field-label {
          font-size: 12px;
          font-weight: 500;
          color: #8B8FA8;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 8px;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .slide-up { animation: slideUp 0.22s ease forwards; }
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
            Reviews & Ratings
          </div>
          {stats && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#F6AD55", fontSize: 16 }}>★</span>
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700 }}>
                {stats.avg}
              </span>
              <span style={{ fontSize: 12, color: "#5A5E72" }}>
                ({stats.total} review{stats.total !== 1 ? "s" : ""})
              </span>
            </div>
          )}
        </div>

        <div style={{ padding: "26px 30px 60px", maxWidth: 860, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: isClient ? "1fr 1fr" : "1fr", gap: 24 }}>

            {/* ── LEFT: SUBMIT FORM (clients only) ── */}
            {isClient && (
              <div>
                <div style={{
                  background: "#13151C",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 18, padding: 28,
                }}>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 6 }}>
                    Leave a Review
                  </div>
                  <div style={{ fontSize: 13, color: "#5A5E72", marginBottom: 24 }}>
                    Rate your experience with a freelancer after project completion.
                  </div>

                  {/* Success / Error */}
                  {formSuccess && (
                    <div className="success-box" style={{ marginBottom: 18 }}>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="7" stroke="#43E8A0" strokeWidth="1.5"/>
                        <path d="M5 8l2 2 4-4" stroke="#43E8A0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {formSuccess}
                    </div>
                  )}
                  {formError && (
                    <div className="error-box" style={{ marginBottom: 18 }}>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="7" stroke="#FF6584" strokeWidth="1.5"/>
                        <path d="M8 5v3.5M8 10.5v.5" stroke="#FF6584" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      {formError}
                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

                    {/* Freelancer ID */}
                    <div>
                      <div className="field-label">Freelancer ID</div>
                      <input
                        className="rv-input"
                        type="text"
                        placeholder="MongoDB _id of the freelancer"
                        value={freelancerId}
                        onChange={(e) => { setFreelancerId(e.target.value); setFormError(""); }}
                      />
                    </div>

                    {/* Project ID */}
                    <div>
                      <div className="field-label">Project ID</div>
                      <input
                        className="rv-input"
                        type="text"
                        placeholder="MongoDB _id of the project"
                        value={projectId}
                        onChange={(e) => { setProjectId(e.target.value); setFormError(""); }}
                      />
                    </div>

                    {/* Star Rating */}
                    <div>
                      <div className="field-label">Your Rating</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <StarRating value={rating} onChange={(val) => { setRating(val); setFormError(""); }} size={32} />
                        {rating > 0 && (
                          <span style={{ fontSize: 14, color: "#F6AD55", fontWeight: 500 }}>
                            {getRatingLabel(rating)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Comment */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div className="field-label" style={{ marginBottom: 0 }}>Your Review</div>
                        <span style={{ fontSize: 11, color: "#5A5E72" }}>
                          {comment.length}/500
                        </span>
                      </div>
                      <textarea
                        className="rv-textarea"
                        rows={4}
                        placeholder="Describe your experience working with this freelancer..."
                        value={comment}
                        maxLength={500}
                        onChange={(e) => { setComment(e.target.value); setFormError(""); }}
                      />
                    </div>

                    {/* Submit */}
                    <button
                      className="btn-submit"
                      onClick={handleSubmit}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
                            style={{ animation: "spin 0.8s linear infinite" }}>
                            <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="2" strokeDasharray="20 18"/>
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <path d="M8 2l1.8 3.6L14 6.3l-3 2.9.7 4.1L8 11.4l-3.7 1.9.7-4.1-3-2.9 4.2-.7z"
                              stroke="white" strokeWidth="1.3" strokeLinejoin="round"/>
                          </svg>
                          Submit Review
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── RIGHT: VIEW REVIEWS ── */}
            <div>
              {/* Search */}
              <div style={{
                background: "#13151C",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16, padding: 22, marginBottom: 20,
              }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 5 }}>
                  {isFreelancer ? "My Reviews" : "View Freelancer Reviews"}
                </div>
                <div style={{ fontSize: 13, color: "#5A5E72", marginBottom: 14 }}>
                  {isFreelancer
                    ? "See what clients say about your work."
                    : "Enter a Freelancer ID to see their reviews."}
                </div>

                {isFreelancer ? (
                  <button
                    className="btn-search"
                    style={{ width: "100%", justifyContent: "center" }}
                    onClick={() => { setSearchId(user?.id); fetchReviews(user?.id); }}
                  >
                    Load My Reviews
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: 10 }}>
                    <input
                      className="rv-input"
                      type="text"
                      placeholder="Freelancer ID..."
                      value={inputId}
                      onChange={(e) => setInputId(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { setSearchId(inputId); fetchReviews(inputId); }}}
                      style={{ flex: 1 }}
                    />
                    <button
                      className="btn-search"
                      onClick={() => { setSearchId(inputId); fetchReviews(inputId); }}
                    >
                      Search
                    </button>
                  </div>
                )}
              </div>

              {/* Stats Summary */}
              {stats && stats.total > 0 && (
                <div style={{
                  background: "#13151C",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 16, padding: 22, marginBottom: 18,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 18 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 44, fontWeight: 700, color: "#F6AD55", lineHeight: 1 }}>
                        {stats.avg}
                      </div>
                      <StarRating value={Math.round(stats.avg)} readonly size={16} />
                      <div style={{ fontSize: 12, color: "#5A5E72", marginTop: 6 }}>
                        {stats.total} review{stats.total !== 1 ? "s" : ""}
                      </div>
                    </div>

                    {/* Distribution bars */}
                    <div style={{ flex: 1 }}>
                      {stats.distribution.map((d) => (
                        <div key={d.star} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                          <span style={{ fontSize: 11, color: "#5A5E72", width: 14, textAlign: "right" }}>{d.star}</span>
                          <span style={{ color: "#F6AD55", fontSize: 11 }}>★</span>
                          <div className="dist-bar-bg">
                            <div className="dist-bar-fill" style={{ width: `${d.percent}%` }} />
                          </div>
                          <span style={{ fontSize: 11, color: "#5A5E72", width: 24 }}>{d.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Loading */}
              {loadingReviews && (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#5A5E72" }}>
                  <svg width="26" height="26" viewBox="0 0 16 16" fill="none"
                    style={{ animation: "spin 0.8s linear infinite", marginBottom: 10 }}>
                    <circle cx="8" cy="8" r="6" stroke="#6C63FF" strokeWidth="2" strokeDasharray="20 18"/>
                  </svg>
                  <div style={{ fontSize: 13 }}>Loading reviews...</div>
                </div>
              )}

              {/* Empty state */}
              {!loadingReviews && searchId && reviews.length === 0 && (
                <div style={{ textAlign: "center", padding: "50px 20px", color: "#5A5E72" }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>⭐</div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: "#8B8FA8", marginBottom: 6 }}>
                    No reviews yet
                  </div>
                  <div style={{ fontSize: 13 }}>This freelancer hasn't received any reviews.</div>
                </div>
              )}

              {/* Review Cards */}
              {!loadingReviews && reviews.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {reviews.map((review, i) => (
                    <div key={review._id} className="rv-card slide-up" style={{ animationDelay: `${i * 0.05}s` }}>

                      {/* Header */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: "50%",
                            background: avatarColors[i % avatarColors.length],
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12, fontWeight: 700, color: "#fff",
                            fontFamily: "'Syne', sans-serif", flexShrink: 0,
                          }}>
                            {getInitials(review.clientId?.name)}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>
                              {review.clientId?.name || "Client"}
                            </div>
                            <div style={{ fontSize: 11, color: "#5A5E72", marginTop: 1 }}>
                              {review.projectId?.title || "Project"}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <StarRating value={review.rating} readonly size={14} />
                          <div style={{ fontSize: 11, color: "#5A5E72", marginTop: 3 }}>
                            {new Date(review.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Comment */}
                      <div style={{
                        fontSize: 13, color: "#8B8FA8", lineHeight: 1.7,
                        background: "#20232F",
                        border: "1px solid rgba(255,255,255,0.05)",
                        borderRadius: 10, padding: "11px 14px",
                      }}>
                        "{review.comment}"
                      </div>

                      {/* Rating badge */}
                      <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
                        <span style={{
                          padding: "3px 10px", borderRadius: 20,
                          fontSize: 11, fontWeight: 600,
                          background: review.rating >= 4 ? "rgba(67,232,160,0.1)" : review.rating >= 3 ? "rgba(246,173,85,0.1)" : "rgba(255,101,132,0.1)",
                          color: review.rating >= 4 ? "#43E8A0" : review.rating >= 3 ? "#F6AD55" : "#FF6584",
                          border: `1px solid ${review.rating >= 4 ? "rgba(67,232,160,0.2)" : review.rating >= 3 ? "rgba(246,173,85,0.2)" : "rgba(255,101,132,0.2)"}`,
                        }}>
                          {getRatingLabel(review.rating)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default Reviews;