const express = require("express");
const router = express.Router();
const { getPolicy, updatePolicyRule, updateGlobalConstraints } = require("../controllers/policyController");
const { validatePolicyUpdateRequest } = require("../middleware/validateRequest");
const apiKeyAuth = require("../middleware/apiKeyAuth");

// Public GET endpoint for dashboard rendering
router.get("/policy", getPolicy);

// Protected mutation endpoints requiring x-api-key header
router.put("/policy/global", apiKeyAuth, updateGlobalConstraints);
router.put("/policy/:reason_code", apiKeyAuth, validatePolicyUpdateRequest, updatePolicyRule);

module.exports = router;
