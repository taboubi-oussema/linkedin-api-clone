const Job = require("../models/Job");
const User = require("../models/User");

// @desc    Get all jobs with filters
// @route   GET /api/jobs
// @access  Private
exports.getJobs = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Build query
    let query = { active: true };

    // Add filters if they exist
    if (req.query.title) {
      query.title = { $regex: req.query.title, $options: "i" };
    }

    if (req.query.location) {
      query.location = { $regex: req.query.location, $options: "i" };
    }

    if (req.query.employmentType) {
      query.employmentType = req.query.employmentType;
    }

    if (req.query.experienceLevel) {
      query.experienceLevel = req.query.experienceLevel;
    }

    const total = await Job.countDocuments(query);

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex)
      .populate("company", ["firstName", "lastName", "headline"]);

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      success: true,
      count: jobs.length,
      pagination,
      data: jobs,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Private
exports.getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate("company", [
      "firstName",
      "lastName",
      "headline",
    ]);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a job posting
// @route   POST /api/jobs
// @access  Private
exports.createJob = async (req, res, next) => {
  try {
    req.body.company = req.user.id;

    const job = await Job.create(req.body);

    res.status(201).json({
      success: true,
      data: job,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a job posting
// @route   PUT /api/jobs/:id
// @access  Private
exports.updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: "Job not found",
      });
    }

    // Make sure user is job owner
    if (job.company.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: "Not authorized to update this job",
      });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a job posting
// @route   DELETE /api/jobs/:id
// @access  Private
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: "Job not found",
      });
    }

    // Make sure user is job owner
    if (job.company.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: "Not authorized to delete this job",
      });
    }

    await job.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Apply for a job
// @route   POST /api/jobs/:id/apply
// @access  Private
exports.applyForJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: "Job not found",
      });
    }

    // Check if job is active
    if (!job.active) {
      return res.status(400).json({
        success: false,
        error: "This job is no longer active",
      });
    }

    // Check if user already applied
    if (job.applicants.some((app) => app.user.toString() === req.user.id)) {
      return res.status(400).json({
        success: false,
        error: "You have already applied to this job",
      });
    }

    // Add user to applicants
    job.applicants.push({
      user: req.user.id,
      status: "applied",
      appliedAt: Date.now(),
    });

    await job.save();

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's job applications
// @route   GET /api/users/:id/applications
// @access  Private
exports.getUserApplications = async (req, res, next) => {
  try {
    // Make sure user is accessing their own applications
    if (req.params.id !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: "Not authorized to access these applications",
      });
    }

    // Find jobs where user has applied
    const jobs = await Job.find({
      "applicants.user": req.user.id,
    }).populate("company", ["firstName", "lastName", "headline"]);

    // Format jobs to include application status
    const applications = jobs.map((job) => {
      const application = job.applicants.find(
        (app) => app.user.toString() === req.user.id
      );

      return {
        job: {
          _id: job._id,
          title: job.title,
          company: job.company,
          location: job.location,
          employmentType: job.employmentType,
        },
        status: application.status,
        appliedAt: application.appliedAt,
      };
    });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (err) {
    next(err);
  }
};
