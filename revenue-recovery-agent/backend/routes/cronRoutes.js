const express = require("express");
const router = express.Router();
const { triggerProcessDeferred } = require("../controllers/cronController");

// Endpoint to trigger deferred cases queue worker
router.post("/cron/process-deferred", triggerProcessDeferred);

module.exports = router;
