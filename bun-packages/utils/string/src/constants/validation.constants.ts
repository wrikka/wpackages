/**
 * Validation constants for string operations
 */

export const COMMON_VALIDATION_RULES = {
  REQUIRED: {
    name: 'required',
    validator: (value: string) => value.length > 0,
    message: 'Field is required'
  },
  EMAIL: {
    name: 'email',
    validator: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Invalid email format'
  },
  URL: {
    name: 'url',
    validator: (value: string) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message: 'Invalid URL format'
  },
  PHONE: {
    name: 'phone',
    validator: (value: string) => /^\+?[\d\s\-\(\)]+$/.test(value) && value.replace(/\D/g, '').length >= 10,
    message: 'Invalid phone number format'
  },
  NUMERIC: {
    name: 'numeric',
    validator: (value: string) => /^\d+$/.test(value),
    message: 'Must contain only numbers'
  },
  ALPHA: {
    name: 'alpha',
    validator: (value: string) => /^[a-zA-Z]+$/.test(value),
    message: 'Must contain only letters'
  },
  ALPHANUMERIC: {
    name: 'alphanumeric',
    validator: (value: string) => /^[a-zA-Z0-9]+$/.test(value),
    message: 'Must contain only letters and numbers'
  }
} as const;

export const VALIDATION_ERROR_MESSAGES = {
  EMPTY: 'Value cannot be empty',
  TOO_SHORT: 'Value is too short',
  TOO_LONG: 'Value is too long',
  INVALID_FORMAT: 'Invalid format',
  CONTAINS_INVALID_CHARS: 'Contains invalid characters'
} as const;
