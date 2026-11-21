import { AppError } from '../utils/errors.js';
import { limits } from '../config.js';

export function validateAnalyzeBody(body = {}) {
  const resume = typeof body.resume === 'string' ? body.resume.trim() : '';
  const jobDescription = typeof body.jobDescription === 'string' ? body.jobDescription.trim() : '';
  const promptVersion = body.promptVersion || 'v3';
  const provider = body.provider || 'auto';
  if (resume.length < limits.resumeMin) throw new AppError(400, `Resume text must be at least ${limits.resumeMin} characters.`);
  if (resume.length > limits.resumeMax) throw new AppError(400, `Resume text must be under ${limits.resumeMax} characters.`);
  if (jobDescription.length < limits.jdMin) throw new AppError(400, `Job description must be at least ${limits.jdMin} characters.`);
  if (jobDescription.length > limits.jdMax) throw new AppError(400, `Job description must be under ${limits.jdMax} characters.`);
  if (!['v1', 'v2', 'v3'].includes(promptVersion)) throw new AppError(400, 'promptVersion must be v1, v2 or v3.');
  if (!['auto', 'gemini', 'openai'].includes(provider)) throw new AppError(400, 'provider must be auto, gemini or openai.');
  return { resume, jobDescription, promptVersion, provider, saveHistory: body.saveHistory === true };
}
