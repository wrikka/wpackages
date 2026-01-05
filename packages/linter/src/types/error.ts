import { Data } from "effect";

export class FileSystemError extends Data.TaggedError("FileSystemError")<{
	readonly message: string;
	readonly path: string;
	readonly cause?: unknown;
}> {}

export class SemanticLinterError extends Data.TaggedError("SemanticLinterError")<{
	readonly message: string;
	readonly cause?: unknown;
}> {}
