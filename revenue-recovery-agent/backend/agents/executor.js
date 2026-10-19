/**
 * Executor Agent
 * Executes recovery actions, calls Razorpay for payment links,
 * invokes LLM for personalized outreach, and simulates recovery probability outcomes.
 */

const { callLLM } = require("../services/llmClient");
const { createPaymentLink } = require("../services/razorpayClient");
<<<<<<< HEAD
=======
const { sendOutboundNotification } = require("../services/notificationService");
>>>>>>> ee84457 (The Recovery Agent project is completed end-to-end)

async function execute(decision, event) {
  const amount = event.amount !== undefined ? event.amount : (event.payload ? event.payload.amount : 0);

  if (decision.decision === "stop") {
    return {
      outcome: "not_recovered",
      amount_recovered: 0.0,
      detail: `Stopped — ${decision.why}`
    };
  }

  if (decision.decision === "deferred") {
    return {
      outcome: "deferred",
      amount_recovered: 0.0,
      detail: `Deferred — ${decision.why}, retry in ${decision.delay_hours}h`
    };
  }

  // decision === "act"
  const channel = decision.channel;
  let templateMessage = null;
  let personalizedMessage = null;
  let paymentLink = null;

  if (channel && channel !== "none") {
    // Generate real Razorpay payment link (or fallback)
    paymentLink = await createPaymentLink(amount, "INR", `Recovery for ${decision.reason_code}`);

    if (decision.message_template) {
      const formattedAmount = `₹${Number(amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
      templateMessage = decision.message_template
        .replace("{amount}", formattedAmount)
        .replace("{link}", paymentLink);

      // Generate personalized outreach copy via LLM
      const maxChars = channel === "email" ? 400 : 200;
      const systemPrompt = `You are a polite, empathetic customer support AI for an e-commerce platform. Draft a short, warm, non-pushy ${channel.toUpperCase()} message under ${maxChars} characters to assist a customer whose payment failed due to "${decision.reason_code}". 
Include the amount (${formattedAmount}) and payment link (${paymentLink}). Keep it friendly, clear, and reassuring. Return ONLY the message text without quotes or meta comments.`;

      const userPrompt = `Amount: ${formattedAmount}, Reason: ${decision.reason_code}, Link: ${paymentLink}, Template reference: "${templateMessage}"`;

      personalizedMessage = await callLLM(systemPrompt, userPrompt);
    }
  }

<<<<<<< HEAD
  const prob = decision.recovery_probability !== undefined ? decision.recovery_probability : 0;
  const recovered = Math.random() < prob;

  const finalMessage = personalizedMessage || templateMessage;

=======
  const finalMessage = personalizedMessage || templateMessage;
  let dispatchResult = null;

  if (channel && channel !== "none" && finalMessage) {
    dispatchResult = await sendOutboundNotification({
      channel,
      recipient: event.customer_contact || event.customer_email,
      message: finalMessage,
      paymentLink,
      customerId: event.customer_id
    });
  }

  const prob = decision.recovery_probability !== undefined ? decision.recovery_probability : 0;
  const recovered = Math.random() < prob;

>>>>>>> ee84457 (The Recovery Agent project is completed end-to-end)
  return {
    outcome: recovered ? "recovered" : "attempted_not_recovered",
    amount_recovered: recovered ? amount : 0.0,
    channel_used: channel,
    message_sent: finalMessage,
    template_message: templateMessage,
    personalized_message: personalizedMessage,
    payment_link: paymentLink,
<<<<<<< HEAD
    detail: `Action=${decision.action} via ${channel || "system"}`
=======
    dispatch_status: dispatchResult?.status || "not_applicable",
    dispatch_recipient: dispatchResult?.recipient || null,
    detail: `Action=${decision.action} via ${channel || "system"}${dispatchResult?.status ? ` (${dispatchResult.status})` : ""}`
>>>>>>> ee84457 (The Recovery Agent project is completed end-to-end)
  };
}

module.exports = { execute };
