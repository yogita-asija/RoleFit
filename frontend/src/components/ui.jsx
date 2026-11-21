import { CheckCircle2, AlertCircle, X, Loader2, BadgeCheck } from 'lucide-react';

export function Logo({ onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 font-display text-xl font-bold" aria-label="RoleFit home">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-violet text-white"><BadgeCheck size={18} /></span>RoleFit
    </button>
  );
}

export function Header({ page, go, health }) {
  const links = [['analyzer', 'Analyzer'], ['evaluation', 'Prompt evaluation'], ['history', 'History']];
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Logo onClick={() => go('landing')} />
        <nav className="flex items-center gap-1 text-sm font-semibold" aria-label="Main">
          {links.map(([id, label]) => (
            <button key={id} onClick={() => go(id)} aria-current={page === id ? 'page' : undefined} className={`rounded-lg px-3 py-2 ${page === id ? 'bg-violet-soft text-violet' : 'text-mute hover:text-ink'}`}>{label}</button>
          ))}
        </nav>
        {health?.config?.demoMode && <span className="rounded-full bg-amber-soft px-3 py-1 text-xs font-semibold text-amber">Demo mode: no AI key configured</span>}
      </div>
    </header>
  );
}

export function Toast({ toast, onClose }) {
  if (!toast) return null;
  const ok = toast.type === 'success';
  return (
    <div role="status" className={`fixed bottom-4 right-4 z-30 flex max-w-sm items-start gap-3 rounded-xl border p-4 shadow-lg ${ok ? 'border-mint bg-mint-soft text-mint' : 'border-rose bg-rose-soft text-rose'}`}>
      {ok ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
      <p className="text-sm font-medium">{toast.message}</p>
      <button onClick={onClose} aria-label="Dismiss"><X size={16} /></button>
    </div>
  );
}

export const Spinner = ({ label }) => <span className="inline-flex items-center gap-2"><Loader2 className="animate-spin" size={18} />{label}</span>;

export function ScoreRing({ value, size = 150 }) {
  const r = 56, c = 2 * Math.PI * r;
  const color = value >= 70 ? '#0E8F6E' : value >= 40 ? '#5B4BDB' : '#B4233F';
  return (
    <div className="relative" style={{ width: size, height: size }} role="img" aria-label={`Match score ${value} out of 100`}>
      <svg viewBox="0 0 140 140" className="-rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#E4E1F5" strokeWidth="12" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} style={{ transition: 'stroke-dashoffset .8s ease' }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div><div className="font-display text-4xl font-bold">{value}</div><div className="text-xs text-mute">out of 100</div></div>
      </div>
    </div>
  );
}
