import { StringTrimOptions, StringPadOptions } from '../types/string.type';
import { DEFAULT_PAD_STRING, DEFAULT_TRUNCATE_SUFFIX } from '../constants/string.constants';

/**
 * Core string utility functions
 */

export class StringUtil {
  /**
   * Trims string based on options
   */
  static trim(input: string, options: StringTrimOptions = {}): string {
    if (!input) return '';

    const { trimStart = false, trimEnd = false, trimAll = false } = options;

    if (trimAll) return input.trim();
    if (trimStart && trimEnd) return input.trim();
    if (trimStart) return input.replace(/^\s+/, '');
    if (trimEnd) return input.replace(/\s+$/, '');

    return input;
  }

  /**
   * Pads string to specified length
   */
  static pad(input: string, options: StringPadOptions): string {
    if (!input) return '';

    const { padStart = false, padEnd = false, fillString = DEFAULT_PAD_STRING, targetLength } = options;

    if (padStart && padEnd) {
      const totalPadding = targetLength - input.length;
      if (totalPadding <= 0) return input;
      
      const startPadding = Math.ceil(totalPadding / 2);
      const endPadding = totalPadding - startPadding;
      
      return fillString.repeat(startPadding).slice(0, startPadding) + 
             input + 
             fillString.repeat(endPadding).slice(0, endPadding);
    }

    if (padStart) {
      return input.padStart(targetLength, fillString);
    }

    if (padEnd) {
      return input.padEnd(targetLength, fillString);
    }

    return input;
  }

  /**
   * Truncates string to specified length
   */
  static truncate(input: string, maxLength: number, suffix: string = DEFAULT_TRUNCATE_SUFFIX): string {
    if (!input || input.length <= maxLength) return input;
    
    const truncateLength = maxLength - suffix.length;
    if (truncateLength <= 0) return suffix.slice(0, maxLength);
    
    return input.slice(0, truncateLength) + suffix;
  }

  /**
   * Reverses a string
   */
  static reverse(input: string): string {
    return input ? input.split('').reverse().join('') : '';
  }

  /**
   * Checks if string is empty or whitespace only
   */
  static isEmpty(input: string): boolean {
    return !input || input.trim().length === 0;
  }

  /**
   * Gets string length (Unicode aware)
   */
  static length(input: string): number {
    return input ? [...input].length : 0;
  }

  /**
   * Counts words in a string
   */
  static wordCount(input: string): number {
    if (!input) return 0;
    return input.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Gets character count (excluding whitespace)
   */
  static charCount(input: string, includeWhitespace: boolean = false): number {
    if (!input) return 0;
    return includeWhitespace ? input.length : input.replace(/\s/g, '').length;
  }

  /**
   * Extracts numbers from string
   */
  static extractNumbers(input: string): string {
    return input ? input.replace(/\D/g, '') : '';
  }

  /**
   * Extracts letters from string
   */
  static extractLetters(input: string): string {
    return input ? input.replace(/[^a-zA-Z]/g, '') : '';
  }

  /**
   * Checks if string contains only ASCII characters
   */
  static isASCII(input: string): boolean {
    return /^[\x00-\x7F]*$/.test(input);
  }

  /**
   * Converts string to safe filename
   */
  static toFilename(input: string, replacement: string = '_'): string {
    if (!input) return '';
    return input
      .replace(/[<>:"/\\|?*]/g, replacement)
      .replace(/\s+/g, replacement)
      .replace(new RegExp(`${replacement}+`, 'g'), replacement)
      .replace(new RegExp(`^${replacement}|${replacement}$`, 'g'), '');
  }
}
