import { StringError } from './string-error';
import { ValidationResult } from '../types/validation.type';

/**
 * Error handling utilities for string operations
 */

export class ErrorHandler {
  /**
   * Handles validation result and throws appropriate error if invalid
   */
  static handleValidation(result: ValidationResult, field?: string): void {
    if (!result.isValid) {
      const messages = result.errors.map(error => error.message);
      throw StringError.validationFailed(messages, field, result.data);
    }
  }

  /**
   * Wraps function with error handling
   */
  static wrap<T extends (...args: any[]) => any>(
    fn: T,
    options: {
      field?: string;
      rethrow?: boolean;
      onError?: (error: Error) => void;
    } = {}
  ): T {
    return ((...args: Parameters<T>) => {
      try {
        return fn(...args);
      } catch (error) {
        if (error instanceof StringError) {
          options.onError?.(error);
          if (options.rethrow) {
            throw error;
          }
          return null;
        }

        // Convert other errors to StringError
        const stringError = new StringError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          StringErrorCode.VALIDATION_FAILED,
          { field: options.field, cause: error instanceof Error ? error : undefined }
        );

        options.onError?.(stringError);
        if (options.rethrow) {
          throw stringError;
        }
        return null;
      }
    }) as T;
  }

  /**
   * Creates safe version of function that returns result instead of throwing
   */
  static safe<T extends (...args: any[]) => any>(
    fn: T,
    defaultValue?: ReturnType<T>
  ): (...args: Parameters<T>) => { success: boolean; result?: ReturnType<T>; error?: StringError } {
    return (...args: Parameters<T>) => {
      try {
        const result = fn(...args);
        return { success: true, result };
      } catch (error) {
        const stringError = error instanceof StringError 
          ? error 
          : new StringError(
              error instanceof Error ? error.message : 'Unknown error occurred',
              StringErrorCode.VALIDATION_FAILED
            );
        
        return { success: false, error: stringError, result: defaultValue };
      }
    };
  }

  /**
   * Creates retry function with exponential backoff
   */
  static async retry<T>(
    fn: () => Promise<T>,
    options: {
      maxAttempts?: number;
      baseDelay?: number;
      maxDelay?: number;
      onRetry?: (attempt: number, error: Error) => void;
    } = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      baseDelay = 1000,
      maxDelay = 10000,
      onRetry
    } = options;

    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt === maxAttempts) {
          break;
        }

        const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
        onRetry?.(attempt, lastError);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  /**
   * Creates circuit breaker pattern for string operations
   */
  static circuitBreaker<T extends (...args: any[]) => any>(
    fn: T,
    options: {
      failureThreshold?: number;
      resetTimeout?: number;
      onStateChange?: (state: 'closed' | 'open' | 'half-open') => void;
    } = {}
  ): T {
    const {
      failureThreshold = 5,
      resetTimeout = 60000,
      onStateChange
    } = options;

    let failureCount = 0;
    let lastFailureTime = 0;
    let state: 'closed' | 'open' | 'half-open' = 'closed';

    return ((...args: Parameters<T>) => {
      const now = Date.now();

      // Reset circuit breaker if enough time has passed
      if (state === 'open' && now - lastFailureTime > resetTimeout) {
        state = 'half-open';
        failureCount = 0;
        onStateChange?.(state);
      }

      // Reject calls if circuit is open
      if (state === 'open') {
        throw new StringError(
          'Circuit breaker is open',
          StringErrorCode.VALIDATION_FAILED
        );
      }

      try {
        const result = fn(...args);
        
        // Reset on success in half-open state
        if (state === 'half-open') {
          state = 'closed';
          failureCount = 0;
          onStateChange?.(state);
        }
        
        return result;
      } catch (error) {
        failureCount++;
        lastFailureTime = now;

        // Open circuit if threshold reached
        if (failureCount >= failureThreshold) {
          state = 'open';
          onStateChange?.(state);
        }

        throw error;
      }
    }) as T;
  }

  /**
   * Creates timeout wrapper for async operations
   */
  static withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    timeoutMessage: string = 'Operation timed out'
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        setTimeout(() => {
          reject(new StringError(timeoutMessage, StringErrorCode.VALIDATION_FAILED));
        }, timeoutMs);
      })
    ]);
  }

  /**
   * Creates rate limiter for string operations
   */
  static rateLimiter<T extends (...args: any[]) => any>(
    fn: T,
    options: {
      maxCalls?: number;
      windowMs?: number;
      onRateLimit?: () => void;
    } = {}
  ): T {
    const {
      maxCalls = 10,
      windowMs = 1000,
      onRateLimit
    } = options;

    const calls: number[] = [];

    return ((...args: Parameters<T>) => {
      const now = Date.now();
      
      // Remove old calls outside the window
      const windowStart = now - windowMs;
      while (calls.length > 0 && calls[0] < windowStart) {
        calls.shift();
      }

      // Check if rate limit exceeded
      if (calls.length >= maxCalls) {
        onRateLimit?.();
        throw new StringError(
          'Rate limit exceeded',
          StringErrorCode.VALIDATION_FAILED
        );
      }

      // Record this call
      calls.push(now);
      
      return fn(...args);
    }) as T;
  }
}
