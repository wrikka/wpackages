import { ValidationRule, ValidationSchema, ValidationResult, ValidationError } from '../types/validation.type';
import { COMMON_VALIDATION_RULES, VALIDATION_ERROR_MESSAGES } from '../constants/validation.constants';

/**
 * String validation utilities
 */

export class ValidationUtil {
  /**
   * Validates string against schema
   */
  static validate(input: string, schema: ValidationSchema): ValidationResult {
    const errors: ValidationError[] = [];

    // Check required
    if (schema.required && this.isEmpty(input)) {
      errors.push({
        rule: 'required',
        message: VALIDATION_ERROR_MESSAGES.EMPTY,
        value: input
      });
    }

    // Skip other validations if empty and not required
    if (this.isEmpty(input) && !schema.required) {
      return { isValid: true, errors: [], data: input };
    }

    // Check min length
    if (schema.minLength !== undefined && input.length < schema.minLength) {
      errors.push({
        rule: 'minLength',
        message: `${VALIDATION_ERROR_MESSAGES.TOO_SHORT} (minimum ${schema.minLength} characters)`,
        value: input
      });
    }

    // Check max length
    if (schema.maxLength !== undefined && input.length > schema.maxLength) {
      errors.push({
        rule: 'maxLength',
        message: `${VALIDATION_ERROR_MESSAGES.TOO_LONG} (maximum ${schema.maxLength} characters)`,
        value: input
      });
    }

    // Check pattern
    if (schema.pattern && !schema.pattern.test(input)) {
      errors.push({
        rule: 'pattern',
        message: VALIDATION_ERROR_MESSAGES.INVALID_FORMAT,
        value: input
      });
    }

    // Check custom rules
    for (const rule of schema.rules) {
      if (!rule.validator(input)) {
        errors.push({
          rule: rule.name,
          message: rule.message,
          value: input
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      data: input
    };
  }

  /**
   * Checks if string is empty or whitespace only
   */
  static isEmpty(input: string): boolean {
    return !input || input.trim().length === 0;
  }

  /**
   * Validates email format
   */
  static isEmail(input: string): boolean {
    return COMMON_VALIDATION_RULES.EMAIL.validator(input);
  }

  /**
   * Validates URL format
   */
  static isUrl(input: string): boolean {
    return COMMON_VALIDATION_RULES.URL.validator(input);
  }

  /**
   * Validates phone number format
   */
  static isPhone(input: string): boolean {
    return COMMON_VALIDATION_RULES.PHONE.validator(input);
  }

  /**
   * Checks if string contains only numbers
   */
  static isNumeric(input: string): boolean {
    return COMMON_VALIDATION_RULES.NUMERIC.validator(input);
  }

  /**
   * Checks if string contains only letters
   */
  static isAlpha(input: string): boolean {
    return COMMON_VALIDATION_RULES.ALPHA.validator(input);
  }

  /**
   * Checks if string contains only letters and numbers
   */
  static isAlphanumeric(input: string): boolean {
    return COMMON_VALIDATION_RULES.ALPHANUMERIC.validator(input);
  }

  /**
   * Validates string against custom rule
   */
  static validateRule(input: string, rule: ValidationRule): boolean {
    return rule.validator(input);
  }

  /**
   * Creates a custom validation rule
   */
  static createRule(name: string, validator: (value: string) => boolean, message: string): ValidationRule {
    return { name, validator, message };
  }

  /**
   * Validates string length
   */
  static isValidLength(input: string, minLength?: number, maxLength?: number): boolean {
    const length = input.length;
    
    if (minLength !== undefined && length < minLength) return false;
    if (maxLength !== undefined && length > maxLength) return false;
    
    return true;
  }

  /**
   * Validates string against regex pattern
   */
  static matchesPattern(input: string, pattern: RegExp): boolean {
    return pattern.test(input);
  }

  /**
   * Checks if string contains substring
   */
  static contains(input: string, substring: string, caseSensitive: boolean = true): boolean {
    if (caseSensitive) {
      return input.includes(substring);
    }
    return input.toLowerCase().includes(substring.toLowerCase());
  }

  /**
   * Checks if string starts with substring
   */
  static startsWith(input: string, substring: string, caseSensitive: boolean = true): boolean {
    if (caseSensitive) {
      return input.startsWith(substring);
    }
    return input.toLowerCase().startsWith(substring.toLowerCase());
  }

  /**
   * Checks if string ends with substring
   */
  static endsWith(input: string, substring: string, caseSensitive: boolean = true): boolean {
    if (caseSensitive) {
      return input.endsWith(substring);
    }
    return input.toLowerCase().endsWith(substring.toLowerCase());
  }

  /**
   * Validates string contains only ASCII characters
   */
  static isASCII(input: string): boolean {
    return /^[\x00-\x7F]*$/.test(input);
  }

  /**
   * Validates string is valid JSON
   */
  static isJSON(input: string): boolean {
    try {
      JSON.parse(input);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validates string is valid base64
   */
  static isBase64(input: string): boolean {
    try {
      return btoa(atob(input)) === input;
    } catch {
      return false;
    }
  }

  /**
   * Validates string is valid UUID
   */
  static isUUID(input: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(input);
  }
}
