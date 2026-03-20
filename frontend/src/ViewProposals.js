import React, { useEffect, useState } from "react";
import axios from "axios";

function ViewProposals() {

  const [proposals, setProposals] = useState([]);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {

      const projectId = prompt("Enter Project ID");

      const res = await axios.get(
        `http://localhost:5000/api/proposals/project/${projectId}`
      );

      setProposals(res.data);

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Proposals</h2>

      {proposals.map((proposal) => (
        <div key={proposal._id} style={{
          border: "1px solid #ccc",
          margin: "10px",
          padding: "10px"
        }}>
          <p><b>Freelancer:</b> {proposal.freelancerId?.name}</p>
          <p><b>Email:</b> {proposal.freelancerId?.email}</p>
          <p><b>Message:</b> {proposal.message}</p>
          <p><b>Bid:</b> ₹{proposal.bidAmount}</p>
        </div>
      ))}

    </div>
  );
}

export default ViewProposals;