import React, { useState } from "react";
import axios from "axios";

function PostProject() {

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [skills, setSkills] = useState("");

  const handleSubmit = async () => {
    try {

      const user = JSON.parse(localStorage.getItem("user"));

      await axios.post(
        "http://localhost:5000/api/projects/create",
        {
          title,
          description,
          budget,
          skills: skills.split(","),
          clientId: user.id
        }
      );

      alert("Project created!");

    } catch (error) {
      console.log(error);
      alert("Error creating project");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Post Project</h2>

      <input
        placeholder="Title"
        onChange={(e) => setTitle(e.target.value)}
      />

      <br /><br />

      <textarea
        placeholder="Description"
        onChange={(e) => setDescription(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Budget"
        type="number"
        onChange={(e) => setBudget(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Skills (comma separated)"
        onChange={(e) => setSkills(e.target.value)}
      />

      <br /><br />

      <button onClick={handleSubmit}>Post Project</button>
    </div>
  );
}

export default PostProject;