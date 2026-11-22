
const express = require("express");

const {
  getCompanyProfile,
  updateCompanyProfile,
} = require("../controllers/company.controller");

const {
  createOpportunity,
  getCompanyOpportunities,
  updateOpportunity,
  closeOpportunity,
} = require("../controllers/opportunity.controller");

const {
  requireAuth,
  allowRoles,
} = require("../middleware/auth.middleware");

const router = express.Router();
const { uploadProfilePhoto } = require("../middleware/upload.middleware");
const { uploadCompanyLogo } = require("../controllers/company.controller");

// Protect all company routes
router.use(requireAuth, allowRoles("COMPANY"));

// COMPANY PROFILE
router.get("/profile", getCompanyProfile);
router.put("/profile", updateCompanyProfile);
router.post("/logo", uploadProfilePhoto, uploadCompanyLogo);

// COMPANY OPPORTUNITIES
router.post("/opportunities", createOpportunity);
router.get("/opportunities", getCompanyOpportunities);
router.put("/opportunities/:id", updateOpportunity);
router.patch("/opportunities/:id/close", closeOpportunity);
const { getApplicants, updateApplicationStatus } = require("../controllers/opportunity.controller");
router.get("/applicants", getApplicants);
router.patch("/applications/:id/status", updateApplicationStatus);

module.exports = router;
