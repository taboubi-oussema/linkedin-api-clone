const express = require("express");
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
} = require("../../controllers/postController");

const {
  getComments,
  addComment,
} = require("../../controllers/commentController");

const router = express.Router();

const { protect } = require("../../middleware/auth");

router.route("/").get(protect, getPosts).post(protect, createPost);

router
  .route("/:id")
  .get(protect, getPost)
  .put(protect, updatePost)
  .delete(protect, deletePost);

router.route("/:id/like").post(protect, likePost).delete(protect, unlikePost);

router
  .route("/:id/comments")
  .get(protect, getComments)
  .post(protect, addComment);

module.exports = router;
