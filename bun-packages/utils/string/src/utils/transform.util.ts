import { StringTransformer, StringComparator } from '../types/string.type';

/**
 * String transformation utilities
 */

export class TransformUtil {
  /**
   * Applies multiple transformers to string
   */
  static pipe(input: string, transformers: StringTransformer[]): string {
    return transformers.reduce((result, transformer) => transformer(result), input);
  }

  /**
   * Creates a transformer that prefixes string
   */
  static prefix(prefix: string): StringTransformer {
    return (input: string) => prefix + input;
  }

  /**
   * Creates a transformer that suffixes string
   */
  static suffix(suffix: string): StringTransformer {
    return (input: string) => input + suffix;
  }

  /**
   * Creates a transformer that wraps string
   */
  static wrap(wrapper: string): StringTransformer {
    return (input: string) => wrapper + input + wrapper;
  }

  /**
   * Creates a transformer that replaces substring
   */
  static replace(searchValue: string | RegExp, replaceValue: string): StringTransformer {
    return (input: string) => input.replace(searchValue, replaceValue);
  }

  /**
   * Creates a transformer that replaces all occurrences
   */
  static replaceAll(searchValue: string | RegExp, replaceValue: string): StringTransformer {
    const regex = typeof searchValue === 'string' ? new RegExp(searchValue, 'g') : new RegExp(searchValue.source, 'g');
    return (input: string) => input.replace(regex, replaceValue);
  }

  /**
   * Creates a transformer that maps each character
   */
  static mapChar(mapper: (char: string, index: number) => string): StringTransformer {
    return (input: string) => input.split('').map(mapper).join('');
  }

  /**
   * Creates a transformer that filters characters
   */
  static filterChar(predicate: (char: string, index: number) => boolean): StringTransformer {
    return (input: string) => input.split('').filter(predicate).join('');
  }

  /**
   * Creates a transformer that reduces string
   */
  static reduceChar<T>(reducer: (accumulator: T, char: string, index: number) => T, initialValue: T): (input: string) => T {
    return (input: string) => input.split('').reduce(reducer, initialValue);
  }

  /**
   * Creates a comparator for strings
   */
  static compare(caseSensitive: boolean = true): StringComparator {
    return (a: string, b: string) => {
      if (caseSensitive) {
        return a.localeCompare(b);
      }
      return a.toLowerCase().localeCompare(b.toLowerCase());
    };
  }

  /**
   * Creates a comparator for string length
   */
  static compareByLength(ascending: boolean = true): StringComparator {
    return (a: string, b: string) => {
      const diff = a.length - b.length;
      return ascending ? diff : -diff;
    };
  }

  /**
   * Creates a comparator for alphabetical order
   */
  static compareAlphabetical(caseSensitive: boolean = true): StringComparator {
    return (a: string, b: string) => {
      const aNormalized = caseSensitive ? a : a.toLowerCase();
      const bNormalized = caseSensitive ? b : b.toLowerCase();
      return aNormalized.localeCompare(bNormalized);
    };
  }

  /**
   * Creates a comparator for numeric strings
   */
  static compareNumeric(): StringComparator {
    return (a: string, b: string) => {
      const aNum = parseFloat(a) || 0;
      const bNum = parseFloat(b) || 0;
      return aNum - bNum;
    };
  }

  /**
   * Transforms string to slug
   */
  static toSlug(separator: string = '-'): StringTransformer {
    return (input: string) => {
      return input
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special chars
        .replace(/\s+/g, separator) // Replace spaces with separator
        .replace(new RegExp(`${separator}+`, 'g'), separator) // Replace multiple separators
        .replace(new RegExp(`^${separator}|${separator}$`, 'g'), ''); // Remove leading/trailing separators
    };
  }

  /**
   * Transforms string to initials
   */
  static toInitials(maxLength?: number): StringTransformer {
    return (input: string) => {
      const words = input.trim().split(/\s+/);
      const initials = words.map(word => word.charAt(0).toUpperCase()).join('');
      return maxLength ? initials.slice(0, maxLength) : initials;
    };
  }

  /**
   * Transforms string to acronym
   */
  static toAcronym(): StringTransformer {
    return (input: string) => {
      return input
        .replace(/[^a-zA-Z0-9\s]/g, '') // Keep only alphanumeric and spaces
        .split(/\s+/) // Split by whitespace
        .map(word => word.charAt(0).toUpperCase()) // Take first letter of each word
        .join(''); // Join them
    };
  }

  /**
   * Transforms string to hash (simple)
   */
  static toHash(): StringTransformer {
    return (input: string) => {
      let hash = 0;
      for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return hash.toString(36);
    };
  }

  /**
   * Transforms string to mask (hide sensitive data)
   */
  static toMask(visibleChars: number = 4, maskChar: string = '*'): StringTransformer {
    return (input: string) => {
      if (input.length <= visibleChars) return input;
      
      const visible = input.slice(0, visibleChars);
      const masked = maskChar.repeat(input.length - visibleChars);
      return visible + masked;
    };
  }

  /**
   * Transforms string to title case
   */
  static toTitleCase(): StringTransformer {
    return (input: string) => {
      return input.replace(/\b\w/g, char => char.toUpperCase());
    };
  }

  /**
   * Transforms string to sentence case
   */
  static toSentenceCase(): StringTransformer {
    return (input: string) => {
      return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
    };
  }

  /**
   * Transforms string to alternating case
   */
  static toAlternatingCase(): StringTransformer {
    return (input: string) => {
      return input.split('').map((char, index) => 
        index % 2 === 0 ? char.toLowerCase() : char.toUpperCase()
      ).join('');
    };
  }

  /**
   * Transforms string to random case
   */
  static toRandomCase(): StringTransformer {
    return (input: string) => {
      return input.split('').map(char => 
        Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase()
      ).join('');
    };
  }
}
