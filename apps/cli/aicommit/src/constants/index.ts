/**
 * Constants for aicommit application
 */

export const CONFIG_FILE = '.aicommitrc.json';
export const DEFAULT_LOCALE = 'en';
export const DEFAULT_MAX_COMMIT_LENGTH = 50;
export const DEFAULT_GENERATE_COUNT = 1;

export const COMMIT_TYPES = [
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'test',
  'chore',
] as const;

export const LLM_PROVIDERS = [
  'openai',
  'claude',
  'mastra',
] as const;
