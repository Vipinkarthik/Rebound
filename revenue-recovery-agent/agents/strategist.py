"""
Strategist Agent
----------------
Given a diagnosed reason code + case state (prior attempts, opt-out status,
timestamp), decides what action to take. Every decision passes through the
global compliance/stopping constraints BEFORE the per-reason policy is
allowed to fire — this ordering is deliberate: compliance can veto a
retry, a retry can never override compliance.

Returns a decision dict that the Executor will act on and the Auditor will log.
"""

from datetime import datetime


def _in_quiet_hours(timestamp: datetime, start: int, end: int) -> bool:
    hour = timestamp.hour
    if start > end:  # window wraps midnight, e.g. 21 -> 9
        return hour >= start or hour < end
    return start <= hour < end


def decide(reason_code: str, event: dict, timestamp: datetime,
           policy: dict) -> dict:
    reasons = policy["reasons"]
    constraints = policy["global_constraints"]
    payload = event["payload"]

    rule = reasons.get(reason_code, reasons["issuer_declined"])
    prior_attempts = payload.get("prior_attempts", 0)
    opted_out = payload.get("customer_opted_out", False)

    # --- Stopping / compliance checks first, in priority order ---
    if constraints["respect_opt_out"] and opted_out:
        return _stop("customer_opted_out", rule)

    if prior_attempts >= constraints["max_total_contact_attempts"]:
        return _stop("global_max_attempts_reached", rule)

    if prior_attempts >= rule["max_attempts"]:
        return _stop("reason_specific_max_attempts_reached", rule)

    if rule["channel"] != "none" and _in_quiet_hours(
        timestamp, constraints["quiet_hours_start"], constraints["quiet_hours_end"]
    ):
        return {
            "decision": "deferred",
            "action": rule["action"],
            "reason_code": reason_code,
            "channel": rule["channel"],
            "delay_hours": constraints["quiet_hours_end"] - timestamp.hour
                if timestamp.hour < constraints["quiet_hours_end"]
                else (24 - timestamp.hour + constraints["quiet_hours_end"]),
            "why": "deferred_quiet_hours",
        }

    # --- Cleared all checks: proceed with the policy's normal action ---
    return {
        "decision": "act",
        "action": rule["action"],
        "reason_code": reason_code,
        "channel": rule["channel"],
        "delay_hours": rule["retry_delay_hours"],
        "message_template": rule["message_template"],
        "recovery_probability": rule["recovery_probability"],
        "why": f"policy_match:{reason_code}",
    }


def _stop(why: str, rule: dict) -> dict:
    return {
        "decision": "stop",
        "action": "stop_no_recovery",
        "reason_code": None,
        "channel": None,
        "delay_hours": None,
        "why": why,
    }
