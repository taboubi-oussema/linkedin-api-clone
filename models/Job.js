const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  employmentType: {
    type: String,
    enum: ["Full-time", "Part-time", "Contract", "Temporary", "Internship"],
    required: true,
  },
  experienceLevel: {
    type: String,
    enum: [
      "Entry level",
      "Mid-Senior level",
      "Senior level",
      "Director",
      "Executive",
    ],
    required: true,
  },
  skills: [
    {
      type: String,
    },
  ],
  salary: {
    min: {
      type: Number,
    },
    max: {
      type: Number,
    },
    currency: {
      type: String,
      default: "USD",
    },
  },
  applicants: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      status: {
        type: String,
        enum: ["applied", "reviewed", "interviewed", "offered", "rejected"],
        default: "applied",
      },
      appliedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("Job", JobSchema);
