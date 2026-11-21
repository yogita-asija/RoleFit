import axios from 'axios';

const http = axios.create({ baseURL: (import.meta.env.VITE_API_URL || '') + '/api', timeout: 120000 });
export const errMsg = (e) => e.response?.data?.error || (e.code === 'ECONNABORTED' ? 'The request timed out.' : e.request ? 'Cannot reach the server. Check that the backend is running.' : 'Something went wrong.');

export const getHealth = () => http.get('/health').then((r) => r.data);
export const analyze = (body) => http.post('/analyze', body).then((r) => r.data);
export const extractPdf = (file) => {
  const fd = new FormData(); fd.append('resume', file);
  return http.post('/extract-pdf', fd).then((r) => r.data.text);
};
export const getHistory = () => http.get('/history').then((r) => r.data);
export const getPrompts = () => http.get('/prompts').then((r) => r.data);
export const getEvaluation = () => http.get('/evaluate').then((r) => r.data);
export const startEvaluation = () => http.post('/evaluate', {}).then((r) => r.data);
