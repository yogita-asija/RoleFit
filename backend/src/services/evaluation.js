import { runAnalysis } from './analysis.js';
import { testCases } from '../data/testCases.js';
import { includesNorm, norm } from '../utils/text.js';

export const CRITERIA = ['relevance', 'accuracy', 'grounding', 'completeness', 'reliability'];
const to5 = (frac) => +(1 + 4 * Math.max(0, Math.min(1, frac))).toFixed(2);
const findReq = (reqs, kw) => reqs.find((q) => norm(q.name).includes(norm(kw)));

/** Automatic, reproducible 1-5 metrics computed from the structured output and the known test-case expectations. */
export function scoreRun(result, tc) {
  const reqs = result.requirements;
  const exp = [...tc.expected.demonstrated.map((k) => [k, true]), ...tc.expected.gaps.map((k) => [k, false])];
  const found = exp.filter(([k]) => findReq(reqs, k));
  const correct = exp.filter(([k, shouldMatch]) => {
    const q = findReq(reqs, k);
    return q && (shouldMatch ? q.status !== 'not_demonstrated' : q.status === 'not_demonstrated');
  });
  const falseClaims = tc.expected.gaps.filter((k) => { const q = findReq(reqs, k); return q && q.status === 'demonstrated'; }).length;
  const claims = reqs.filter((q) => q.status !== 'not_demonstrated');
  const grounded = claims.filter((q) => includesNorm(tc.resume, q.evidence)).length;
  const bullets = result.rewrittenBullets;
  const ungroundedBullets = bullets.filter((b) => !includesNorm(tc.resume, b.original)).length;
  const inventedNumbers = bullets.filter((b) => b.inventedNumbers.length).length;
  const checks = [reqs.length >= 5, result.recommendations.length === 3, bullets.length >= 1, Number.isFinite(result.score.total) && result.score.total > 0, !!result.explanation.summary, reqs.some((q) => q.status === 'not_demonstrated')];
  return {
    relevance: to5(found.length / exp.length),
    accuracy: to5(correct.length / exp.length),
    grounding: to5(claims.length ? grounded / claims.length : 0),
    completeness: to5(checks.filter(Boolean).length / checks.length),
    reliability: Math.max(1, +(5 - 2 * falseClaims - 2 * inventedNumbers - ungroundedBullets).toFixed(2)),
    details: { falseClaims, ungroundedBullets, inventedNumbers, downgraded: result.validation.downgraded },
  };
}

export async function runEvaluation({ provider = 'auto', onProgress = () => {} } = {}) {
  const runs = []; let model = '', usedProvider = '';
  const total = testCases.length * 3;
  for (const tc of testCases) {
    for (const version of ['v1', 'v2', 'v3']) {
      try {
        const out = await runAnalysis({ resume: tc.resume, jobDescription: tc.jd, promptVersion: version, provider });
        if (out.mode !== 'ai') throw new Error('No AI provider configured.');
        model = out.model; usedProvider = out.provider;
        runs.push({ caseId: tc.id, version, metrics: scoreRun(out.result, tc), result: out.result, error: null });
      } catch (e) { runs.push({ caseId: tc.id, version, metrics: null, result: null, error: e.message }); }
      onProgress({ done: runs.length, total });
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  const summary = {};
  for (const v of ['v1', 'v2', 'v3']) {
    const ok = runs.filter((r) => r.version === v && r.metrics);
    summary[v] = { runs: ok.length, failures: runs.filter((r) => r.version === v).length - ok.length };
    for (const c of CRITERIA) summary[v][c] = ok.length ? +(ok.reduce((s, r) => s + r.metrics[c], 0) / ok.length).toFixed(2) : null;
    summary[v].overall = ok.length ? +(CRITERIA.reduce((s, c) => s + summary[v][c], 0) / CRITERIA.length).toFixed(2) : null;
  }
  return { mode: 'real', provider: usedProvider, model, generatedAt: new Date().toISOString(), criteria: CRITERIA, summary, runs };
}
