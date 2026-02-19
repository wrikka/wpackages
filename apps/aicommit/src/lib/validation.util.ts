/**
 * Validation utilities
 */

export function isValidCommitMessage(message: string): boolean {
  if (!message || message.trim().length === 0) return false;
  if (message.length > 200) return false; // Arbitrary max length
  return true;
}

export function isValidGitBranch(branch: string): boolean {
  if (!branch || branch.trim().length === 0) return false;
  
  // Git branch name rules
  const invalidChars = /[~^:?*\\[\]]/;
  const startsWithDot = /^\./;
  const endsWithDot = /\.$/;
  const consecutiveDots = /\.\./;
  const endsWithLock = /\.lock$/;
  
  return !(
    invalidChars.test(branch) ||
    startsWithDot.test(branch) ||
    endsWithDot.test(branch) ||
    consecutiveDots.test(branch) ||
    endsWithLock.test(branch)
  );
}

export function isValidApiKey(key: string): boolean {
  return key && key.trim().length > 0;
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[\x00-\x1F\x7F]/g, '');
}
