const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { runSimulation } = require("../controllers/simulationController");
const { validateSimulateRequest } = require("../middleware/validateRequest");

const simulateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // Limit simulation calls per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Simulation rate limit reached. Please wait a few minutes before running another large batch." }
});

router.post("/simulate", simulateLimiter, validateSimulateRequest, runSimulation);

module.exports = router;
