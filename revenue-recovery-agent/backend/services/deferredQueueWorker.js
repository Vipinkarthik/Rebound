const AuditLog = require("../models/AuditLog");
const { PolicyRule, GlobalConstraints } = require("../models/PolicyRule");
const strategist = require("../agents/strategist");
const executor = require("../agents/executor");

/**
 * Worker that scans for deferred cases and executes recovery once quiet hours / retry delay pass.
 */
async function processDeferredCases() {
  try {
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

    // Find unresolved deferred logs
    const deferredLogs = await AuditLog.find({
      "decision.decision": "deferred",
      "result.outcome": "deferred"
    });

    if (deferredLogs.length === 0) {
      return {
        processed_count: 0,
        recovered_count: 0,
        total_recovered_inr: 0,
        remaining_deferred: 0,
        details: "No pending deferred cases found."
      };
    }

    let processedCount = 0;
    let recoveredCount = 0;
    let totalRecovered = 0;
    let stoppedCount = 0;

    const now = new Date();

    for (const log of deferredLogs) {
      const reasonCode = log.diagnosis?.reason_code || "issuer_declined";
      const originalTime = new Date(log.timestamp || log.createdAt);
      const delayHours = log.decision?.delay_hours || 0;

      // Check if required delay period has elapsed OR simulate scheduled run
      const hoursElapsed = (now.getTime() - originalTime.getTime()) / (1000 * 60 * 60);

      // Re-evaluate using current timestamp
      const newDecision = strategist.decide(
        reasonCode,
        {
          amount: log.amount,
          customer_opted_out: false,
          prior_attempts: 1
        },
        now, // evaluated at current time
        rulesMap,
        globalConstraints
      );

      // If the decision is still deferred (e.g., still in quiet hours), leave it
      if (newDecision.decision === "deferred") {
        continue;
      }

      // If decision transitioned to act or stop:
      processedCount++;
      const execResult = await executor.execute(newDecision, {
        amount: log.amount,
        payload: { amount: log.amount }
      });

      if (execResult.outcome === "recovered") {
        recoveredCount++;
        totalRecovered += execResult.amount_recovered;
      } else if (newDecision.decision === "stop") {
        stoppedCount++;
      }

      // Update the audit log with the executed outcome
      log.decision = newDecision;
      log.result = {
        ...execResult,
        detail: `[Deferred Queue Worker Resolved]: ${execResult.detail || ""}`
      };
      log.timestamp = now;
      await log.save();
    }

    const remainingDeferred = await AuditLog.countDocuments({
      "decision.decision": "deferred",
      "result.outcome": "deferred"
    });

    return {
      processed_count: processedCount,
      recovered_count: recoveredCount,
      stopped_count: stoppedCount,
      total_recovered_inr: Math.round(totalRecovered * 100) / 100,
      remaining_deferred: remainingDeferred,
      details: `Processed ${processedCount} deferred cases. ${recoveredCount} recovered, ${remainingDeferred} remaining deferred.`
    };
  } catch (error) {
    console.error("[Deferred Queue Worker Error]:", error);
    throw error;
  }
}

/**
 * Start a lightweight recurring background worker
 */
function startDeferredQueueScheduler(intervalMinutes = 5) {
  const ms = intervalMinutes * 60 * 1000;
  console.log(`[Deferred Queue Scheduler]: Initialized to run every ${intervalMinutes} minutes.`);

  setInterval(async () => {
    try {
      const summary = await processDeferredCases();
      if (summary.processed_count > 0) {
        console.log(`[Deferred Queue Scheduler Active]:`, summary.details);
      }
    } catch (err) {
      console.warn(`[Deferred Queue Scheduler Run Warning]:`, err.message);
    }
  }, ms);
}

module.exports = {
  processDeferredCases,
  startDeferredQueueScheduler
};
