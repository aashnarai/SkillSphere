import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function PostProject() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [skills, setSkills] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!title || !description || !budget) {
      setError("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");

      if (!user || !token) {
        navigate("/login");
        return;
      }

      await axios.post(
        "http://localhost:5000/api/projects/create",
        {
          title,
          description,
          budget,
          skills: skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          clientId: user._id, // ✅ FIXED (was user.id ❌)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ SECURE
          },
        }
      );

      setSuccess(true);

      // reset form
      setTitle("");
      setDescription("");
      setBudget("");
      setSkills("");

      // redirect after 2 sec
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);

    } catch (err) {
      console.log(err);
      setError("Error creating project");
    } finally {
      setLoading(false);
    }
  };

  const skillList = skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <>
      <div style={{
        minHeight: "100vh",
        background: "#0A0B0F",
        color: "#F0F2FF",
        fontFamily: "'DM Sans', sans-serif",
        padding: 30
      }}>

        <h2>Post a Project</h2>

        {/* SUCCESS */}
        {success && (
          <div style={{ color: "lightgreen", marginBottom: 15 }}>
            Project posted successfully!
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div style={{ color: "red", marginBottom: 15 }}>
            {error}
          </div>
        )}

        {/* FORM */}
        <input
          type="text"
          placeholder="Project Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <br /><br />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <br /><br />

        <input
          type="number"
          placeholder="Budget"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
        />

        <br /><br />

        <input
          type="text"
          placeholder="Skills (comma separated)"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
        />

        {/* SKILL PREVIEW */}
        <div>
          {skillList.map((skill, i) => (
            <span key={i} style={{ marginRight: 5 }}>
              {skill}
            </span>
          ))}
        </div>

        <br />

        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Posting..." : "Post Project"}
        </button>

      </div>
    </>
  );
}

export default PostProject;