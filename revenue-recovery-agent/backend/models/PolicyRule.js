const mongoose = require("mongoose");

const policyRuleSchema = new mongoose.Schema({
  reason_code: { type: String, required: true, unique: true },
  action: { type: String, required: true },
  retry_delay_hours: { type: Number, required: true, default: 0 },
  max_attempts: { type: Number, required: true, default: 1 },
  channel: { type: String, required: true, default: "none" },
  message_template: { type: String, default: null },
  recovery_probability: { type: Number, required: true, default: 0.5 },
}, { timestamps: true });

const globalConstraintsSchema = new mongoose.Schema({
  quiet_hours_start: { type: Number, required: true, default: 21 },
  quiet_hours_end: { type: Number, required: true, default: 9 },
  max_total_contact_attempts: { type: Number, required: true, default: 3 },
  respect_opt_out: { type: Boolean, required: true, default: true },
  stop_after_days_open: { type: Number, required: true, default: 5 },
}, { timestamps: true });

const PolicyRule = mongoose.model("PolicyRule", policyRuleSchema);
const GlobalConstraints = mongoose.model("GlobalConstraints", globalConstraintsSchema);

const SEED_RULES = [
  {
    reason_code: "insufficient_funds",
    action: "retry_with_nudge",
    retry_delay_hours: 24,
    max_attempts: 3,
    channel: "sms",
    message_template: "Your payment of {amount} couldn't go through (low balance). We'll retry tomorrow — or pay now: {link}",
    recovery_probability: 0.55,
  },
  {
    reason_code: "bank_downtime",
    action: "retry_silent",
    retry_delay_hours: 0.5,
    max_attempts: 5,
    channel: "none",
    message_template: null,
    recovery_probability: 0.80,
  },
  {
    reason_code: "otp_timeout",
    action: "retry_with_nudge",
    retry_delay_hours: 0,
    max_attempts: 2,
    channel: "sms",
    message_template: "Payment attempt timed out. Please try again: {link}",
    recovery_probability: 0.60,
  },
  {
    reason_code: "card_expired",
    action: "request_update",
    retry_delay_hours: 0,
    max_attempts: 2,
    channel: "email",
    message_template: "Your card has expired. Update it to complete your payment: {link}",
    recovery_probability: 0.35,
  },
  {
    reason_code: "invalid_card",
    action: "request_update",
    retry_delay_hours: 0,
    max_attempts: 1,
    channel: "sms",
    message_template: "That card couldn't be used. Try another payment method: {link}",
    recovery_probability: 0.30,
  },
  {
    reason_code: "issuer_declined",
    action: "escalate",
    retry_delay_hours: 0,
    max_attempts: 1,
    channel: "email",
    message_template: "Your bank declined this payment. Contact your bank, or try another card: {link}",
    recovery_probability: 0.20,
  },
];

const DEFAULT_GLOBAL_CONSTRAINTS = {
  quiet_hours_start: 21,
  quiet_hours_end: 9,
  max_total_contact_attempts: 3,
  respect_opt_out: true,
  stop_after_days_open: 5,
};

async function seedDefaultPolicies() {
  try {
    for (const rule of SEED_RULES) {
      await PolicyRule.updateOne(
        { reason_code: rule.reason_code },
        { $setOnInsert: rule },
        { upsert: true }
      );
    }

    const gcCount = await GlobalConstraints.countDocuments();
    if (gcCount === 0) {
      await GlobalConstraints.create(DEFAULT_GLOBAL_CONSTRAINTS);
    }
  } catch (err) {
    console.error("Error seeding default policies:", err);
  }
}

module.exports = {
  PolicyRule,
  GlobalConstraints,
  seedDefaultPolicies,
};
