import { CheckCircle2, CircleDot, CircleOff, Lightbulb, PenLine, Info, ShieldCheck, FlaskConical } from 'lucide-react';
import { ScoreRing } from './ui.jsx';

const STATUS = {
  demonstrated: { label: 'Demonstrated', icon: CheckCircle2, cls: 'text-mint bg-mint-soft' },
  partial: { label: 'Partially demonstrated', icon: CircleDot, cls: 'text-amber bg-amber-soft' },
  not_demonstrated: { label: 'Not demonstrated', icon: CircleOff, cls: 'text-rose bg-rose-soft' },
};
const CAT = { technical: 'Technical skills', projects: 'Projects & practical evidence', experience: 'Relevant experience', education: 'Education & qualifications' };

function Req({ q }) {
  const s = STATUS[q.status]; const Icon = s.icon;
  const gap = q.status === 'not_demonstrated' ? (q.gapType === 'not_evidenced' ? 'May exist, but the resume does not show it' : 'Nothing related found in the resume') : null;
  return (
    <li className="rounded-xl border border-line p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}><Icon size={13} />{s.label}</span>
        <span className="font-semibold">{q.name}</span>
        <span className="text-xs text-mute">{CAT[q.category]} · {q.importance}</span>
      </div>
      {q.evidence && <blockquote className="mt-2 border-l-4 border-violet bg-violet-soft px-3 py-2 text-sm">{q.evidence}</blockquote>}
      {gap && <p className="mt-2 text-sm text-mute">{gap}.</p>}
      {q.note && <p className="mt-1 text-sm text-mute">{q.note}</p>}
    </li>
  );
}

const Section = ({ icon: Icon, title, children }) => (
  <section className="card p-5"><h3 className="mb-3 flex items-center gap-2 text-lg font-semibold"><Icon size={18} className="text-violet" />{title}</h3>{children}</section>
);

export default function Results({ data }) {
  const { result: r, mode, provider, model, promptVersion } = data;
  const groups = ['demonstrated', 'partial', 'not_demonstrated'].map((s) => [s, r.requirements.filter((q) => q.status === s)]);
  const v = r.validation;
  return (
    <div className="space-y-5">
      {mode === 'demo' && (
        <div className="flex gap-3 rounded-xl border border-amber bg-amber-soft p-4 text-sm text-amber"><FlaskConical size={20} className="shrink-0" />
          <p><b>Demo mode.</b> This result comes from a simple keyword matcher, not an AI model. No API key is configured on the server. Rewritten bullets are unavailable in demo mode.</p></div>
      )}
      <div className="card flex flex-col items-center gap-6 p-6 sm:flex-row">
        <ScoreRing value={r.score.total} />
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{r.jobTitle || 'Match result'}</h2>
          <p className="mt-1 text-sm text-mute">{mode === 'ai' ? `${provider} · ${model} · prompt ${promptVersion.toUpperCase()}` : 'Rule-based demo'} · {r.score.method === 'rubric' ? 'rubric-based score' : 'model-estimated score (no rubric)'}</p>
          <p className="mt-3 text-sm">{groups[0][1].length} demonstrated, {groups[1][1].length} partial, {groups[2][1].length} not demonstrated.</p>
          {v.enforced && <p className="mt-2 flex items-center gap-1 text-sm text-mint"><ShieldCheck size={16} />Evidence check: {v.groundedClaims} of {v.claims} claims verified in your resume{v.downgraded ? `; ${v.downgraded} downgraded` : ''}{v.droppedBullets ? `; ${v.droppedBullets} unsafe bullet(s) removed` : ''}.</p>}
        </div>
      </div>

      {groups.map(([s, items]) => items.length > 0 && (
        <Section key={s} icon={STATUS[s].icon} title={`${STATUS[s].label} (${items.length})`}><ul className="space-y-3">{items.map((q, i) => <Req key={i} q={q} />)}</ul></Section>
      ))}

      <Section icon={Lightbulb} title="Top three improvements">
        {r.recommendations.length ? <ol className="space-y-3">{r.recommendations.map((x) => (
          <li key={x.priority} className="rounded-xl border border-line p-4"><p className="font-semibold">{x.priority}. {x.title}</p><p className="mt-1 text-sm text-mute">{x.detail}</p></li>))}</ol> : <p className="text-sm text-mute">No recommendations were returned.</p>}
      </Section>

      <Section icon={PenLine} title="Improved bullets (existing evidence only)">
        {r.rewrittenBullets.length ? <ul className="space-y-3">{r.rewrittenBullets.map((b, i) => (
          <li key={i} className="rounded-xl border border-line p-4 text-sm"><p className="text-mute"><b>Original:</b> {b.original}</p><p className="mt-1"><b>Improved:</b> {b.improved}</p>
            {(!b.grounded || b.inventedNumbers.length > 0) && <p className="mt-1 font-semibold text-rose">Warning: this bullet may contain details that are not in your resume. Check it before use.</p>}</li>))}</ul>
          : <p className="text-sm text-mute">No bullets could be rewritten without adding information that is not in your resume.</p>}
      </Section>

      <Section icon={Info} title="How the score was calculated">
        <p className="text-sm">{r.explanation.summary}</p>
        {r.score.breakdown && (
          <div className="mt-3 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-mute"><tr><th className="py-1 pr-3">Category</th><th className="pr-3">Weight used</th><th className="pr-3">Evidenced</th><th>Points</th></tr></thead>
            <tbody>{r.score.breakdown.map((b) => (<tr key={b.category} className="border-t border-line"><td className="py-2 pr-3">{CAT[b.category]}</td><td className="pr-3">{b.applicable ? `${b.effectiveWeight}%` : 'n/a (not in job)'}</td><td className="pr-3">{b.applicable ? `${Math.round(b.pct * 100)}%` : '-'}</td><td>{b.points}</td></tr>))}</tbody></table></div>)}
        {r.explanation.positives.length > 0 && <p className="mt-3 text-sm"><b className="text-mint">Raised the score:</b> {r.explanation.positives.join(', ')}</p>}
        {r.explanation.reducers.length > 0 && <p className="mt-1 text-sm"><b className="text-rose">Lowered the score:</b> {r.explanation.reducers.join(', ')}</p>}
      </Section>

      <Section icon={Info} title="Important limitations"><ul className="list-disc space-y-1 pl-5 text-sm text-mute">{r.limitations.map((l) => <li key={l}>{l}</li>)}</ul></Section>
    </div>
  );
}
