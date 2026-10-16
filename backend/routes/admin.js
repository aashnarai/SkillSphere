const express  = require("express");
const router   = express.Router();
const User     = require("../models/User");
const Project  = require("../models/Project");
const Proposal = require("../models/Proposal");
const Review   = require("../models/Review");
const { verifyToken, requireRole } = require("./auth");

// All admin routes are protected — must be logged in AND be admin
const adminOnly = [verifyToken, requireRole("admin")];

// ── GET /api/admin/stats ──
// Platform-wide analytics
router.get("/stats", ...adminOnly, async (req, res) => {
  try {
    const [
      totalUsers,
      totalClients,
      totalFreelancers,
      totalProjects,
      openProjects,
      completedProjects,
      totalProposals,
      acceptedProposals,
      totalReviews,
      suspendedUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "client" }),
      User.countDocuments({ role: "freelancer" }),
      Project.countDocuments(),
      Project.countDocuments({ status: "open" }),
      Project.countDocuments({ status: "completed" }),
      Proposal.countDocuments(),
      Proposal.countDocuments({ status: "accepted" }),
      Review.countDocuments(),
      User.countDocuments({ isSuspended: true }),
    ]);

    // Top skills across all projects
    const projects  = await Project.find({}, "skills");
    const skillMap  = {};
    projects.forEach((p) =>
      (p.skills || []).forEach((s) => {
        skillMap[s] = (skillMap[s] || 0) + 1;
      })
    );
    const topSkills = Object.entries(skillMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skill, count]) => ({ skill, count }));

    // Recent signups (last 7 days)
    const weekAgo      = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentSignups = await User.countDocuments({ createdAt: { $gte: weekAgo } });

    const successRate = totalProposals > 0
      ? Math.round((acceptedProposals / totalProposals) * 100)
      : 0;

    res.json({
      users:     { total: totalUsers, clients: totalClients, freelancers: totalFreelancers, suspended: suspendedUsers, recentSignups },
      projects:  { total: totalProjects, open: openProjects, completed: completedProjects },
      proposals: { total: totalProposals, accepted: acceptedProposals, successRate },
      reviews:   { total: totalReviews },
      topSkills,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/admin/users ──
// All users with pagination
router.get("/users", ...adminOnly, async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const role  = req.query.role; // optional filter
    const search = req.query.search;

    const query = {};
    if (role)   query.role  = role;
    if (search) query.$or   = [
      { name:  { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({ users, total, page, pages: Math.ceil(total / limit) });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/admin/users/:id/suspend ──
router.put("/users/:id/suspend", ...adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Prevent admin from suspending themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: "Cannot suspend your own account" });
    }

    user.isSuspended = true;
    await user.save();

    res.json({ message: `${user.name} has been suspended`, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/admin/users/:id/unsuspend ──
router.put("/users/:id/unsuspend", ...adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isSuspended = false;
    await user.save();

    res.json({ message: `${user.name} has been unsuspended`, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/admin/users/:id/verify ──
router.put("/users/:id/verify", ...adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: `${user.name} has been verified`, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/admin/users/:id ──
router.delete("/users/:id", ...adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/admin/projects ──
router.get("/projects", ...adminOnly, async (req, res) => {
  try {
    const page   = parseInt(req.query.page)   || 1;
    const limit  = parseInt(req.query.limit)  || 20;
    const status = req.query.status;
    const search = req.query.search;

    const query = {};
    if (status) query.status = status;
    if (search) query.title  = { $regex: search, $options: "i" };

    const projects = await Project.find(query)
      .populate("clientId", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Project.countDocuments(query);

    res.json({ projects, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/admin/projects/:id/status ──
// Admin can change project status (e.g. close a fraudulent project)
router.put("/projects/:id/status", ...adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["open", "in-progress", "completed", "closed"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("clientId", "name email");

    if (!project) return res.status(404).json({ message: "Project not found" });

    res.json({ message: "Project status updated", project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/admin/projects/:id ──
router.delete("/projects/:id", ...adminOnly, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    await project.deleteOne();
    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/admin/proposals ──
router.get("/proposals", ...adminOnly, async (req, res) => {
  try {
    const proposals = await Proposal.find()
      .populate("freelancerId", "name email")
      .populate("projectId",   "title budget")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(proposals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;