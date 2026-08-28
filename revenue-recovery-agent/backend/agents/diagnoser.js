/**
 * Diagnoser Agent
 * Classifies raw gateway error descriptions into structured reason codes.
 * Uses fast keyword matching first; falls back to LLM for low-confidence/unseen error strings.
 */

const { callLLM } = require("../services/llmClient");

const KEYWORD_RULES = [
  { keywords: ["insufficient", "low balance", "no funds"], reason_code: "insufficient_funds" },
  { keywords: ["bank server", "not responding", "timeout", "unreachable", "maintenance"], reason_code: "bank_downtime" },
  { keywords: ["otp", "3ds", "authentication"], reason_code: "otp_timeout" },
  { keywords: ["expired", "expiry date"], reason_code: "card_expired" },
  { keywords: ["invalid card", "invalid cvv", "verification failed"], reason_code: "invalid_card" },
  { keywords: ["do not honour", "declined by issuing bank", "declined by card issuer", "blocked by issuer"], reason_code: "issuer_declined" },
];

const VALID_REASON_CODES = [
  "insufficient_funds",
  "bank_downtime",
  "otp_timeout",
  "card_expired",
  "invalid_card",
  "issuer_declined"
];

const DEFAULT_REASON = "issuer_declined";

async function diagnose(rawErrorDescription) {
  if (!rawErrorDescription) {
    return {
      reason_code: DEFAULT_REASON,
      confidence: 0.3,
      matched_rule: null,
      diagnosed_by: "keyword"
    };
  }

  const text = rawErrorDescription.toLowerCase();

  for (const rule of KEYWORD_RULES) {
    for (const kw of rule.keywords) {
      if (text.includes(kw)) {
        return {
          reason_code: rule.reason_code,
          confidence: 0.9,
          matched_rule: kw,
          diagnosed_by: "keyword"
        };
      }
    }
  }

  // Keyword match failed (confidence < 0.5) — invoke LLM classification
  const systemPrompt = `You are a financial payment gateway error classification AI. Classify the user's raw error description into EXACTLY ONE of these six valid reason_codes:
- insufficient_funds
- bank_downtime
- otp_timeout
- card_expired
- invalid_card
- issuer_declined

Respond with ONLY the exact reason_code string and nothing else. No punctuation, no markdown formatting.`;

  const llmResult = await callLLM(systemPrompt, rawErrorDescription);
  if (llmResult) {
    const cleaned = llmResult.toLowerCase().trim();
    if (VALID_REASON_CODES.includes(cleaned)) {
      return {
        reason_code: cleaned,
        confidence: 0.95,
        matched_rule: "llm_classification",
        diagnosed_by: "llm"
      };
    }
  }

  return {
    reason_code: DEFAULT_REASON,
    confidence: 0.3,
    matched_rule: null,
    diagnosed_by: "keyword"
  };
}

module.exports = { diagnose };
