/**
 * Queue operation and item errors
 */

import { QueueError } from "./base";

/** Error thrown when operation times out */
export class QueueTimeoutError extends QueueError {
	constructor(message = "Queue operation timed out") {
		super(message, "QUEUE_TIMEOUT");
		this.name = "QueueTimeoutError";
	}
}

/** Error thrown when queue item is not found */
export class QueueItemNotFoundError extends QueueError {
	constructor(message = "Queue item not found") {
		super(message, "ITEM_NOT_FOUND");
		this.name = "QueueItemNotFoundError";
	}
}
