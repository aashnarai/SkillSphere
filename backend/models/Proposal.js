const mongoose = require("mongoose");

const ProposalSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project"
  },
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  message: {
    type: String,
    required: true
  },
  bidAmount: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Proposal", ProposalSchema);