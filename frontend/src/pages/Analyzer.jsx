import { useRef, useState } from 'react';
import { Upload, Wand2, Eraser } from 'lucide-react';
import { analyze, extractPdf, errMsg } from '../services/api.js';
import { sample } from '../data/sample.js';
import { Spinner } from '../components/ui.jsx';
import Results from '../components/Results.jsx';

export default function Analyzer({ health, notify }) {
  const [resume, setResume] = useState(''); const [jd, setJd] = useState('');
  const [version, setVersion] = useState('v3'); const [provider, setProvider] = useState('auto');
  const [save, setSave] = useState(false); const [busy, setBusy] = useState(false); const [uploading, setUploading] = useState(false);
  const [data, setData] = useState(null); const [error, setError] = useState('');
  const fileRef = useRef(null); const resultRef = useRef(null);
  const cfg = health?.config;

  const onFile = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') return notify('error', 'Only PDF files are accepted.');
    if (file.size > 5 * 1024 * 1024) return notify('error', 'PDF is larger than 5 MB.');
    setUploading(true);
    try { setResume(await extractPdf(file)); notify('success', 'PDF text extracted. Review it below.'); }
    catch (e) { notify('error', errMsg(e)); } finally { setUploading(false); }
  };
  const run = async () => {
    setBusy(true); setError(''); setData(null);
    try {
      const d = await analyze({ resume, jobDescription: jd, promptVersion: version, provider, saveHistory: save });
      setData(d); notify('success', d.saved ? 'Analysis complete and saved to history.' : 'Analysis complete.');
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (e) { setError(errMsg(e)); } finally { setBusy(false); }
  };
  const ready = resume.trim().length >= 50 && jd.trim().length >= 50;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-3xl font-bold">Analyze your resume</h1><p className="text-mute">Add both texts, then run the analysis.</p></div>
        <button className="btn-ghost" onClick={() => { setResume(sample.resume); setJd(sample.jobDescription); setData(null); }}>Load fictional sample</button>
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="card p-5">
          <div className="flex items-center justify-between"><label htmlFor="resume" className="font-semibold">Resume</label><span className="text-xs text-mute">{resume.length}/15000</span></div>
          <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }}
            className="mt-3 flex items-center justify-between gap-3 rounded-xl border-2 border-dashed border-line p-4 text-sm">
            <span className="text-mute">Drop a PDF here (max 5 MB, text-based)</span>
            <button className="btn-ghost" onClick={() => fileRef.current.click()} disabled={uploading}>{uploading ? <Spinner label="Reading" /> : <><Upload size={16} />Upload PDF</>}</button>
            <input ref={fileRef} type="file" accept="application/pdf" hidden onChange={(e) => { onFile(e.target.files[0]); e.target.value = ''; }} />
          </div>
          <textarea id="resume" className="field mt-3 h-64" maxLength={15000} placeholder="Or paste your resume text here" value={resume} onChange={(e) => setResume(e.target.value)} />
        </section>
        <section className="card p-5">
          <div className="flex items-center justify-between"><label htmlFor="jd" className="font-semibold">Job description</label><span className="text-xs text-mute">{jd.length}/8000</span></div>
          <textarea id="jd" className="field mt-3 h-[22.5rem]" maxLength={8000} placeholder="Paste the internship or job description" value={jd} onChange={(e) => setJd(e.target.value)} />
        </section>
      </div>

      <section className="card mt-5 flex flex-wrap items-end gap-4 p-5">
        <div><label htmlFor="prov" className="block text-sm font-semibold">AI model</label>
          <select id="prov" className="field mt-1" value={provider} onChange={(e) => setProvider(e.target.value)}>
            <option value="auto">Automatic</option>
            <option value="gemini" disabled={cfg && !cfg.gemini}>Gemini{cfg && !cfg.gemini ? ' (not configured)' : ''}</option>
            <option value="openai" disabled={cfg && !cfg.openai}>OpenAI{cfg && !cfg.openai ? ' (not configured)' : ''}</option>
          </select></div>
        <div><label htmlFor="ver" className="block text-sm font-semibold">Prompt version</label>
          <select id="ver" className="field mt-1" value={version} onChange={(e) => setVersion(e.target.value)}>
            <option value="v3">V3 Evidence-grounded (recommended)</option><option value="v2">V2 Structured</option><option value="v1">V1 Baseline</option>
          </select></div>
        {cfg?.database === 'connected' && <label className="flex items-center gap-2 pb-3 text-sm"><input type="checkbox" checked={save} onChange={(e) => setSave(e.target.checked)} />Save results to history (resume text is never stored)</label>}
        <div className="ml-auto flex gap-2">
          <button className="btn-ghost" onClick={() => { setResume(''); setJd(''); setData(null); setError(''); }}><Eraser size={16} />Clear</button>
          <button className="btn-primary" onClick={run} disabled={!ready || busy}>{busy ? <Spinner label="Analyzing..." /> : <><Wand2 size={16} />Analyze resume</>}</button>
        </div>
      </section>

      <div ref={resultRef} className="mt-6" aria-live="polite">
        {error && <div role="alert" className="rounded-xl border border-rose bg-rose-soft p-4 text-sm text-rose"><b>Analysis failed.</b> {error}</div>}
        {!data && !error && !busy && <div className="card p-8 text-center text-mute">Your results will appear here. Add a resume and a job description to begin.</div>}
        {busy && <div className="card p-8 text-center text-mute">Checking each requirement against your resume. This usually takes 10 to 30 seconds.</div>}
        {data && <Results data={data} />}
      </div>
    </main>
  );
}
