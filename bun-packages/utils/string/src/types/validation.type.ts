/**
 * Validation related types for string operations
 */

export interface ValidationRule {
  name: string;
  validator: (value: string) => boolean;
  message: string;
}

export interface ValidationSchema {
  rules: ValidationRule[];
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
}

export interface ValidationError {
  field?: string;
  rule: string;
  message: string;
  value: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  data?: string;
}
