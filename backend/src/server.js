import app from './app.js';
import { config } from './config.js';
import { connectDb } from './services/db.js';

await connectDb();
app.listen(config.port, () => console.log(`[server] RoleFit API on :${config.port}`));
