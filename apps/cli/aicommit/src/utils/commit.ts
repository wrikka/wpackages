/**
 * Legacy commit utilities - use formatCommitMessage from '../lib/format.util' instead
 * @deprecated Use formatCommitMessage from '../lib/format.util'
 */

import { formatCommitMessage as newFormatCommitMessage } from '../lib/format.util';
import type { AicommitConfig } from '../types/config';

export const formatCommitMessage = newFormatCommitMessage;

const EMOJIS: Record<string, string> = {
  feat: '✨',
  fix: '🐛',
  docs: '📝',
  style: '💄',
  refactor: '♻️',
  test: '✅',
  chore: '🔧',
  perf: '⚡',
  ci: '🤖',
  build: '📦',
};

export function addEmoji(message: string, config: AicommitConfig): string {
  if (!config.enableEmojis) return message;

  const type = message.split(':')[0];
  const emoji = type && EMOJIS[type] ? EMOJIS[type] : '';

  if (emoji) {
    return `${emoji} ${message}`;
  }

  return message;
}

export function truncateMessage(message: string, maxLength: number): string {
  if (message.length <= maxLength) return message;
  return message.substring(0, maxLength - 3) + '...';
}
