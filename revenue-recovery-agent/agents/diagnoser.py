"""
Diagnoser Agent
---------------
Takes a raw, messy gateway error string and classifies it into one of the
clean reason codes defined in policy/rules.yaml. This is what makes the
pipeline "root-cause-aware" instead of a blind retry loop.

Rule-based keyword matching is used here for speed and reliability in a
demo/batch setting. In a production version this step is a natural place
to swap in an LLM call for the ambiguous/unseen error strings that don't
match any keyword rule below.
"""

KEYWORD_RULES = [
    (["insufficient", "low balance", "no funds"], "insufficient_funds"),
    (["bank server", "not responding", "timeout", "unreachable", "maintenance"], "bank_downtime"),
    (["otp", "3ds", "authentication"], "otp_timeout"),
    (["expired", "expiry date"], "card_expired"),
    (["invalid card", "invalid cvv", "verification failed"], "invalid_card"),
    (["do not honour", "declined by issuing bank", "declined by card issuer", "blocked by issuer"], "issuer_declined"),
]

DEFAULT_REASON = "issuer_declined"  # safest fallback: treat unknowns as needing escalation, not silent retry


def diagnose(raw_error_description: str) -> dict:
    """
    Returns {"reason_code": str, "confidence": float, "matched_rule": str|None}
    """
    text = raw_error_description.lower()

    for keywords, reason_code in KEYWORD_RULES:
        for kw in keywords:
            if kw in text:
                return {
                    "reason_code": reason_code,
                    "confidence": 0.9,
                    "matched_rule": kw,
                }

    # No keyword matched — low-confidence fallback, flagged for visibility
    return {
        "reason_code": DEFAULT_REASON,
        "confidence": 0.3,
        "matched_rule": None,
    }
