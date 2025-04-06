const express = require("express");
const {
  updateComment,
  deleteComment,
} = require("../../controllers/commentController");

const router = express.Router();

const { protect } = require("../../middleware/auth");

router.route("/:id").put(protect, updateComment).delete(protect, deleteComment);

module.exports = router;
