const express = require("express");
const router = express.Router();
const Proposal = require("../models/Proposal");

router.post("/apply", async (req, res) => {
  try {

    const { projectId, freelancerId, message, bidAmount } = req.body;

    const proposal = new Proposal({
      projectId,
      freelancerId,
      message,
      bidAmount
    });

    await proposal.save();

    res.json({
      message: "Proposal submitted successfully",
      proposal
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get("/project/:projectId", async (req, res) => {
  try {

    const { projectId } = req.params;

    const proposals = await Proposal.find({ projectId })
      .populate("freelancerId", "name email");

    res.json(proposals);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;