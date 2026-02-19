/**
 * Validation utilities
 */

/**
 * Validates if a value is a positive number
 */
export function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && value > 0 && !isNaN(value);
}

/**
 * Validates if a value is a non-negative number
 */
export function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && value >= 0 && !isNaN(value);
}

/**
 * Checks if a value is a valid priority
 */
export function isValidPriority(priority: number): boolean {
  return [1, 2, 3, 4].includes(priority);
}
