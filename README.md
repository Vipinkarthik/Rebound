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
```

---

### 2. Frontend Setup

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

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
