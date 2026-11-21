// DEMO MODE: transparent keyword matcher. This is NOT AI. It only exists so the app is usable without API keys.
const SKILLS = ['python', 'java', 'javascript', 'typescript', 'react', 'node.js', 'express', 'sql', 'mysql', 'postgresql', 'mongodb', 'html', 'css', 'git', 'docker', 'aws', 'azure', 'rest', 'api', 'spring boot', 'c++', 'c#', 'pandas', 'numpy', 'scikit-learn', 'pytorch', 'tensorflow', 'machine learning', 'deep learning', 'nlp', 'tableau', 'power bi', 'excel', 'statistics', 'data analysis', 'linux', 'figma', 'canva', 'seo', 'google analytics', 'content writing', 'social media', 'communication', 'teamwork', 'agile', 'testing', 'jest'];
const segs = (t) => t.split(/\n|(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
const has = (text, term) => new RegExp(`(^|[^a-z0-9])${term.replace(/[.+#*]/g, '\\$&')}($|[^a-z0-9])`, 'i').test(text);

export function demoAnalyze(resume, jd) {
  const lines = segs(resume);
  const find = (re) => lines.find((l) => re.test(l))?.slice(0, 200) || '';
  const requirements = [];
  for (const term of SKILLS) {
    if (!has(jd, term)) continue;
    const ev = lines.find((l) => has(l, term))?.slice(0, 200) || '';
    requirements.push({ name: term, category: 'technical', importance: 'required', status: ev ? 'demonstrated' : 'not_demonstrated', evidence: ev, gapType: ev ? null : 'absent', note: ev ? 'Keyword found in resume (rule-based match).' : 'Keyword not found in resume text.' });
  }
  const extra = [
    [/project|portfolio|build/i, 'Practical project work', 'projects', /project|built|developed|designed|created/i],
    [/intern|experience|work/i, 'Relevant work experience', 'experience', /intern|worked|experience|volunteer|assistant/i],
    [/degree|bachelor|undergraduate|university|computer science/i, 'Relevant education', 'education', /bachelor|b\.?sc|b\.?tech|degree|university|diploma/i],
  ];
  for (const [jdRe, name, category, resRe] of extra) {
    if (!jdRe.test(jd)) continue;
    const ev = find(resRe);
    requirements.push({ name, category, importance: 'preferred', status: ev ? 'partial' : 'not_demonstrated', evidence: ev, gapType: ev ? null : 'absent', note: 'Rule-based keyword check only.' });
  }
  const gaps = requirements.filter((r) => r.status === 'not_demonstrated');
  const recommendations = gaps.slice(0, 3).map((g, i) => ({ priority: i + 1, title: `Show evidence of ${g.name}, if you have it`, detail: `The job description mentions ${g.name} but your resume text does not. If you have used it, add a bullet describing where and how. If not, do not claim it.`, relatedRequirement: g.name }));
  while (recommendations.length < 3 && requirements.length) recommendations.push({ priority: recommendations.length + 1, title: 'Add measurable outcomes to your existing bullets', detail: 'Where you have real numbers (users, time saved, scores), state them next to the skills the job asks for.', relatedRequirement: '' });
  return { jobTitle: '', requirements, recommendations, rewrittenBullets: [] };
}
