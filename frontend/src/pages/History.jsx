import { useEffect, useState } from 'react';
import { getHistory, errMsg } from '../services/api.js';
import Results from '../components/Results.jsx';

export default function History() {
  const [state, setState] = useState({ loading: true }); const [open, setOpen] = useState(null);
  useEffect(() => { getHistory().then((d) => setState({ ...d })).catch((e) => setState({ error: errMsg(e) })); }, []);
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold">Analysis history</h1>
      <p className="text-mute">Only analyses you chose to save appear here. They hold results, not your resume text, and are deleted after 30 days.</p>
      <div className="mt-6 space-y-3">
        {state.loading && <p>Loading...</p>}
        {state.error && <p role="alert" className="text-rose">{state.error}</p>}
        {state.available === false && <div className="card p-8 text-center text-mute">History is off because MongoDB is not connected. Set MONGODB_URI on the backend to enable it.</div>}
        {state.available && state.items.length === 0 && <div className="card p-8 text-center text-mute">No saved analyses yet. Tick "Save results to history" on the analyzer page.</div>}
        {state.items?.map((it) => (
          <div key={it._id} className="card p-4">
            <button className="flex w-full items-center justify-between text-left" onClick={() => setOpen(open === it._id ? null : it._id)}>
              <span><b>{it.jobTitle || 'Untitled role'}</b><span className="ml-2 text-sm text-mute">{new Date(it.createdAt).toLocaleString()} · {it.model} · {it.promptVersion?.toUpperCase()}</span></span>
              <span className="font-display text-xl font-bold text-violet">{it.score}</span>
            </button>
            {open === it._id && <div className="mt-4"><Results data={{ result: it.result, mode: 'ai', provider: it.provider, model: it.model, promptVersion: it.promptVersion }} /></div>}
          </div>))}
      </div>
    </main>
  );
}
