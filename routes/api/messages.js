const express = require("express");
const {
  getConversations,
  getMessages,
  sendMessage,
  deleteMessage,
} = require("../../controllers/messageController");

const router = express.Router();

const { protect } = require("../../middleware/auth");

router.route("/").get(protect, getConversations);

router.route("/:conversationId").get(protect, getMessages);

router.route("/:receiverId").post(protect, sendMessage);

router.route("/:id").delete(protect, deleteMessage);

module.exports = router;
