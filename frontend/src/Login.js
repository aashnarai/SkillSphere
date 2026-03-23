import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/projects");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;700&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-input {
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
        .login-input::placeholder { color: #5A5E72; }
        .login-input:hover { border-color: rgba(255,255,255,0.13); }
        .login-input:focus {
          border-color: rgba(108,99,255,0.55);
          box-shadow: 0 0 0 3px rgba(108,99,255,0.1);
        }
        .login-input.error-field {
          border-color: rgba(255,101,132,0.5);
          box-shadow: 0 0 0 3px rgba(255,101,132,0.08);
        }

        .btn-login {
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
        .btn-login:hover:not(:disabled) {
          background: #7B74FF;
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(108,99,255,0.35);
        }
        .btn-login:disabled { opacity: 0.6; cursor: not-allowed; }

        .show-pass-btn {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #5A5E72;
          padding: 2px;
          display: flex;
          align-items: center;
          transition: color 0.15s;
        }
        .show-pass-btn:hover { color: #8B8FA8; }

        .error-box {
          display: flex;
          align-items: center;
          gap: 9px;
          background: rgba(255,101,132,0.08);
          border: 1px solid rgba(255,101,132,0.22);
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 13px;
          color: #FF6584;
          font-family: 'DM Sans', sans-serif;
          animation: fadeIn 0.2s ease;
        }

        .divider-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 4px 0;
        }
        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.07);
        }
        .divider-text {
          font-size: 12px;
          color: #5A5E72;
          white-space: nowrap;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
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
          width: "45%",
          background: "#13151C",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 52px",
        }}>
          {/* Logo */}
          <div style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: -0.5,
            color: "#F0F2FF",
            marginBottom: 10,
          }}>
            Skill<span style={{ color: "#6C63FF" }}>Sphere</span>
          </div>
          <div style={{ fontSize: 10, color: "#5A5E72", letterSpacing: 2, textTransform: "uppercase", marginBottom: 48 }}>
            Hyperlocal Freelance Ecosystem
          </div>

          {/* Tagline */}
          <div style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 32,
            fontWeight: 700,
            lineHeight: 1.25,
            color: "#F0F2FF",
            marginBottom: 18,
          }}>
            Connect. Build.<br />
            <span style={{ color: "#6C63FF" }}>Get Paid.</span>
          </div>
          <div style={{ fontSize: 15, color: "#8B8FA8", lineHeight: 1.7, marginBottom: 40, maxWidth: 320 }}>
            Join thousands of freelancers and clients on the most intelligent hyperlocal work platform.
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 32 }}>
            {[
              { val: "8.4k", label: "Freelancers" },
              { val: "1.2k", label: "Active Gigs" },
              { val: "94%", label: "Match Rate" },
            ].map((s) => (
              <div key={s.label}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, color: "#43E8A0" }}>
                  {s.val}
                </div>
                <div style={{ fontSize: 12, color: "#5A5E72", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Decorative orb */}
          <div style={{
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)",
            position: "absolute",
            bottom: 80,
            left: 40,
            pointerEvents: "none",
          }} />
        </div>

        {/* RIGHT PANEL — Form */}
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
        }}>
          <div style={{ width: "100%", maxWidth: 420 }}>

            {/* Form header */}
            <div style={{ marginBottom: 32 }}>
              <div style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 26,
                fontWeight: 700,
                color: "#F0F2FF",
                marginBottom: 8,
              }}>
                Welcome back
              </div>
              <div style={{ fontSize: 14, color: "#8B8FA8" }}>
                Sign in to your SkillSphere account
              </div>
            </div>

            {/* Error box */}
            {error && (
              <div className="error-box" style={{ marginBottom: 20 }}>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="#FF6584" strokeWidth="1.5" />
                  <path d="M8 5v3.5M8 10.5v.5" stroke="#FF6584" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {error}
              </div>
            )}

            {/* Form fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Email */}
              <div>
                <div style={{
                  fontSize: 12, fontWeight: 500, color: "#8B8FA8",
                  textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8,
                }}>
                  Email address
                </div>
                <input
                  className={`login-input ${error ? "error-field" : ""}`}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  onKeyDown={handleKeyDown}
                />
              </div>

              {/* Password */}
              <div>
                <div style={{
                  fontSize: 12, fontWeight: 500, color: "#8B8FA8",
                  textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span>Password</span>
                  <span style={{ color: "#6C63FF", cursor: "pointer", fontSize: 11, textTransform: "none", letterSpacing: 0 }}>
                    Forgot password?
                  </span>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    className={`login-input ${error ? "error-field" : ""}`}
                    type={showPass ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    onKeyDown={handleKeyDown}
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    className="show-pass-btn"
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                  >
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
              </div>

              {/* Submit */}
              <button
                className="btn-login"
                onClick={handleLogin}
                disabled={loading}
                style={{ marginTop: 6 }}
              >
                {loading ? (
                  <>
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none"
                      style={{ animation: "spin 0.8s linear infinite" }}>
                      <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="2" strokeDasharray="20 18" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="divider-row">
                <div className="divider-line" />
                <span className="divider-text">Don't have an account?</span>
                <div className="divider-line" />
              </div>

              {/* Register link */}
              <Link
                to="/register"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "12px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                  color: "#A09BFF",
                  background: "rgba(108,99,255,0.08)",
                  border: "1px solid rgba(108,99,255,0.2)",
                  textDecoration: "none",
                  transition: "all 0.15s",
                }}
              >
                Create an account
              </Link>

            </div>
          </div>
        </div>

      </div>
    </>
  );
}

export default Login;