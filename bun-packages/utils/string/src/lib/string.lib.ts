import { StringUtil } from '../utils/string.util';
import { CaseUtil } from '../utils/case.util';
import { FormatUtil } from '../utils/format.util';
import { ValidationUtil } from '../utils/validation.util';
import { TransformUtil } from '../utils/transform.util';
import { StringTransformer } from '../types/string.type';

/**
 * High-level string library functions
 */

export class StringLib {
  /**
   * Comprehensive string processor with multiple operations
   */
  static process(input: string, operations: {
    trim?: boolean;
    normalize?: boolean;
    case?: 'upper' | 'lower' | 'camel' | 'pascal' | 'snake' | 'kebab';
    truncate?: { length: number; suffix?: string };
    pad?: { length: number; fill?: string; position?: 'start' | 'end' | 'center' };
    mask?: { visible: number; char?: string };
  }): string {
    let result = input;

    // Trim
    if (operations.trim) {
      result = StringUtil.trim(result, { trimAll: true });
    }

    // Normalize whitespace
    if (operations.normalize) {
      result = FormatUtil.normalizeWhitespace(result);
    }

    // Case conversion
    if (operations.case) {
      switch (operations.case) {
        case 'upper':
          result = result.toUpperCase();
          break;
        case 'lower':
          result = result.toLowerCase();
          break;
        case 'camel':
          result = CaseUtil.toCamelCase(result);
          break;
        case 'pascal':
          result = CaseUtil.toPascalCase(result);
          break;
        case 'snake':
          result = CaseUtil.toSnakeCase(result);
          break;
        case 'kebab':
          result = CaseUtil.toKebabCase(result);
          break;
      }
    }

    // Truncate
    if (operations.truncate) {
      result = StringUtil.truncate(
        result, 
        operations.truncate.length, 
        operations.truncate.suffix
      );
    }

    // Pad
    if (operations.pad) {
      const { length, fill = ' ', position = 'end' } = operations.pad;
      if (position === 'start') {
        result = StringUtil.pad(result, { padStart: true, targetLength: length, fillString: fill });
      } else if (position === 'end') {
        result = StringUtil.pad(result, { padEnd: true, targetLength: length, fillString: fill });
      } else {
        result = StringUtil.pad(result, { padStart: true, padEnd: true, targetLength: length, fillString: fill });
      }
    }

    // Mask
    if (operations.mask) {
      result = TransformUtil.toMask(operations.mask.visible, operations.mask.char)(result);
    }

    return result;
  }

  /**
   * Creates a reusable string processor
   */
  static createProcessor(operations: Parameters<typeof StringLib.process>[1]): StringTransformer {
    return (input: string) => StringLib.process(input, operations);
  }

  /**
   * String similarity calculator (Levenshtein distance)
   */
  static similarity(a: string, b: string): number {
    const distance = this.levenshteinDistance(a, b);
    const maxLength = Math.max(a.length, b.length);
    return maxLength === 0 ? 1 : 1 - distance / maxLength;
  }

  /**
   * Levenshtein distance calculation
   */
  static levenshteinDistance(a: string, b: string): number {
    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[b.length][a.length];
  }

  /**
   * Find best match from options
   */
  static findBestMatch(input: string, options: string[]): { match: string; score: number } | null {
    if (options.length === 0) return null;

    let bestMatch = options[0];
    let bestScore = this.similarity(input, bestMatch);

    for (let i = 1; i < options.length; i++) {
      const score = this.similarity(input, options[i]);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = options[i];
      }
    }

    return { match: bestMatch, score: bestScore };
  }

  /**
   * Generate string variations
   */
  static generateVariations(input: string): string[] {
    const variations = new Set<string>();

    // Original
    variations.add(input);

    // Case variations
    variations.add(input.toLowerCase());
    variations.add(input.toUpperCase());
    variations.add(CaseUtil.toCamelCase(input));
    variations.add(CaseUtil.toPascalCase(input));
    variations.add(CaseUtil.toSnakeCase(input));
    variations.add(CaseUtil.toKebabCase(input));

    // Format variations
    variations.add(FormatUtil.normalizeWhitespace(input));
    variations.add(FormatUtil.removeAllWhitespace(input));
    variations.add(TransformUtil.toSlug()(input));
    variations.add(TransformUtil.toInitials()(input));

    // Trim variations
    variations.add(input.trim());
    variations.add(StringUtil.trim(input, { trimStart: true }));
    variations.add(StringUtil.trim(input, { trimEnd: true }));

    return Array.from(variations).filter(Boolean);
  }

  /**
   * Extract meaningful information from string
   */
  static extractInfo(input: string): {
    words: string[];
    numbers: string[];
    emails: string[];
    urls: string[];
    phoneNumbers: string[];
    hashtags: string[];
    mentions: string[];
  } {
    return {
      words: input.trim().split(/\s+/).filter(word => word.length > 0),
      numbers: FormatUtil.extractNumbers(input),
      emails: FormatUtil.extractEmails(input),
      urls: FormatUtil.extractUrls(input),
      phoneNumbers: FormatUtil.extractPhoneNumbers(input),
      hashtags: input.match(/#\w+/g) || [],
      mentions: input.match(/@\w+/g) || []
    };
  }

  /**
   * Check if string is meaningful (not just noise)
   */
  static isMeaningful(input: string): boolean {
    if (ValidationUtil.isEmpty(input)) return false;

    // Check if it contains at least one letter
    if (!/[a-zA-Z]/.test(input)) return false;

    // Check if it's not just repeated characters
    if (/^(.)\1+$/.test(input)) return false;

    // Check if it's not just a pattern
    if (/^(?:abc|123|test|demo|sample)$/i.test(input)) return false;

    return true;
  }

  /**
   * Sanitize string for safe usage
   */
  static sanitize(input: string, options: {
    allowHtml?: boolean;
    allowUrls?: boolean;
    allowEmails?: boolean;
    maxLength?: number;
  } = {}): string {
    let result = input;

    if (!options.allowHtml) {
      result = FormatUtil.stripHtml(result);
    }

    if (!options.allowUrls) {
      result = FormatUtil.stripUrls(result);
    }

    if (!options.allowEmails) {
      result = FormatUtil.stripEmails(result);
    }

    if (options.maxLength) {
      result = StringUtil.truncate(result, options.maxLength);
    }

    return FormatUtil.normalizeWhitespace(result);
  }
}
