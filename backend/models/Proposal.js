const mongoose = require("mongoose");

const ProposalSchema = new mongoose.Schema(
  {
    // ── CORE (same as yours) ──
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project ID is required"],
    },
    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Freelancer ID is required"],
    },
    message: {
      type: String,
      required: [true, "Cover message is required"],
      trim: true,
    },
    bidAmount: {
      type: Number,
      required: [true, "Bid amount is required"],
      min: [0, "Bid amount cannot be negative"],
    },

    // ── STATUS ── (this was missing — needed for accept/reject)
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }  // replaces your manual createdAt — also adds updatedAt
);

// ── PREVENT DUPLICATE APPLICATIONS ──
// A freelancer cannot apply to the same project twice
ProposalSchema.index({ projectId: 1, freelancerId: 1 }, { unique: true });

module.exports = mongoose.model("Proposal", ProposalSchema);