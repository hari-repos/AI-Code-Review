#!/usr/bin/env node

import { runAIReviewer } from './capabilities/pr-reviewer/reviewer';
import { Logger } from './utils/logger';

async function main() {
  await runAIReviewer();
}

main().catch((err) => {
  Logger.error('Fatal CLI Error:', (err as Error).message);
  process.exit(1);
});
