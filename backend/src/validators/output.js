import { arr, str, includesNorm, numbersIn } from '../utils/text.js';
import { computeScore } from '../services/scoring.js';

const CATS = ['technical', 'projects', 'experience', 'education'];
const STATUSES = ['demonstrated', 'partial', 'not_demonstrated'];

export const LIMITATIONS = [
  'The score measures how well this resume text evidences this job description. It is not an employability or hiring prediction.',
  'A gap marked "not evidenced" may be a real skill missing from the text. Add it only if you genuinely have it.',
  'Scanned or image-only resumes, formatting and layout are not assessed.',
  'AI output can contain mistakes. Check every suggestion against your own experience before using it.',
];

const cleanReq = (x) => {
  const status = STATUSES.includes(x?.status) ? x.status : 'not_demonstrated';
  return {
    name: str(x?.name, 120),
    category: CATS.includes(x?.category) ? x.category : 'technical',
    importance: x?.importance === 'preferred' ? 'preferred' : 'required',
    status,
    evidence: str(x?.evidence, 300),
    gapType: status === 'not_demonstrated' ? (x?.gapType === 'not_evidenced' ? 'not_evidenced' : 'absent') : null,
    note: str(x?.note, 300),
  };
};

/** Turns raw model JSON (any prompt version) into one consistent shape. v3 enforces evidence grounding. */
export function normalizeResult(version, raw, resume) {
  const r = raw && typeof raw === 'object' ? raw : {};
  const enforce = version === 'v3';
  let requirements;
  if (version === 'v1') {
    const mk = (n, status) => cleanReq({ name: n, status, gapType: 'absent' });
    requirements = [...arr(r.matchingSkills).map((n) => mk(str(n, 120), 'demonstrated')), ...arr(r.weakOrMissing).map((n) => mk(str(n, 120), 'not_demonstrated'))].filter((x) => x.name);
  } else {
    requirements = arr(r.requirements).slice(0, 20).map(cleanReq).filter((x) => x.name);
  }

  let downgraded = 0;
  if (enforce) {
    requirements = requirements.map((q) => {
      if (q.status !== 'not_demonstrated' && !includesNorm(resume, q.evidence)) {
        downgraded++;
        return { ...q, status: 'not_demonstrated', gapType: 'not_evidenced', note: (q.note + ' Downgraded: the cited evidence could not be verified in the resume.').trim() };
      }
      return q;
    });
  }
  const claims = requirements.filter((q) => q.status !== 'not_demonstrated');
  const groundedClaims = claims.filter((q) => includesNorm(resume, q.evidence)).length;

  const resumeNums = new Set(numbersIn(resume));
  let droppedBullets = 0;
  let bullets = arr(r.rewrittenBullets).slice(0, 3).map((b) => {
    const original = str(b?.original, 500), improved = str(b?.improved, 500);
    return { original, improved, grounded: includesNorm(resume, original), inventedNumbers: numbersIn(improved).filter((n) => !resumeNums.has(n)) };
  }).filter((b) => b.original && b.improved);
  if (enforce) {
    const before = bullets.length;
    bullets = bullets.filter((b) => b.grounded && !b.inventedNumbers.length);
    droppedBullets = before - bullets.length;
  }

  const recommendations = arr(r.recommendations).slice(0, 3).map((x, i) => ({
    priority: i + 1, title: str(x?.title, 150), detail: str(x?.detail, 500), relatedRequirement: str(x?.relatedRequirement, 120),
  })).filter((x) => x.title);

  let score, explanation;
  if (version === 'v1') {
    const t = Number(r.score);
    score = { total: Number.isFinite(t) ? Math.max(0, Math.min(100, Math.round(t))) : 0, method: 'model-estimated', breakdown: null };
    explanation = { summary: str(r.scoreReasons, 800) || 'The baseline prompt gives no rubric; this score is the model\'s own estimate.', positives: [], reducers: [] };
  } else {
    const s = computeScore(requirements);
    score = { total: s.total, method: 'rubric', breakdown: s.breakdown };
    explanation = {
      summary: `Score = weighted share of requirements evidenced (technical 40%, projects 30%, experience 20%, education 10%), re-normalised over categories present in this job description. Demonstrated counts 1, partial 0.5, not demonstrated 0; required items count double.`,
      positives: requirements.filter((q) => q.status === 'demonstrated').map((q) => q.name),
      reducers: requirements.filter((q) => q.status !== 'demonstrated').map((q) => `${q.name} (${q.status === 'partial' ? 'partial' : q.gapType === 'not_evidenced' ? 'not evidenced' : 'absent'})`),
    };
  }

  return {
    jobTitle: str(r.jobTitle, 120), requirements, recommendations, rewrittenBullets: bullets, score, explanation, limitations: LIMITATIONS,
    validation: { enforced: enforce, claims: claims.length, groundedClaims, downgraded, droppedBullets, inventedNumberBullets: bullets.filter((b) => b.inventedNumbers.length).length },
  };
}
