const AuditLog = require("../models/AuditLog");

async function getAuditLogs(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const decision = req.query.decision;
    const reasonCode = req.query.reason_code;

    const filter = {};

    if (decision) {
      filter["decision.decision"] = decision;
    }

    if (reasonCode) {
      filter["diagnosis.reason_code"] = reasonCode;
    }

    const total = await AuditLog.countDocuments(filter);
    const pages = Math.ceil(total / limit) || 1;

    const data = await AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Fetch sample stopped cases (up to 6) for StoppedCasesPanel
    const stoppedCases = await AuditLog.find({ "decision.decision": "stop" })
      .sort({ timestamp: -1 })
      .limit(6);

    res.json({
      data,
      stopped_cases: stoppedCases,
      pagination: {
        total,
        page,
        limit,
        pages
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAuditLogs
};
