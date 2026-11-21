import fs from 'node:fs';
import { testCases } from '../src/data/testCases.js';
let md = '# Test cases\n\nFive **fictional** resume / job-description pairs used to compare the three prompt versions. Generated from `backend/src/data/testCases.js` (`npm run docs:testcases`).\n\n';
for (const t of testCases) {
  md += `## ${t.id}: ${t.title}\n\n**Resume**\n\n\`\`\`\n${t.resume}\n\`\`\`\n\n**Job description**\n\n> ${t.jd}\n\n**Expected skills demonstrated:** ${t.expected.demonstrated.join(', ')}\n\n**Expected gaps (must NOT be claimed as demonstrated):** ${t.expected.gaps.join(', ')}\n\n`;
}
fs.writeFileSync(new URL('../../TEST_CASES.md', import.meta.url), md);
