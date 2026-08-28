const express = require("express");
const router = express.Router();
const { getAuditLogs } = require("../controllers/auditController");

router.get("/audit", getAuditLogs);

module.exports = router;
