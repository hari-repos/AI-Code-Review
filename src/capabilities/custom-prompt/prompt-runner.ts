import { CustomPromptOptions } from './types';
import { executeAICompletion } from '../../client/openai-client';
import { Logger } from '../../utils/logger';

/**
 * Generic AI execution helper for custom internal AI solutions and workflows.
 */
export async function runCustomAIPrompt<T = any>(options: CustomPromptOptions<T>): Promise<T> {
  Logger.debug('Executing Custom AI Prompt...');
  return await executeAICompletion<T>({
    systemPrompt: options.systemPrompt,
    userPrompt: options.userPrompt,
    temperature: options.temperature,
    config: options.clientConfig
  });
}
