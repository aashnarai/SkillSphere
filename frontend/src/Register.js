import React, { useState } from "react";
import axios from "axios";

function Register() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("freelancer");

  const handleRegister = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        { name, email, password, role }
      );

      alert(res.data.message);

    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Register</h2>

      <input
        type="text"
        placeholder="Name"
        onChange={(e) => setName(e.target.value)}
      />

      <br /><br />

      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <select onChange={(e) => setRole(e.target.value)}>
        <option value="freelancer">Freelancer</option>
        <option value="client">Client</option>
      </select>

      <br /><br />

      <button onClick={handleRegister}>Register</button>
    </div>
  );
}

export default Register;