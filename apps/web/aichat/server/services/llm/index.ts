import { createOpenAIProvider } from './openai';
import type { LlmProvider } from './types';

export function getLlmProvider(model: string): LlmProvider {
  if (model.startsWith('gpt-')) {
    return createOpenAIProvider();
  }

  throw new Error(`Unsupported model: ${model}`);
}
