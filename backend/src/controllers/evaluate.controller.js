import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { asyncHandler, AppError } from '../utils/errors.js';
import { runEvaluation } from '../services/evaluation.js';
import { resolveProvider } from '../services/ai.js';
import { demoEvaluation } from '../data/demoEvaluation.js';
import { testCases } from '../data/testCases.js';
import { PROMPTS } from '../prompts/index.js';

export const RESULTS_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), '../data/evaluation-results.json');
let job = { status: 'idle', progress: { done: 0, total: 15 }, error: null };

const latest = () => { try { return JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf8')); } catch { return null; } };

export const startEvaluation = asyncHandler(async (req, res) => {
  const provider = resolveProvider(req.body?.provider || 'auto');
  if (!provider) throw new AppError(400, 'No AI API key is configured, so a real evaluation cannot run. Showing illustrative demo data only.');
  if (job.status === 'running') return res.status(202).json(job);
  job = { status: 'running', progress: { done: 0, total: testCases.length * 3 }, error: null };
  runEvaluation({ provider, onProgress: (p) => { job.progress = p; } })
    .then((r) => { fs.writeFileSync(RESULTS_FILE, JSON.stringify(r, null, 2)); job.status = 'done'; })
    .catch((e) => { job.status = 'error'; job.error = e.message; });
  res.status(202).json(job);
});

export const getEvaluation = (req, res) => {
  res.json({ job, evaluation: latest() || demoEvaluation, cases: testCases.map(({ id, title, expected }) => ({ id, title, expected })) });
};

export const getPrompts = (req, res) => res.json(Object.values(PROMPTS));
