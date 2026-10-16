/**
 * Serverless API Route for Dawon AI Chatbot (Google Gemini API Proxy)
 * Supports Multi-Key Rotation and Automatic Failover across multiple Gemini accounts.
 */

// In-memory pointer for round-robin key selection across serverless invocations
let currentKeyIndex = 0;

function getApiKeys() {
  const keys = [];

  // 1. Check comma-separated GEMINI_API_KEYS
  if (process.env.GEMINI_API_KEYS) {
    const split = process.env.GEMINI_API_KEYS.split(',').map(k => k.trim()).filter(Boolean);
    keys.push(...split);
  }

  // 2. Check individual GEMINI_API_KEY_1, GEMINI_API_KEY_2, GEMINI_API_KEY_3
  ['GEMINI_API_KEY_1', 'GEMINI_API_KEY_2', 'GEMINI_API_KEY_3', 'GEMINI_API_KEY', 'VITE_GEMINI_API_KEY'].forEach(envName => {
    const val = process.env[envName];
    if (val && typeof val === 'string' && val.trim() && !keys.includes(val.trim())) {
      keys.push(val.trim());
    }
  });

  return keys;
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { prompt, systemInstruction, model = 'gemini-2.5-flash' } = req.body || {};

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'Missing required field: prompt' });
  }

  const keys = getApiKeys();

  if (keys.length === 0) {
    return res.status(503).json({
      error: 'NO_KEY_CONFIGURED',
      message: 'No Google Gemini API key configured on the server. Please set GEMINI_API_KEYS in environment variables.',
      fallbackToLocalEngine: true
    });
  }

  // Attempt requests starting from the current round-robin index, with failover
  const numKeys = keys.length;
  let lastError = null;

  for (let attempt = 0; attempt < numKeys; attempt++) {
    const keyIdx = (currentKeyIndex + attempt) % numKeys;
    const apiKey = keys[keyIdx];

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6500);

      const payload = {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 900
        }
      };

      if (systemInstruction) {
        payload.systemInstruction = {
          parts: [{ text: systemInstruction }]
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Handle Quota Limit (429) or Forbidden (403) by failing over to the next key
      if (response.status === 429 || response.status === 403) {
        const errDetails = await response.text();
        console.warn(`[Dawon Gemini API] Key index ${keyIdx} returned ${response.status}. Failing over to next key. Details:`, errDetails.slice(0, 150));
        lastError = `Key ${keyIdx} limit (${response.status})`;
        continue; // Try next key
      }

      if (!response.ok) {
        const errBody = await response.text();
        console.error(`[Dawon Gemini API] Upstream error from key index ${keyIdx}:`, response.status, errBody.slice(0, 200));
        lastError = `Upstream error ${response.status}`;
        continue;
      }

      const data = await response.json();
      const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!candidateText) {
        lastError = 'Empty response from Gemini';
        continue;
      }

      // Success! Update round-robin pointer for future requests
      currentKeyIndex = (keyIdx + 1) % numKeys;

      return res.status(200).json({
        text: candidateText,
        model,
        keyIndex: keyIdx,
        totalKeysInPool: numKeys
      });

    } catch (err) {
      console.warn(`[Dawon Gemini API] Key index ${keyIdx} network/timeout error:`, err.message);
      lastError = err.message;
    }
  }

  // If all keys in pool failed, notify client to gracefully use built-in transit engine
  return res.status(503).json({
    error: 'ALL_KEYS_EXHAUSTED',
    message: `All ${numKeys} Gemini API keys exhausted or rate-limited.`,
    details: lastError,
    fallbackToLocalEngine: true
  });
}
