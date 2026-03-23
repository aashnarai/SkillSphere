const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    // ── CORE ──
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["client", "freelancer", "admin"],
      required: [true, "Role is required"],
    },

    // ── PROFILE ──
    bio: {
      type: String,
      default: "",
      maxlength: 500,
    },
    profilePicture: {
      type: String,      // Cloudinary URL
      default: "",
    },
    location: {
      type: String,
      default: "",
    },

    // ── FREELANCER SPECIFIC ──
    skills: {
      type: [String],
      default: [],
    },
    hourlyRate: {
      type: Number,
      default: 0,
    },
    availability: {
      type: Boolean,
      default: true,       // true = available for work
    },
    experience: {
      type: String,
      enum: ["beginner", "intermediate", "expert"],
      default: "beginner",
    },

    // ── REPUTATION ──
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },

    // ── ACCOUNT ──
    isVerified: {
      type: Boolean,
      default: false,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }   // adds createdAt and updatedAt automatically
);

module.exports = mongoose.model("User", UserSchema);