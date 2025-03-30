const User = require("../models/User");
const Profile = require("../models/Profile");
const Connection = require("../models/Connection");

// @desc    Get all users
// @route   GET /api/users
// @access  Private
exports.getUsers = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await User.countDocuments();

    const users = await User.find().limit(limit).skip(startIndex);

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
      count: users.length,
      pagination,
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
exports.updateUser = async (req, res, next) => {
  try {
    // Make sure user is updating their own account
    if (req.params.id !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: "Not authorized to update this user",
      });
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private
exports.deleteUser = async (req, res, next) => {
  try {
    // Make sure user is deleting their own account
    if (req.params.id !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: "Not authorized to delete this user",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user profile
// @route   GET /api/users/:id/profile
// @access  Private
exports.getUserProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.params.id }).populate(
      "user",
      ["firstName", "lastName", "email", "headline"]
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: "Profile not found",
      });
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create or update user profile
// @route   PUT /api/users/:id/profile
// @access  Private
exports.updateUserProfile = async (req, res, next) => {
  try {
    // Make sure user is updating their own profile
    if (req.params.id !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: "Not authorized to update this profile",
      });
    }

    // Build profile object
    const profileFields = { ...req.body, user: req.params.id };

    // Find and update profile
    let profile = await Profile.findOne({ user: req.params.id });

    if (profile) {
      // Update
      profile = await Profile.findOneAndUpdate(
        { user: req.params.id },
        { $set: profileFields },
        { new: true }
      );
    } else {
      // Create
      profile = await Profile.create(profileFields);
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Follow a user
// @route   POST /api/users/:id/follow
// @access  Private
exports.followUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        error: "You cannot follow yourself",
      });
    }

    // Check if the user exists
    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Check if connection/follow already exists
    const existingConnection = await Connection.findOne({
      requester: req.user.id,
      recipient: req.params.id,
    });

    if (existingConnection) {
      return res.status(400).json({
        success: false,
        error: "Already following or connection request pending",
      });
    }

    // Create a new connection
    const connection = await Connection.create({
      requester: req.user.id,
      recipient: req.params.id,
      status: "pending",
    });

    res.status(200).json({
      success: true,
      data: connection,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Unfollow a user
// @route   DELETE /api/users/:id/follow
// @access  Private
exports.unfollowUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        error: "You cannot unfollow yourself",
      });
    }

    // Find and remove the connection
    const connection = await Connection.findOneAndDelete({
      requester: req.user.id,
      recipient: req.params.id,
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        error: "You are not following this user",
      });
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};
