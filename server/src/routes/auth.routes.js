
const express = require("express");

const {
  registerStudent,
  registerCompany,
  login,
  logout,
  getCurrentUser,
} = require("../controllers/auth.controller");

const {
  requireAuth,
  allowRoles,
} = require("../middleware/auth.middleware");

const router = express.Router();

// Public routes
router.post("/register/student", registerStudent);
router.post("/register/company", registerCompany);
router.post("/login", login);

// Protected routes
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, getCurrentUser);

// Student-only route
router.get(
  "/student-test",
  requireAuth,
  allowRoles("STUDENT"),
  (req, res) => {
    res.json({
      success: true,
      message: "Student access granted.",
      user: req.user,
    });
  }
);

// Company-only route
router.get(
  "/company-test",
  requireAuth,
  allowRoles("COMPANY"),
  (req, res) => {
    res.json({
      success: true,
      message: "Company access granted.",
      user: req.user,
    });
  }
);

// Admin-only route
router.get(
  "/admin-test",
  requireAuth,
  allowRoles("ADMIN"),
  (req, res) => {
    res.json({
      success: true,
      message: "Administrator access granted.",
      user: req.user,
    });
  }
);

module.exports = router;
