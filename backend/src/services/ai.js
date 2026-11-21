import { config } from '../config.js';
import { AppError } from '../utils/errors.js';

export const providerStatus = () => ({ gemini: !!config.geminiKey, openai: !!config.openaiKey });

export function resolveProvider(requested) {
  const s = providerStatus();
  if (requested === 'auto') return s.gemini ? 'gemini' : s.openai ? 'openai' : null;
  if (!s[requested]) throw new AppError(400, `${requested === 'gemini' ? 'Gemini' : 'OpenAI'} is not configured on the server. Choose another model or add the API key.`);
  return requested;
}

async function post(url, headers, body, timeoutMs = config.aiTimeoutMs) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body), signal: ctrl.signal });
    if (!res.ok) {
      const code = res.status;
      const errBody = await res.text().catch(() => '');
      console.error(`[ai] ${url.split('?')[0]} -> ${code}: ${errBody.slice(0, 500)}`);
      const e = new AppError(code === 429 ? 429 : 502, code === 429 ? 'The AI provider is rate-limiting requests. Try again in a minute.' : code === 401 || code === 403 ? 'The AI provider rejected the server API key.' : `The AI provider returned an error (${code}).`);
      e.providerStatus = code;
      throw e;
    }
    return await res.json();
  } catch (e) {
    if (e.name === 'AbortError') { const t = new AppError(504, 'The AI provider took too long to respond. Please try again.'); t.providerStatus = 504; throw t; }
    if (e instanceof AppError) throw e;
    throw new AppError(502, 'Could not reach the AI provider.');
  } finally { clearTimeout(timer); }
}

export function parseJson(text) {
  const t = String(text || '').replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  try { return JSON.parse(t); } catch { /* try extracting object */ }
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a >= 0 && b > a) { try { return JSON.parse(t.slice(a, b + 1)); } catch { /* fallthrough */ } }
  throw new AppError(502, 'The AI returned an unreadable response. Please try again.');
}

const BAD = /tts|image|live|audio|embed|vision|robotics|computer|thinking-exp|preview-\d|customtools|deep-research|nano|banana|lite-preview/i;
let workingGemini = null;

async function geminiCandidates() {
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200', { headers: { 'x-goog-api-key': config.geminiKey } }).catch(() => null);
  if (!res || !res.ok) return [];
  const { models = [] } = await res.json();
  const names = models
    .filter((m) => (m.supportedGenerationMethods || []).includes('generateContent'))
    .map((m) => m.name.replace(/^models\//, ''))
    .filter((n) => /^gemini-/.test(n) && !BAD.test(n));
  const rank = (n) => (/flash/.test(n) && !/lite/.test(n) ? 0 : /flash-lite/.test(n) ? 1 : 2);
  // flash first, then newest version number first
  const ver = (n) => parseFloat((n.match(/gemini-(\d+(?:\.\d+)?)/) || [0, 0])[1]);
  const sorted = names.sort((a, b) => rank(a) - rank(b) || ver(b) - ver(a));
  // interleave: busiest full Flash models are often overloaded, so also try the lighter flash-lite ones early
  const full = sorted.filter((n) => rank(n) === 0), lite = sorted.filter((n) => rank(n) === 1), rest = sorted.filter((n) => rank(n) > 1);
  const out = [];
  for (let i = 0; i < Math.max(full.length, lite.length); i++) { if (lite[i]) out.push(lite[i]); if (full[i]) out.push(full[i]); }
  return [...out, ...rest];
}

async function geminiCall(model, system, user) {
  const data = await post(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, { 'x-goog-api-key': config.geminiKey }, {
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: 'user', parts: [{ text: user }] }],
    generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
  }, Math.min(config.aiTimeoutMs, 30000));
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
  return { text, model };
}

const RETRYABLE = new Set([404, 429, 500, 502, 503, 504]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Try one Gemini model; on a temporary overload (503/500) wait and retry the same model.
async function geminiWithRetry(model, system, user) {
  const waits = [0, 1500];
  let last;
  for (const w of waits) {
    if (w) await sleep(w);
    try { return await geminiCall(model, system, user); } catch (e) {
      last = e;
      if (![500, 503].includes(e.providerStatus)) throw e;
      console.error(`[ai] ${model} is busy (${e.providerStatus}), retrying...`);
    }
  }
  throw last;
}

async function callGemini(system, user) {
  const first = workingGemini || config.geminiModel;
  let lastErr;
  try {
    const out = await geminiWithRetry(first, system, user);
    workingGemini = first;
    return out;
  } catch (e) {
    if (!RETRYABLE.has(e.providerStatus)) throw e;
    lastErr = e;
    console.error(`[ai] Gemini model "${first}" failed (${e.providerStatus}); trying other models your key can use...`);
  }
  const tried = new Set([first]);
  for (const m of (await geminiCandidates()).slice(0, 5)) {
    if (tried.has(m)) continue;
    tried.add(m);
    try {
      const out = await geminiWithRetry(m, system, user);
      workingGemini = m;
      console.error(`[ai] Using Gemini model "${m}". Set GEMINI_MODEL=${m} in .env to skip this lookup.`);
      return out;
    } catch (err) {
      if (!RETRYABLE.has(err.providerStatus)) throw err;
      lastErr = err;
    }
  }
  const busy = [429, 503, 504].includes(lastErr?.providerStatus);
  throw new AppError(busy ? 503 : 502, busy
    ? 'Gemini is overloaded right now. Please try again in a minute, or choose OpenAI as the AI model.'
    : 'No Gemini model is available for this API key. Create a new key in Google AI Studio, or choose OpenAI as the AI model.');
}

async function callOpenAI(system, user) {
  const data = await post('https://api.openai.com/v1/chat/completions', { Authorization: `Bearer ${config.openaiKey}` }, {
    model: config.openaiModel, temperature: 0.2, response_format: { type: 'json_object' },
    messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
  });
  return { text: data?.choices?.[0]?.message?.content || '', model: config.openaiModel };
}

/** opts.fallback: if Gemini keeps failing and an OpenAI key exists, answer with OpenAI instead. */
export async function callModel(provider, system, user, opts = {}) {
  if (provider === 'openai') return { ...(await callOpenAI(system, user)), provider: 'openai' };
  try {
    return { ...(await callGemini(system, user)), provider: 'gemini' };
  } catch (e) {
    if (!opts.fallback || !config.openaiKey || !(e instanceof AppError) || e.status < 500) throw e;
    console.error(`[ai] Gemini unavailable (${e.message}) -> falling back to OpenAI (${config.openaiModel}).`);
    return { ...(await callOpenAI(system, user)), provider: 'openai' };
  }
}