import type { StreamHandler } from "../types";

/**
 * Handle stdout data chunk
 */
export const handleStdoutChunk = (
	chunk: Buffer,
	encoding: BufferEncoding,
	handler: StreamHandler | undefined,
	onData: (data: string) => void,
): void => {
	const data = chunk.toString(encoding);
	onData(data);
	handler?.onStdout?.(data);
	handler?.onOutput?.(data);
};

/**
 * Handle stderr data chunk
 */
export const handleStderrChunk = (
	chunk: Buffer,
	encoding: BufferEncoding,
	handler: StreamHandler | undefined,
	onData: (data: string) => void,
): void => {
	const data = chunk.toString(encoding);
	onData(data);
	handler?.onStderr?.(data);
	handler?.onOutput?.(data);
};

/**
 * Handle process output (for verbose mode)
 */
export const handleProcessOutput = (
	data: string,
	isStderr: boolean,
	verbose: boolean,
): void => {
	if (verbose) {
		if (isStderr) {
			process.stderr.write(data);
		} else {
			process.stdout.write(data);
		}
	}
};
