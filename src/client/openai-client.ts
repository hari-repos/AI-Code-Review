import OpenAI from 'openai';
import { OpenAIClientConfig, AIStructuredCompletionOptions } from './types';
import { Logger } from '../utils/logger';

export interface OpenAIClientResult {
  client: OpenAI;
  model: string;
}

/**
 * Initializes OpenAI or Azure OpenAI client dynamically based on environment variables or provided config.
 */
export function createAIClient(config?: OpenAIClientConfig): OpenAIClientResult {
  const apiKey = config?.apiKey || process.env.OPENAI_API_KEY || process.env.AZURE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing API key. Please set OPENAI_API_KEY or AZURE_OPENAI_API_KEY environment variable.');
  }

  const azureEndpoint = config?.azureEndpoint || process.env.AZURE_OPENAI_ENDPOINT;
  const azureDeployment = config?.azureDeployment || process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o';
  const apiVersion = config?.azureApiVersion || process.env.AZURE_OPENAI_API_VERSION || '2024-06-01';

  if (azureEndpoint) {
    Logger.info(`Configuring Azure OpenAI Client (Endpoint: ${azureEndpoint}, Deployment: ${azureDeployment})`);
    const client = new OpenAI({
      apiKey: apiKey,
      baseURL: `${azureEndpoint.replace(/\/$/, '')}/openai/deployments/${azureDeployment}`,
      defaultQuery: { 'api-version': apiVersion },
      defaultHeaders: { 'api-key': apiKey }
    });
    return { client, model: azureDeployment };
  } else {
    const model = config?.model || process.env.OPENAI_MODEL || 'gpt-4o';
    const baseURL = config?.baseURL || process.env.OPENAI_BASE_URL;
    Logger.info(`Configuring Standard OpenAI Client (Model: ${model}${baseURL ? `, BaseURL: ${baseURL}` : ''})`);
    const client = new OpenAI({
      apiKey: apiKey,
      baseURL: baseURL || undefined
    });
    return { client, model };
  }
}

/**
 * Executes a structured JSON AI completion and parses the JSON response into typed object T.
 */
export async function executeAICompletion<T>(options: AIStructuredCompletionOptions): Promise<T> {
  const { client, model } = createAIClient(options.config);

  try {
    const response = await client.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: options.systemPrompt },
        { role: 'user', content: options.userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: options.temperature ?? 0.2
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Received empty response from OpenAI model.');
    }

    return JSON.parse(content) as T;
  } catch (err) {
    Logger.error('AI Completion failed:', (err as Error).message);
    throw err;
  }
}
