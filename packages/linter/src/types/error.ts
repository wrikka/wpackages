import { Data } from "effect";

export class FileSystemError extends Data.TaggedError("FileSystemError")<{
	readonly message: string;
	readonly path: string;
	readonly cause?: unknown;
}> {}
