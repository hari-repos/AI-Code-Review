import { OpenAIClientConfig } from '../../client/types';

export interface CustomPromptOptions<T = any> {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  clientConfig?: OpenAIClientConfig;
}
