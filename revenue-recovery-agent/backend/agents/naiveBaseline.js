/**
 * Naive Baseline Agent
 * Unintelligent comparison baseline: ignores diagnosis, compliance rules,
 * and reason codes. Always retries blindly via SMS with flat 15% recovery probability.
 */

function executeNaiveBaseline(event) {
  const amount = event.amount !== undefined ? event.amount : (event.payload ? event.payload.amount : 0);

  const decision = {
    decision: "act",
    action: "retry",
    reason_code: "unknown",
    channel: "sms",
    delay_hours: 6,
    why: "naive_blind_retry"
  };

  const FLAT_RECOVERY_PROB = 0.15;
  const recovered = Math.random() < FLAT_RECOVERY_PROB;

  const result = {
    outcome: recovered ? "recovered" : "attempted_not_recovered",
    amount_recovered: recovered ? amount : 0.0,
    channel_used: "sms",
    message_sent: `Payment retry: ₹${amount} needed. Pay now: https://rzp.io/pay/xyz123`,
    detail: "Naive blind retry via sms"
  };

  return { decision, result };
}

module.exports = { executeNaiveBaseline };
