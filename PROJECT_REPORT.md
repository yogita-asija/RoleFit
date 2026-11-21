# RoleFit project report

## 1. Problem
Students tailor resumes to internships without knowing which requirements their resume actually evidences. Generic AI feedback often invents skills or metrics, which is harmful in a job application.

## 2. Solution
A web app that maps each job requirement to verbatim resume evidence, classifies it (demonstrated / partial / not demonstrated, with absent vs not-evidenced gaps), computes a rubric score in code, and suggests improvements and rewritten bullets restricted to existing facts.

## 3. Design decisions
- Score computed by deterministic code from the model's classifications, so it is transparent and reproducible.
- V3 output is validated: unverifiable evidence is downgraded and unsafe bullets removed.
- Provider calls use plain `fetch` with timeouts; keys stay server-side.
- MongoDB is optional and opt-in; no resume text is persisted.
- Demo mode (keyword matcher) keeps the app usable without keys and is always labelled.

## 4. Implementation summary
React/Vite/Tailwind frontend (landing, analyzer, results, prompt evaluation, history); Express backend with validation, rate limiting, helmet, CORS, PDF extraction (pdf-parse), Gemini and OpenAI integrations, three prompts, scoring, evaluation runner and unit tests.

## 5. Evaluation
Not yet run with a real model (see `PROMPT_EVALUATION.md`). After running `npm run evaluate`, insert the generated table and your manual observations here. Do not use the illustrative numbers.

## 6. Ethics and privacy
No login; no logging of bodies; opt-in history storing results only with 30-day expiry; fictional test data; clear user-facing notice; the tool states it is not an employability predictor and advises adding skills only if genuinely held.

## 7. Limitations and future work
See README. Unverified in this build: calls to the live Gemini/OpenAI/MongoDB services (no keys or network access were available); these code paths are implemented but untested against live services.
