const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  event_id: { type: String, required: true },
  payment_id: { type: String, required: true },
  customer_id: { type: String, required: true },
  amount: { type: Number, required: true },
  raw_error: { type: String, required: true },
  diagnosis: {
    reason_code: { type: String, required: true },
    confidence: { type: Number, required: true },
    matched_rule: { type: String, default: null },
    diagnosed_by: { type: String, enum: ["keyword", "llm"], default: "keyword" }
  },
  decision: {
    decision: { type: String, required: true }, // act, deferred, stop
    action: { type: String },
    reason_code: { type: String, default: null },
    channel: { type: String, default: null },
    delay_hours: { type: Number, default: null },
    why: { type: String, required: true }
  },
  result: {
    outcome: { type: String, required: true }, // recovered, attempted_not_recovered, deferred, not_recovered
    amount_recovered: { type: Number, default: 0 },
    channel_used: { type: String, default: null },
    message_sent: { type: String, default: null },
    template_message: { type: String, default: null },
    personalized_message: { type: String, default: null },
    payment_link: { type: String, default: null },
    detail: { type: String }
  },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("AuditLog", auditLogSchema);
