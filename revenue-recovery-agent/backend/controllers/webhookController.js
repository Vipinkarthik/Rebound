const crypto = require("crypto");
const Event = require("../models/Event");
const AuditLog = require("../models/AuditLog");
const { PolicyRule, GlobalConstraints } = require("../models/PolicyRule");
const diagnoser = require("../agents/diagnoser");
const strategist = require("../agents/strategist");
const executor = require("../agents/executor");

/**
 * Verify Razorpay Webhook Signature using HMAC SHA256
 */
function verifyWebhookSignature(rawBody, signature, secret) {
  if (!secret) return true; // If secret not configured in dev, skip verification
  if (!signature || !rawBody) return false;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, "utf8"),
    Buffer.from(signature, "utf8")
  );
}

/**
 * Process an incoming payment failure event through the agent pipeline
 */
async function processPaymentFailureEvent({
  eventId,
  paymentId,
  customerId,
  amount,
  currency,
  rawErrorDescription,
  customerOptedOut = false,
  metadata = {}
}) {
  // 1. Fetch current policy rules and global constraints
  const rulesDocs = await PolicyRule.find({});
  const rulesMap = {};
  for (const r of rulesDocs) {
    rulesMap[r.reason_code] = r.toObject();
  }

  let globalConstraints = await GlobalConstraints.findOne({});
  if (!globalConstraints) {
    globalConstraints = {
      quiet_hours_start: 21,
      quiet_hours_end: 9,
      max_total_contact_attempts: 3,
      respect_opt_out: true,
      stop_after_days_open: 5
    };
  } else {
    globalConstraints = globalConstraints.toObject();
  }

  // 2. Count prior attempts for this customer from audit history
  const priorAttemptsCount = await AuditLog.countDocuments({
    customer_id: customerId,
    "decision.decision": "act"
  });

  const eventDoc = {
    event_id: eventId || `evt_${crypto.randomBytes(6).toString("hex")}`,
    payment_id: paymentId || `pay_${crypto.randomBytes(7).toString("hex")}`,
    customer_id: customerId || "cust_guest",
    amount: Number(amount) || 0,
    currency: currency || "INR",
    raw_error_description: rawErrorDescription || "Payment failed at gateway",
    customer_opted_out: Boolean(customerOptedOut),
    prior_attempts: priorAttemptsCount,
    created_at: new Date()
  };

  // 3. Save event to database
  await Event.create(eventDoc);

  // 4. Run through agent pipeline
  const diagnosis = await diagnoser.diagnose(eventDoc.raw_error_description);
  const decision = strategist.decide(
    diagnosis.reason_code,
    eventDoc,
    eventDoc.created_at,
    rulesMap,
    globalConstraints
  );
  const result = await executor.execute(decision, eventDoc);

  // 5. Create immutable audit record
  const auditDoc = await AuditLog.create({
    event_id: eventDoc.event_id,
    payment_id: eventDoc.payment_id,
    customer_id: eventDoc.customer_id,
    amount: eventDoc.amount,
    raw_error: eventDoc.raw_error_description,
    diagnosis,
    decision,
    result,
    timestamp: eventDoc.created_at
  });

  return {
    event: eventDoc,
    diagnosis,
    decision,
    result,
    audit_id: auditDoc._id
  };
}

/**
 * Live Razorpay Webhook Receiver
 * Handles: payment.failed, subscription.halted, invoice.expired
 */
async function handleRazorpayWebhook(req, res, next) {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify signature
    const isValid = verifyWebhookSignature(req.rawBody || JSON.stringify(req.body), signature, webhookSecret);
    if (!isValid) {
      return res.status(400).json({ error: "Invalid Razorpay webhook signature" });
    }

    const { event, payload } = req.body;

    // Supported recovery triggers
    const supportedEvents = ["payment.failed", "subscription.halted", "invoice.expired"];
    if (!supportedEvents.includes(event)) {
      return res.status(200).json({
        status: "ignored",
        message: `Event type '${event}' is not a payment failure recovery trigger.`
      });
    }

    // Extract payment / failure details from payload
    const paymentEntity = payload?.payment?.entity || payload?.invoice?.entity || {};
    const rawError =
      paymentEntity.error_description ||
      paymentEntity.error_reason ||
      paymentEntity.description ||
      "Payment failed during transaction authorization";

    // Razorpay amounts are in paise (e.g. 50000 paise = 500 INR)
    const amountInINR = paymentEntity.amount ? paymentEntity.amount / 100 : 999.0;

    const recoveryOutcome = await processPaymentFailureEvent({
      eventId: req.body.id || `evt_${crypto.randomBytes(6).toString("hex")}`,
      paymentId: paymentEntity.id || `pay_${crypto.randomBytes(7).toString("hex")}`,
      customerId: paymentEntity.customer_id || paymentEntity.contact || paymentEntity.email || "cust_webhook",
      amount: amountInINR,
      currency: paymentEntity.currency || "INR",
      rawErrorDescription: rawError,
      customerOptedOut: Boolean(paymentEntity.notes?.opt_out === "true" || paymentEntity.notes?.opted_out === true)
    });

    res.status(200).json({
      status: "success",
      message: "Webhook ingested and processed by recovery agents",
      event_type: event,
      ...recoveryOutcome
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Interactive Webhook Simulation Trigger
 * Allows frontend users and testers to dispatch a simulated Razorpay webhook
 */
async function simulateIncomingWebhook(req, res, next) {
  try {
    const {
      event_type = "payment.failed",
      raw_error_description = "Bank system under maintenance",
      amount = 1499.0,
      customer_id,
      customer_opted_out = false
    } = req.body;

    const recoveryOutcome = await processPaymentFailureEvent({
      eventId: `evt_sim_${crypto.randomBytes(4).toString("hex")}`,
      paymentId: `pay_sim_${crypto.randomBytes(5).toString("hex")}`,
      customerId: customer_id || `cust_${Math.floor(1000 + Math.random() * 9000)}`,
      amount: Number(amount),
      currency: "INR",
      rawErrorDescription: raw_error_description,
      customerOptedOut: Boolean(customer_opted_out)
    });

    res.status(201).json({
      status: "success",
      event_type,
      message: "Simulated webhook processed and added to audit trail in real-time.",
      ...recoveryOutcome
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  handleRazorpayWebhook,
  simulateIncomingWebhook,
  processPaymentFailureEvent
};
