/**
 * Queue validation utilities
 */

import type { QueueOptions } from '../types';

/**
 * Validates queue options
 */
export function validateQueueOptions(options: QueueOptions): void {
  if (options.maxSize !== undefined && options.maxSize <= 0) {
    throw new Error('maxSize must be positive');
  }
  
  if (options.concurrency !== undefined && options.concurrency <= 0) {
    throw new Error('concurrency must be positive');
  }
}
