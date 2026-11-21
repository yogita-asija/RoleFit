import pdf from 'pdf-parse/lib/pdf-parse.js';
import { AppError } from '../utils/errors.js';

export async function extractPdfText(buffer) {
  if (!buffer || buffer.subarray(0, 5).toString('latin1') !== '%PDF-') throw new AppError(400, 'The file is not a valid PDF.');
  let data;
  const parse = () => Promise.race([pdf(buffer, { max: 10 }), new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 15000))]);
  try {
    for (let i = 0; i < 3 && !data; i++) { try { data = await parse(); } catch (e) { if (i === 2) throw e; await new Promise((r) => setTimeout(r, 300)); } } // pdf-parse 1.1.1 can fail on its very first call; one retry is reliable
  } catch { throw new AppError(422, 'This PDF could not be read. Try exporting it again or paste the text instead.'); }
  const text = (data.text || '').replace(/\u0000/g, '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  if (text.length < 50) throw new AppError(422, 'No selectable text found. Scanned PDFs are not supported; paste the text instead.');
  return text.slice(0, 15000);
}
