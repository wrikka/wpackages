/**
 * WPackages String Utilities
 * 
 * A comprehensive string manipulation and validation library for TypeScript
 * 
 * @version 1.0.0
 * @author WPackages Team
 */

// Export types
export * from './types';

// Export constants
export * from './constants';

// Export utility classes
export * from './utils';

// Export library functions
export * from './lib';

// Export error handling
export * from './error';

// Export configuration
export * from './config';

// Re-export commonly used utilities for convenience
export { StringUtil } from './utils/string.util';
export { CaseUtil } from './utils/case.util';
export { FormatUtil } from './utils/format.util';
export { ValidationUtil } from './utils/validation.util';
export { TransformUtil } from './utils/transform.util';

export { StringLib } from './lib/string.lib';
export { StringError } from './error/string-error';
export { ErrorHandler } from './error/error-handler';

export { StringConfigManager } from './config/string.config';
export { ValidationConfigManager } from './config/validation.config';

// Re-export commonly used types
export type {
  StringCaseOptions,
  StringTrimOptions,
  StringPadOptions,
  StringFormatOptions,
  StringValidationResult,
  StringTransformer,
  StringValidator,
  StringComparator,
  StringErrorCode
} from './types/string.type';

export type {
  ValidationRule,
  ValidationSchema,
  ValidationError,
  ValidationResult
} from './types/validation.type';
