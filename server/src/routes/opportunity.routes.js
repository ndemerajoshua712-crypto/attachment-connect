const express = require("express");

const {
  getAvailableOpportunities,
  applyToOpportunity, getMyApplications,
} = require("../controllers/opportunity.controller");
const { requireAuth, allowRoles } = require("../middleware/auth.middleware");

const router = express.Router();

// Browse opportunities available to students.
router.get("/", getAvailableOpportunities);
router.post("/:id/apply", requireAuth, allowRoles("STUDENT"), applyToOpportunity);
router.get("/applications/me", requireAuth, allowRoles("STUDENT"), getMyApplications);

module.exports = router;
