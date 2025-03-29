const Connection = require("../models/Connection");
const User = require("../models/User");

// @desc    Get user connections
// @route   GET /api/connections
// @access  Private
exports.getConnections = async (req, res, next) => {
  try {
    // Find connections where user is either requester or recipient
    const connections = await Connection.find({
      $or: [
        { requester: req.user.id, status: "accepted" },
        { recipient: req.user.id, status: "accepted" },
      ],
    }).populate("requester recipient", ["firstName", "lastName", "headline"]);

    // Format response to get connected users
    const connectedUsers = connections.map((connection) => {
      const connectedUser =
        connection.requester._id.toString() === req.user.id
          ? connection.recipient
          : connection.requester;

      return {
        connectionId: connection._id,
        user: connectedUser,
        createdAt: connection.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      count: connectedUsers.length,
      data: connectedUsers,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Send connection request
// @route   POST /api/connections/request/:id
// @access  Private
exports.sendConnectionRequest = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        error: "You cannot connect with yourself",
      });
    }

    // Check if recipient user exists
    const recipient = await User.findById(req.params.id);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Check if connection already exists
    const existingConnection = await Connection.findOne({
      $or: [
        { requester: req.user.id, recipient: req.params.id },
        { requester: req.params.id, recipient: req.user.id },
      ],
    });

    if (existingConnection) {
      return res.status(400).json({
        success: false,
        error: "Connection request already exists",
      });
    }

    // Create connection request
    const connection = await Connection.create({
      requester: req.user.id,
      recipient: req.params.id,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      data: connection,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Accept connection request
// @route   PUT /api/connections/accept/:id
// @access  Private
exports.acceptConnectionRequest = async (req, res, next) => {
  try {
    const connection = await Connection.findOne({
      _id: req.params.id,
      recipient: req.user.id,
      status: "pending",
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        error: "Connection request not found",
      });
    }

    connection.status = "accepted";
    await connection.save();

    res.status(200).json({
      success: true,
      data: connection,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reject connection request
// @route   PUT /api/connections/reject/:id
// @access  Private
exports.rejectConnectionRequest = async (req, res, next) => {
  try {
    const connection = await Connection.findOne({
      _id: req.params.id,
      recipient: req.user.id,
      status: "pending",
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        error: "Connection request not found",
      });
    }

    connection.status = "rejected";
    await connection.save();

    res.status(200).json({
      success: true,
      data: connection,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove connection
// @route   DELETE /api/connections/:id
// @access  Private
exports.removeConnection = async (req, res, next) => {
  try {
    const connection = await Connection.findOne({
      _id: req.params.id,
      $or: [{ requester: req.user.id }, { recipient: req.user.id }],
      status: "accepted",
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        error: "Connection not found",
      });
    }

    await connection.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get connection suggestions
// @route   GET /api/connections/suggestions
// @access  Private
exports.getConnectionSuggestions = async (req, res, next) => {
  try {
    // Get existing connections and pending requests
    const existingConnections = await Connection.find({
      $or: [{ requester: req.user.id }, { recipient: req.user.id }],
    });

    // Extract user IDs that the current user is already connected to or has pending requests with
    const existingUserIds = existingConnections.map((conn) =>
      conn.requester.toString() === req.user.id.toString()
        ? conn.recipient.toString()
        : conn.requester.toString()
    );

    // Add current user's ID to the exclusion list
    existingUserIds.push(req.user.id);

    // Find users who are not connected to the current user
    const suggestedUsers = await User.find({
      _id: { $nin: existingUserIds },
    })
      .select("firstName lastName headline")
      .limit(10);

    res.status(200).json({
      success: true,
      count: suggestedUsers.length,
      data: suggestedUsers,
    });
  } catch (err) {
    next(err);
  }
};
