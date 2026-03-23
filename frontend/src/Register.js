import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole]         = useState("freelancer");
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        name, email, password, role,
      });
      setSuccess(res.data.message || "Account created! Redirecting...");
      setTimeout(() => navigate("/"), 1800);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleRegister();
  };

  const roles = [
    {
      id: "freelancer",
      label: "Freelancer",
      desc: "Find gigs & get paid",
      icon: (
        <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
          <path d="M8 1L10 5.5H15L11 8.5L12.5 13L8 10L3.5 13L5 8.5L1 5.5H6L8 1Z"
            stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: "client",
      label: "Client",
      desc: "Post projects & hire",
      icon: (
        <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M5 7h6M5 10h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  const passwordStrength = () => {
    if (!password) return null;
    if (password.length < 6)  return { label: "Too short", color: "#FF6584", width: "25%" };
    if (password.length < 10) return { label: "Fair",      color: "#F6AD55", width: "55%" };
    return                           { label: "Strong",    color: "#43E8A0", width: "100%" };
  };
  const strength = passwordStrength();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;700&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .reg-input {
          width: 100%;
          padding: 13px 16px;
          background: #1A1D27;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: #F0F2FF;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .reg-input::placeholder { color: #5A5E72; }
        .reg-input:hover  { border-color: rgba(255,255,255,0.13); }
        .reg-input:focus  {
          border-color: rgba(108,99,255,0.55);
          box-shadow: 0 0 0 3px rgba(108,99,255,0.1);
        }
        .reg-input.has-error {
          border-color: rgba(255,101,132,0.5);
          box-shadow: 0 0 0 3px rgba(255,101,132,0.08);
        }

        .role-card {
          flex: 1;
          padding: 16px;
          border-radius: 12px;
          background: #1A1D27;
          border: 1px solid rgba(255,255,255,0.08);
          cursor: pointer;
          transition: all 0.15s;
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .role-card:hover { border-color: rgba(255,255,255,0.16); }
        .role-card.active {
          background: rgba(108,99,255,0.1);
          border-color: rgba(108,99,255,0.4);
          box-shadow: 0 0 0 3px rgba(108,99,255,0.08);
        }

        .btn-register {
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
        .btn-register:hover:not(:disabled) {
          background: #7B74FF;
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(108,99,255,0.35);
        }
        .btn-register:disabled { opacity: 0.6; cursor: not-allowed; }

        .show-pass-btn {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #5A5E72; padding: 2px;
          display: flex; align-items: center;
          transition: color 0.15s;
        }
        .show-pass-btn:hover { color: #8B8FA8; }

        .error-box {
          display: flex; align-items: center; gap: 9px;
          background: rgba(255,101,132,0.08);
          border: 1px solid rgba(255,101,132,0.22);
          border-radius: 10px; padding: 12px 16px;
          font-size: 13px; color: #FF6584;
          font-family: 'DM Sans', sans-serif;
          margin-bottom: 20px;
          animation: fadeIn 0.2s ease;
        }
        .success-box {
          display: flex; align-items: center; gap: 9px;
          background: rgba(67,232,160,0.08);
          border: 1px solid rgba(67,232,160,0.22);
          border-radius: 10px; padding: 12px 16px;
          font-size: 13px; color: #43E8A0;
          font-family: 'DM Sans', sans-serif;
          margin-bottom: 20px;
          animation: fadeIn 0.2s ease;
        }

        .field-label {
          font-size: 12px; font-weight: 500; color: #8B8FA8;
          text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "#0A0B0F",
        display: "flex",
        fontFamily: "'DM Sans', sans-serif",
      }}>

        {/* LEFT PANEL — Branding */}
        <div style={{
          width: "42%",
          background: "#13151C",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 52px",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 700, letterSpacing: -0.5, color: "#F0F2FF", marginBottom: 8 }}>
            Skill<span style={{ color: "#6C63FF" }}>Sphere</span>
          </div>
          <div style={{ fontSize: 10, color: "#5A5E72", letterSpacing: 2, textTransform: "uppercase", marginBottom: 48 }}>
            Hyperlocal Freelance Ecosystem
          </div>

          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 30, fontWeight: 700, lineHeight: 1.25, color: "#F0F2FF", marginBottom: 16 }}>
            Start Your<br />
            <span style={{ color: "#6C63FF" }}>Journey Today.</span>
          </div>
          <div style={{ fontSize: 15, color: "#8B8FA8", lineHeight: 1.7, marginBottom: 40, maxWidth: 300 }}>
            Create your account and join thousands of professionals on the most intelligent hyperlocal work platform.
          </div>

          {/* Role perks */}
          {[
            { icon: "✦", text: "AI-powered job matching" },
            { icon: "✦", text: "Secure escrow payments" },
            { icon: "✦", text: "Verified reputation system" },
            { icon: "✦", text: "Real-time collaboration tools" },
          ].map((item) => (
            <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ color: "#6C63FF", fontSize: 10 }}>{item.icon}</span>
              <span style={{ fontSize: 13, color: "#8B8FA8" }}>{item.text}</span>
            </div>
          ))}

          {/* Decorative orb */}
          <div style={{
            width: 220, height: 220, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)",
            position: "absolute", bottom: 40, right: -60, pointerEvents: "none",
          }} />
        </div>

        {/* RIGHT PANEL — Form */}
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          overflowY: "auto",
        }}>
          <div style={{ width: "100%", maxWidth: 440 }}>

            {/* Header */}
            <div style={{ marginBottom: 30 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 700, color: "#F0F2FF", marginBottom: 8 }}>
                Create account
              </div>
              <div style={{ fontSize: 14, color: "#8B8FA8" }}>
                Join SkillSphere — it's free to get started.
              </div>
            </div>

            {/* Alerts */}
            {error && (
              <div className="error-box">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="#FF6584" strokeWidth="1.5" />
                  <path d="M8 5v3.5M8 10.5v.5" stroke="#FF6584" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {error}
              </div>
            )}
            {success && (
              <div className="success-box">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="#43E8A0" strokeWidth="1.5" />
                  <path d="M5 8l2 2 4-4" stroke="#43E8A0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {success}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Role Selector */}
              <div>
                <div className="field-label">I want to</div>
                <div style={{ display: "flex", gap: 10 }}>
                  {roles.map((r) => (
                    <button
                      key={r.id}
                      className={`role-card ${role === r.id ? "active" : ""}`}
                      onClick={() => setRole(r.id)}
                      type="button"
                    >
                      <div style={{ color: role === r.id ? "#A09BFF" : "#5A5E72", transition: "color 0.15s" }}>
                        {r.icon}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: role === r.id ? "#F0F2FF" : "#8B8FA8" }}>
                        {r.label}
                      </div>
                      <div style={{ fontSize: 11, color: role === r.id ? "#8B8FA8" : "#5A5E72" }}>
                        {r.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <div className="field-label">Full Name</div>
                <input
                  className={`reg-input ${error && !name ? "has-error" : ""}`}
                  type="text"
                  placeholder="Arjun Kumar"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(""); }}
                  onKeyDown={handleKeyDown}
                />
              </div>

              {/* Email */}
              <div>
                <div className="field-label">Email Address</div>
                <input
                  className={`reg-input ${error && !email ? "has-error" : ""}`}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  onKeyDown={handleKeyDown}
                />
              </div>

              {/* Password */}
              <div>
                <div className="field-label">Password</div>
                <div style={{ position: "relative" }}>
                  <input
                    className={`reg-input ${error && !password ? "has-error" : ""}`}
                    type={showPass ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    onKeyDown={handleKeyDown}
                    style={{ paddingRight: 44 }}
                  />
                  <button className="show-pass-btn" type="button" onClick={() => setShowPass(!showPass)}>
                    {showPass ? (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z" stroke="currentColor" strokeWidth="1.4"/>
                        <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4"/>
                        <path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z" stroke="currentColor" strokeWidth="1.4"/>
                        <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4"/>
                      </svg>
                    )}
                  </button>
                </div>

                {/* Password strength bar */}
                {strength && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 2,
                        background: strength.color,
                        width: strength.width,
                        transition: "width 0.3s ease, background 0.3s ease",
                      }} />
                    </div>
                    <div style={{ fontSize: 11, color: strength.color, marginTop: 5 }}>
                      {strength.label}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                className="btn-register"
                onClick={handleRegister}
                disabled={loading}
                style={{ marginTop: 4 }}
              >
                {loading ? (
                  <>
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none"
                      style={{ animation: "spin 0.8s linear infinite" }}>
                      <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="2" strokeDasharray="20 18" />
                    </svg>
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </>
                )}
              </button>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
                <span style={{ fontSize: 12, color: "#5A5E72", whiteSpace: "nowrap" }}>Already have an account?</span>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
              </div>

              {/* Login link */}
              <Link
                to="/"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 6, padding: "12px", borderRadius: 10,
                  fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                  color: "#A09BFF",
                  background: "rgba(108,99,255,0.08)",
                  border: "1px solid rgba(108,99,255,0.2)",
                  textDecoration: "none", transition: "all 0.15s",
                }}
              >
                Sign in instead
              </Link>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;