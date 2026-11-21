import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Header, Toast } from './components/ui.jsx';
import Landing from './pages/Landing.jsx';
import Analyzer from './pages/Analyzer.jsx';
import Evaluation from './pages/Evaluation.jsx';
import History from './pages/History.jsx';
import { getHealth } from './services/api.js';

const PAGES = ['landing', 'analyzer', 'evaluation', 'history'];
const fromHash = () => {
  const h = window.location.hash.replace('#', '');
  return PAGES.includes(h) ? h : 'landing';
};

export default function App() {
  const [page, setPage] = useState(fromHash);
  const [analyzerVisited, setAnalyzerVisited] = useState(fromHash() === 'analyzer');
  const [health, setHealth] = useState(null); const [toast, setToast] = useState(null);
  useEffect(() => { getHealth().then(setHealth).catch(() => setHealth(null)); }, []);
  // Browser Back/Forward buttons (and edited URLs) change the page
  useEffect(() => {
    const onNav = () => { setPage(fromHash()); window.scrollTo(0, 0); };
    window.addEventListener('popstate', onNav);
    return () => window.removeEventListener('popstate', onNav);
  }, []);
  useEffect(() => { if (page === 'analyzer') setAnalyzerVisited(true); }, [page]);
  const notify = useCallback((type, message) => { setToast({ type, message }); setTimeout(() => setToast(null), 5000); }, []);
  const go = (p) => {
    if (p === page) return;
    window.history.pushState(null, '', '#' + p);
    setPage(p); window.scrollTo(0, 0);
  };
  const back = () => { if (window.history.length > 1) window.history.back(); else go('landing'); };
  return (
    <>
      <Header page={page} go={go} health={health} />
      {page !== 'landing' && (
        <div className="mx-auto max-w-6xl px-4 pt-4">
          <button type="button" onClick={back} className="btn-ghost !px-3 !py-1.5 text-sm"><ArrowLeft size={16} /> Back</button>
        </div>
      )}
      {page === 'landing' && <Landing go={go} />}
      {/* Analyzer stays mounted once opened, so your text and results survive when you go back */}
      {analyzerVisited && <div hidden={page !== 'analyzer'}><Analyzer health={health} notify={notify} /></div>}
      {page === 'evaluation' && <Evaluation health={health} notify={notify} />}
      {page === 'history' && <History />}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}