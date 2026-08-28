const { PolicyRule, GlobalConstraints } = require("../models/PolicyRule");

async function getPolicy(req, res, next) {
  try {
    const rules = await PolicyRule.find({}).sort({ reason_code: 1 });
    let globalConstraints = await GlobalConstraints.findOne({});
    if (!globalConstraints) {
      globalConstraints = await GlobalConstraints.create({
        quiet_hours_start: 21,
        quiet_hours_end: 9,
        max_total_contact_attempts: 3,
        respect_opt_out: true,
        stop_after_days_open: 5
      });
    }

    res.json({
      rules,
      global_constraints: globalConstraints
    });
  } catch (error) {
    next(error);
  }
}

async function updatePolicyRule(req, res, next) {
  try {
    const { reason_code } = req.params;
    const {
      action,
      retry_delay_hours,
      max_attempts,
      channel,
      message_template,
      recovery_probability
    } = req.body;

    const updateFields = {};
    if (action !== undefined) updateFields.action = action;
    if (retry_delay_hours !== undefined) updateFields.retry_delay_hours = Number(retry_delay_hours);
    if (max_attempts !== undefined) updateFields.max_attempts = Number(max_attempts);
    if (channel !== undefined) updateFields.channel = channel;
    if (message_template !== undefined) updateFields.message_template = message_template;
    if (recovery_probability !== undefined) updateFields.recovery_probability = Number(recovery_probability);

    const updatedRule = await PolicyRule.findOneAndUpdate(
      { reason_code },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedRule) {
      return res.status(404).json({ error: `Policy rule for '${reason_code}' not found` });
    }

    res.json(updatedRule);
  } catch (error) {
    next(error);
  }
}

async function updateGlobalConstraints(req, res, next) {
  try {
    const {
      quiet_hours_start,
      quiet_hours_end,
      max_total_contact_attempts,
      respect_opt_out,
      stop_after_days_open
    } = req.body;

    const updateFields = {};
    if (quiet_hours_start !== undefined) updateFields.quiet_hours_start = Number(quiet_hours_start);
    if (quiet_hours_end !== undefined) updateFields.quiet_hours_end = Number(quiet_hours_end);
    if (max_total_contact_attempts !== undefined) updateFields.max_total_contact_attempts = Number(max_total_contact_attempts);
    if (respect_opt_out !== undefined) updateFields.respect_opt_out = Boolean(respect_opt_out);
    if (stop_after_days_open !== undefined) updateFields.stop_after_days_open = Number(stop_after_days_open);

    let updatedConstraints = await GlobalConstraints.findOneAndUpdate(
      {},
      { $set: updateFields },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(updatedConstraints);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPolicy,
  updatePolicyRule,
  updateGlobalConstraints
};
