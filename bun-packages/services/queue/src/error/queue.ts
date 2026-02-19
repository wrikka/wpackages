/**
 * Queue state and capacity errors
 */

import { QueueError } from './base';

/** Error thrown when queue is full */
export class QueueFullError extends QueueError {
  constructor(message = 'Queue is full') {
    super(message, 'QUEUE_FULL');
    this.name = 'QueueFullError';
  }
}

/** Error thrown when queue is empty */
export class QueueEmptyError extends QueueError {
  constructor(message = 'Queue is empty') {
    super(message, 'QUEUE_EMPTY');
    this.name = 'QueueEmptyError';
  }
}

/** Error thrown when queue is in invalid state */
export class QueueStateError extends QueueError {
  constructor(message = 'Queue is in invalid state') {
    super(message, 'QUEUE_STATE');
    this.name = 'QueueStateError';
  }
}
