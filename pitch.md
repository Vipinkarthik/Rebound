# 🎙️ Pitch Deck & Presentation Guide: Smart Payment Recovery Agent (Rebound)
### Razorpay Hackathon 2026 — Track: Autonomous AI Agents in Fintech

---

## ⏱️ 5-Minute Pitch Script & Timing Breakdown

| Timestamp | Section | Key Visual / Action on Screen |
|---|---|---|
| **0:00 – 1:00** | **The Hook & The Multi-Billion Dollar Problem** | Dashboard Header & Headline Metrics |
| **1:00 – 2:00** | **The Solution & Core Innovations** | Architecture Diagram / Pipeline |
| **2:00 – 3:30** | **Live Website & Dashboard Walkthrough** | Live Webhook Simulator & "Explain Decision" Drawer |
| **3:30 – 4:15** | **Business Impact, ROI & Numbers** | Baseline Comparison & Net Uplift Card (+80% to +120%) |
| **4:15 – 5:00** | **Future Vision, Scalability & Closing** | Policy Editor & Webhook Architecture |

---

### [0:00 – 1:00] The Hook: The Fatal Flaw of Modern Payment Recovery

> **Speaker:**
>
> "Judges, every single day, millions of dollars in digital commerce transactions fail at checkout. But the real tragedy isn't that a payment fails — it’s how modern companies attempt to recover it.
>
> Today, 99% of businesses rely on what we call **'Blind Retry Bots'**. A payment fails, and a dumb script blindly sends a generic email or SMS saying: *'Your payment failed, please click here.'*
>
> This creates two disastrous problems:
> 1. **It is completely blind to root cause:** An **expired card** cannot be retried silently. A **bank server downtime** should *never* bother the customer with an email — it needs an instant, silent gateway retry. An **insufficient funds** failure needs a polite morning nudge when paychecks clear, not an immediate nag.
> 2. **It has ZERO compliance restraint:** These bots spam customers at 11:30 PM in violation of **Quiet Hours regulations**, harass users who explicitly **opted out** (violating TCPA / DNC compliance), and retry relentlessly until the customer churns out of pure frustration.
>
> We built **Rebound — The Smart Payment Recovery Agent**: an autonomous, root-cause aware, compliance-first recovery system that treats **restraint as a feature**, not an afterthought."

---

### [1:00 – 2:00] The Solution & Uniqueness: Why Rebound is Different

> **Speaker:**
>
> "Rebound replaces blind scripts with an autonomous **Multi-Agent Pipeline** integrated directly with Razorpay:
>
> 1. **The Diagnoser Agent:** When a payment fails, it takes the messy gateway error string and classifies it into 6 structured reason codes using high-speed heuristics backed by an **LLM fallback** (Claude / Gemini) for novel or ambiguous errors.
> 2. **The Strategist Agent (Our Core Innovation):** Before taking *any* action, it evaluates **Compliance Guardrails FIRST**:
>    - *Has the customer opted out?* **Veto and halt.**
>    - *Have we hit the 3-attempt contact cap?* **Veto and halt.**
>    - *Is it between 9 PM and 9 AM?* **Defer until morning.**
>    Only when compliance clears does it apply the tailored recovery policy.
> 3. **The Executor Agent:** Instead of sending a static link, it integrates with the **Razorpay Node SDK** to generate a real, secure **Razorpay Payment Link (`short_url`)**, uses generative AI to draft empathetic, non-pushy outreach copy, and dispatches via SMS, Email, or WhatsApp.
> 4. **The Autonomous Deferred Queue Scheduler:** It doesn't just defer quiet-hour payments and forget them — a background worker wakes them up the moment morning hours open and executes recovery automatically."

---

### [2:00 – 3:30] Live Product Walkthrough: How the Website Works

*(Switch to browser tab running `http://localhost:3000`)*

> **Speaker:**
>
> "Let’s look at the live dashboard:
>
> 1. **The Net Recovery Uplift Benchmark:** Right at the top, you see our **Baseline Comparison Card**. We run every transaction batch in parallel through a traditional blind-retry baseline and our autonomous agent. The result? **A +80% to +120% Net Recovery Uplift** — provable ROI right on the screen.
> 2. **Live Webhook Ingestion (Click 'Simulate Webhook'):** 
>    - Let’s simulate an incoming live Razorpay webhook event (`payment.failed`).
>    - First, let’s test **Bank Downtime**. The agent identifies the issue, avoids spamming the customer, and schedules a silent retry.
>    - Now, let’s check **Compliance Restraint**: I’ll toggle **'Simulate Customer Opt-Out'** and inject. Watch the audit trail: the agent immediately halts recovery with a `customer_opted_out` veto to protect the merchant from regulatory fines!
> 3. **'Explain This Decision' AI Inspector (Click 'Explain' on any audit row):**
>    - Black-box AI is dangerous in fintech. When an auditor or support agent asks *'Why did the agent stop this payment?'*, they can click **Explain**. 
>    - In real-time, the AI generates a plain-English explanation citing exact compliance clauses and error reasons.
> 4. **Live Policy Editor:**
>    - Businesses aren't static. In our dashboard, operations teams can tune retry delays, channels, contact limits, and quiet hour boundaries in real-time without writing a single line of code."

---

### [3:30 – 4:15] Impact, Numbers & Business Benefits

> **Speaker:**
>
> "What does this mean for a merchant processing ₹5 Crores a month?
>
> - **Direct Revenue Recovery:** In a typical 300-transaction failure batch representing **₹65 Lakhs at risk**, blind retries recover only ₹9 Lakhs (~15%). Rebound recovers **₹18+ Lakhs** — an instant net gain of **₹9 Lakhs recovered cash**.
> - **100% Regulatory Peace of Mind:** Zero late-night customer spam, zero TCPA/DNC opt-out penalties, and 100% immutable audit logging for every decision.
> - **Customer Retention:** Customers aren't alienated by endless bot spam. Instead, they get a polite, context-aware nudge with a 1-click Razorpay checkout link when it's appropriate."

---

### [4:15 – 5:00] Extensibility & Closing Vision

> **Speaker:**
>
> "This isn't just for checkout failures. The same multi-agent pipeline easily extends to:
> - **`subscription.halted`**: Recovering recurring SaaS subscription revenue before account cancellation.
> - **`invoice.expired`**: Automating B2B invoice collection and gentle payment reminders.
> - **Checkout Abandonment**: Pre-failure cart recovery.
>
> In fintech, **smart restraint is the ultimate form of intelligence**. Rebound proves that autonomous agents can drive massive revenue uplift while upholding the highest standards of customer trust and compliance.
>
> Thank you, and we look forward to your questions!"

---

## 💡 Quick Q&A Cheat Sheet for Judges

### Q1: "How do you prevent the AI from hallucinating or making dangerous recovery decisions?"
> **Answer:** "Our AI does not make unbound decisions. The Strategist uses a **deterministic compliance rule engine** — compliance checks (opt-out, quiet hours, caps) are hardcoded gatekeepers that run *before* any action. The LLM is used strictly where it excels: classifying ambiguous raw error strings and drafting empathetic human copy. Even if an LLM fails or times out, the system seamlessly falls back to pre-compiled keyword policies and templates."

### Q2: "How is Razorpay integrated into the agent?"
> **Answer:** "We use the official Razorpay Node SDK. When the Executor decides to nudge a customer via SMS or Email, it dynamically calls Razorpay's Payment Links API to generate a unique test-mode `short_url` tied to the transaction amount and currency, embeds it in the message copy, and provides a direct 1-click payment experience."

### Q3: "What happens to payments that fail during quiet hours (e.g. 11 PM)?"
> **Answer:** "Instead of waking up the customer, the agent tags the transaction as `DEFERRED` and calculates the delay until quiet hours end (9 AM). Our background **Deferred Queue Worker** periodically scans for pending deferred cases and re-evaluates them once the permissible messaging window opens."

### Q4: "How do you prove that this is better than what merchants already have?"
> **Answer:** "Merchants rarely have a benchmark. Our system runs a parallel **Naive Baseline simulator** side-by-side with every batch. It proves that root-cause awareness and smart retry timing yields a **+80% to +120% Net Recovery Uplift** over blind retries."
