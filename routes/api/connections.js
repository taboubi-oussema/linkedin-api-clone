const express = require("express");
const {
  getConnections,
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  removeConnection,
  getConnectionSuggestions,
} = require("../../controllers/connectionController");

const router = express.Router();

const { protect } = require("../../middleware/auth");

router.route("/").get(protect, getConnections);

router.route("/suggestions").get(protect, getConnectionSuggestions);

router.route("/request/:id").post(protect, sendConnectionRequest);

router.route("/accept/:id").put(protect, acceptConnectionRequest);

router.route("/reject/:id").put(protect, rejectConnectionRequest);

router.route("/:id").delete(protect, removeConnection);

module.exports = router;
