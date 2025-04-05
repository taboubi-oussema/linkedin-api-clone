const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  avatar: {
    type: String,
    default: "",
  },
  backgroundImage: {
    type: String,
    default: "",
  },
  about: {
    type: String,
    default: "",
  },
  experience: [
    {
      title: {
        type: String,
        required: true,
      },
      company: {
        type: String,
        required: true,
      },
      location: {
        type: String,
      },
      from: {
        type: Date,
        required: true,
      },
      to: {
        type: Date,
      },
      current: {
        type: Boolean,
        default: false,
      },
      description: {
        type: String,
      },
    },
  ],
  education: [
    {
      school: {
        type: String,
        required: true,
      },
      degree: {
        type: String,
        required: true,
      },
      fieldOfStudy: {
        type: String,
        required: true,
      },
      from: {
        type: Date,
        required: true,
      },
      to: {
        type: Date,
      },
      current: {
        type: Boolean,
        default: false,
      },
      description: {
        type: String,
      },
    },
  ],
  skills: {
    type: [String],
  },
  certifications: [
    {
      name: {
        type: String,
        required: true,
      },
      organization: {
        type: String,
        required: true,
      },
      issueDate: {
        type: Date,
      },
      expirationDate: {
        type: Date,
      },
      credentialURL: {
        type: String,
      },
    },
  ],
  languages: [
    {
      language: {
        type: String,
        required: true,
      },
      proficiency: {
        type: String,
        enum: [
          "Elementary",
          "Limited Working",
          "Professional Working",
          "Full Professional",
          "Native/Bilingual",
        ],
      },
    },
  ],
  socialLinks: {
    website: {
      type: String,
    },
    twitter: {
      type: String,
    },
    github: {
      type: String,
    },
    youtube: {
      type: String,
    },
  },
});

module.exports = mongoose.model("Profile", ProfileSchema);
