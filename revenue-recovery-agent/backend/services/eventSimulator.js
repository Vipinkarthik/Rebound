const crypto = require("crypto");

const RAW_ERRORS = {
  insufficient_funds: [
    "Insufficient balance in account",
    "Your account has insufficient funds for this transaction",
    "Transaction declined - low balance",
  ],
  bank_downtime: [
    "Issuing bank server not responding",
    "Payment gateway timeout - bank unreachable",
    "Bank system under maintenance",
  ],
  otp_timeout: [
    "OTP validation timed out",
    "Customer did not complete 3DS/OTP authentication in time",
  ],
  card_expired: [
    "Card has expired",
    "Expiry date on card has passed",
  ],
  invalid_card: [
    "Invalid card number",
    "Card verification failed - invalid CVV",
  ],
  issuer_declined: [
    "Do not honour - declined by issuing bank",
    "Transaction declined by card issuer, no reason provided",
    "Card blocked by issuer",
  ],
};

const BUCKETS = Object.keys(RAW_ERRORS);

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomPriorAttempts() {
  const rand = Math.random() * 100;
  if (rand < 70) return 0;
  if (rand < 88) return 1;
  if (rand < 96) return 2;
  return 3;
}

function generateEvent() {
  const bucket = randomChoice(BUCKETS);
  const rawError = randomChoice(RAW_ERRORS[bucket]);
  const amount = Math.round((199 + Math.random() * (45000 - 199)) * 100) / 100;
  const optedOut = Math.random() < 0.05;
  const priorAttempts = getRandomPriorAttempts();
  const custNum = Math.floor(Math.random() * 120) + 1;
  const customerId = `cust_${String(custNum).padStart(4, "0")}`;

  const minutesAgo = Math.floor(Math.random() * 4320); // within last 3 days
  const createdAt = new Date(Date.now() - minutesAgo * 60 * 1000);

  return {
    event_id: `evt_${crypto.randomBytes(6).toString("hex")}`,
    payment_id: `pay_${crypto.randomBytes(7).toString("hex")}`,
    customer_id: customerId,
    amount: amount,
    currency: "INR",
    raw_error_description: rawError,
    customer_opted_out: optedOut,
    prior_attempts: priorAttempts,
    created_at: createdAt
  };
}

function generateEventsBatch(count = 300) {
  const events = [];
  for (let i = 0; i < count; i++) {
    events.push(generateEvent());
  }
  return events;
}

module.exports = {
  generateEventsBatch
};
