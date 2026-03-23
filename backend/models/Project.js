const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema(
  {
    // ── CORE (same as yours) ──
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    budget: {
      type: Number,
      required: [true, "Budget is required"],
      min: [0, "Budget cannot be negative"],
    },
    skills: {
      type: [String],
      default: [],
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Client ID is required"],
    },

    // ── STATUS ── (missing from yours)
    // Tracks the lifecycle of a project
    status: {
      type: String,
      enum: ["open", "in-progress", "completed", "closed"],
      default: "open",
    },
  },
  { timestamps: true } // replaces manual createdAt — also adds updatedAt
);

module.exports = mongoose.model("Project", ProjectSchema);