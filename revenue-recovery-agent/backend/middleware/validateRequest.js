const { z } = require("zod");

const simulateSchema = z.object({
  count: z.number().int().positive().max(2000).optional().default(300)
});

function validateSimulateRequest(req, res, next) {
  const result = simulateSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: "Invalid request payload. Count must be a positive integer <= 2000.",
      details: result.error.errors
    });
  }
  req.body.count = result.data.count;
  next();
}

function validatePolicyUpdateRequest(req, res, next) {
  const { max_attempts, retry_delay_hours, recovery_probability } = req.body;
  if (max_attempts !== undefined && (isNaN(Number(max_attempts)) || Number(max_attempts) < 0)) {
    return res.status(400).json({ error: "max_attempts must be a non-negative number" });
  }
  if (retry_delay_hours !== undefined && (isNaN(Number(retry_delay_hours)) || Number(retry_delay_hours) < 0)) {
    return res.status(400).json({ error: "retry_delay_hours must be a non-negative number" });
  }
  if (recovery_probability !== undefined) {
    const prob = Number(recovery_probability);
    if (isNaN(prob) || prob < 0 || prob > 1) {
      return res.status(400).json({ error: "recovery_probability must be a number between 0 and 1" });
    }
  }
  next();
}

module.exports = {
  validateSimulateRequest,
  validatePolicyUpdateRequest
};
