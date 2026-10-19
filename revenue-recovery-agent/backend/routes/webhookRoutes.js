const express = require("express");
const router = express.Router();
const {
  handleRazorpayWebhook,
  simulateIncomingWebhook
} = require("../controllers/webhookController");

// Public live webhook endpoint for Razorpay gateway
router.post("/webhooks/razorpay", handleRazorpayWebhook);

// Interactive test simulation endpoint (for dashboard demo)
router.post("/webhooks/test-simulate", simulateIncomingWebhook);

module.exports = router;
