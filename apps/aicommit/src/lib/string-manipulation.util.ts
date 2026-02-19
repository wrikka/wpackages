/**
 * String manipulation utilities
 */

export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function removeSpecialChars(str: string): string {
  return str.replace(/[^a-zA-Z0-9\s]/g, '');
}

export function sanitizeCommitMessage(message: string): string {
  return message
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/["']/g, '');
}
