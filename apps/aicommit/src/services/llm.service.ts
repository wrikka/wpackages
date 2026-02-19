/**
 * LLM service for generating commit messages
 */

import type { AicommitConfig } from '../types/config';
import { LLMError } from '../error';
import { getLLMProvider } from '../llm/providers';

export class LLMService {
  constructor(private config: AicommitConfig) {}

  async generateCommitMessage(diff: string): Promise<string> {
    try {
      const provider = getLLMProvider(this.config.llmProvider);
      return await provider.generateCommitMessage(diff, this.config);
    } catch (error) {
      throw new LLMError('Failed to generate commit message', error);
    }
  }

  async generateMultipleCommitMessages(diff: string, count: number): Promise<string[]> {
    const messages: string[] = [];
    
    for (let i = 0; i < count; i++) {
      try {
        const message = await this.generateCommitMessage(diff);
        messages.push(message);
      } catch (error) {
        if (i === 0) {
          throw error; // Re-throw if first attempt fails
        }
        // Continue with partial results if subsequent attempts fail
        break;
      }
    }

    if (messages.length === 0) {
      throw new LLMError('Failed to generate any commit messages');
    }

    return messages;
  }
}
