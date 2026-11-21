import { config } from '../config.js';
import { providerStatus } from '../services/ai.js';
import { dbState } from '../services/db.js';
import { Analysis } from '../models/Analysis.js';
import { asyncHandler } from '../utils/errors.js';

export const health = (req, res) => {
  const p = providerStatus();
  res.json({ status: 'ok', uptimeSeconds: Math.round(process.uptime()), config: { gemini: p.gemini, openai: p.openai, database: dbState(), demoMode: !p.gemini && !p.openai, geminiModel: p.gemini ? config.geminiModel : null, openaiModel: p.openai ? config.openaiModel : null } });
};

export const history = asyncHandler(async (req, res) => {
  if (dbState() !== 'connected') return res.json({ available: false, items: [], message: 'History is disabled because MongoDB is not connected.' });
  const items = await Analysis.find().sort({ createdAt: -1 }).limit(30).lean();
  res.json({ available: true, items });
});
