export interface AicommitConfig {
  // LLM Settings
  llmProvider: 'openai' | 'claude' | 'mastra';
  openaiApiKey?: string;
  claudeApiKey?: string;
  mastraApiKey?: string;
  model?: string;

  // Commit Settings
  locale: string;
  maxCommitLength: number;
  commitTypes?: string[];
  enableEmojis: boolean;

  // Generation Settings
  generateCount: number;
  customPrompt?: string;

  // Git Settings
  branchIgnore?: string[];
  enableGitHook: boolean;

  // History Settings
  enableHistory: boolean;
  historyLimit?: number;
}

export const defaultConfig: AicommitConfig = {
  llmProvider: 'mastra',
  locale: 'en',
  maxCommitLength: 50,
  commitTypes: ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore'],
  enableEmojis: true,
  generateCount: 1,
  enableGitHook: false,
  enableHistory: true,
  historyLimit: 100,
};
