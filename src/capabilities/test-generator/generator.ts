import * as fs from 'fs';
import { TestGeneratorOptions, GeneratedTestSuite } from './types';
import { executeAICompletion } from '../../client/openai-client';
import { loadCustomCodingStandards } from '../../utils/config-loader';
import { Logger } from '../../utils/logger';

/**
 * Executes AI Test Case Generation capability for Playwright, Jest, Vitest, etc.
 */
export async function generateTestCases(options: TestGeneratorOptions): Promise<GeneratedTestSuite> {
  Logger.info('=====================================================');
  Logger.info('   @mycompany/ai-capabilities: Test Case Generator   ');
  Logger.info('=====================================================');

  let codeToTest = options.sourceCode || '';
  if (!codeToTest && options.sourceFilePath) {
    if (fs.existsSync(options.sourceFilePath)) {
      codeToTest = fs.readFileSync(options.sourceFilePath, 'utf-8');
      Logger.info(`Loaded source code from ${options.sourceFilePath}`);
    } else {
      throw new Error(`Source file not found at path: ${options.sourceFilePath}`);
    }
  }

  if (!codeToTest) {
    throw new Error('Please provide sourceCode or a valid sourceFilePath to generate test cases.');
  }

  const framework = options.framework || 'playwright';
  const customStandards = loadCustomCodingStandards();

  let systemPrompt = `You are a Senior QA Automation Architect specializing in generating production-grade test suites using ${framework}.

Your task is to analyze the provided source code and generate a comprehensive, self-contained test suite.

REQUIREMENTS:
- Use clean Page Object Model (POM) and modular principles where applicable.
- Ensure 100% type-safe TypeScript code.
- Cover happy paths, edge cases, error conditions, and boundary values.
`;

  if (customStandards) {
    systemPrompt += `\n### TEAM CODING & TEST STANDARDS ###\n${customStandards}\n`;
  }

  if (options.customInstructions) {
    systemPrompt += `\n### ADDITIONAL INSTRUCTIONS ###\n${options.customInstructions}\n`;
  }

  systemPrompt += `\nOUTPUT FORMAT REQUIREMENTS:
Return a strictly valid JSON object matching the schema below (no markdown wrappers outside JSON):
{
  "filePath": "tests/generated-test.spec.ts",
  "testCode": "import { test, expect } from '@playwright/test'; ...",
  "description": "Summary of tests created."
}`;

  Logger.info(`Generating ${framework} test suite with AI model...`);

  const result = await executeAICompletion<GeneratedTestSuite>({
    systemPrompt,
    userPrompt: `Generate ${framework} test suite for the following source code:\n\n${codeToTest}`,
    temperature: 0.2,
    config: options.clientConfig
  });

  Logger.info(`Generated test suite successfully: ${result.filePath}`);
  return result;
}
