import { ArrowRight, FileText, ListChecks, ShieldCheck } from 'lucide-react';

const steps = [
  [FileText, 'Add your resume and a job description', 'Upload a PDF or paste text. Nothing is stored unless you opt in to history.'],
  [ListChecks, 'See each requirement checked', 'Every requirement is marked demonstrated, partial or not demonstrated.'],
  [ShieldCheck, 'Get advice you can trust', 'Each match quotes your own words. RoleFit never adds skills, numbers or projects you did not write.'],
];

export default function Landing({ go }) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-14">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">Tailor your resume to the internship, with evidence for every match.</h1>
          <p className="mt-4 max-w-xl text-lg text-mute">RoleFit compares your resume with a job description for students and new graduates. It shows what you demonstrate, what you only partly show, and what is missing, without making anything up.</p>
          <button onClick={() => go('analyzer')} className="btn-primary mt-7 text-lg">Get started <ArrowRight size={18} /></button>
        </div>
        <div className="card space-y-3 p-5" aria-label="Example finding">
          <p className="text-sm font-semibold text-mute">Job requires: SQL for data analysis</p>
          <p className="inline-block rounded-full bg-mint-soft px-3 py-0.5 text-xs font-semibold text-mint">Demonstrated</p>
          <blockquote className="border-l-4 border-violet bg-violet-soft px-3 py-2 text-sm">Skills: <mark className="bg-transparent font-semibold text-violet">Python, SQL</mark>, Excel, pandas</blockquote>
          <p className="text-sm font-semibold text-mute">Job requires: Power BI dashboards</p>
          <p className="inline-block rounded-full bg-rose-soft px-3 py-0.5 text-xs font-semibold text-rose">Not demonstrated</p>
          <p className="text-sm text-mute">Nothing in the resume mentions it. Add it only if you have used it.</p>
        </div>
      </div>
      <section className="mt-16 grid gap-4 md:grid-cols-3" aria-label="How it works">
        {steps.map(([Icon, t, d]) => (<div key={t} className="card p-5"><Icon className="text-violet" /><h2 className="mt-3 text-lg font-semibold">{t}</h2><p className="mt-1 text-sm text-mute">{d}</p></div>))}
      </section>
      <p className="mt-10 text-sm text-mute">Privacy: your text is sent to the AI provider you choose to produce the analysis. RoleFit does not log it and does not store it unless you tick "Save to history", and then only the results are kept, for 30 days.</p>
    </main>
  );
}
