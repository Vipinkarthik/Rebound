/**
 * LLM Client Service
 * Wrapper supporting Anthropic API (@anthropic-ai/sdk) or Google Gemini API (@google/genai).
 * Configured via LLM_PROVIDER ('anthropic' | 'gemini'). Default: 'anthropic'.
 * Safely falls back if API keys are absent or requests time out (10s limit).
 */

async function callLLM(systemPrompt, userPrompt) {
  const provider = (process.env.LLM_PROVIDER || "anthropic").toLowerCase();
  const timeoutMs = 10000;

  try {
    if (provider === "anthropic" && process.env.ANTHROPIC_API_KEY) {
      const Anthropic = require("@anthropic-ai/sdk");
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

      const responsePromise = anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }]
      });

      const response = await promiseWithTimeout(responsePromise, timeoutMs);
      if (response && response.content && response.content[0]) {
        return response.content[0].text.trim();
      }
    } else if (provider === "gemini" && process.env.GEMINI_API_KEY) {
      const { GoogleGenAI } = require("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const responsePromise = ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `${systemPrompt}\n\nUser Input: ${userPrompt}`
      });

      const response = await promiseWithTimeout(responsePromise, timeoutMs);
      if (response && response.text) {
        return response.text.trim();
      }
    }
  } catch (err) {
    console.warn(`[LLM Client Warning - ${provider}]:`, err.message);
  }

  return null; // Return null so callers can apply clean deterministic fallbacks
}

function promiseWithTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error("LLM request timed out after 10s")), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

module.exports = { callLLM };
