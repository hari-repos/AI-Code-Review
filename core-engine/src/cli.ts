#!/usr/bin/env node

import { runAIReviewer } from './reviewers/ai-reviewer';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'review';

  switch (command) {
    case 'review':
    case 'ai-pr-review':
      await runAIReviewer();
      break;
    default:
      console.log(`Usage: npx @mycompany/core-engine [review|ai-pr-review]`);
      await runAIReviewer();
      break;
  }
}

main().catch((err) => {
  console.error('[AI Core Engine Fatal Error]:', err);
  process.exit(1);
});
