const express    = require("express");
const router     = express.Router();
const Proposal   = require("../models/Proposal");
const Project    = require("../models/Project");
const { verifyToken, requireRole } = require("./auth");
const { getIO }  = require("../socket");

// ── POST /api/proposals/apply ──
// Only freelancers can apply to a project
router.post("/apply", verifyToken, requireRole("freelancer"), async (req, res) => {
  try {
    const { projectId, message, bidAmount } = req.body;

    if (!projectId || !message || !bidAmount) {
      return res.status(400).json({ message: "projectId, message, and bidAmount are required" });
    }

    // Check project exists
    const project = await Project.findById(projectId).populate("clientId", "name");
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Prevent duplicate applications
    const alreadyApplied = await Proposal.findOne({
      projectId,
      freelancerId: req.user.id,
    });
    if (alreadyApplied) {
      return res.status(400).json({ message: "You have already applied to this project" });
    }

    // Create proposal
    const proposal = new Proposal({
      projectId,
      freelancerId: req.user.id, // ✅ from token
      message,
      bidAmount,
      status: "pending",
    });

    await proposal.save();
    await proposal.populate("freelancerId", "name email");

    // ✅ Notify the client via Socket.IO
    try {
      getIO()
        .to(project.clientId._id.toString())
        .emit("proposal_received", {
          message: `New proposal received for "${project.title}" from ${proposal.freelancerId.name}`,
        });
    } catch (socketErr) {
      console.log("Socket notification failed:", socketErr.message);
    }

    res.status(201).json({
      message: "Applied successfully",
      proposal,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/proposals/project/:projectId ──
// Get all proposals for a specific project (client only, must own the project)
router.get("/project/:projectId", verifyToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Only the client who owns the project can see proposals
    if (
      req.user.role === "client" &&
      project.clientId.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Not authorized to view these proposals" });
    }

    const proposals = await Proposal.find({ projectId: req.params.projectId })
      .populate("freelancerId", "name email")
      .populate("projectId", "title budget")
      .sort({ createdAt: -1 });

    res.json(proposals);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/proposals/freelancer/:freelancerId ──
// Get all proposals submitted by a freelancer
router.get("/freelancer/:freelancerId", verifyToken, async (req, res) => {
  try {
    // Freelancers can only see their own proposals
    if (
      req.user.role === "freelancer" &&
      req.user.id !== req.params.freelancerId
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const proposals = await Proposal.find({ freelancerId: req.params.freelancerId })
      .populate("projectId", "title budget description")
      .populate("freelancerId", "name email")
      .sort({ createdAt: -1 });

    res.json(proposals);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/proposals/:id ──
// Get a single proposal by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate("freelancerId", "name email")
      .populate("projectId", "title budget clientId");

    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    res.json(proposal);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── PUT /api/proposals/accept/:id ──
// Client accepts a proposal
router.put("/accept/:id", verifyToken, requireRole("client"), async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate("freelancerId", "name email")
      .populate("projectId", "title clientId");

    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    // Make sure this client owns the project
    if (proposal.projectId.clientId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (proposal.status !== "pending") {
      return res.status(400).json({ message: `Proposal is already ${proposal.status}` });
    }

    proposal.status = "accepted";
    await proposal.save();

    // ✅ Notify the freelancer via Socket.IO
    try {
      getIO()
        .to(proposal.freelancerId._id.toString())
        .emit("proposal_accepted", {
          message: `Your proposal for "${proposal.projectId.title}" was accepted! 🎉`,
        });
    } catch (socketErr) {
      console.log("Socket notification failed:", socketErr.message);
    }

    res.json({
      message: "Proposal accepted successfully",
      proposal,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── PUT /api/proposals/reject/:id ──
// Client rejects a proposal
router.put("/reject/:id", verifyToken, requireRole("client"), async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate("freelancerId", "name email")
      .populate("projectId", "title clientId");

    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    // Make sure this client owns the project
    if (proposal.projectId.clientId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (proposal.status !== "pending") {
      return res.status(400).json({ message: `Proposal is already ${proposal.status}` });
    }

    proposal.status = "rejected";
    await proposal.save();

    // ✅ Notify the freelancer via Socket.IO
    try {
      getIO()
        .to(proposal.freelancerId._id.toString())
        .emit("proposal_rejected", {
          message: `Your proposal for "${proposal.projectId.title}" was not selected this time.`,
        });
    } catch (socketErr) {
      console.log("Socket notification failed:", socketErr.message);
    }

    res.json({
      message: "Proposal rejected successfully",
      proposal,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── DELETE /api/proposals/:id ──
// Freelancer can withdraw their own pending proposal
router.delete("/:id", verifyToken, requireRole("freelancer"), async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    if (proposal.freelancerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (proposal.status !== "pending") {
      return res.status(400).json({ message: "Cannot withdraw a proposal that has already been reviewed" });
    }

    await proposal.deleteOne();

    res.json({ message: "Proposal withdrawn successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;