const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  event_id: { type: String, required: true, unique: true },
  payment_id: { type: String, required: true },
  customer_id: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  raw_error_description: { type: String, required: true },
  customer_opted_out: { type: Boolean, default: false },
  prior_attempts: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);
