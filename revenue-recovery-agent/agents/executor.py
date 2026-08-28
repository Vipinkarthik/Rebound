"""
Executor Agent
--------------
Carries out whatever the Strategist decided. In this demo, "executing" a
retry/nudge/escalation is mocked (printed + logged) rather than wired to a
real SMS/email/payment-retry API — swapping in real Razorpay + Twilio/SendGrid
calls here is a drop-in replacement, the interface doesn't change.

For a batch simulation we also need to simulate *whether the recovery
attempt actually worked*, so the pipeline can report a realistic recovered-
revenue number. We do this with the recovery_probability from the policy.
"""

import random


def execute(decision: dict, event: dict) -> dict:
    payload = event["payload"]
    amount = payload["amount"]

    if decision["decision"] == "stop":
        return {
            "outcome": "not_recovered",
            "amount_recovered": 0.0,
            "detail": f"Stopped — {decision['why']}",
        }

    if decision["decision"] == "deferred":
        return {
            "outcome": "deferred",
            "amount_recovered": 0.0,
            "detail": f"Deferred — {decision['why']}, retry in {decision['delay_hours']}h",
        }

    # decision == "act"
    channel = decision["channel"]
    if channel and channel != "none" and decision.get("message_template"):
        message = decision["message_template"].format(
            amount=f"₹{amount:,.0f}", link="https://rzp.io/pay/xyz123"
        )
    else:
        message = None  # silent retry, e.g. bank_downtime

    recovered = random.random() < decision.get("recovery_probability", 0)

    return {
        "outcome": "recovered" if recovered else "attempted_not_recovered",
        "amount_recovered": amount if recovered else 0.0,
        "channel_used": channel,
        "message_sent": message,
        "detail": f"Action={decision['action']} via {channel or 'system'}",
    }
