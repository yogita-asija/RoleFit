import { asyncHandler, AppError } from '../utils/errors.js';
import { validateAnalyzeBody } from '../validators/input.js';
import { runAnalysis } from '../services/analysis.js';
import { extractPdfText } from '../services/pdf.js';
import { dbState } from '../services/db.js';
import { Analysis } from '../models/Analysis.js';

export const analyze = asyncHandler(async (req, res) => {
  const input = validateAnalyzeBody(req.body);
  const out = await runAnalysis(input);
  let saved = false;
  if (input.saveHistory && dbState() === 'connected' && out.mode === 'ai') {
    try {
      await Analysis.create({ promptVersion: out.promptVersion, provider: out.provider, model: out.model, jobTitle: out.result.jobTitle, score: out.result.score.total, result: out.result });
      saved = true;
    } catch { /* history is optional */ }
  }
  res.json({ ...out, saved });
});

export const extractPdf = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError(400, 'Attach a PDF file in the "resume" field.');
  res.json({ text: await extractPdfText(req.file.buffer) });
});
