# Rebound — Compliance-First AI Agent for Payment Failure Recovery

> Built for the Razorpay Hackathon, Track 03: AI Revenue Recovery.

Rebound is an agent pipeline that detects failed payments, works out *why* they failed, decides whether it is allowed to act, executes the right recovery action, and records every decision in an audit trail. It is built around one idea: recovering revenue responsibly means knowing when to act, and when to stop.


## The problem

When a payment fails, most businesses retry blindly or send the same reminder to everyone. A bank outage, an expired card and a low balance each need a different response, so blind retries waste recoverable revenue. They also create compliance risk: messages at night, ignored opt-outs, and no rule for when to stop.

## How Rebound works

```
Razorpay payment.failed webhook (HMAC-verified)  /  simulated event stream
                            │
                            ▼
  1. DIAGNOSER   raw gateway error → one of 6 reason codes
                 (keyword rules first, LLM fallback when confidence is low)
                            │
                            ▼
  2. STRATEGIST  compliance checks FIRST, in strict order:
                 opt-out → global contact cap → per-reason cap → quiet hours
                 then the per-reason recovery policy
                 → decision: ACT / DEFER / STOP, with a recorded reason
                            │
                            ▼
  3. EXECUTOR    creates a Razorpay test-mode payment link,
                 drafts the customer message, dispatches (stubbed), records outcome
                            │
                            ▼
  4. AUDIT LOG   one record per case: diagnosis → decision → outcome
                 plus a plain-English "Explain" for any decision

  Side workers:  Deferred-queue worker re-evaluates cases held by quiet hours
                 Naive baseline runs the same events as a blind 15% retry
```

**Design principle:** compliance is deterministic code that runs first and can veto any action. The LLM is used only where judgment helps (classifying ambiguous errors, drafting message wording, explaining decisions), and every LLM step has a rule-based fallback, so the model can never override a compliance rule.

### Reason codes and default policy

| Reason code | Action | Channel | Retry delay | Max attempts |
|---|---|---|---|---|
| `bank_downtime` | Silent retry | none | 0.5 h | 5 |
| `insufficient_funds` | Retry with nudge | SMS | 24 h | 3 |
| `otp_timeout` | Retry with nudge | SMS | 0 h | 2 |
| `card_expired` | Request card update | Email | 0 h | 2 |
| `invalid_card` | Request card update | SMS | 0 h | 1 |
| `issuer_declined` | Escalate | Email | 0 h | 1 |

Global limits (editable live): quiet hours 9 PM – 9 AM, 3 total contact attempts, opt-outs respected, case expiry 5 days.

---

## Results (sample simulation run)

| | Rebound agent | Naive blind retry |
|---|---|---|
| Failed payments processed | 561 | 561 |
| Revenue at risk | ₹1.17 crore | ₹1.17 crore |
| Recovered | ₹46.5 lakh | ₹17.6 lakh |
| Recovery rate | 39.6% | 15% |
| **Net uplift** | **+163.9%** | baseline |
| Cases halted by compliance rules | 173 | n/a |

> **Read this before quoting the numbers.** The agent and the baseline process the same events, but recovery outcomes are **simulated** using configurable recovery probabilities (a flat 15% for the baseline, per-reason rates for the agent, editable in the Policy Editor). The uplift therefore shows how reason-specific policies behave under those assumptions. It is not measured merchant data. Totals change with every run.

---

## What is real vs. simulated

| Real | Simulated / stubbed |
|---|---|
| Razorpay webhook endpoint with HMAC-SHA256 signature verification | Failed-payment event stream and error strings |
| Razorpay test-mode payment link creation (official SDK) | Whether a customer actually pays (probability model) |
| Decision logic: diagnosis, compliance veto, policy engine | SMS / email / WhatsApp delivery (stubbed; ready for Twilio / SendGrid) |
| LLM classification, message drafting and explanations (Claude / Gemini) | Customer opt-out data |
| Audit log, live policy editing, deferred-queue worker | |

Without API keys the app still runs: LLM steps fall back to rules and templates, and payment links fall back to a placeholder URL.

---

## Features

- **Root-cause diagnosis** with keyword rules plus LLM fallback; each diagnosis is tagged `diagnosed_by: keyword | llm` with a confidence score.
- **Compliance-first strategist** where opt-outs, contact caps and quiet hours are checked before any policy can fire.
- **Razorpay integration** for signed webhook ingestion and test-mode Payment Links.
- **Deferred queue:** cases held by quiet hours are re-evaluated by a background worker (every 5 minutes) or via `POST /api/cron/process-deferred`.
- **Baseline benchmark:** the same events run through a blind-retry baseline, with uplift shown live.
- **Explain this decision:** plain-English explanation of any audit record (`POST /api/explain/:auditLogId`).
- **Live policy editor:** change attempt caps, delays, channels and quiet hours without a redeploy.
- **Webhook simulator:** inject a failure from the dashboard, including an opted-out customer, to watch the pipeline decide.
- **Security basics:** admin routes need an `x-api-key` header, rate limiting on `/api/simulate`, Zod request validation, timing-safe webhook signature comparison.

---

## Tech stack

- **Frontend:** React 18, Vite, Tailwind CSS, Recharts, Lucide Icons, Axios
- **Backend:** Node.js, Express, Mongoose, Zod, express-rate-limit
- **AI / integrations:** Anthropic SDK, Google Gen AI SDK, Razorpay Node SDK
- **Database:** MongoDB (Atlas, with local and in-memory fallbacks)

---

## Project structure

```
revenue-recovery-agent/
├── backend/
│   ├── agents/          diagnoser.js · strategist.js · executor.js · naiveBaseline.js
│   ├── controllers/     simulation · webhook · cron · explain · policy · summary · audit
│   ├── services/        eventSimulator · razorpayClient · llmClient
│   │                    notificationService · deferredQueueWorker
│   ├── models/          Event · AuditLog · PolicyRule · GlobalConstraints
│   ├── routes/  middleware/  config/  server.js
└── frontend/
    └── src/
        ├── api/client.js
        ├── pages/Dashboard.jsx
        └── components/  BaselineComparisonCard · MetricCard · RecoveryByReasonChart
                         StoppedCasesPanel · AuditLogTable · PolicyEditor
                         WebhookSimulatorModal · RunSimulationButton
```

---

## Quickstart

**Prerequisites:** Node.js 18+, and a MongoDB connection string (Atlas or local).

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env     # then fill in values
npm run dev              # http://localhost:5000
```

`backend/.env`:

```env
PORT=5000
FRONTEND_URL=http://localhost:3000
ADMIN_API_KEY=<choose-a-long-random-string>
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/revenue-recovery

# Optional: LLM (rule-based fallback if unset)
LLM_PROVIDER=anthropic          # anthropic | gemini
ANTHROPIC_API_KEY=
GEMINI_API_KEY=

# Optional: Razorpay test-mode keys (placeholder link if unset)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

On first start the server seeds the default policy rules and global constraints.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env     # set VITE_API_BASE_URL if the backend is not on localhost:5000
npm run dev              # http://localhost:3000
```

### 3. Try it

1. Click **Run Simulation** to process a batch and see the baseline comparison.
2. Click **Simulate Webhook**, choose an error such as bank maintenance or insufficient funds, and watch the new row appear in the audit trail.
3. Inject another failure with **Simulate Customer Opt-Out** ticked and see the decision come back as STOP.
4. Click **Explain** on any audit row.
5. Edit a rule in the **Policy Editor**, save it, and run again to see the numbers move.

---

## API reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/simulate` | Rate-limited | Runs a batch through the agent and the baseline; returns both summaries and uplift |
| `POST` | `/api/webhooks/razorpay` | HMAC signature | Live Razorpay webhook receiver (`payment.failed`) |
| `POST` | `/api/webhooks/test-simulate` | none | Dashboard trigger for injecting a test webhook |
| `POST` | `/api/cron/process-deferred` | none | Re-evaluates cases deferred by quiet hours |
| `GET` | `/api/summary` | none | Aggregated metrics and baseline comparison |
| `GET` | `/api/audit` | none | Paginated audit log (`?page=&limit=&decision=&reason_code=`) |
| `POST` | `/api/explain/:auditLogId` | none | Plain-English explanation of a decision |
| `GET` | `/api/policy` | none | Active policy rules and global constraints |
| `PUT` | `/api/policy/:reason_code` | `x-api-key` | Update one policy rule |
| `PUT` | `/api/policy/global` | `x-api-key` | Update global constraints |

---

## Limitations and next steps

- Recovery rates are assumptions, so the next step is replacing them with measured outcomes from real merchant data.
- Messaging is stubbed, so the next step is wiring real SMS / email / WhatsApp providers with delivery receipts.
- Opt-out and quiet-hour handling is a simplified model and would need to follow the applicable telecom and RBI guidelines before real use.
- Extend the same pipeline to `subscription.halted` (failed subscriptions), overdue invoices and checkout abandonment.
- Add authentication on the dashboard and on the remaining admin-style endpoints.
