export const norm = (s = '') =>
  String(s).toLowerCase().replace(/[^\p{L}\p{N}%+#.\s]/gu, ' ').replace(/\s+/g, ' ').trim();
export const includesNorm = (hay, needle) => {
  const n = norm(needle);
  return n.length >= 4 && norm(hay).includes(n);
};
export const numbersIn = (s = '') => (String(s).match(/\d+(?:[.,]\d+)*/g) || []).map((n) => n.replace(/,/g, ''));
export const str = (v, max = 400) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
export const arr = (v) => (Array.isArray(v) ? v : []);
