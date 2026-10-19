const { processDeferredCases } = require("../services/deferredQueueWorker");

async function triggerProcessDeferred(req, res, next) {
  try {
    const result = await processDeferredCases();
    res.json({
      status: "success",
      timestamp: new Date().toISOString(),
      ...result
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  triggerProcessDeferred
};
