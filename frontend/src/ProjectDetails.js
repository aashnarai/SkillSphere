import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProject();
  }, [id]); // ✅ FIXED

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const res = await axios.get(
        `http://localhost:5000/api/projects/${id}`, // ✅ BEST PRACTICE
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProject(res.data);

    } catch (err) {
      console.log(err);
      setError("Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-white p-6">
        Loading project...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-6">
        {error}
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-gray-400 p-6">
        Project not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">

      <h1 className="text-3xl font-bold">
        {project.title}
      </h1>

      <p className="mt-4 text-gray-400">
        {project.description}
      </p>

      <p className="mt-4 text-purple-400">
        Budget: ₹{project.budget}
      </p>

      <p className="mt-2 text-gray-300">
        Client: {project.clientId?.name || "Unknown"}
      </p>

    </div>
  );
}

export default ProjectDetails;