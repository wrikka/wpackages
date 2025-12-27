import type { User } from './user.types';

/**
 * A pure function to format a user's name.
 * @param user The user object.
 * @returns The formatted name string.
 */
export function formatUserName(user: User): string {
  return `${user.name} <${user.email}>`;
}
