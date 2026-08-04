export interface OpenAIClientConfig {
  apiKey?: string;
  model?: string;
  baseURL?: string;
  azureEndpoint?: string;
  azureDeployment?: string;
  azureApiVersion?: string;
}

export interface AIStructuredCompletionOptions {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  config?: OpenAIClientConfig;
}
