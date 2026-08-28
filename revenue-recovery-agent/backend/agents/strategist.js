/**
 * Strategist Agent
 * Evaluates compliance constraints first, then applies per-reason policy.
 */

function inQuietHours(hour, start, end) {
  if (start > end) {
    // e.g. 21 to 9 (9 PM to 9 AM)
    return hour >= start || hour < end;
  }
  return hour >= start && hour < end;
}

function _stop(why) {
  return {
    decision: "stop",
    action: "stop_no_recovery",
    reason_code: null,
    channel: null,
    delay_hours: null,
    why: why
  };
}

function decide(reasonCode, event, timestampInput, policyRulesMap, globalConstraints) {
  const rule = policyRulesMap[reasonCode] || policyRulesMap["issuer_declined"] || {
    action: "escalate",
    max_attempts: 1,
    channel: "email",
    retry_delay_hours: 0,
    message_template: null,
    recovery_probability: 0.2
  };

  const constraints = globalConstraints || {
    quiet_hours_start: 21,
    quiet_hours_end: 9,
    max_total_contact_attempts: 3,
    respect_opt_out: true,
    stop_after_days_open: 5
  };

  const priorAttempts = event.prior_attempts !== undefined ? event.prior_attempts : (event.payload ? event.payload.prior_attempts : 0);
  const optedOut = event.customer_opted_out !== undefined ? event.customer_opted_out : (event.payload ? event.payload.customer_opted_out : false);

  const timestamp = timestampInput instanceof Date ? timestampInput : new Date(timestampInput);
  const hour = timestamp.getHours();

  // 1. Opt-out check
  if (constraints.respect_opt_out && optedOut) {
    return _stop("customer_opted_out");
  }

  // 2. Global max attempts check
  if (priorAttempts >= constraints.max_total_contact_attempts) {
    return _stop("global_max_attempts_reached");
  }

  // 3. Reason-specific max attempts check
  if (priorAttempts >= rule.max_attempts) {
    return _stop("reason_specific_max_attempts_reached");
  }

  // 4. Quiet hours check
  if (rule.channel && rule.channel !== "none" && inQuietHours(hour, constraints.quiet_hours_start, constraints.quiet_hours_end)) {
    const delayHours = hour < constraints.quiet_hours_end
      ? constraints.quiet_hours_end - hour
      : (24 - hour + constraints.quiet_hours_end);

    return {
      decision: "deferred",
      action: rule.action,
      reason_code: reasonCode,
      channel: rule.channel,
      delay_hours: delayHours,
      why: "deferred_quiet_hours"
    };
  }

  // 5. Act
  return {
    decision: "act",
    action: rule.action,
    reason_code: reasonCode,
    channel: rule.channel,
    delay_hours: rule.retry_delay_hours,
    message_template: rule.message_template,
    recovery_probability: rule.recovery_probability,
    why: `policy_match:${reasonCode}`
  };
}

module.exports = { decide };
