const express  = require("express");
const router   = express.Router();
const Review   = require("../models/Review");
const User     = require("../models/User");
const { verifyToken, requireRole } = require("./auth");
const { getIO } = require("../socket");

// ── POST /api/reviews/create ──
// Only clients can leave a review for a freelancer
router.post("/create", verifyToken, requireRole("client"), async (req, res) => {
  try {
    const { freelancerId, projectId, rating, comment } = req.body;

    if (!freelancerId || !projectId || !rating || !comment) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for duplicate review
    const existing = await Review.findOne({
      clientId: req.user.id,
      projectId,
    });
    if (existing) {
      return res.status(400).json({ message: "You have already reviewed this project" });
    }

    // Create review
    const review = new Review({
      freelancerId,
      clientId: req.user.id, // from token
      projectId,
      rating,
      comment,
    });

    await review.save();
    await review.populate("clientId", "name");

    // ── UPDATE FREELANCER'S AVERAGE RATING ──
    const allReviews = await Review.find({ freelancerId });
    const avgRating  = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await User.findByIdAndUpdate(freelancerId, {
      rating:       Math.round(avgRating * 10) / 10, // round to 1 decimal
      totalReviews: allReviews.length,
    });

    // ── NOTIFY FREELANCER VIA SOCKET ──
    try {
      getIO()
        .to(freelancerId.toString())
        .emit("review_added", {
          message: `You received a ${rating}-star review from ${review.clientId.name}!`,
        });
    } catch (socketErr) {
      console.log("Socket notification failed:", socketErr.message);
    }

    res.status(201).json({
      message: "Review submitted successfully",
      review,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/reviews/freelancer/:freelancerId ──
// Get all reviews for a freelancer (public)
router.get("/freelancer/:freelancerId", verifyToken, async (req, res) => {
  try {
    const reviews = await Review.find({ freelancerId: req.params.freelancerId })
      .populate("clientId",  "name profilePicture")
      .populate("projectId", "title")
      .sort({ createdAt: -1 });

    // Calculate stats
    const total  = reviews.length;
    const avg    = total > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / total) * 10) / 10
      : 0;

    // Rating distribution (how many 1★, 2★, 3★, 4★, 5★)
    const distribution = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count:   reviews.filter((r) => r.rating === star).length,
      percent: total > 0
        ? Math.round((reviews.filter((r) => r.rating === star).length / total) * 100)
        : 0,
    }));

    res.json({ reviews, total, avg, distribution });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/reviews/project/:projectId ──
// Get review for a specific project
router.get("/project/:projectId", verifyToken, async (req, res) => {
  try {
    const review = await Review.findOne({ projectId: req.params.projectId })
      .populate("clientId",     "name")
      .populate("freelancerId", "name");

    res.json(review || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── DELETE /api/reviews/:id ──
// Client can delete their own review
router.delete("/:id", verifyToken, requireRole("client"), async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.clientId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await review.deleteOne();

    // Recalculate freelancer rating after deletion
    const remaining = await Review.find({ freelancerId: review.freelancerId });
    const newAvg    = remaining.length > 0
      ? Math.round((remaining.reduce((s, r) => s + r.rating, 0) / remaining.length) * 10) / 10
      : 0;

    await User.findByIdAndUpdate(review.freelancerId, {
      rating:       newAvg,
      totalReviews: remaining.length,
    });

    res.json({ message: "Review deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;