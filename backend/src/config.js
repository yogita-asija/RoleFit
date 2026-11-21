import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT) || 5000,
  env: process.env.NODE_ENV || 'development',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map((s) => s.trim()).filter(Boolean),
  geminiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
  openaiKey: process.env.OPENAI_API_KEY || '',
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  aiTimeoutMs: Number(process.env.AI_TIMEOUT_MS) || 60000,
  mongoUri: process.env.MONGODB_URI || '',
};

export const limits = { resumeMin: 50, resumeMax: 15000, jdMin: 50, jdMax: 8000, pdfBytes: 5 * 1024 * 1024 };