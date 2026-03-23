const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    // Who is being reviewed
    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Freelancer ID is required"],
    },
    // Who is writing the review
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Client ID is required"],
    },
    // Which project this review is for
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project ID is required"],
    },
    // Star rating 1-5
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    // Written review
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      trim: true,
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
  },
  { timestamps: true }
);

// One review per client per project — no duplicate reviews
ReviewSchema.index({ clientId: 1, projectId: 1 }, { unique: true });

module.exports = mongoose.model("Review", ReviewSchema);