import fs from 'node:fs';
import '../src/config.js';
import { runEvaluation } from '../src/services/evaluation.js';
import { resolveProvider } from '../src/services/ai.js';
import { RESULTS_FILE } from '../src/controllers/evaluate.controller.js';

const provider = process.argv[2] || 'auto';
if (!resolveProvider(provider)) { console.error('No API key configured. Set GEMINI_API_KEY or OPENAI_API_KEY in backend/.env first.'); process.exit(1); }
const res = await runEvaluation({ provider, onProgress: (p) => console.log(`${p.done}/${p.total}`) });
fs.writeFileSync(RESULTS_FILE, JSON.stringify(res, null, 2));
console.table(res.summary);
console.log('Saved to', RESULTS_FILE);
