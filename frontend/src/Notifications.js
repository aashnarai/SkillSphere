import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

// ── NOTIFICATION TYPES CONFIG ──
const typeConfig = {
  proposal:  { color: "#6C63FF", bg: "rgba(108,99,255,0.12)", border: "rgba(108,99,255,0.22)", label: "Proposal"  },
  accepted:  { color: "#43E8A0", bg: "rgba(67,232,160,0.1)",  border: "rgba(67,232,160,0.22)",  label: "Accepted"  },
  payment:   { color: "#F6AD55", bg: "rgba(246,173,85,0.1)",  border: "rgba(246,173,85,0.22)",  label: "Payment"   },
  review:    { color: "#FF6584", bg: "rgba(255,101,132,0.1)", border: "rgba(255,101,132,0.22)", label: "Review"    },
  message:   { color: "#A09BFF", bg: "rgba(160,155,255,0.1)", border: "rgba(160,155,255,0.22)", label: "Message"   },
  rejected:  { color: "#FF6584", bg: "rgba(255,101,132,0.1)", border: "rgba(255,101,132,0.22)", label: "Rejected"  },
};

const typeIcon = (type) => {
  const icons = {
    proposal: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M8 1L10 5.5H15L11 8.5L12.5 13L8 10L3.5 13L5 8.5L1 5.5H6L8 1Z"
          stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      </svg>
    ),
    accepted: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    payment: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="4" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M1 7h14" stroke="currentColor" strokeWidth="1.3"/>
      </svg>
    ),
    review: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.4l-3.7 1.9.7-4.1-3-2.9 4.2-.7L8 1z"
          stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      </svg>
    ),
    message: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M14 10a2 2 0 01-2 2H5l-3 3V4a2 2 0 012-2h8a2 2 0 012 2v6z"
          stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      </svg>
    ),
    rejected: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  };
  return icons[type] || icons.message;
};

// ── SAMPLE INITIAL NOTIFICATIONS ──
const initialNotifications = [
  { id: 1, type: "accepted",  title: "Proposal Accepted!",        body: "TechCorp accepted your proposal for 'MERN Marketplace'. Check your dashboard.", time: "2m ago",  read: false },
  { id: 2, type: "proposal",  title: "New Proposal Received",      body: "Priya Rao submitted a proposal for 'E-commerce Platform UI' with a bid of ₹32,000.", time: "15m ago", read: false },
  { id: 3, type: "message",   title: "New Message",                body: "Siddharth M. sent you a message: 'Sent you the Figma link, please review.'", time: "1h ago",  read: false },
  { id: 4, type: "payment",   title: "Payment Released",           body: "₹45,000 has been released from escrow for 'API Integration Suite'. Check your wallet.", time: "3h ago",  read: true  },
  { id: 5, type: "review",    title: "New Review Posted",          body: "Anika Nair left you a 5-star review: 'Excellent work, delivered on time!'", time: "1d ago",  read: true  },
  { id: 6, type: "rejected",  title: "Proposal Not Selected",      body: "Your proposal for 'CI/CD Pipeline Setup' was not selected this time.", time: "2d ago",  read: true  },
  { id: 7, type: "proposal",  title: "New Gig Match Found",        body: "A new project matching your skills (React, Node.js) was posted by FinPay Inc.", time: "2d ago",  read: true  },
];

// ── NOTIFICATION BELL (for Navbar) ──
export function NotificationBell({ onClick, count }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "relative",
        width: 36, height: 36,
        borderRadius: 9,
        background: "#1A1D27",
        border: "1px solid rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", color: "#8B8FA8",
        transition: "all 0.15s",
      }}
      title="Notifications"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1a5 5 0 00-5 5v3l-1.5 2H14.5L13 9V6a5 5 0 00-5-5z"
          stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M6.5 13a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
      {count > 0 && (
        <span style={{
          position: "absolute", top: -4, right: -4,
          background: "#FF6584", color: "#fff",
          borderRadius: 10, padding: "1px 5px",
          fontSize: 10, fontWeight: 700,
          border: "2px solid #0A0B0F",
          minWidth: 18, textAlign: "center",
          lineHeight: "14px",
        }}>
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}

// ── MAIN NOTIFICATIONS PAGE ──
function Notifications() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter]               = useState("all");
  const [socket, setSocket]               = useState(null);
  const [connected, setConnected]         = useState(false);
  const [toast, setToast]                 = useState(null);
  const toastTimer                        = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ── SOCKET SETUP ──
  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      auth: { token: localStorage.getItem("token") },
    });

    newSocket.on("connect", () => {
      setConnected(true);
      newSocket.emit("join", { userId: user?.id });
    });

    newSocket.on("disconnect", () => setConnected(false));

    // Listen for real-time notifications from backend
    newSocket.on("notification", (data) => {
      const newNotif = {
        id: Date.now(),
        type: data.type || "message",
        title: data.title,
        body: data.body,
        time: "just now",
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
      showToast(newNotif);
    });

    // Specific events
    newSocket.on("proposal_received",  (d) => triggerNotif("proposal", "New Proposal Received",  d.message || "Someone applied to your project."));
    newSocket.on("proposal_accepted",  (d) => triggerNotif("accepted", "Proposal Accepted!",      d.message || "Your proposal was accepted!"));
    newSocket.on("proposal_rejected",  (d) => triggerNotif("rejected", "Proposal Not Selected",   d.message || "Your proposal was not selected."));
    newSocket.on("payment_received",   (d) => triggerNotif("payment",  "Payment Released",         d.message || "A payment has been released."));
    newSocket.on("new_message",        (d) => triggerNotif("message",  "New Message",              d.message || "You have a new message."));
    newSocket.on("review_added",       (d) => triggerNotif("review",   "New Review Posted",        d.message || "Someone left you a review."));

    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, []);

  const triggerNotif = (type, title, body) => {
    const notif = { id: Date.now(), type, title, body, time: "just now", read: false };
    setNotifications((prev) => [notif, ...prev]);
    showToast(notif);
  };

  const showToast = (notif) => {
    setToast(notif);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  const markRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotif = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => setNotifications([]);

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "all")    return true;
    return n.type === filter;
  });

  const filters = ["all", "unread", "proposal", "accepted", "payment", "message", "review"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;700&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .notif-shell {
          min-height: 100vh;
          background: #0A0B0F;
          color: #F0F2FF;
          font-family: 'DM Sans', sans-serif;
        }

        .notif-filter-btn {
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.08);
          background: #1A1D27;
          color: #8B8FA8;
          transition: all 0.15s;
          text-transform: capitalize;
          white-space: nowrap;
        }
        .notif-filter-btn:hover { background: #20232F; color: #F0F2FF; }
        .notif-filter-btn.active {
          background: rgba(108,99,255,0.15);
          color: #A09BFF;
          border-color: rgba(108,99,255,0.3);
        }

        .notif-card {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 16px 20px;
          background: #13151C;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          transition: all 0.15s;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        .notif-card:hover {
          border-color: rgba(255,255,255,0.13);
          background: #16192200;
        }
        .notif-card.unread {
          background: #14162000;
          border-color: rgba(108,99,255,0.15);
        }
        .notif-card.unread::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: #6C63FF;
          border-radius: 14px 0 0 14px;
        }

        .notif-icon-wrap {
          width: 38px; height: 38px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .notif-delete-btn {
          position: absolute;
          top: 12px; right: 14px;
          background: none; border: none;
          cursor: pointer; color: #5A5E72;
          opacity: 0;
          transition: all 0.15s;
          padding: 2px;
          display: flex; align-items: center;
        }
        .notif-card:hover .notif-delete-btn { opacity: 1; }
        .notif-delete-btn:hover { color: #FF6584; }

        .btn-ghost-sm {
          padding: 7px 16px;
          border-radius: 8px;
          font-size: 12px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          cursor: pointer;
          background: #1A1D27;
          color: #8B8FA8;
          border: 1px solid rgba(255,255,255,0.08);
          transition: all 0.15s;
        }
        .btn-ghost-sm:hover { background: #20232F; color: #F0F2FF; }

        .btn-accent-sm {
          padding: 7px 16px;
          border-radius: 8px;
          font-size: 12px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          cursor: pointer;
          background: rgba(108,99,255,0.12);
          color: #A09BFF;
          border: 1px solid rgba(108,99,255,0.22);
          transition: all 0.15s;
        }
        .btn-accent-sm:hover { background: rgba(108,99,255,0.2); }

        /* ── TOAST ── */
        .toast {
          position: fixed;
          bottom: 28px; right: 28px;
          background: #13151C;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 14px;
          padding: 14px 16px;
          display: flex; align-items: flex-start; gap: 12px;
          max-width: 340px;
          box-shadow: 0 16px 48px rgba(0,0,0,0.5);
          z-index: 9999;
          animation: toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .toast.hide { animation: toastOut 0.25s ease forwards; }

        @keyframes toastIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes toastOut {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(10px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.2s ease forwards; }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
          color: #5A5E72;
        }

        .connected-pill {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 11px; padding: 3px 9px; border-radius: 20px;
        }
        .connected-pill.on  { background: rgba(67,232,160,0.1);  color: #43E8A0; }
        .connected-pill.off { background: rgba(255,101,132,0.1); color: #FF6584; }
        .pill-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
      `}</style>

      <div className="notif-shell">

        {/* ── TOPBAR ── */}
        <div style={{
          padding: "20px 30px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          position: "sticky", top: 0, background: "#0A0B0F", zIndex: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700 }}>
              Notifications
            </div>
            {unreadCount > 0 && (
              <span style={{
                background: "#6C63FF", color: "#fff",
                borderRadius: 20, padding: "2px 10px",
                fontSize: 12, fontWeight: 700,
              }}>
                {unreadCount} new
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className={`connected-pill ${connected ? "on" : "off"}`}>
              <div className="pill-dot" />
              {connected ? "Live" : "Offline"}
            </div>
            {unreadCount > 0 && (
              <button className="btn-accent-sm" onClick={markAllRead}>
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button className="btn-ghost-sm" onClick={clearAll}>
                Clear all
              </button>
            )}
          </div>
        </div>

        <div style={{ padding: "22px 30px 60px", maxWidth: 780, margin: "0 auto" }}>

          {/* ── FILTER CHIPS ── */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
            {filters.map((f) => (
              <button
                key={f}
                className={`notif-filter-btn ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f === "all"
                  ? `All (${notifications.length})`
                  : f === "unread"
                  ? `Unread (${unreadCount})`
                  : f}
              </button>
            ))}
          </div>

          {/* ── SUMMARY CARDS ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
            {[
              { label: "Total",    value: notifications.length,                                    color: "#A09BFF" },
              { label: "Unread",   value: unreadCount,                                             color: "#6C63FF" },
              { label: "Accepted", value: notifications.filter(n => n.type === "accepted").length, color: "#43E8A0" },
              { label: "Payments", value: notifications.filter(n => n.type === "payment").length,  color: "#F6AD55" },
            ].map((s) => (
              <div key={s.label} style={{
                background: "#13151C",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12, padding: "14px 16px",
              }}>
                <div style={{ fontSize: 11, color: "#8B8FA8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
                  {s.label}
                </div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 700, color: s.color }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* ── NOTIFICATION LIST ── */}
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 42, marginBottom: 14 }}>🔔</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: "#8B8FA8", marginBottom: 6 }}>
                {filter === "unread" ? "All caught up!" : "No notifications"}
              </div>
              <div style={{ fontSize: 14 }}>
                {filter === "unread" ? "You have no unread notifications." : "Nothing here yet. We'll notify you when something happens."}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.map((notif, i) => {
                const cfg = typeConfig[notif.type] || typeConfig.message;
                return (
                  <div
                    key={notif.id}
                    className={`notif-card ${!notif.read ? "unread" : ""} fade-up`}
                    style={{ animationDelay: `${i * 0.04}s` }}
                    onClick={() => markRead(notif.id)}
                  >
                    {/* Icon */}
                    <div className="notif-icon-wrap" style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}>
                      {typeIcon(notif.type)}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0, paddingRight: 24 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: notif.read ? "#8B8FA8" : "#F0F2FF" }}>
                          {notif.title}
                        </span>
                        <span style={{
                          padding: "2px 8px", borderRadius: 20,
                          fontSize: 10, fontWeight: 500,
                          background: cfg.bg, color: cfg.color,
                          border: `1px solid ${cfg.border}`,
                        }}>
                          {cfg.label}
                        </span>
                        {!notif.read && (
                          <span style={{
                            width: 7, height: 7, borderRadius: "50%",
                            background: "#6C63FF", flexShrink: 0,
                            marginLeft: "auto",
                          }} />
                        )}
                      </div>
                      <div style={{ fontSize: 13, color: "#8B8FA8", lineHeight: 1.6, marginBottom: 6 }}>
                        {notif.body}
                      </div>
                      <div style={{ fontSize: 11, color: "#5A5E72" }}>{notif.time}</div>
                    </div>

                    {/* Delete btn */}
                    <button
                      className="notif-delete-btn"
                      onClick={(e) => { e.stopPropagation(); deleteNotif(notif.id); }}
                      title="Dismiss"
                    >
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                        <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── TOAST POPUP ── */}
      {toast && (() => {
        const cfg = typeConfig[toast.type] || typeConfig.message;
        return (
          <div className="toast">
            <div style={{
              width: 36, height: 36, borderRadius: 9, flexShrink: 0,
              background: cfg.bg, border: `1px solid ${cfg.border}`,
              color: cfg.color,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {typeIcon(toast.type)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{toast.title}</div>
              <div style={{ fontSize: 12, color: "#8B8FA8", lineHeight: 1.5 }}>
                {toast.body.slice(0, 80)}{toast.body.length > 80 ? "..." : ""}
              </div>
            </div>
            <button
              onClick={() => setToast(null)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#5A5E72", padding: 2, flexShrink: 0,
                display: "flex", alignItems: "center",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        );
      })()}
    </>
  );
}

export default Notifications;