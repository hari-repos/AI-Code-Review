#!/usr/bin/env node

import { generateTestCases } from './capabilities/test-generator/generator';
import { Logger } from './utils/logger';

async function main() {
  const args = process.argv.slice(2);
  const sourceFile = args[0] || args.find(a => a.startsWith('--file='))?.split('=')[1];
  if (!sourceFile) {
    Logger.error('Usage: npx ai-generate-tests <sourceFilePath>');
    process.exit(1);
  }
  const result = await generateTestCases({ sourceFilePath: sourceFile });
  console.log('\n--- Generated Test Code ---');
  console.log(result.testCode);
}

main().catch((err) => {
  Logger.error('Fatal CLI Error:', (err as Error).message);
  process.exit(1);
});
