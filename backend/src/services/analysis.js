import { PROMPTS, buildUser } from '../prompts/index.js';
import { callModel, parseJson, resolveProvider } from './ai.js';
import { demoAnalyze } from './demo.js';
import { normalizeResult } from '../validators/output.js';

/** Runs one analysis. Falls back to a clearly labelled rule-based demo only when no provider is configured. */
export async function runAnalysis({ resume, jobDescription, promptVersion = 'v3', provider = 'auto' }) {
  const resolved = resolveProvider(provider);
  if (!resolved) {
    const result = normalizeResult('v3', demoAnalyze(resume, jobDescription), resume);
    return { mode: 'demo', provider: 'rule-based', model: 'keyword matcher (not AI)', promptVersion: 'n/a', result };
  }
  const { system } = PROMPTS[promptVersion];
  const user = buildUser(resume, jobDescription);
  const opts = { fallback: provider === 'auto' };
  let out = await callModel(resolved, system, user, opts);
  let raw;
  try { raw = parseJson(out.text); } catch { out = await callModel(resolved, system, user, opts); raw = parseJson(out.text); }
  return { mode: 'ai', provider: out.provider, model: out.model, promptVersion, result: normalizeResult(promptVersion, raw, resume) };
}