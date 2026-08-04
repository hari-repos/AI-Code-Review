import * as fs from 'fs';
import * as path from 'path';
import { Logger } from './logger';

/**
 * Reads team/framework coding standards from local directory or environment variable.
 */
export function loadCustomCodingStandards(customPath?: string): string {
  const envStandards = process.env.CUSTOM_CODING_STANDARDS;
  if (envStandards && envStandards.trim().length > 0) {
    return envStandards.trim();
  }

  const targetPath = customPath || path.join(process.cwd(), 'CODING_STANDARDS.md');
  if (fs.existsSync(targetPath)) {
    try {
      const content = fs.readFileSync(targetPath, 'utf-8');
      Logger.info(`Loaded custom coding standards from: ${targetPath}`);
      return content.trim();
    } catch (err) {
      Logger.warn(`Could not read standards file at ${targetPath}:`, (err as Error).message);
    }
  }

  const altPath = path.join(process.cwd(), '.ai-coderules');
  if (fs.existsSync(altPath)) {
    try {
      const content = fs.readFileSync(altPath, 'utf-8');
      Logger.info(`Loaded custom coding standards from: ${altPath}`);
      return content.trim();
    } catch (err) {
      Logger.warn(`Could not read standards file at ${altPath}:`, (err as Error).message);
    }
  }

  return '';
}
