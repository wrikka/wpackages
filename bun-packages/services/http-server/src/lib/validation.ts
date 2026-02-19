export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => boolean | string;
}

export interface ValidationResult<T = unknown> {
  valid: boolean;
  errors: string[];
  value?: T;
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: string[] = [],
    public field?: string
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export function validateString(value: unknown, rules: ValidationRule[]): ValidationResult {
  const errors: string[] = [];
  let valid = true;

  if (typeof value !== 'string') {
    errors.push('Value must be a string');
    return { valid: false, errors };
  }

  const str = value as string;

  for (const rule of rules) {
    if (rule.required && (str === undefined || str === '')) {
      errors.push(`${rule.field} is required`);
      valid = false;
    }

    if (rule.min !== undefined && str.length < rule.min) {
      errors.push(`${rule.field} must be at least ${rule.min} characters`);
      valid = false;
    }

    if (rule.max !== undefined && str.length > rule.max) {
      errors.push(`${rule.field} must be at most ${rule.max} characters`);
      valid = false;
    }

    if (rule.pattern && !rule.pattern.test(str)) {
      errors.push(`${rule.field} format is invalid`);
      valid = false;
    }

    if (rule.custom) {
      const customResult = rule.custom(str);
      if (typeof customResult === 'boolean') {
        if (!customResult) {
          errors.push(`${rule.field} is invalid`);
          valid = false;
        }
      } else if (typeof customResult === 'string') {
        errors.push(customResult);
        valid = false;
      }
    }
  }

  return { valid, errors, value: str };
}

export function validateNumber(value: unknown, rules: ValidationRule[]): ValidationResult {
  const errors: string[] = [];
  let valid = true;

  if (typeof value !== 'number') {
    errors.push('Value must be a number');
    return { valid: false, errors };
  }

  const num = value as number;

  for (const rule of rules) {
    if (rule.required && (value === undefined || isNaN(num))) {
      errors.push(`${rule.field} is required`);
      valid = false;
    }

    if (rule.min !== undefined && num < rule.min) {
      errors.push(`${rule.field} must be at least ${rule.min}`);
      valid = false;
    }

    if (rule.max !== undefined && num > rule.max) {
      errors.push(`${rule.field} must be at most ${rule.max}`);
      valid = false;
    }

    if (rule.custom) {
      const customResult = rule.custom(num);
      if (typeof customResult === 'boolean') {
        if (!customResult) {
          errors.push(`${rule.field} is invalid`);
          valid = false;
        }
      } else if (typeof customResult === 'string') {
        errors.push(customResult);
        valid = false;
      }
    }
  }

  return { valid, errors, value: num };
}

export function validateObject(value: unknown, rules: ValidationRule[]): ValidationResult {
  const errors: string[] = [];
  let valid = true;

  if (typeof value !== 'object' || value === null) {
    errors.push('Value must be an object');
    return { valid: false, errors };
  }

  const obj = value as Record<string, unknown>;

  for (const rule of rules) {
    if (rule.required && (!obj || Object.keys(obj).length === 0)) {
      errors.push(`${rule.field} is required`);
      valid = false;
    }

    if (rule.custom) {
      const customResult = rule.custom(obj);
      if (typeof customResult === 'boolean') {
        if (!customResult) {
          errors.push(`${rule.field} is invalid`);
          valid = false;
        }
      } else if (typeof customResult === 'string') {
        errors.push(customResult);
        valid = false;
      }
    }
  }

  return { valid, errors, value: obj };
}

export function createValidator(rules: ValidationRule[]) {
  return (value: unknown) => validateValue(value, rules);
}

function validateValue(value: unknown, rules: ValidationRule[]): ValidationResult {
  if (rules.length === 0) {
    return { valid: true, errors: [], value };
  }

  // Use first matching rule type or default to string validation
  const primaryRule = rules.find(rule => rule.type) || { type: 'string' as const };

  switch (primaryRule.type) {
    case 'string':
      return validateString(value, rules);
    case 'number':
      return validateNumber(value, rules);
    case 'object':
      return validateObject(value, rules);
    default:
      return validateString(value, rules);
  }
}
