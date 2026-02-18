import type { AicommitConfig } from '../types/config';

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

export function formatCommitMessage(message: string, config: AicommitConfig): string {
  let formatted = message;

  // Add emoji if enabled
  formatted = addEmoji(formatted, config);

  // Truncate if needed
  formatted = truncateMessage(formatted, config.maxCommitLength);

  return formatted;
}
