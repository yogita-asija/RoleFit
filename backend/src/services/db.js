import mongoose from 'mongoose';
import { config } from '../config.js';

mongoose.set('bufferCommands', false);

function hint(e) {
  const m = String(e?.message || e);
  if (/ENOTFOUND|querySrv|ECONNREFUSED.*_mongodb/i.test(m)) return 'DNS lookup failed. Check the cluster address in MONGODB_URI, your internet, or try another network/DNS (8.8.8.8).';
  if (/whitelist|IP|not authorized to connect|Server selection timed out|ReplicaSetNoPrimary/i.test(m)) return 'Atlas is probably blocking your IP. In Atlas: Network Access -> Add IP Address -> "Allow access from anywhere" (0.0.0.0/0), then wait ~1 minute.';
  if (/auth|bad auth|authentication failed/i.test(m)) return 'Wrong username or password in MONGODB_URI (special characters in the password must be URL-encoded).';
  if (/Invalid scheme|Invalid connection string|URI/i.test(m)) return 'MONGODB_URI is malformed. It must be one line: mongodb+srv://USER:PASSWORD@HOST/rolefit?retryWrites=true&w=majority';
  return '';
}

let retryTimer = null;
export async function connectDb() {
  if (!config.mongoUri) return console.log('[db] MONGODB_URI not set: history disabled.');
  try {
    await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 15000 });
    console.log(`[db] connected (database: ${mongoose.connection.name})`);
  } catch (e) {
    console.warn(`[db] connection failed: ${e.message}`);
    const h = hint(e); if (h) console.warn(`[db] hint: ${h}`);
    console.warn('[db] running without history; will retry in 30 s.');
    clearTimeout(retryTimer);
    retryTimer = setTimeout(() => { connectDb(); }, 30000);
    retryTimer.unref?.();
  }
}
export const dbState = () => (!config.mongoUri ? 'not_configured' : mongoose.connection.readyState === 1 ? 'connected' : 'disconnected');