import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import routes from './routes/index.js';
import { errorHandler } from './utils/errors.js';

const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: (origin, cb) => (!origin || config.corsOrigins.includes(origin) ? cb(null, true) : cb(new Error('Origin not allowed by CORS'))) }));
app.use(express.json({ limit: '100kb' }));
app.use('/api', rateLimit({ windowMs: 15 * 60e3, max: 300, standardHeaders: true, legacyHeaders: false }));
app.use('/api', routes);
app.use((req, res) => res.status(404).json({ error: 'Not found.' }));
app.use(errorHandler);
export default app;
