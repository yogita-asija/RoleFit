import { Router } from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { limits } from '../config.js';
import { AppError } from '../utils/errors.js';
import { analyze, extractPdf } from '../controllers/analyze.controller.js';
import { startEvaluation, getEvaluation, getPrompts } from '../controllers/evaluate.controller.js';
import { health, history } from '../controllers/misc.controller.js';

const upload = multer({
  storage: multer.memoryStorage(), limits: { fileSize: limits.pdfBytes, files: 1 },
  fileFilter: (req, file, cb) => (file.mimetype === 'application/pdf' ? cb(null, true) : cb(new AppError(400, 'Only PDF files are accepted.'))),
});
const limiter = (max, windowMs, message) => rateLimit({ windowMs, max, standardHeaders: true, legacyHeaders: false, message: { error: message } });

const r = Router();
r.get('/health', health);
r.get('/prompts', getPrompts);
r.post('/analyze', limiter(15, 15 * 60e3, 'Too many analyses. Please wait a few minutes.'), analyze);
r.post('/extract-pdf', limiter(20, 15 * 60e3, 'Too many uploads. Please wait a few minutes.'), upload.single('resume'), extractPdf);
r.get('/history', history);
r.get('/evaluate', getEvaluation);
r.post('/evaluate', limiter(2, 60 * 60e3, 'Evaluation can be started twice per hour.'), startEvaluation);
export default r;
