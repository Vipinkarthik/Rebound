"""
Generates a batch of synthetic 'payment.failed' events shaped like real
payment-gateway webhooks. Each event carries a RAW error description (the
kind of messy string a gateway actually returns) rather than a clean reason
code — the Diagnoser agent's job is to classify these into reason codes.

Run:
    python synthetic_events.py --count 300 --out ../data/events.json
"""

import argparse
import json
import random
import uuid
from datetime import datetime, timedelta

# Raw gateway error strings -> the ground-truth bucket they belong to.
# (Kept here only so we can validate the Diagnoser's accuracy later.)
RAW_ERRORS = {
    "insufficient_funds": [
        "Insufficient balance in account",
        "Your account has insufficient funds for this transaction",
        "Transaction declined - low balance",
    ],
    "bank_downtime": [
        "Issuing bank server not responding",
        "Payment gateway timeout - bank unreachable",
        "Bank system under maintenance",
    ],
    "otp_timeout": [
        "OTP validation timed out",
        "Customer did not complete 3DS/OTP authentication in time",
    ],
    "card_expired": [
        "Card has expired",
        "Expiry date on card has passed",
    ],
    "invalid_card": [
        "Invalid card number",
        "Card verification failed - invalid CVV",
    ],
    "issuer_declined": [
        "Do not honour - declined by issuing bank",
        "Transaction declined by card issuer, no reason provided",
        "Card blocked by issuer",
    ],
}

CUSTOMERS = [f"cust_{i:04d}" for i in range(1, 121)]


def make_event(now: datetime) -> dict:
    bucket = random.choice(list(RAW_ERRORS.keys()))
    raw_error = random.choice(RAW_ERRORS[bucket])
    amount = round(random.uniform(199, 45000), 2)
    opted_out = random.random() < 0.05          # 5% of customers have opted out
    prior_attempts = random.choices([0, 1, 2, 3], weights=[70, 18, 8, 4])[0]

    return {
        "event_id": f"evt_{uuid.uuid4().hex[:12]}",
        "event": "payment.failed",
        "created_at": (now - timedelta(minutes=random.randint(0, 4320))).isoformat(),
        "payload": {
            "payment_id": f"pay_{uuid.uuid4().hex[:14]}",
            "order_id": f"order_{uuid.uuid4().hex[:14]}",
            "customer_id": random.choice(CUSTOMERS),
            "customer_opted_out": opted_out,
            "amount": amount,
            "currency": "INR",
            "raw_error_description": raw_error,
            "_ground_truth_reason": bucket,   # only for eval, not used by the agents
            "prior_attempts": prior_attempts,
        },
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--count", type=int, default=300)
    parser.add_argument("--out", type=str, default="../data/events.json")
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    random.seed(args.seed)
    now = datetime.now()
    events = [make_event(now) for _ in range(args.count)]

    with open(args.out, "w") as f:
        json.dump(events, f, indent=2)

    print(f"Generated {len(events)} synthetic payment.failed events -> {args.out}")


if __name__ == "__main__":
    main()
