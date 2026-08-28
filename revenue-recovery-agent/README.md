# Smart Payment Recovery Agent

An AI agent pipeline that detects failed payments, diagnoses *why* they
failed, decides the right recovery action under compliance and stopping
rules, executes it, and logs a full audit trail — rather than blindly
retrying every failure the same way.

## The problem

Most "payment recovery" is one script: payment fails → send a retry email.
It ignores that a failure due to a **temporarily down bank server** needs a
completely different response than one due to an **expired card** or a
**customer declined by their own bank** — and it never stops, even when it
should (opted-out customers, exhausted attempts, off-hours contact).

## The pipeline

```
Detector   →   Diagnoser   →   Strategist   →   Executor   →   Audit Logger
(webhook)      (raw error      (policy +        (mock send/     (immutable
                → reason        compliance       retry, logs      JSONL trail)
                code)           check → action)  outcome)
```

- **Detector** — reads the incoming `payment.failed`-style event stream.
  (In this repo, a batch of simulated events; swap in a real Razorpay
  webhook receiver to go live.)
- **Diagnoser** (`agents/diagnoser.py`) — classifies the raw, messy gateway
  error string into a clean reason code (`insufficient_funds`,
  `bank_downtime`, `otp_timeout`, `card_expired`, `invalid_card`,
  `issuer_declined`), with a confidence score and safe fallback for
  unrecognized errors.
- **Strategist** (`agents/strategist.py`) — the decision core. Checks
  **compliance and stopping rules first** (opt-out, max attempts, quiet
  hours) — these can veto any action — then applies the per-reason policy
  from `policy/rules.yaml` to pick the recovery action, channel, and timing.
- **Executor** (`agents/executor.py`) — carries out the decision (mocked
  send/retry in this demo — swap in real SMS/email/payment-retry APIs) and
  simulates a realistic outcome.
- **Audit Logger** (`audit/logger.py`) — writes one immutable record per
  case: detection → diagnosis → decision → outcome, with the reason for
  every decision.

## Why this is different from a retry bot

1. **Root-cause-aware, not blind.** Bank downtime gets a fast, silent
   retry. An expired card gets a request to update payment details, not a
   pointless retry. This is enforced by policy, not hardcoded per-case.
2. **The agent visibly stops.** Compliance and stopping rules run *before*
   any recovery action, and are logged just as thoroughly as successes —
   see `cases_stopped_by_compliance` in the results summary.
3. **Everything is auditable.** Every decision states *why* it fired
   (`policy_match:...`, `deferred_quiet_hours`, `customer_opted_out`, etc.)
   in `data/audit_log.jsonl`.

## Quickstart

```bash
pip install pyyaml

# 1. Generate a batch of synthetic payment-failure events
cd simulator && python synthetic_events.py --count 300 --out ../data/events.json && cd ..

# 2. Run the full pipeline
python main.py
```

Outputs:
- `data/results_summary.json` — headline metrics (total at risk, recovered,
  recovery rate, breakdown by reason code)
- `data/audit_log.jsonl` — one line per case, full decision trail

## Sample result (300 simulated events)

| Metric | Value |
|---|---|
| Total at risk | ₹66.5L |
| Recovered | ₹16.5L |
| Recovery rate | 24.9% |
| Cases stopped by compliance rules | 50 |
| Cases deferred for quiet hours | 95 |

Bank-downtime failures recover at ~73% (fast silent retry works); issuer
declines and invalid cards recover far less (correctly — no amount of
retrying fixes a card the bank has blocked).

## Policy configuration

All recovery behavior lives in `policy/rules.yaml` — no code changes
needed to adjust retry timing, contact caps, quiet hours, or channels per
failure reason.

## Roadmap / what a full version adds

- Real Razorpay webhook ingestion (`payment.failed`, `subscription.halted`,
  `invoice.expired`) instead of simulated events
- LLM-backed diagnosis for error strings the keyword rules don't cover
- A live dashboard (see `dashboard/`) instead of a JSON summary
- Extending the same pipeline to checkout abandonment and B2B receivables
