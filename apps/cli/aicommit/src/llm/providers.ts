import { ofetch } from 'ofetch';

export interface LLMProvider {
  generateCommitMessage(diff: string, config: any): Promise<string>;
}

export class MastraProvider implements LLMProvider {
  async generateCommitMessage(diff: string, config: any): Promise<string> {
    const response = await ofetch('https://mastra.ai/api/chat/completions', {
      method: 'POST',
      body: {
        model: config.model || 'mastra-7b-instruct',
        messages: [
          {
            role: 'system',
            content: config.customPrompt || 'You are an expert at writing git commit messages. Your response should be only the commit message, without any additional explanation or formatting.',
          },
          {
            role: 'user',
            content: `Generate a concise git commit message for the following changes:\n\n${diff}`,
          },
        ],
        stream: false,
      },
    });

    return response.choices[0]?.message?.content?.trim() || '';
  }
}

export class OpenAIProvider implements LLMProvider {
  async generateCommitMessage(diff: string, config: any): Promise<string> {
    const response = await ofetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.openaiApiKey}`,
      },
      body: {
        model: config.model || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: config.customPrompt || 'You are an expert at writing git commit messages. Your response should be only the commit message, without any additional explanation or formatting.',
          },
          {
            role: 'user',
            content: `Generate a concise git commit message for the following changes:\n\n${diff}`,
          },
        ],
        stream: false,
      },
    });

    return response.choices[0]?.message?.content?.trim() || '';
  }
}

export class ClaudeProvider implements LLMProvider {
  async generateCommitMessage(diff: string, config: any): Promise<string> {
    const response = await ofetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': config.claudeApiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: {
        model: config.model || 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: config.customPrompt || `You are an expert at writing git commit messages. Generate a concise git commit message for the following changes:\n\n${diff}`,
          },
        ],
      },
    });

    return response.content[0]?.text?.trim() || '';
  }
}

export function getLLMProvider(provider: 'openai' | 'claude' | 'mastra'): LLMProvider {
  switch (provider) {
    case 'openai':
      return new OpenAIProvider();
    case 'claude':
      return new ClaudeProvider();
    case 'mastra':
    default:
      return new MastraProvider();
  }
}
