/**
 * Razorpay Integration Service
 * Generates test-mode Razorpay Payment Links using official Razorpay Node SDK.
 * Safely falls back to a mock link if API keys are missing or requests fail.
 */

const FALLBACK_LINK = "https://rzp.io/pay/xyz123";

async function createPaymentLink(amount, currency = "INR", description = "Payment Recovery") {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return FALLBACK_LINK;
  }

  try {
    const Razorpay = require("razorpay");
    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });

    const amountInPaise = Math.round(Number(amount) * 100);

    const paymentLink = await instance.paymentLink.create({
      amount: amountInPaise,
      currency: currency,
      accept_partial: false,
      description: description,
      customer: {
        name: "Valued Customer",
        contact: "+919999999999",
        email: "customer@example.com"
      },
      notify: {
        sms: true,
        email: true
      },
      reminder_enable: true
    });

    if (paymentLink && paymentLink.short_url) {
      return paymentLink.short_url;
    }
  } catch (err) {
    console.warn("[Razorpay Integration Warning]:", err.message || err);
  }

  return FALLBACK_LINK;
}

module.exports = { createPaymentLink };
