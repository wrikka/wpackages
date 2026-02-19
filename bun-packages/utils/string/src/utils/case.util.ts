import { StringCaseOptions } from '../types/string.type';
import { CASE_PATTERNS } from '../constants/string.constants';

/**
 * String case conversion utilities
 */

export class CaseUtil {
  /**
   * Converts string to specified case
   */
  static convert(input: string, options: StringCaseOptions): string {
    if (!input) return '';

    const { uppercase, lowercase, capitalize, camelCase, pascalCase, snakeCase, kebabCase } = options;

    let result = input;

    if (uppercase) result = result.toUpperCase();
    if (lowercase) result = result.toLowerCase();
    if (capitalize) result = this.capitalize(result);
    if (camelCase) result = this.toCamelCase(result);
    if (pascalCase) result = this.toPascalCase(result);
    if (snakeCase) result = this.toSnakeCase(result);
    if (kebabCase) result = this.toKebabCase(result);

    return result;
  }

  /**
   * Capitalizes first letter of each word
   */
  static capitalize(input: string): string {
    if (!input) return '';
    return input.replace(/\b\w/g, char => char.toUpperCase());
  }

  /**
   * Converts to camelCase
   */
  static toCamelCase(input: string): string {
    if (!input) return '';
    return input
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '')
      .replace(/[-_]/g, '');
  }

  /**
   * Converts to PascalCase
   */
  static toPascalCase(input: string): string {
    if (!input) return '';
    return input
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
      .replace(/\s+/g, '')
      .replace(/[-_]/g, '');
  }

  /**
   * Converts to snake_case
   */
  static toSnakeCase(input: string): string {
    if (!input) return '';
    return input
      .replace(/\W+/g, ' ')
      .split(/ |\B(?=[A-Z])/)
      .map(word => word.toLowerCase())
      .join('_');
  }

  /**
   * Converts to kebab-case
   */
  static toKebabCase(input: string): string {
    if (!input) return '';
    return input
      .replace(/\W+/g, ' ')
      .split(/ |\B(?=[A-Z])/)
      .map(word => word.toLowerCase())
      .join('-');
  }

  /**
   * Converts to UPPER_SNAKE_CASE
   */
  static toUpperSnakeCase(input: string): string {
    return this.toSnakeCase(input).toUpperCase();
  }

  /**
   * Detects string case pattern
   */
  static detectCase(input: string): keyof typeof CASE_PATTERNS | 'unknown' {
    for (const [caseName, pattern] of Object.entries(CASE_PATTERNS)) {
      if (pattern.test(input)) {
        return caseName as keyof typeof CASE_PATTERNS;
      }
    }
    return 'unknown';
  }

  /**
   * Checks if string is camelCase
   */
  static isCamelCase(input: string): boolean {
    return CASE_PATTERNS.CAMEL_CASE.test(input);
  }

  /**
   * Checks if string is PascalCase
   */
  static isPascalCase(input: string): boolean {
    return CASE_PATTERNS.PASCAL_CASE.test(input);
  }

  /**
   * Checks if string is snake_case
   */
  static isSnakeCase(input: string): boolean {
    return CASE_PATTERNS.SNAKE_CASE.test(input);
  }

  /**
   * Checks if string is kebab-case
   */
  static isKebabCase(input: string): boolean {
    return CASE_PATTERNS.KEBAB_CASE.test(input);
  }

  /**
   * Splits string by case boundaries
   */
  static splitByCase(input: string): string[] {
    if (!input) return [];
    
    return input
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
      .replace(/[-_]/g, ' ')
      .trim()
      .split(/\s+/);
  }
}
