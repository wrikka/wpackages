import { StringFormatOptions } from '../types/string.type';
import { WHITESPACE_PATTERNS, SPECIAL_CHAR_PATTERNS, UNICODE_PATTERNS } from '../constants/string.constants';

/**
 * String formatting utilities
 */

export class FormatUtil {
  /**
   * Formats string based on options
   */
  static format(input: string, options: StringFormatOptions): string {
    if (!input) return '';

    let result = input;

    const { removeWhitespace, removeSpecialChars, normalizeUnicode } = options;

    if (removeWhitespace) {
      result = result.replace(WHITESPACE_PATTERNS.ALL, '');
    }

    if (removeSpecialChars) {
      result = result.replace(SPECIAL_CHAR_PATTERNS.NON_ALPHANUMERIC, '');
    }

    if (normalizeUnicode) {
      result = this.normalizeUnicode(result);
    }

    return result;
  }

  /**
   * Normalizes Unicode string (removes diacritics)
   */
  static normalizeUnicode(input: string): string {
    if (!input) return '';
    return input
      .normalize('NFD')
      .replace(UNICODE_PATTERNS.DIACRITICS, '');
  }

  /**
   * Removes HTML tags from string
   */
  static stripHtml(input: string): string {
    if (!input) return '';
    return input.replace(SPECIAL_CHAR_PATTERNS.HTML_TAGS, '');
  }

  /**
   * Removes URLs from string
   */
  static stripUrls(input: string): string {
    if (!input) return '';
    return input.replace(SPECIAL_CHAR_PATTERNS.URLS, '');
  }

  /**
   * Removes email addresses from string
   */
  static stripEmails(input: string): string {
    if (!input) return '';
    return input.replace(SPECIAL_CHAR_PATTERNS.EMAILS, '');
  }

  /**
   * Removes phone numbers from string
   */
  static stripPhoneNumbers(input: string): string {
    if (!input) return '';
    return input.replace(SPECIAL_CHAR_PATTERNS.PHONE_NUMBERS, '');
  }

  /**
   * Removes numbers from string
   */
  static stripNumbers(input: string): string {
    if (!input) return '';
    return input.replace(SPECIAL_CHAR_PATTERNS.NUMBERS, '');
  }

  /**
   * Normalizes whitespace (converts multiple spaces to single space)
   */
  static normalizeWhitespace(input: string): string {
    if (!input) return '';
    return input
      .replace(WHITESPACE_PATTERNS.MULTIPLE_SPACES, ' ')
      .replace(WHITESPACE_PATTERNS.NEWLINES, ' ')
      .replace(WHITESPACE_PATTERNS.TABS, ' ')
      .trim();
  }

  /**
   * Removes all whitespace
   */
  static removeAllWhitespace(input: string): string {
    if (!input) return '';
    return input.replace(WHITESPACE_PATTERNS.ALL, '');
  }

  /**
   * Removes leading whitespace
   */
  static trimStart(input: string): string {
    if (!input) return '';
    return input.replace(WHITESPACE_PATTERNS.START, '');
  }

  /**
   * Removes trailing whitespace
   */
  static trimEnd(input: string): string {
    if (!input) return '';
    return input.replace(WHITESPACE_PATTERNS.END, '');
  }

  /**
   * Extracts URLs from string
   */
  static extractUrls(input: string): string[] {
    if (!input) return [];
    const matches = input.match(SPECIAL_CHAR_PATTERNS.URLS);
    return matches || [];
  }

  /**
   * Extracts email addresses from string
   */
  static extractEmails(input: string): string[] {
    if (!input) return [];
    const matches = input.match(SPECIAL_CHAR_PATTERNS.EMAILS);
    return matches || [];
  }

  /**
   * Extracts phone numbers from string
   */
  static extractPhoneNumbers(input: string): string[] {
    if (!input) return [];
    const matches = input.match(SPECIAL_CHAR_PATTERNS.PHONE_NUMBERS);
    return matches || [];
  }

  /**
   * Extracts numbers from string
   */
  static extractNumbers(input: string): string[] {
    if (!input) return [];
    const matches = input.match(SPECIAL_CHAR_PATTERNS.NUMBERS);
    return matches || [];
  }

  /**
   * Removes emoji from string
   */
  static stripEmoji(input: string): string {
    if (!input) return '';
    return input.replace(UNICODE_PATTERNS.EMOJI, '');
  }

  /**
   * Escapes HTML special characters
   */
  static escapeHtml(input: string): string {
    if (!input) return '';
    const htmlEscapes: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    
    return input.replace(/[&<>"']/g, char => htmlEscapes[char]);
  }

  /**
   * Unescapes HTML special characters
   */
  static unescapeHtml(input: string): string {
    if (!input) return '';
    const htmlUnescapes: Record<string, string> = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'"
    };
    
    return input.replace(/&(?:amp|lt|gt|quot|#39);/g, entity => htmlUnescapes[entity]);
  }
}
