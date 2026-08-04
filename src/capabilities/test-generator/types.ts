import { OpenAIClientConfig } from '../../client/types';

export interface TestGeneratorOptions {
  sourceFilePath?: string;
  sourceCode?: string;
  framework?: 'playwright' | 'jest' | 'vitest' | 'mocha';
  customInstructions?: string;
  clientConfig?: OpenAIClientConfig;
}

export interface GeneratedTestSuite {
  filePath: string;
  testCode: string;
  description: string;
}
