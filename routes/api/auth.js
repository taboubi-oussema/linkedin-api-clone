const express = require("express");
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
} = require("../../controllers/authController");

const router = express.Router();

const { protect } = require("../../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/password/reset", forgotPassword);
router.put("/password/reset/:resettoken", resetPassword);

module.exports = router;
