#!/usr/bin/env node

import { runAIReviewer } from './capabilities/pr-reviewer/reviewer';
import { generateTestCases } from './capabilities/test-generator/generator';
import { Logger } from './utils/logger';

async function main() {
  const args = process.argv.slice(2);
  const binaryName = process.argv[1] ? process.argv[1].split('/').pop() : '';
  let command = args[0];

  if (binaryName === 'ai-pr-review') {
    command = 'review';
  } else if (binaryName === 'ai-generate-tests') {
    command = 'generate-tests';
  }

  switch (command) {
    case 'review':
    case 'ai-pr-review':
    case 'pr-review': {
      await runAIReviewer();
      break;
    }

    case 'generate-tests':
    case 'test-gen': {
      const sourceFile = args[1] || args.find(a => a.startsWith('--file='))?.split('=')[1];
      if (!sourceFile) {
        Logger.error('Usage: npx ai-generate-tests <sourceFilePath>');
        process.exit(1);
      }
      const result = await generateTestCases({ sourceFilePath: sourceFile });
      console.log('\n--- Generated Test Code ---');
      console.log(result.testCode);
      break;
    }

    case 'help':
    case '--help':
    default: {
      console.log(`
=====================================================
          @mycompany/ai-capabilities CLI             
=====================================================

Usage:
  npx ai-pr-review                        Run Azure DevOps PR Code Review
  npx ai-generate-tests <sourceFilePath>   Generate Playwright/unit test suite
  npx ai-capabilities review              Run PR Code Review
  npx ai-capabilities help                Display help menu
`);
      if (command && command !== 'help' && command !== '--help') {
        await runAIReviewer();
      }
      break;
    }
  }
}

main().catch((err) => {
  Logger.error('Fatal CLI Error:', (err as Error).message);
  process.exit(1);
});
