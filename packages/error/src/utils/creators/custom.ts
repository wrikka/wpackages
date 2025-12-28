import { CustomError, type CustomErrorOptions } from '../../error';

/**
 * Creates a new error class that extends CustomError.
 * This is useful for creating domain-specific errors.
 * @param errorName - The name for the new error class.
 * @returns A new class that extends CustomError.
 * @example
 * const MyCustomError = createErrorFactory<{ customField: string }>('MyCustomError');
 * const err = new MyCustomError({ message: 'test', customField: 'value' });
 * console.log(err.name); // 'MyCustomError'
 * console.log(err.customField); // 'value'
 */
export function createErrorFactory<T extends Record<string, unknown>>(
  errorName: string,
) {
  const reservedKeys = new Set<string>([
    'name',
    'message',
    'cause',
    'context',
    'stack',
  ]);

  const assignExtraFields = (target: Record<string, unknown>, source: Record<string, unknown>) => {
    for (const [key, value] of Object.entries(source)) {
      if (reservedKeys.has(key)) continue;
      target[key] = value;
    }
  };

  const NewError = class extends CustomError {

    constructor(options: CustomErrorOptions & T) {
      super(options);
      this.name = errorName;
      assignExtraFields(this as Record<string, unknown>, options);
    }
  };

  // Set the display name of the class for better debugging
  Object.defineProperty(NewError, 'name', { value: errorName });

  return NewError;
}
