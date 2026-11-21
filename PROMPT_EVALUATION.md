# Prompt evaluation

## Status
**No real evaluation results are included in this repository.** The project was built in an environment without access to the Gemini or OpenAI APIs, so no AI experiment has been run. Any table you see in the app without a green "Real results" banner is **illustrative only**.

## How to produce real results
1. Put `GEMINI_API_KEY` (or `OPENAI_API_KEY`) in `backend/.env`.
2. `cd backend && npm run evaluate` (15 calls: 5 cases x 3 prompts), or click **Run real evaluation** on the Prompt evaluation page.
3. Results are saved to `backend/src/data/evaluation-results.json` and shown in the app. Copy the table below from the app into your report.

## Method
Each of the five fictional cases (see `TEST_CASES.md`) is run through V1, V2 and V3 with identical input and the same model and temperature (0.2). Expectations per case: skills that should be demonstrated and gaps that must **not** be claimed as demonstrated.

| Criterion (1-5) | How it is computed automatically |
|---|---|
| Relevance | Share of expected skills/gaps that appear among the extracted requirements |
| Accuracy | Share of expected items classified correctly (demonstrated/partial vs not demonstrated) |
| Evidence grounding | Share of claimed matches whose evidence text is found verbatim in the resume (V1 gives no evidence, so it scores low by design) |
| Completeness | Six checks: 5+ requirements, 3 recommendations, 1+ bullet, score, explanation, at least one gap listed |
| Reliability | 5 minus 2 per gap falsely claimed as demonstrated, minus 2 per bullet with invented numbers, minus 1 per bullet whose original is not in the resume |

Score mapping: fraction f becomes 1 + 4f. These are proxy metrics; also review the raw outputs manually and say so in your report.

## Illustrative sample (NOT real results)
| Criterion | V1 | V2 | V3 |
|---|---|---|---|
| Relevance | 3.5 | 4.2 | 4.4 |
| Accuracy | 3.0 | 3.8 | 4.4 |
| Evidence grounding | 1.5 | 3.0 | 4.8 |
| Completeness | 3.0 | 4.2 | 4.4 |
| Reliability | 3.0 | 3.8 | 4.7 |

These values are placeholders showing the expected shape of the results. They must not be reported as findings.

## Expected benefit of each step (hypothesis to test)
V2 should improve completeness and comparability; V3 should improve grounding and reliability because unverifiable claims are rejected by code, at a possible small cost to recall.
