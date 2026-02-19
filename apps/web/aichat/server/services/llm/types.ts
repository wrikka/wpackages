import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import type { Tool } from '../plugins/types';

export interface LlmProvider {
  chat: (options: ChatOptions) => Promise<any>;
}

export interface ChatOptions {
  model: string;
  messages: ChatCompletionMessageParam[];
  temperature?: number;
  max_tokens?: number;
  tools?: Tool[];
}
