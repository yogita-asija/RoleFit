// ILLUSTRATIVE ONLY. These numbers were NOT produced by running any model. They show the expected shape and the
// typical direction of improvement. Run `npm run evaluate` (needs an API key) to generate real results.
export const demoEvaluation = {
  mode: 'illustrative',
  note: 'Illustrative sample values, not experiment results. No AI model produced these numbers. Add an API key and run the real evaluation to replace them.',
  criteria: ['relevance', 'accuracy', 'grounding', 'completeness', 'reliability'],
  summary: {
    v1: { relevance: 3.5, accuracy: 3.0, grounding: 1.5, completeness: 3.0, reliability: 3.0, overall: 2.8 },
    v2: { relevance: 4.2, accuracy: 3.8, grounding: 3.0, completeness: 4.2, reliability: 3.8, overall: 3.8 },
    v3: { relevance: 4.4, accuracy: 4.4, grounding: 4.8, completeness: 4.4, reliability: 4.7, overall: 4.5 },
  },
  runs: [],
};
