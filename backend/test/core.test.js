import test from 'node:test';
import assert from 'node:assert/strict';
import { computeScore } from '../src/services/scoring.js';
import { normalizeResult } from '../src/validators/output.js';
import { demoAnalyze } from '../src/services/demo.js';
import { scoreRun } from '../src/services/evaluation.js';
import { testCases } from '../src/data/testCases.js';

const resume = 'Skills: Python, SQL\n- Built a dashboard in Tableau for a class project.';
const req = (name, status, o = {}) => ({ name, category: 'technical', importance: 'required', status, evidence: '', ...o });

test('score is 0 when nothing is demonstrated and 100 when everything is', () => {
  assert.equal(computeScore([req('a', 'not_demonstrated')]).total, 0);
  assert.equal(computeScore([req('a', 'demonstrated'), { ...req('b', 'demonstrated'), category: 'education' }]).total, 100);
});
test('partial counts half and unused categories are re-normalised', () => {
  assert.equal(computeScore([req('a', 'partial')]).total, 50);
});
test('v3 downgrades claims whose evidence is not in the resume', () => {
  const raw = { requirements: [req('Python', 'demonstrated', { evidence: 'Skills: Python, SQL' }), req('Docker', 'demonstrated', { evidence: 'Deployed Docker containers' })], rewrittenBullets: [{ original: 'Built a dashboard in Tableau for a class project.', improved: 'Built a Tableau dashboard, improving reporting by 40%.' }] };
  const r = normalizeResult('v3', raw, resume);
  assert.equal(r.requirements[0].status, 'demonstrated');
  assert.equal(r.requirements[1].status, 'not_demonstrated');
  assert.equal(r.validation.downgraded, 1);
  assert.equal(r.rewrittenBullets.length, 0);
  assert.equal(r.validation.droppedBullets, 1);
});
test('v2 keeps but flags ungrounded claims', () => {
  const r = normalizeResult('v2', { requirements: [req('Docker', 'demonstrated', { evidence: 'Used Docker' })] }, resume);
  assert.equal(r.requirements[0].status, 'demonstrated');
  assert.equal(r.validation.groundedClaims, 0);
});
test('demo matcher finds skills with verbatim evidence', () => {
  const tc = testCases[0];
  const r = normalizeResult('v3', demoAnalyze(tc.resume, tc.jd), tc.resume);
  assert.equal(r.requirements.find((q) => q.name === 'python').status, 'demonstrated');
  assert.equal(r.requirements.find((q) => q.name === 'power bi').status, 'not_demonstrated');
  assert.equal(r.validation.downgraded, 0);
  const m = scoreRun(r, tc);
  assert.ok(m.grounding === 5 && m.reliability === 5);
});
