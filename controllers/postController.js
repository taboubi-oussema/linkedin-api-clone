const Post = require("../models/Post");
const User = require("../models/User");
const Connection = require("../models/Connection");

// @desc    Get all posts (feed)
// @route   GET /api/posts
// @access  Private
exports.getPosts = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Post.countDocuments();

    // Get user's connections
    const connections = await Connection.find({
      $or: [
        { requester: req.user.id, status: "accepted" },
        { recipient: req.user.id, status: "accepted" },
      ],
    });

    // Extract connection IDs
    const connectionIds = connections.map((conn) =>
      conn.requester.toString() === req.user.id.toString()
        ? conn.recipient
        : conn.requester
    );

    // Include current user ID
    connectionIds.push(req.user.id);

    // Get posts from connections and public posts
    const posts = await Post.find({
      $or: [{ user: { $in: connectionIds } }, { privacy: "public" }],
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex)
      .populate("user", ["firstName", "lastName", "headline"])
      .populate({
        path: "comments",
        select: "text user createdAt",
        populate: {
          path: "user",
          select: "firstName lastName",
        },
      });

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
      count: posts.length,
      pagination,
      data: posts,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Private
exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("user", ["firstName", "lastName", "headline"])
      .populate({
        path: "comments",
        select: "text user createdAt",
        populate: {
          path: "user",
          select: "firstName lastName",
        },
      });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Post not found",
      });
    }

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res, next) => {
  try {
    req.body.user = req.user.id;

    const post = await Post.create(req.body);

    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Post not found",
      });
    }

    // Make sure user is post owner
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: "Not authorized to update this post",
      });
    }

    post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Post not found",
      });
    }

    // Make sure user is post owner
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: "Not authorized to delete this post",
      });
    }

    await post.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Like a post
// @route   POST /api/posts/:id/like
// @access  Private
exports.likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Post not found",
      });
    }

    // Check if the post has already been liked
    if (post.likes.some((like) => like.user.toString() === req.user.id)) {
      return res.status(400).json({
        success: false,
        error: "Post already liked",
      });
    }

    post.likes.unshift({ user: req.user.id });

    await post.save();

    res.status(200).json({
      success: true,
      data: post.likes,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Unlike a post
// @route   DELETE /api/posts/:id/like
// @access  Private
exports.unlikePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Post not found",
      });
    }

    // Check if the post has already been liked
    if (!post.likes.some((like) => like.user.toString() === req.user.id)) {
      return res.status(400).json({
        success: false,
        error: "Post has not yet been liked",
      });
    }

    // Remove the like
    post.likes = post.likes.filter(
      (like) => like.user.toString() !== req.user.id
    );

    await post.save();

    res.status(200).json({
      success: true,
      data: post.likes,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get posts by user
// @route   GET /api/users/:id/posts
// @access  Private
exports.getUserPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Check if user exists
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const total = await Post.countDocuments({ user: req.params.id });

    const posts = await Post.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex)
      .populate("user", ["firstName", "lastName", "headline"])
      .populate({
        path: "comments",
        select: "text user createdAt",
        populate: {
          path: "user",
          select: "firstName lastName",
        },
      });

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
      count: posts.length,
      pagination,
      data: posts,
    });
  } catch (err) {
    next(err);
  }
};
