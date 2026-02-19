/**
 * Configuration management for aicommit
 */

import type { AicommitConfig } from '../types/config';
import { DEFAULT_LOCALE, DEFAULT_MAX_COMMIT_LENGTH, DEFAULT_GENERATE_COUNT, COMMIT_TYPES, LLM_PROVIDERS } from '../constants';

export function createDefaultConfig(): AicommitConfig {
  return {
    llmProvider: 'mastra',
    locale: DEFAULT_LOCALE,
    maxCommitLength: DEFAULT_MAX_COMMIT_LENGTH,
    commitTypes: [...COMMIT_TYPES],
    enableEmojis: true,
    generateCount: DEFAULT_GENERATE_COUNT,
    enableGitHook: false,
    enableHistory: true,
    historyLimit: 100,
  };
}

export function validateConfig(config: Partial<AicommitConfig>): string[] {
  const errors: string[] = [];

  if (config.llmProvider && !LLM_PROVIDERS.includes(config.llmProvider as any)) {
    errors.push(`Invalid llmProvider. Must be one of: ${LLM_PROVIDERS.join(', ')}`);
  }

  if (config.locale && typeof config.locale !== 'string') {
    errors.push('Locale must be a string');
  }

  if (config.maxCommitLength && (typeof config.maxCommitLength !== 'number' || config.maxCommitLength <= 0)) {
    errors.push('maxCommitLength must be a positive number');
  }

  if (config.generateCount && (typeof config.generateCount !== 'number' || config.generateCount <= 0)) {
    errors.push('generateCount must be a positive number');
  }

  if (config.commitTypes && (!Array.isArray(config.commitTypes) || config.commitTypes.some(type => typeof type !== 'string'))) {
    errors.push('commitTypes must be an array of strings');
  }

  if (config.enableEmojis && typeof config.enableEmojis !== 'boolean') {
    errors.push('enableEmojis must be a boolean');
  }

  if (config.enableGitHook && typeof config.enableGitHook !== 'boolean') {
    errors.push('enableGitHook must be a boolean');
  }

  if (config.enableHistory && typeof config.enableHistory !== 'boolean') {
    errors.push('enableHistory must be a boolean');
  }

  if (config.historyLimit && (typeof config.historyLimit !== 'number' || config.historyLimit <= 0)) {
    errors.push('historyLimit must be a positive number');
  }

  return errors;
}
