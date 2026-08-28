const AuditLog = require("../models/AuditLog");
const { callLLM } = require("../services/llmClient");

async function explainDecision(req, res, next) {
  try {
    const { auditLogId } = req.params;

    const log = await AuditLog.findById(auditLogId);
    if (!log) {
      return res.status(404).json({ error: "Audit log entry not found" });
    }

    const decisionType = log.decision ? log.decision.decision : "act";
    const why = log.decision ? log.decision.why : "policy_match";
    const reasonCode = log.diagnosis ? log.diagnosis.reason_code : "unknown";
    const rawError = log.raw_error || "";
    const amount = log.amount || 0;

    const systemPrompt = `You are a financial compliance and customer support AI assistant. Explain in 2-3 plain-English, easy-to-understand sentences why the automated payment recovery agent made its decision for a non-technical reader (like a customer support representative or auditor). 
Explicitly cite any compliance constraints (like Quiet Hours 9PM-9AM, Customer Opt-Out, or Max Contact Attempt caps) if the decision was 'stop' or 'deferred'. Be concise and professional.`;

    const userPrompt = `Transaction Amount: ₹${amount}
Raw Gateway Error: "${rawError}"
Diagnosed Reason Code: ${reasonCode}
Agent Decision: ${decisionType.toUpperCase()}
Decision Rationale (why): ${why}
Execution Result: ${log.result ? log.result.detail : ""}`;

    const llmExplanation = await callLLM(systemPrompt, userPrompt);

    if (llmExplanation) {
      return res.json({
        audit_id: auditLogId,
        explanation: llmExplanation,
        generated_by: "llm"
      });
    }

    // Deterministic fallback explanation generator
    let fallbackText = "";
    if (decisionType === "stop") {
      if (why === "customer_opted_out") {
        fallbackText = `The agent halted recovery because the customer explicitly opted out of communications, enforcing privacy compliance regulations (TCPA/DNC).`;
      } else if (why === "global_max_attempts_reached") {
        fallbackText = `The agent stopped outreach because the global limit of 3 contact attempts across case history was reached, protecting the customer from excessive messaging.`;
      } else if (why === "reason_specific_max_attempts_reached") {
        fallbackText = `The agent stopped recovery outreach after hitting the maximum allowed retry attempts configured for '${reasonCode}' failures.`;
      } else {
        fallbackText = `The agent stopped recovery for this transaction to enforce safety and compliance policy constraints (${why}).`;
      }
    } else if (decisionType === "deferred") {
      fallbackText = `The agent deferred customer outreach because the transaction occurred during quiet hours (9 PM to 9 AM). Recovery messaging will resume when quiet hours end to ensure compliant messaging windows.`;
    } else {
      fallbackText = `The agent identified the root cause as '${reasonCode}' from the error '${rawError}' and initiated a compliant recovery action (${log.decision?.action}) via ${log.decision?.channel || 'system'}.`;
    }

    res.json({
      audit_id: auditLogId,
      explanation: fallbackText,
      generated_by: "rule_fallback"
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { explainDecision };
