<<<<<<< HEAD
# Revenue Recovery Agent — Full-Stack Autonomous Dashboard

An autonomous, compliance-first payment recovery agent system that detects failed payments, diagnoses root causes from messy gateway error strings, enforces strict compliance constraints (quiet hours, opt-outs, attempt caps), generates dynamic outreach copy with Razorpay payment links, and provides real-time auditability and parallel baseline comparisons.

---

## 🌟 Key Features

1. **Root-Cause Aware Diagnosis (`Diagnoser`)**:
   - Classifies raw gateway errors into structured reason codes (`insufficient_funds`, `bank_downtime`, `otp_timeout`, `card_expired`, `invalid_card`, `issuer_declined`).
   - Hybrid pipeline: High-speed keyword matching with automatic LLM fallback (Claude 3.5 Sonnet / Gemini 2.5) for ambiguous or novel errors, logging `diagnosed_by: "keyword" | "llm"`.

2. **Compliance-First Strategy Engine (`Strategist`)**:
   - **Restraint as a Feature**: Compliance guardrails strictly veto and prioritize customer safety before any retry action is allowed:
     1. Customer opt-out check (TCPA/DNC compliance).
     2. Global hard contact cap (max 3 contact attempts across case history).
     3. Reason-specific max attempt limits.
     4. Quiet hours restriction (no customer outreach between 9 PM and 9 AM local time).
     5. Per-reason policy match (`retry_with_nudge`, `retry_silent`, `request_update`, `escalate`).

3. **Intelligent Execution & Razorpay Integration (`Executor`)**:
   - Live integration with the official Razorpay Node SDK to generate real test-mode payment links (`short_url`).
   - LLM-powered personalized copy generation for customer SMS/Email outreach.
   - Outcome probability modeling.

4. **Naive Baseline Comparison & Uplift Benchmark**:
   - Runs parallel batch simulation through a naive baseline (blind retry, 15% flat recovery) vs. the autonomous agent pipeline.
   - Displays real-time **Net Recovery Uplift (%)** prominently on the dashboard.

5. **"Explain This Decision" AI Inspector**:
   - non-technical plain-English explanations for every decision via `POST /api/explain/:auditLogId`, citing exact compliance constraints and diagnostic reasons.

6. **Enterprise Security & Reliability**:
   - Protected policy mutations via `x-api-key` header (`ADMIN_API_KEY`).
   - Rate limiting on `/api/simulate` (`express-rate-limit`).
   - Zod request payload schema validation.

---

## 📊 How This Differs From a Naive Approach

Traditional systems rely on **blind retries** (spamming the card or customer with generic SMS/emails repeatedly). This produces low recovery (~15%), annoys customers, and violates TCPA / quiet hours regulations.

**Revenue Recovery Agent** diagnoses the specific reason (e.g. low balance vs. bank downtime) and enforces strict compliance rules first (never messaging during 9PM-9AM quiet hours or contacting opted-out users). In simulation benchmarks, this root-cause aware approach yields a **+80% to +120% Net Recovery Uplift** over naive retries while eliminating customer spam complaints.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Lucide Icons, Axios
- **Backend**: Node.js, Express, Mongoose, Zod, Express Rate Limit
- **Integrations**: Anthropic SDK (`@anthropic-ai/sdk`), Google Gen AI (`@google/genai`), Razorpay SDK (`razorpay`)
- **Database**: MongoDB (Atlas / Local MongoDB with automatic policy seeding)

---

## 🚀 Quickstart & Setup

### 1. Backend Setup

```bash
cd backend
npm install
```

#### Environment Variables (`backend/.env`)

```env
PORT=5000
FRONTEND_URL=http://localhost:3000
ADMIN_API_KEY=secret-admin-key
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/?appName=rebound

# LLM Provider (anthropic | gemini) - Optional, has rule-based fallback
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=
GEMINI_API_KEY=

# Razorpay Test Keys - Optional, has mock URL fallback
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

#### Start Backend Server

```bash
npm run dev
=======
# Smart Payment Recovery Agent (Rebound)
### Razorpay Hackathon Autonomous Agent System

An autonomous, root-cause-aware, compliance-first payment recovery agent pipeline built with **Node.js, Express, React, Vite, MongoDB, Razorpay SDK, and Generative AI (Claude & Gemini)**.

Unlike naive payment recovery scripts that blindly retry every failed charge, this agent diagnoses *why* the transaction failed, enforces strict regulatory compliance constraints (Quiet Hours 9 PM – 9 AM, Opt-Outs, Attempt Caps), generates personalized outreach copy with real **Razorpay Payment Links**, and calculates a **+80% to +120% Net Recovery Uplift** over blind retry baselines.

---

## 🌟 Architecture & The Multi-Agent Pipeline

```
                       [Incoming Payment Failure]
                     (Live Webhook or Batch Stream)
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 1. Diagnoser Agent (agents/diagnoser.js)                               │
│    • High-speed keyword rules + LLM fallback (Claude / Gemini)         │
│    • Categorizes raw gateway errors into 6 structured reason codes     │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 2. Strategist Agent (agents/strategist.js)                             │
│    • COMPLIANCE VETO FIRST: Opt-out check, 3-attempt hard cap,         │
│      Quiet Hours (9 PM - 9 AM local time)                              │
│    • Applies per-reason policy: Action, Channel, Delay, Probability    │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 3. Executor Agent (agents/executor.js)                                 │
│    • Creates live Razorpay Payment Links (razorpay SDK short_url)      │
│    • LLM drafts tailored, empathetic outreach copy (SMS / Email)       │
│    • Outbound dispatch service with status tracking (delivered/queued) │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
             ┌─────────────────────┴─────────────────────┐
             ▼                                           ▼
┌───────────────────────────────┐           ┌────────────────────────────┐
│ 4. Deferred Queue Worker      │           │ 5. Naive Baseline Agent    │
│    • Automatic scheduler      │           │    • Blind retry benchmark │
│    • Re-awakens cases after   │           │    • Computes real-time    │
│      quiet hours / delay      │           │      Net Recovery Uplift % │
└───────────────────────────────┘           └────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 6. Full-Stack Operational Dashboard (frontend/)                        │
│    • Net Uplift Benchmark Card (+80% to +120% boost)                  │
│    • Real-time KPIs: At Risk, Recovered, Recovery Rate, Stopped Cases │
│    • Interactive "Simulate Live Webhook" trigger modal                 │
│    • "Explain This Decision" AI compliance inspector                   │
│    • Live In-Dashboard Policy Rule & Constraint Editor                 │
└────────────────────────────────────────────────────────────────────────┘
>>>>>>> ee84457 (The Recovery Agent project is completed end-to-end)
```

---

<<<<<<< HEAD
### 2. Frontend Setup

In a separate terminal:

```bash
cd frontend
=======
## 🚀 Key Differentiators

| Feature | Naive Blind Retry | Rebound Autonomous Agent |
|---|---|---|
| **Root-Cause Awareness** | Ignored (Same generic message for all) | Classifies 6 reasons (`bank_downtime`, `insufficient_funds`, `otp_timeout`, `card_expired`, etc.) |
| **Bank Downtime Handling** | Sends spam email to customer | Silent, rapid gateway retry (75-80% recovery) without bothering customer |
| **Compliance Restraint** | Sends messages late at night (11 PM) | Enforces 9 PM–9 AM Quiet Hours; defers until morning window |
| **Opt-Out Compliance** | Ignores opt-out requests | Immediately halts recovery to protect TCPA/DNC privacy rules |
| **Customer Experience** | Spammy, repetitive, annoying | Polite, reason-specific copy with direct Razorpay payment links |
| **Recovery Uplift** | ~15% flat recovery | **+80% to +120% Net Recovery Uplift** over baseline |

---

## 📂 Project Directory Structure

```
revenue-recovery-agent/
├── backend/
│   ├── agents/
│   │   ├── diagnoser.js           # Error classifier (Keyword + LLM fallback)
│   │   ├── strategist.js          # Compliance guardrails & policy engine
│   │   ├── executor.js            # Razorpay links & LLM outreach copy
│   │   └── naiveBaseline.js       # Unintelligent blind retry benchmark
│   ├── controllers/
│   │   ├── simulationController.js # Batch simulation runner
│   │   ├── webhookController.js    # Live Razorpay webhook & simulator
│   │   ├── cronController.js       # Deferred queue processor
│   │   ├── explainController.js    # "Explain Decision" AI inspector
│   │   └── policyController.js     # Live policy mutation API
│   ├── services/
│   │   ├── eventSimulator.js       # Realistic synthetic event generator
│   │   ├── razorpayClient.js       # Official Razorpay Node SDK client
│   │   ├── llmClient.js            # Anthropic Claude & Google Gemini client
│   │   ├── notificationService.js  # Outbound SMS/Email dispatch service
│   │   └── deferredQueueWorker.js  # Background scheduler for quiet hours
│   ├── models/                    # MongoDB Mongoose schemas (AuditLog, PolicyRule)
│   ├── routes/                    # Express REST API routes
│   └── server.js                  # Main Express server entrypoint
│
└── frontend/
    ├── src/
    │   ├── api/client.js          # Axios API client
    │   ├── components/
    │   │   ├── BaselineComparisonCard.jsx # Net Uplift comparison
    │   │   ├── MetricCard.jsx             # Top KPI stats
    │   │   ├── RecoveryByReasonChart.jsx  # Recharts breakdown by reason
    │   │   ├── StoppedCasesPanel.jsx      # Compliance restraint & deferred queue
    │   │   ├── AuditLogTable.jsx          # Paginated audit trail with "Explain"
    │   │   ├── PolicyEditor.jsx           # Live policy rule editor
    │   │   ├── WebhookSimulatorModal.jsx  # Interactive live webhook injection
    │   │   └── RunSimulationButton.jsx    # Batch simulation trigger
    │   └── pages/
    │       └── Dashboard.jsx              # Main application dashboard
    └── package.json
```

---

## ⚡ Quickstart

### 1. Prerequisites
- Node.js (v18+)
- MongoDB connection string (local or MongoDB Atlas)

### 2. Start the Backend API

```bash
cd revenue-recovery-agent/backend
>>>>>>> ee84457 (The Recovery Agent project is completed end-to-end)
npm install
npm run dev
```

<<<<<<< HEAD
Open `http://localhost:3000` in your browser.

---

## 📖 API Endpoints Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/simulate` | Public (Rate-limited) | Runs parallel batch simulation through Agent & Baseline; returns summaries & uplift %. |
| `GET` | `/api/summary` | Public | Recomputes latest summary stats & baseline comparison from `AuditLog` collection. |
| `GET` | `/api/audit` | Public | Filterable & paginated audit logs (`?page=&limit=&decision=&reason_code=`). |
| `POST` | `/api/explain/:auditLogId` | Public | Generates 2-3 sentence non-technical decision explanation. |
| `GET` | `/api/policy` | Public | Returns all `PolicyRule` docs and `GlobalConstraints`. |
| `PUT` | `/api/policy/:reason_code` | `x-api-key` Header | Updates a policy rule live. |
| `PUT` | `/api/policy/global` | `x-api-key` Header | Updates global compliance constraints live. |

---

## 🚢 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for full deployment instructions for Render, Railway, Vercel, Netlify, and MongoDB Atlas.
=======
*Backend runs on `http://localhost:5000` with automatic policy seeding.*

### 3. Start the Frontend Dashboard

```bash
cd revenue-recovery-agent/frontend
npm install
npm run dev
```

*Open `http://localhost:3000` (or `http://localhost:5173`) in your browser.*

---

## 🌐 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/simulate` | Runs parallel batch simulation (300 events) through Agent & Baseline; returns summaries & net uplift %. |
| `POST` | `/api/webhooks/razorpay` | Live Razorpay Webhook receiver with HMAC-SHA256 signature verification. |
| `POST` | `/api/webhooks/test-simulate` | Interactive trigger for simulating incoming Razorpay webhooks in real-time. |
| `POST` | `/api/cron/process-deferred` | Processes queued cases deferred during quiet hours. |
| `GET` | `/api/summary` | Returns latest aggregated metrics, recovery rates, and baseline comparison. |
| `GET` | `/api/audit` | Filterable, paginated audit logs (`?page=&limit=&decision=&reason_code=`). |
| `POST` | `/api/explain/:auditLogId` | Generates plain-English decision explanations citing compliance constraints. |
| `GET` | `/api/policy` | Fetches active policy rules and global compliance constraints. |
| `PUT` | `/api/policy/:reason_code` | Protected live update of a policy rule (`x-api-key: secret-admin-key`). |
| `PUT` | `/api/policy/global` | Protected live update of global compliance constraints. |

---

## 🚢 Deployment Guide

Detailed deployment instructions for **Render, Railway, Vercel, Netlify, and MongoDB Atlas** are provided in [revenue-recovery-agent/DEPLOYMENT.md](revenue-recovery-agent/DEPLOYMENT.md).
>>>>>>> ee84457 (The Recovery Agent project is completed end-to-end)
