const { computeSummaryFromAuditLogs } = require("./simulationController");

async function getSummary(req, res, next) {
  try {
    const summary = await computeSummaryFromAuditLogs();
    res.json(summary);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSummary
};
