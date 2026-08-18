const axios = require('axios');

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Free-tier keys hit per-minute request caps constantly; that is a wait, not a failure. */
const isRetryable = (status, message = '') =>
  status === 429 ||
  status === 500 ||
  status === 503 ||
  /quota|rate limit|overloaded|try again|unavailable/i.test(message);

/** Google tells us how long to wait ("Please retry in 7.7s") — honour it when present. */
function retryDelayMs(err, attempt) {
  const details = err.response?.data?.error?.details || [];
  const info = details.find((d) => typeof d.retryDelay === 'string');
  if (info) {
    const seconds = parseFloat(info.retryDelay);
    if (!Number.isNaN(seconds)) return Math.min(seconds * 1000 + 400, 12000);
  }
  const message = err.response?.data?.error?.message || '';
  const match = message.match(/retry in ([\d.]+)s/i);
  if (match) return Math.min(parseFloat(match[1]) * 1000 + 400, 12000);
  return Math.min(1200 * 2 ** attempt, 8000); // exponential backoff
}

/**
 * Calls the Gemini generateContent REST endpoint directly with axios
 * (no extra SDK dependency needed).
 *
 * @param {string} systemPrompt  instructions sent as systemInstruction
 * @param {Array}  messages      conversation so far: [{ role: 'user'|'model', text }]
 *                               The last entry must be the current user question.
 * @param {number} temperature   higher = more varied phrasing between questions
 */
async function askGemini({ systemPrompt, messages, temperature = 0.75, maxOutputTokens = 900 }) {
  const rawKeys = process.env.GEMINI_API_KEY || '';
  const apiKeys = rawKeys.split(',').map((k) => k.trim()).filter(Boolean);

  if (apiKeys.length === 0) {
    throw new Error(
      'GEMINI_API_KEY is missing. Add it to backend/.env (get a free key at https://aistudio.google.com/app/apikey)'
    );
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('askGemini requires a non-empty messages array');
  }

  const primaryModel = process.env.GEMINI_MODEL || 'gemini-flash-latest';
  // Only models that currently exist — a dead model burns a round trip on every
  // request. The "lite" models come next on purpose: they carry their own,
  // larger free-tier allowance, so when the flagship daily quota runs out the
  // advisor keeps giving real answers instead of dropping to the offline engine.
  const fallbackModels = (process.env.GEMINI_FALLBACK_MODELS || '')
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean);

  const uniqueModels = [
    ...new Set([
      primaryModel,
      ...fallbackModels,
      'gemini-flash-latest',
      'gemini-flash-lite-latest',
      'gemini-3.1-flash-lite',
    ]),
  ];

  const contents = messages.map((m) => ({
    role: m.role === 'model' ? 'model' : 'user',
    parts: [{ text: m.text }],
  }));

  const body = {
    contents,
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      temperature,
      topP: 0.95,
      maxOutputTokens,
    },
  };

  const timeout = Number(process.env.GEMINI_TIMEOUT_MS) || 20000;
  const maxAttempts = Number(process.env.GEMINI_MAX_RETRIES) || 3;

  // A farmer is waiting on this reply. Retrying is worth it for a short
  // per-minute rate limit, but when the daily quota is gone the delays keep
  // growing — past this budget we stop and let the caller fall back.
  const retryBudgetMs = Number(process.env.GEMINI_RETRY_BUDGET_MS) || 12000;
  const deadline = Date.now() + retryBudgetMs;
  let lastError = null;

  for (const apiKey of apiKeys) {
    for (const model of uniqueModels) {
      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        try {
          const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${apiKey}`;
          const { data } = await axios.post(url, body, {
            headers: { 'Content-Type': 'application/json' },
            timeout,
          });

          const candidate = data?.candidates?.[0];
          const text = candidate?.content?.parts?.map((p) => p.text).filter(Boolean).join('\n') || '';

          if (text.trim()) return { text: text.trim(), model };

          // Empty body with a stop reason (usually a safety block) will not fix
          // itself on retry — move on to the next model.
          lastError = new Error(
            `Gemini returned no text (finishReason: ${candidate?.finishReason || 'unknown'})`
          );
          break;
        } catch (err) {
          const status = err.response?.status;
          const errorMsg = err.response?.data?.error?.message || err.message;
          lastError = new Error(`Gemini API error (${model}): ${errorMsg}`);

          if (isRetryable(status, errorMsg) && attempt < maxAttempts - 1) {
            const wait = retryDelayMs(err, attempt);
            if (Date.now() + wait <= deadline) {
              console.warn(`Gemini "${model}" busy (${status || 'network'}), retrying in ${wait}ms`);
              await sleep(wait);
              continue; // same model, try again
            }
            console.warn(`Gemini "${model}" busy (${status || 'network'}) and retry budget spent`);
          }

          console.warn(`Gemini model "${model}" failed:`, errorMsg);
          break; // move to the next model
        }
      }
    }
  }

  throw lastError || new Error('Failed to generate response from Gemini API');
}

module.exports = { askGemini };
