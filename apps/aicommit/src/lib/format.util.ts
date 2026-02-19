/**
 * Formatting utilities
 */

import type { AicommitConfig } from '../types/config';
import { COMMIT_TYPES } from '../constants';
import { truncateString, sanitizeCommitMessage } from './string-manipulation.util';

const EMOJI_MAP: Record<string, string> = {
  feat: '✨',
  fix: '🐛',
  docs: '📝',
  style: '💄',
  refactor: '♻️',
  test: '✅',
  chore: '🔧',
  perf: '⚡',
  ci: '👷',
  build: '📦',
  temp: '🚀',
};

export function formatCommitMessage(message: string, config: AicommitConfig): string {
  let formatted = sanitizeCommitMessage(message);

  // Add emoji if enabled and message doesn't already have one
  if (config.enableEmojis && !/^[\p{Emoji}]/u.test(formatted)) {
    const commitType = extractCommitType(formatted);
    const emoji = EMOJI_MAP[commitType] || '📝';
    formatted = `${emoji} ${formatted}`;
  }

  // Truncate if too long
  if (formatted.length > config.maxCommitLength) {
    formatted = truncateString(formatted, config.maxCommitLength);
  }

  return formatted;
}

function extractCommitType(message: string): string {
  const conventionalCommitRegex = /^(\w+)(\(.+\))?:/;
  const match = message.match(conventionalCommitRegex);

  if (match) {
    const type = match[1]!.toLowerCase();
    return COMMIT_TYPES.includes(type as any) ? type : 'feat';
  }

  return 'feat';
}

export function formatCommitType(type: string, scope?: string): string {
  let formatted = type.toLowerCase();
  if (scope) {
    formatted += `(${scope})`;
  }
  return formatted;
}

export function addCommitScope(message: string, scope: string): string {
  const conventionalCommitRegex = /^(\w+)(\(.+\))?:/;
  const match = message.match(conventionalCommitRegex);

  if (match) {
    const type = match[1]!;
    return message.replace(conventionalCommitRegex, `${type}(${scope}):`);
  }

  return `${scope}: ${message}`;
}
