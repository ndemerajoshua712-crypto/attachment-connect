
const express = require("express");

const {
  getStudentProfile,
  updateStudentProfile,
  uploadStudentPhoto,
  uploadStudentCV,
  getStudentCVs,
  downloadStudentCV,
} = require("../controllers/student.controller");

const {
  requireAuth,
  allowRoles,
} = require("../middleware/auth.middleware");

const {
  uploadProfilePhoto,
  uploadCV,
} = require("../middleware/upload.middleware");

const router = express.Router();

// All student routes require authentication and the STUDENT role.
router.use(requireAuth, allowRoles("STUDENT"));

// Get the logged-in student's profile.
router.get("/me", getStudentProfile);

// Update the logged-in student's profile.
router.put("/me", updateStudentProfile);
router.post(
  "/me/photo",
  uploadProfilePhoto,
  uploadStudentPhoto
);
router.post("/me/cv", uploadCV, uploadStudentCV);
router.get("/me/cvs", getStudentCVs);

router.get("/me/cvs/:documentId/download", downloadStudentCV);
module.exports = router;
