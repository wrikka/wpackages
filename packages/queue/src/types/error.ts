import { Data } from "effect";

export class QueueEmptyError extends Data.TaggedError("QueueEmptyError")<{
	readonly queueName: string;
}> {}

export class QueueFullError extends Data.TaggedError("QueueFullError")<{
	readonly queueName: string;
	readonly running: number;
	readonly maxConcurrent?: number;
}> {}

export class StateInvalidError extends Data.TaggedError("StateInvalidError")<{
	readonly queueName: string;
}> {}

export class TimeoutError extends Data.TaggedError("TimeoutError")<{
	readonly after: number;
}> {}

