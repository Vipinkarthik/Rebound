const Event = require("../models/Event");
const AuditLog = require("../models/AuditLog");
const { PolicyRule, GlobalConstraints } = require("../models/PolicyRule");
const { generateEventsBatch } = require("../services/eventSimulator");
const diagnoser = require("../agents/diagnoser");
const strategist = require("../agents/strategist");
const executor = require("../agents/executor");
const { executeNaiveBaseline } = require("../agents/naiveBaseline");

async function computeSummaryFromAuditLogs(baselineTotalRecoveredOverride = null) {
  const auditLogs = await AuditLog.find({});
  let totalAtRisk = 0;
  let totalRecovered = 0;
  let actedCount = 0;
  let deferredCount = 0;
  let stoppedCount = 0;

  const byReason = {};

  for (const log of auditLogs) {
    const amount = log.amount || 0;
    const reasonCode = log.diagnosis ? log.diagnosis.reason_code : "issuer_declined";
    const recoveredAmount = log.result ? (log.result.amount_recovered || 0) : 0;

    totalAtRisk += amount;
    totalRecovered += recoveredAmount;

    if (!byReason[reasonCode]) {
      byReason[reasonCode] = { count: 0, at_risk: 0, recovered: 0 };
    }
    byReason[reasonCode].count += 1;
    byReason[reasonCode].at_risk += amount;
    byReason[reasonCode].recovered += recoveredAmount;

    const decisionType = log.decision ? log.decision.decision : "act";
    if (decisionType === "stop") {
      stoppedCount += 1;
    } else if (decisionType === "deferred") {
      deferredCount += 1;
    } else {
      actedCount += 1;
    }
  }

  const byReasonFormatted = {};
  for (const [code, val] of Object.entries(byReason)) {
    byReasonFormatted[code] = {
      count: val.count,
      at_risk_inr: Math.round(val.at_risk * 100) / 100,
      recovered_inr: Math.round(val.recovered * 100) / 100,
      recovery_rate_pct: val.at_risk > 0 ? Math.round((val.recovered / val.at_risk) * 10000) / 100 : 0
    };
  }

  const agentSummary = {
    total_events: auditLogs.length,
    total_at_risk_inr: Math.round(totalAtRisk * 100) / 100,
    total_recovered_inr: Math.round(totalRecovered * 100) / 100,
    recovery_rate_pct: totalAtRisk > 0 ? Math.round((totalRecovered / totalAtRisk) * 10000) / 100 : 0,
    cases_acted_on: actedCount,
    cases_deferred_quiet_hours: deferredCount,
    cases_stopped_by_compliance: stoppedCount,
    by_reason_code: byReasonFormatted
  };

  // Estimate baseline summary if not provided (15% flat recovery rate across total_at_risk)
  const baselineRecovered = baselineTotalRecoveredOverride !== null
    ? baselineTotalRecoveredOverride
    : Math.round(totalAtRisk * 0.15 * 100) / 100;

  const baselineSummary = {
    total_events: auditLogs.length,
    total_at_risk_inr: agentSummary.total_at_risk_inr,
    total_recovered_inr: baselineRecovered,
    recovery_rate_pct: agentSummary.total_at_risk_inr > 0 ? Math.round((baselineRecovered / agentSummary.total_at_risk_inr) * 10000) / 100 : 0
  };

  const upliftPct = baselineRecovered > 0
    ? Math.round(((agentSummary.total_recovered_inr - baselineRecovered) / baselineRecovered) * 10000) / 100
    : 0;

  return {
    ...agentSummary,
    agentSummary,
    baselineSummary,
    upliftPct
  };
}

async function runSimulation(req, res, next) {
  try {
    const count = parseInt(req.body.count, 10) || 300;

    // Fetch current policies
    const rulesDocs = await PolicyRule.find({});
    const rulesMap = {};
    for (const r of rulesDocs) {
      rulesMap[r.reason_code] = r.toObject();
    }

    let globalConstraints = await GlobalConstraints.findOne({});
    if (!globalConstraints) {
      globalConstraints = {
        quiet_hours_start: 21,
        quiet_hours_end: 9,
        max_total_contact_attempts: 3,
        respect_opt_out: true,
        stop_after_days_open: 5
      };
    } else {
      globalConstraints = globalConstraints.toObject();
    }

    // Clear previous runs
    await Event.deleteMany({});
    await AuditLog.deleteMany({});

    // Generate batch
    const syntheticEvents = generateEventsBatch(count);
    const savedEvents = await Event.insertMany(syntheticEvents);

    const auditDocs = [];
    let baselineTotalRecovered = 0;

    for (const evt of savedEvents) {
      // 1. Run through Naive Baseline for parallel comparison
      const naiveRes = executeNaiveBaseline(evt);
      baselineTotalRecovered += naiveRes.result.amount_recovered;

      // 2. Run through Intelligent Agent Pipeline
      const diag = await diagnoser.diagnose(evt.raw_error_description);
      const decision = strategist.decide(
        diag.reason_code,
        evt,
        evt.created_at,
        rulesMap,
        globalConstraints
      );
      const result = await executor.execute(decision, evt);

      auditDocs.push({
        event_id: evt.event_id,
        payment_id: evt.payment_id,
        customer_id: evt.customer_id,
        amount: evt.amount,
        raw_error: evt.raw_error_description,
        diagnosis: diag,
        decision: decision,
        result: result,
        timestamp: evt.created_at
      });
    }

    await AuditLog.insertMany(auditDocs);

    const summary = await computeSummaryFromAuditLogs(Math.round(baselineTotalRecovered * 100) / 100);
    res.json(summary);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  runSimulation,
  computeSummaryFromAuditLogs
};
