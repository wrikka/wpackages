/**
 * String manipulation options and interfaces
 */

export interface StringCaseOptions {
  uppercase?: boolean;
  lowercase?: boolean;
  capitalize?: boolean;
  camelCase?: boolean;
  pascalCase?: boolean;
  snakeCase?: boolean;
  kebabCase?: boolean;
}

export interface StringTrimOptions {
  trimStart?: boolean;
  trimEnd?: boolean;
  trimAll?: boolean;
}

export interface StringPadOptions {
  padStart?: boolean;
  padEnd?: boolean;
  fillString?: string;
  targetLength: number;
}

export interface StringFormatOptions {
  removeWhitespace?: boolean;
  removeSpecialChars?: boolean;
  normalizeUnicode?: boolean;
}

export interface StringValidationResult {
  isValid: boolean;
  errors: string[];
}

export type StringTransformer = (input: string) => string;
export type StringValidator = (input: string) => StringValidationResult;
export type StringComparator = (a: string, b: string) => number;

export enum StringErrorCode {
  EMPTY_STRING = 'EMPTY_STRING',
  INVALID_LENGTH = 'INVALID_LENGTH',
  INVALID_FORMAT = 'INVALID_FORMAT',
  CONTAINS_INVALID_CHARS = 'CONTAINS_INVALID_CHARS',
  VALIDATION_FAILED = 'VALIDATION_FAILED'
}
