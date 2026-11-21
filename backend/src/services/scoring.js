export const CATEGORY_WEIGHTS = { technical: 40, projects: 30, experience: 20, education: 10 };
const CREDIT = { demonstrated: 1, partial: 0.5, not_demonstrated: 0 };
const IMPORTANCE = { required: 2, preferred: 1 };

/** Transparent rubric: per-category credit, re-normalised over categories that have requirements. */
export function computeScore(requirements) {
  const breakdown = Object.entries(CATEGORY_WEIGHTS).map(([category, weight]) => {
    const items = requirements.filter((r) => r.category === category);
    const possible = items.reduce((s, r) => s + IMPORTANCE[r.importance], 0);
    const earned = items.reduce((s, r) => s + IMPORTANCE[r.importance] * CREDIT[r.status], 0);
    return { category, weight, applicable: items.length > 0, requirements: items.length, earned, possible, pct: possible ? earned / possible : 0 };
  });
  const applicableWeight = breakdown.filter((b) => b.applicable).reduce((s, b) => s + b.weight, 0);
  breakdown.forEach((b) => {
    b.effectiveWeight = b.applicable && applicableWeight ? +((b.weight / applicableWeight) * 100).toFixed(1) : 0;
    b.points = +((b.effectiveWeight * b.pct)).toFixed(1);
  });
  const total = Math.round(breakdown.reduce((s, b) => s + b.points, 0));
  return { total, breakdown };
}
