const Comment = require("../models/Comment");
const Post = require("../models/Post");

// @desc    Get comments for a post
// @route   GET /api/posts/:id/comments
// @access  Private
exports.getComments = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Post not found",
      });
    }

    const comments = await Comment.find({ post: req.params.id })
      .sort({ createdAt: -1 })
      .populate("user", ["firstName", "lastName"]);

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add a comment
// @route   POST /api/posts/:id/comments
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Post not found",
      });
    }

    const comment = await Comment.create({
      text: req.body.text,
      post: req.params.id,
      user: req.user.id,
    });

    // Add comment to post's comments array
    post.comments.push(comment._id);
    await post.save();

    res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a comment
// @route   PUT /api/comments/:id
// @access  Private
exports.updateComment = async (req, res, next) => {
  try {
    let comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: "Comment not found",
      });
    }

    // Make sure user is comment owner
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: "Not authorized to update this comment",
      });
    }

    comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { text: req.body.text },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: comment,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: "Comment not found",
      });
    }

    // Make sure user is comment owner
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: "Not authorized to delete this comment",
      });
    }

    // Find post and remove comment from its comments array
    const post = await Post.findById(comment.post);
    if (post) {
      post.comments = post.comments.filter(
        (commentId) => commentId.toString() !== req.params.id
      );
      await post.save();
    }

    await comment.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};
