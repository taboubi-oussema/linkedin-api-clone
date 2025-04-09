const express = require("express");
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserProfile,
  updateUserProfile,
  followUser,
  unfollowUser,
} = require("../../controllers/userController");

const { getUserPosts } = require("../../controllers/postController");
const { getUserApplications } = require("../../controllers/jobController");

const router = express.Router();

const { protect } = require("../../middleware/auth");

router.route("/").get(protect, getUsers);

router
  .route("/:id")
  .get(protect, getUser)
  .put(protect, updateUser)
  .delete(protect, deleteUser);

router
  .route("/:id/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router
  .route("/:id/follow")
  .post(protect, followUser)
  .delete(protect, unfollowUser);

router.route("/:id/posts").get(protect, getUserPosts);

router.route("/:id/applications").get(protect, getUserApplications);

module.exports = router;
