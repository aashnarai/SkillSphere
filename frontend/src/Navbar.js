import React from "react";
import { Link } from "react-router-dom";

function Navbar() {

  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div style={{
      padding: "10px",
      background: "#4F46E5",
      color: "white"
    }}>

      {/* ❌ SHOW ONLY WHEN NOT LOGGED IN */}
{!user && (
  <>
    <Link to="/" style={{ margin: "10px", color: "white" }}>Login</Link>
    <Link to="/register" style={{ margin: "10px", color: "white" }}>Register</Link>
  </>
)}
      {/* ✅ COMMON */}
      {user && (
        <Link to="/projects" style={{ margin: "10px", color: "white" }}>
          Projects
        </Link>
      )}

      {/* ✅ CLIENT ONLY */}
      {user?.role === "client" && (
        <>
          <Link to="/post-project" style={{ margin: "10px", color: "white" }}>
            Post Project
          </Link>

          <Link to="/proposals" style={{ margin: "10px", color: "white" }}>
            View Proposals
          </Link>
        </>
      )}

      {/* ✅ FREELANCER ONLY */}
      {user?.role === "freelancer" && (
        <span style={{ margin: "10px" }}>
          Freelancer Dashboard
        </span>
      )}

      {/* ✅ LOGOUT */}
      {user && (
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
          style={{ marginLeft: "20px" }}
        >
          Logout
        </button>
      )}

    </div>
  );
}

export default Navbar;