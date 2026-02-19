import { OpenAI } from 'openai';
import { logger } from '../../utils/logger';
import type { ChatOptions, LlmProvider } from './types';

export function getOpenAIClient() {
  const config = useRuntimeConfig();
  if (!config.openaiApiKey) {
    logger.error('OpenAI API key is not configured.');
    throw new Error('OpenAI API key is not configured.');
  }
  return new OpenAI({ apiKey: config.openaiApiKey });
}

async function chat(options: ChatOptions) {
  const openai = getOpenAIClient();
  const { model, messages, temperature = 0.7, max_tokens = 1000, tools } = options;

  const stream = await openai.chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens,
    stream: true,
    tools: tools && tools.length > 0 ? (tools as any) : undefined,
    tool_choice: tools && tools.length > 0 ? 'auto' : undefined,
  });

  return stream;
}

export function createOpenAIProvider(): LlmProvider {
  return {
    chat,
  };
}
