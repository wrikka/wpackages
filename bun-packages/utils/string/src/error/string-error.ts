import { StringErrorCode } from '../types/string.type';

/**
 * Custom error class for string operations
 */

export class StringError extends Error {
  public readonly code: StringErrorCode;
  public readonly field?: string;
  public readonly value?: string;
  public readonly timestamp: Date;

  constructor(
    message: string,
    code: StringErrorCode,
    options: {
      field?: string;
      value?: string;
      cause?: Error;
    } = {}
  ) {
    super(message);
    this.name = 'StringError';
    this.code = code;
    this.field = options.field;
    this.value = options.value;
    this.timestamp = new Date();

    if (options.cause) {
      this.cause = options.cause;
    }

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StringError);
    }
  }

  /**
   * Creates a new StringError for empty string
   */
  static empty(field?: string, value?: string): StringError {
    return new StringError(
      `String cannot be empty${field ? ` for field '${field}'` : ''}`,
      StringErrorCode.EMPTY_STRING,
      { field, value }
    );
  }

  /**
   * Creates a new StringError for invalid length
   */
  static invalidLength(
    expected: { min?: number; max?: number },
    actual: number,
    field?: string,
    value?: string
  ): StringError {
    const message = `String length ${actual} is invalid`;
    const details = [];
    
    if (expected.min !== undefined) details.push(`minimum ${expected.min}`);
    if (expected.max !== undefined) details.push(`maximum ${expected.max}`);
    
    return new StringError(
      `${message}${details.length > 0 ? ` (${details.join(', ')})` : ''}${field ? ` for field '${field}'` : ''}`,
      StringErrorCode.INVALID_LENGTH,
      { field, value }
    );
  }

  /**
   * Creates a new StringError for invalid format
   */
  static invalidFormat(format: string, field?: string, value?: string): StringError {
    return new StringError(
      `String format is invalid: ${format}${field ? ` for field '${field}'` : ''}`,
      StringErrorCode.INVALID_FORMAT,
      { field, value }
    );
  }

  /**
   * Creates a new StringError for invalid characters
   */
  static invalidCharacters(characters: string, field?: string, value?: string): StringError {
    return new StringError(
      `String contains invalid characters: ${characters}${field ? ` for field '${field}'` : ''}`,
      StringErrorCode.CONTAINS_INVALID_CHARS,
      { field, value }
    );
  }

  /**
   * Creates a new StringError for validation failure
   */
  static validationFailed(errors: string[], field?: string, value?: string): StringError {
    return new StringError(
      `String validation failed: ${errors.join(', ')}${field ? ` for field '${field}'` : ''}`,
      StringErrorCode.VALIDATION_FAILED,
      { field, value }
    );
  }

  /**
   * Converts error to JSON
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      field: this.field,
      value: this.value,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack
    };
  }

  /**
   * Creates StringError from plain object
   */
  static fromJSON(data: Record<string, any>): StringError {
    const error = new StringError(
      data.message,
      data.code,
      {
        field: data.field,
        value: data.value
      }
    );
    error.timestamp = new Date(data.timestamp);
    if (data.stack) {
      error.stack = data.stack;
    }
    return error;
  }
}
