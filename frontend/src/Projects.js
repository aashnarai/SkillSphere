import React, { useEffect, useState } from "react";
import axios from "axios";

function Projects() {

  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/projects/all"
      );

      setProjects(res.data);

    } catch (error) {
      console.log(error);
    }
  };

  // ✅ NEW FUNCTION
  const applyToProject = async (projectId) => {
    try {

      const user = JSON.parse(localStorage.getItem("user"));

      await axios.post(
        "http://localhost:5000/api/proposals/apply",
        {
          projectId,
          freelancerId: user.id,
          message: "I can do this project",
          bidAmount: 4000
        }
      );

      alert("Applied successfully!");

    } catch (error) {
      console.log(error);
      alert("Error applying");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Projects</h2>

      {projects.map((project) => (
        <div key={project._id} style={{
          border: "1px solid #ccc",
          margin: "10px",
          padding: "10px"
        }}>
          <h3>{project.title}</h3>
          <p>{project.description}</p>
          <p>Budget: ₹{project.budget}</p>
          <p>Client: {project.clientId?.name}</p>

          {/* ✅ APPLY BUTTON */}
          <button onClick={() => applyToProject(project._id)}>
            Apply
          </button>

        </div>
      ))}

    </div>
  );
}

export default Projects;