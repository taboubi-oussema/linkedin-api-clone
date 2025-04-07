const express = require("express");
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  applyForJob,
} = require("../../controllers/jobController");

const router = express.Router();

const { protect } = require("../../middleware/auth");

router.route("/").get(protect, getJobs).post(protect, createJob);

router
  .route("/:id")
  .get(protect, getJob)
  .put(protect, updateJob)
  .delete(protect, deleteJob);

router.route("/:id/apply").post(protect, applyForJob);

module.exports = router;
