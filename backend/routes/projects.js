const express      = require("express");
const router       = express.Router();
const Project      = require("../models/Project");
const { verifyToken, requireRole } = require("./auth");

// ── POST /api/projects/create ──
// Only clients can create projects
router.post("/create", verifyToken, requireRole("client"), async (req, res) => {
  try {
    const { title, description, budget, skills } = req.body;

    // Validate required fields
    if (!title || !description || !budget) {
      return res.status(400).json({ message: "Title, description, and budget are required" });
    }

    const project = new Project({
      title,
      description,
      budget,
      skills: skills || [],
      clientId: req.user.id, // ✅ get from token, not request body (more secure)
    });

    await project.save();

    // Populate client info before sending back
    await project.populate("clientId", "name email");

    res.status(201).json({
      message: "Project created successfully",
      project,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/projects/all ──
// All logged-in users can see projects
router.get("/all", verifyToken, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("clientId", "name email")
      .sort({ createdAt: -1 }); // newest first

    res.json(projects);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/projects/my ──
// Client sees only their own projects
router.get("/my", verifyToken, requireRole("client"), async (req, res) => {
  try {
    const projects = await Project.find({ clientId: req.user.id })
      .populate("clientId", "name email")
      .sort({ createdAt: -1 });

    res.json(projects);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/projects/:id ──
// Get a single project by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("clientId", "name email");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── PUT /api/projects/:id ──
// Only the client who created it can update
router.put("/:id", verifyToken, requireRole("client"), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Make sure the client owns this project
    if (project.clientId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to edit this project" });
    }

    const { title, description, budget, skills } = req.body;

    if (title)       project.title       = title;
    if (description) project.description = description;
    if (budget)      project.budget      = budget;
    if (skills)      project.skills      = skills;

    await project.save();

    res.json({ message: "Project updated successfully", project });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── DELETE /api/projects/:id ──
// Only the client who created it can delete
router.delete("/:id", verifyToken, requireRole("client"), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.clientId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this project" });
    }

    await project.deleteOne();

    res.json({ message: "Project deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;