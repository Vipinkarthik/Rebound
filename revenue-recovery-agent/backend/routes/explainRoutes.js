const express = require("express");
const router = express.Router();
const { explainDecision } = require("../controllers/explainController");

router.post("/explain/:auditLogId", explainDecision);
router.get("/explain/:auditLogId", explainDecision);

module.exports = router;
