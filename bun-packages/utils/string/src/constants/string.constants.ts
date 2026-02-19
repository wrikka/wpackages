/**
 * String manipulation constants
 */

export const DEFAULT_PAD_STRING = ' ';
export const DEFAULT_TRUNCATE_SUFFIX = '...';
export const DEFAULT_WORD_SEPARATOR = ' ';

export const CASE_PATTERNS = {
  CAMEL_CASE: /^[a-z][a-zA-Z0-9]*$/,
  PASCAL_CASE: /^[A-Z][a-zA-Z0-9]*$/,
  SNAKE_CASE: /^[a-z][a-z0-9_]*$/,
  KEBAB_CASE: /^[a-z][a-z0-9-]*$/,
  UPPER_SNAKE_CASE: /^[A-Z][A-Z0-9_]*$/
} as const;

export const WHITESPACE_PATTERNS = {
  ALL: /\s+/g,
  START: /^\s+/,
  END: /\s+$/,
  MULTIPLE_SPACES: / {2,}/g,
  NEWLINES: /\r?\n/g,
  TABS: /\t/g
} as const;

export const SPECIAL_CHAR_PATTERNS = {
  HTML_TAGS: /<[^>]*>/g,
  URLS: /https?:\/\/[^\s]+/g,
  EMAILS: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  PHONE_NUMBERS: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
  NUMBERS: /\d+/g,
  NON_ALPHANUMERIC: /[^a-zA-Z0-9]/g
} as const;

export const UNICODE_PATTERNS = {
  ACCENTS: /[\u0300-\u036f]/g,
  DIACRITICS: /[\u0300-\u036f]/g,
  EMOJI: /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu
} as const;
