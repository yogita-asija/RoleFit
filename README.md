# RoleFit: Evidence-Grounded Resume and Job Description Analyzer

RoleFit compares a student's resume with a job description and reports which requirements are **demonstrated**, **partially demonstrated** or **not demonstrated**, quoting resume evidence for every match. It never invents skills, projects or metrics.

## Architecture
```
frontend/ (React + Vite + Tailwind, Vercel)  --axios-->  backend/ (Express, Render)
                                                          |- routes/ -> controllers/ -> services/
                                                          |- prompts/ (V1, V2, V3)   |- ai.js (Gemini, OpenAI via fetch)
                                                          |- validators/ (input, output grounding)
                                                          |- services/scoring.js (rubric), evaluation.js, pdf.js, demo.js
                                                          '- models/Analysis.js (optional MongoDB)
```
Flow: input validation -> prompt (V1/V2/V3) -> AI provider (timeout, one retry on unreadable JSON) -> `normalizeResult` (schema clean-up, evidence verification for V3) -> rubric score computed **in code** -> response.

## Setup
Requirements: Node 18.18+.
```bash
cd backend && cp .env.example .env && npm install && npm run dev     # http://localhost:5000
cd frontend && cp .env.example .env && npm install && npm run dev    # http://localhost:5173 (proxies /api)
```
### Environment variables (backend/.env)
| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY`, `GEMINI_MODEL` | Primary model (default `gemini-2.5-flash`). Key from Google AI Studio. |
| `OPENAI_API_KEY`, `OPENAI_MODEL` | Optional second model (default `gpt-4o-mini`). |
| `MONGODB_URI` | Optional. Enables opt-in history. App works without it. |
| `CORS_ORIGINS` | Comma-separated allowed origins (add your Vercel URL). |
| `AI_TIMEOUT_MS` | AI call timeout (default 60000). |

Frontend: `VITE_API_URL` = backend URL in production (empty in dev). Keys live only on the backend.

**Demo mode:** with no AI key, `/api/analyze` runs a keyword matcher (not AI) and the UI labels it clearly. Prompt evaluation shows clearly labelled *illustrative* numbers.

## API
| Endpoint | Description |
|---|---|
| `GET /api/health` | Status and configuration flags (no secrets). |
| `POST /api/analyze` | `{resume, jobDescription, promptVersion: v1\|v2\|v3 (default v3), provider: auto\|gemini\|openai, saveHistory?}` returns `{mode, provider, model, promptVersion, result, saved}`. |
| `POST /api/extract-pdf` | multipart field `resume` (PDF, max 5 MB, text-based) returns `{text}`. |
| `GET /api/history` | Saved results if MongoDB is connected, else `{available:false}`. |
| `GET /api/prompts` | The three prompt texts. |
| `POST /api/evaluate` | Starts the real evaluation job (15 AI calls); 202 with progress. Errors if no key. |
| `GET /api/evaluate` | Job progress and latest results (`mode: real` or `illustrative`). |

Rate limits: 300 req/15 min overall, analyze 15/15 min, PDF 20/15 min, evaluate 2/hour. Bodies are limited to 100 KB.

## Prompt engineering methodology
- **V1 Baseline:** the plain task list. Free-form answer, model-estimated score.
- **V2 Structured:** extracts 6-12 requirements, maps evidence, three-level classification, `gapType` (absent vs not evidenced), fixed JSON, rubric score computed by the server.
- **V3 Evidence-grounded (recommended):** adds mandatory verbatim snippets, uncertainty rules, no-invention rules for bullets, and **code-level validation**: claims whose snippet is not found in the resume are downgraded; bullets with an `original` not in the resume or with numbers not in the resume are removed.
- All prompts treat resume/job text as untrusted data (prompt-injection guard).

## Scoring methodology
Technical 40%, projects 30%, experience 20%, education 10%. Credit per requirement: demonstrated 1, partial 0.5, not 0; required weighs 2, preferred 1. Categories with no requirements are dropped and weights re-normalised. The breakdown is shown in the UI. The score is not an employability prediction.

## Testing
```bash
cd backend && npm test            # unit tests: scoring, validation, demo matcher, metrics
npm run evaluate                  # REAL prompt comparison (needs a key): writes src/data/evaluation-results.json
npm run docs:testcases            # regenerate ../TEST_CASES.md
cd ../frontend && npm run build
```
Manual flow: Load fictional sample -> Analyze -> check results; upload a text-based PDF; open Prompt evaluation.

## Deployment
**Render (backend):** New Web Service, root `backend`, build `npm install`, start `npm start`, add env vars above (`CORS_ORIGINS` = your Vercel URL). Health check path `/api/health`.
**Vercel (frontend):** import repo, root `frontend`, framework Vite, set `VITE_API_URL` to the Render URL, deploy.
Render's free tier sleeps when idle, so the first request can be slow.

## Data handling
Resume text is sent to the AI provider you select to produce the analysis. The server does not log request bodies and does not store resume or job text. History is opt-in, stores results only (not the input text) and expires after 30 days. Use fictional data for testing.

## Limitations and future work
Text-based PDFs only (no OCR); single-language prompts; skill matching depends on model judgement; evaluation metrics are automatic keyword-based checks on five small fictional cases; the public evaluate endpoint spends API credit (rate-limited). Future: OCR, user accounts, human-rated evaluation, more languages.
