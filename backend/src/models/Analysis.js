import mongoose from 'mongoose';

// Stores only the analysis output, never the resume or job description text.
const schema = new mongoose.Schema({
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 }, // auto-delete after 30 days
  promptVersion: String, provider: String, model: String, jobTitle: String, score: Number,
  result: mongoose.Schema.Types.Mixed,
});
export const Analysis = mongoose.models.Analysis || mongoose.model('Analysis', schema);
